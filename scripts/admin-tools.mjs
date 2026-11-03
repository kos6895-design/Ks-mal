import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// Keep the closed-shift expense action syntactically valid.
const bad="who:u.name});else if(t==='calcOpen'){";
const good="who:u.name});}else if(t==='calcOpen'){";
if(s.includes(bad)) s=s.replace(bad,good);

// Make sure the requested expense tab is present in EVERY admin navigation branch.
const debts='<a href="/?view=debts">Долги</a>';
const expenses='<a href="/?view=calcexpenses">Расходы</a>';
s=s.split(debts+expenses).join(debts);
s=s.split(debts).join(debts+expenses);

// Force Safari/iOS and intermediary caches to revalidate the HTML UI.
const oldRedir="const redir=(p='/')=>new Response(null,{status:303,headers:{location:p}});";
const newRedir="const redir=(p='/')=>new Response(null,{status:303,headers:{location:p,'cache-control':'no-store, no-cache, must-revalidate, max-age=0','pragma':'no-cache','expires':'0'}});";
if(s.includes(oldRedir)) s=s.replace(oldRedir,newRedir);

// Add no-cache meta tags and a visible build marker so the active UI is obvious.
const head='<head><meta charset="utf-8">';
const freshHead='<head><meta charset="utf-8"><meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">';
if(s.includes(head) && !s.includes('http-equiv="Cache-Control"')) s=s.replace(head,freshHead);
const bodyEnd='</body></html>';
if(s.includes(bodyEnd) && !s.includes('MALINA UI 2026-11-03 EXPENSES')) s=s.replace(bodyEnd,'<div style="position:fixed;right:6px;bottom:4px;z-index:99;font:9px Arial;color:#777;opacity:.7">MALINA UI 2026-11-03 EXPENSES</div>'+bodyEnd);

// Fail if either full admin or hall-admin menu still misses the tab.
const occurrences=(s.match(/view=calcexpenses/g)||[]).length;
if(occurrences<3){
  console.error('Expected expenses route plus links in both admin menus; found '+occurrences+' occurrences');
  process.exit(1);
}

fs.writeFileSync(p,s);
const check=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
if(check.status!==0){
  process.stderr.write(check.stderr||check.stdout||'Syntax check failed');
  process.exit(check.status||1);
}
console.log('Fresh UI patch applied: expenses tab forced into both admin menus, cache disabled, build marker added');
