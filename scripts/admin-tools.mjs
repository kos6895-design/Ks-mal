import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const oldAction=`let rows=s.ingredients.map(i=>{let a=Math.max(0,+f.get('i_'+i.id)||0),r={id:i.id,name:i.name,unit:i.unit,expected:i.qty,actual:a,difference:a-i.qty};i.qty=a;return r});s.inventories.push({id:U(),at:new Date().toISOString(),who:u.name,rows})`;
const newAction=`let rows=s.ingredients.map(i=>{let a=Math.max(0,+f.get('i_'+i.id)||0),diff=a-i.qty,pp=i.purchase||{},unitCost=Number(pp.packQty||0)>0?Number(pp.price||0)/Number(pp.packQty):0,lossQty=Math.max(0,-diff),lossAmount=lossQty*unitCost,r={id:i.id,name:i.name,unit:i.unit,expected:i.qty,actual:a,difference:diff,unitCost,lossQty,lossAmount};i.qty=a;return r}),lossTotal=rows.reduce((n,r)=>n+(Number(r.lossAmount)||0),0);s.inventories.push({id:U(),at:new Date().toISOString(),who:u.name,rows,lossTotal})`;
if(!s.includes(oldAction))throw Error('inventory action marker missing');
s=s.replace(oldAction,newAction);

const oldLast=`<div class="card"><h3>Последняя проверка</h3><div class="muted">'+E(last.who)+' · '+E(last.at)+'</div>'+last.rows.map(r=>'<div class="row"><div class="grow">'+E(r.name)+'</div><span>'+r.expected+' → '+r.actual+'</span><b>'+(r.difference>0?'+':'')+r.difference+'</b></div>').join('')+'</div>`;
const newLast=`<div class="card"><h3>Последняя проверка</h3><div class="muted">'+E(last.who)+' · '+E(last.at)+'</div><div class="row"><b class="grow">Сумма потерь по инвентаризации</b><b>'+money(Number(last.lossTotal)||0)+'</b></div>'+last.rows.map(r=>'<div class="row"><div class="grow">'+E(r.name)+(Number(r.lossAmount)>0?'<div class="muted">Потеря: '+money(r.lossAmount)+'</div>':'')+'</div><span>'+r.expected+' → '+r.actual+'</span><b>'+(r.difference>0?'+':'')+r.difference+'</b></div>').join('')+'</div>`;
if(!s.includes(oldLast))throw Error('inventory last card marker missing');
s=s.replace(oldLast,newLast);

const oldHistory=`'<div style="width:100%">'+x.rows.map(r=>'<div class="row"><div class="grow">'+E(r.name)+'</div><span>'+r.expected+' → '+r.actual+'</span><b>'+(r.difference>0?'+':'')+r.difference+'</b></div>').join('')+'</div></details>'`;
const newHistory=`'<div style="width:100%"><div class="row"><b class="grow">Сумма потерь</b><b>'+money(Number(x.lossTotal)||0)+'</b></div>'+x.rows.map(r=>'<div class="row"><div class="grow">'+E(r.name)+(Number(r.lossAmount)>0?'<div class="muted">Потеря: '+money(r.lossAmount)+'</div>':'')+'</div><span>'+r.expected+' → '+r.actual+'</span><b>'+(r.difference>0?'+':'')+r.difference+'</b></div>').join('')+'</div></details>'`;
if(s.includes(oldHistory))s=s.replace(oldHistory,newHistory);

const oldStatsInv=`'<details class="row"><summary class="grow"><b>'+E(String(x.at).replace('T',' ').slice(0,16))+'</b> · '+E(x.who)+'</summary><div style="width:100%">'+x.rows.map(r=>'<div class="row"><div class="grow">'+E(r.name)+'</div><span>'+r.expected+' → '+r.actual+'</span><b>'+(r.difference>0?'+':'')+r.difference+'</b></div>').join('')+'</div></details>'`;
const newStatsInv=`'<details class="row"><summary class="grow"><b>'+E(String(x.at).replace('T',' ').slice(0,16))+'</b> · '+E(x.who)+' · потери '+money(Number(x.lossTotal)||0)+'</summary><div style="width:100%"><div class="row"><b class="grow">Сумма потерь</b><b>'+money(Number(x.lossTotal)||0)+'</b></div>'+x.rows.map(r=>'<div class="row"><div class="grow">'+E(r.name)+(Number(r.lossAmount)>0?'<div class="muted">Потеря: '+money(r.lossAmount)+'</div>':'')+'</div><span>'+r.expected+' → '+r.actual+'</span><b>'+(r.difference>0?'+':'')+r.difference+'</b></div>').join('')+'</div></details>'`;
if(s.includes(oldStatsInv))s=s.replace(oldStatsInv,newStatsInv);

const oldExport=`for(let inv of (s.inventories||[]).filter(x=>inRange(x.at))){rows.push([inv.at,inv.who]);rows.push(['Позиция','Ожидалось','Факт','Разница','Ед.']);for(let r of inv.rows)rows.push([r.name,r.expected,r.actual,r.difference,r.unit]);rows.push([])}`;
const newExport=`for(let inv of (s.inventories||[]).filter(x=>inRange(x.at))){rows.push([inv.at,inv.who,'Сумма потерь',Number(inv.lossTotal)||0]);rows.push(['Позиция','Ожидалось','Факт','Разница','Ед.','Потеря']);for(let r of inv.rows)rows.push([r.name,r.expected,r.actual,r.difference,r.unit,Number(r.lossAmount)||0]);rows.push([])}`;
if(s.includes(oldExport))s=s.replace(oldExport,newExport);

if(!s.includes('lossTotal=rows.reduce')||!s.includes('Сумма потерь по инвентаризации'))throw Error('inventory loss patch incomplete');
fs.writeFileSync(p,s);
console.log('Inventory loss amount applied');
