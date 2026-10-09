import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const oldTab=`tab=t=>n(t.end)-n(t.start)`;
const newTab=`tab=t=>(n(t.ie??t.end)-n(t.is??t.start))-(n(t.oe)-n(t.os))`;
if(!s.includes(oldTab))throw Error('table formula marker missing');
s=s.replace(oldTab,newTab);

const oldTables=`<div class="card"><h3>Столы 1–6</h3>'+(show.tables||[]).map((t,i)=>'<div class="row"><b class="grow">Стол '+(i+1)+'</b><input name="ts'+i+'" type="number" step="any" value="'+n(t.start)+'" '+(lock?'disabled':'')+'><span>→</span><input name="te'+i+'" type="number" step="any" value="'+n(t.end)+'" '+(lock?'disabled':'')+'><b>'+fmt(tab(t))+'</b></div>').join('')+'</div>`;
const newTables=`<div class="card"><h3>Столы 1–6</h3><div class="muted">Логика как в приложении: IN = конец − начало, OUT = конец − начало, результат = IN − OUT.</div>'+(show.tables||[]).map((t,i)=>'<div class="row"><b>Стол '+(i+1)+'</b><span>IN</span><input name="tis'+i+'" type="number" step="any" value="'+n(t.is??t.start)+'" '+(lock?'disabled':'')+'><input name="tie'+i+'" type="number" step="any" value="'+n(t.ie??t.end)+'" '+(lock?'disabled':'')+'><span>OUT</span><input name="tos'+i+'" type="number" step="any" value="'+n(t.os)+'" '+(lock?'disabled':'')+'><input name="toe'+i+'" type="number" step="any" value="'+n(t.oe)+'" '+(lock?'disabled':'')+'><b>'+fmt(tab(t))+'</b></div>').join('')+'</div>`;
if(!s.includes(oldTables))throw Error('tables UI marker missing');
s=s.replace(oldTables,newTables);

const oldButton=`+(!lock?'<div class="card"><button class="btn primary full">✓ Принять изменения</button></div>':'')+'</form>';`;
const newButton=`+(!lock?'<div class="card"><div class="muted" id="autosaveState">Изменения сохраняются автоматически</div></div>':'')+'</form>'+(!lock?'<script>(()=>{const f=document.querySelector(\'form input[name="type"][value="calcSave"]\')?.form;if(!f)return;let timer;const state=document.getElementById("autosaveState");const save=()=>{clearTimeout(timer);timer=setTimeout(async()=>{state.textContent="Сохраняю…";try{await fetch("/action",{method:"POST",body:new FormData(f),credentials:"same-origin"});state.textContent="✓ Сохранено автоматически"}catch(e){state.textContent="Ошибка сохранения"}},450)};f.querySelectorAll("input,select,textarea").forEach(el=>{if(el.type!=="hidden")el.addEventListener("input",save);el.addEventListener("change",save)})})()</script>':'');`;
if(!s.includes(oldButton))throw Error('save button marker missing');
s=s.replace(oldButton,newButton);

const oldOpen=`tables:Array.from({length:6},(_,i)=>({start:p?.tables?.[i]?.end||0,end:p?.tables?.[i]?.end||0}))`;
const newOpen=`tables:Array.from({length:6},(_,i)=>{let q=p?.tables?.[i]||{},ie=q.ie??q.end??0,oe=q.oe??0;return{is:ie,ie,os:oe,oe}})`;
if(!s.includes(oldOpen))throw Error('table open marker missing');
s=s.replace(oldOpen,newOpen);

const oldSave=`x.tables[i]={start:num('ts'+i),end:num('te'+i)}`;
const newSave=`x.tables[i]={is:num('tis'+i),ie:num('tie'+i),os:num('tos'+i),oe:num('toe'+i)}`;
if(!s.includes(oldSave))throw Error('table save marker missing');
s=s.replace(oldSave,newSave);

if(!s.includes('Сохранено автоматически')||!s.includes("name=\"tis'+i+'\"")||!s.includes("x.tables[i]={is:num('tis'+i)"))throw Error('shift autosave/table patch incomplete');
fs.writeFileSync(p,s);
console.log('Shift autosave and table logic applied');
