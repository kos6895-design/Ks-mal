import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const bad="who:u.name});else if(t==='calcOpen'){";
const good="who:u.name});}else if(t==='calcOpen'){";
if(s.includes(bad)) s=s.replace(bad,good);

const debts='<a href="/?view=debts">Долги</a>';
const expenses='<a href="/?view=calcexpenses">Расходы</a>';
s=s.split(debts+expenses).join(debts);
s=s.split(debts).join(debts+expenses);

// Restore the ZAL views accidentally removed by the previous broad slice.
// 6b51a0e is the verified version that still contains Debts + Current shift.
const verified='6b51a0ee5996bf6246f31df764a7089c872d0e55';
const old=spawnSync('git',['show',verified+':worker-direct.js'],{encoding:'utf8'});
if(old.status!==0){process.stderr.write(old.stderr||'Cannot read verified worker');process.exit(1)}
const base=old.stdout;
const debtMarker="if(view==='debts'&&isAdmin(u)){";
const hallMarker="if(view==='shiftlist'&&isAdmin(u)){let from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'',all=s.calcShifts||[]";
const baseDebt=base.indexOf(debtMarker);
const baseHall=base.indexOf(hallMarker);
if(baseDebt<0||baseHall<0||baseHall<=baseDebt){console.error('Verified ZAL block not found');process.exit(1)}
const zalCore=base.slice(baseDebt,baseHall);

// Remove only the legacy BAR shiftlist block. Stop at Debts, never at the hall list,
// so Debts and Current shift cannot be deleted again.
const legacyStart="if(view==='shiftlist'&&isAdmin(u)){let closed=(s.shifts||[]).filter(x=>x.closed).slice().reverse();";
let a=s.indexOf(legacyStart);
if(a>=0){let d=s.indexOf(debtMarker,a);if(d<0){console.error('Debt boundary after legacy list not found');process.exit(1)}s=s.slice(0,a)+s.slice(d)}

// If the previous bad patch already removed the views, restore them immediately
// before the hall-only shift list.
if(!s.includes(debtMarker)||!s.includes("if(view==='shiftcalc'&&isAdmin(u)){")){
  const h=s.indexOf(hallMarker);
  if(h<0){console.error('Hall shift list insertion point not found');process.exit(1)}
  s=s.slice(0,h)+zalCore+s.slice(h);
}

// ZAL / shiftlist uses only hall calculation shifts and filters by opening date.
const shiftStart="if(view==='shiftlist'&&isAdmin(u)){let cs=s.calcShifts||[],n=v=>Number(v||0)";
const shiftStartNew="if(view==='shiftlist'&&isAdmin(u)){let from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'',all=s.calcShifts||[],dateOf=x=>x.businessDate||String(x.opened||'').slice(0,10),cs=all.filter(x=>(!from||dateOf(x)>=from)&&(!to||dateOf(x)<=to)),n=v=>Number(v||0)";
if(s.includes(shiftStart)) s=s.replace(shiftStart,shiftStartNew);
const listHead="body+='<div class=\"card\"><h2>Список смен</h2><div class=\"muted\">Все расчётные смены привязаны к дате открытия.</div></div><div class=\"card\">'";
const listHeadNew="body+='<div class=\"card\"><h2>Смены зала</h2><div class=\"muted\">Только смены зала. Фильтр применяется по дате открытия смены.</div><form class=\"inline\" method=\"get\"><input type=\"hidden\" name=\"view\" value=\"shiftlist\"><label>С <input type=\"date\" name=\"from\" value=\"'+E(from)+'\"></label><label>По <input type=\"date\" name=\"to\" value=\"'+E(to)+'\"></label><button class=\"btn primary\">Показать</button><a class=\"btn\" href=\"/?view=shiftlist\">Сбросить</a></form></div><div class=\"card\">'";
if(s.includes(listHead)) s=s.replace(listHead,listHeadNew);

const oldRedir="const redir=(p='/')=>new Response(null,{status:303,headers:{location:p}});";
const newRedir="const redir=(p='/')=>new Response(null,{status:303,headers:{location:p,'cache-control':'no-store, no-cache, must-revalidate, max-age=0','pragma':'no-cache','expires':'0'}});";
if(s.includes(oldRedir)) s=s.replace(oldRedir,newRedir);

const head='<head><meta charset="utf-8">';
const freshHead='<head><meta charset="utf-8"><meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">';
if(s.includes(head) && !s.includes('http-equiv="Cache-Control"')) s=s.replace(head,freshHead);
const bodyEnd='</body></html>';
if(s.includes(bodyEnd) && !s.includes('MALINA UI 2026-11-03 EXPENSES')) s=s.replace(bodyEnd,'<div style="position:fixed;right:6px;bottom:4px;z-index:99;font:9px Arial;color:#777;opacity:.7">MALINA UI 2026-11-03 EXPENSES</div>'+bodyEnd);

const occurrences=(s.match(/view=calcexpenses/g)||[]).length;
if(occurrences<3){console.error('Expected expenses route plus links in both admin menus');process.exit(1)}
if(!s.includes("all=s.calcShifts||[]")||!s.includes('Только смены зала')){console.error('Hall shift list/date filter patch missing');process.exit(1)}
if(s.includes(legacyStart)){console.error('Legacy bar shift list still present');process.exit(1)}
if(!s.includes(debtMarker)){console.error('Debts view missing');process.exit(1)}
if(!s.includes("if(view==='shiftcalc'&&isAdmin(u)){")){console.error('Current hall shift view missing');process.exit(1)}

fs.writeFileSync(p,s);
const check=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
if(check.status!==0){process.stderr.write(check.stderr||check.stdout||'Syntax check failed');process.exit(check.status||1)}
console.log('ZAL verified: Current shift + hall-only Shift list + Debts + Expenses are present');
