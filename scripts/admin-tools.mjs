import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const oldTab=`tab=t=>(n(t.ie??t.end)-n(t.is??t.start))-(n(t.oe)-n(t.os))`;
const newTab=`tab=t=>[1,5,10,50,100].reduce((a,d)=>a+(n(t.end?.[d])-n(t.start?.[d]))*d,0)`;
if(!s.includes(oldTab))throw Error('table formula marker missing');
s=s.replace(oldTab,newTab);

const start=s.indexOf(`<div class="card"><h3>Столы 1–6</h3><div class="muted">Логика как в приложении:`);
const end=s.indexOf(`<div class="card"><h3>Расходы</h3>`,start);
if(start<0||end<0)throw Error('tables UI markers missing');
const tables=`<div class="card"><h3>Столы 1–6</h3><div class="muted">Для каждого стола: номиналы 1, 5, 10, 50, 100 · Начало · Конец · Результат.</div>'+(show.tables||[]).map((t,i)=>'<details class="card"><summary><b>Стол '+(i+1)+'</b><span style="float:right">Итог: '+fmt(tab(t))+'</span></summary>'+[1,5,10,50,100].map(d=>'<div class="row"><b class="grow">Номинал '+d+'</b><label>Начало <input name="t'+i+'s'+d+'" type="number" min="0" step="1" value="'+n(t.start?.[d])+'" '+(lock?'disabled':'')+'></label><label>Конец <input name="t'+i+'e'+d+'" type="number" min="0" step="1" value="'+n(t.end?.[d])+'" '+(lock?'disabled':'')+'></label><b>Результат '+fmt((n(t.end?.[d])-n(t.start?.[d]))*d)+'</b></div>').join('')+'<div class="row"><b class="grow">Итог стола</b><b class="big">'+fmt(tab(t))+'</b></div></details>').join('')+'</div>`;
s=s.slice(0,start)+tables+s.slice(end);

const oldOpen=`tables:Array.from({length:6},(_,i)=>{let q=p?.tables?.[i]||{},ie=q.ie??q.end??0,oe=q.oe??0;return{is:ie,ie,os:oe,oe}})`;
const newOpen=`tables:Array.from({length:6},(_,i)=>{let q=p?.tables?.[i]||{},prevEnd=q.end&&typeof q.end==='object'?q.end:{};return{start:{1:n(prevEnd[1]),5:n(prevEnd[5]),10:n(prevEnd[10]),50:n(prevEnd[50]),100:n(prevEnd[100])},end:{1:n(prevEnd[1]),5:n(prevEnd[5]),10:n(prevEnd[10]),50:n(prevEnd[50]),100:n(prevEnd[100])}}})`;
if(!s.includes(oldOpen))throw Error('table open marker missing');
s=s.replace(oldOpen,newOpen);

const oldSave=`x.tables[i]={is:num('tis'+i),ie:num('tie'+i),os:num('tos'+i),oe:num('toe'+i)}`;
const newSave=`x.tables[i]={start:{1:num('t'+i+'s1'),5:num('t'+i+'s5'),10:num('t'+i+'s10'),50:num('t'+i+'s50'),100:num('t'+i+'s100')},end:{1:num('t'+i+'e1'),5:num('t'+i+'e5'),10:num('t'+i+'e10'),50:num('t'+i+'e50'),100:num('t'+i+'e100')}}`;
if(!s.includes(oldSave))throw Error('table save marker missing');
s=s.replace(oldSave,newSave);

if(!s.includes('Номинал '+"'"+'+d+')||!s.includes("t'+i+'s100")||!s.includes('Итог стола'))throw Error('denomination tables patch incomplete');
fs.writeFileSync(p,s);
console.log('Hall tables denomination logic applied');
