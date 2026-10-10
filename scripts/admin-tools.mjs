import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const badOpen=`return{start:{1:n(prevEnd[1]),5:n(prevEnd[5]),10:n(prevEnd[10]),50:n(prevEnd[50]),100:n(prevEnd[100])},end:{1:n(prevEnd[1]),5:n(prevEnd[5]),10:n(prevEnd[10]),50:n(prevEnd[50]),100:n(prevEnd[100])}}`;
const goodOpen=`return{start:{1:Number(prevEnd[1]||0),5:Number(prevEnd[5]||0),10:Number(prevEnd[10]||0),50:Number(prevEnd[50]||0),100:Number(prevEnd[100]||0)},end:{1:Number(prevEnd[1]||0),5:Number(prevEnd[5]||0),10:Number(prevEnd[10]||0),50:Number(prevEnd[50]||0),100:Number(prevEnd[100]||0)}}`;
if(s.includes(badOpen))s=s.replace(badOpen,goodOpen);

const oldScript=`const save=()=>{clearTimeout(timer);timer=setTimeout(async()=>{state.textContent="Сохраняю…";try{await fetch("/action",{method:"POST",body:new FormData(f),credentials:"same-origin"});state.textContent="✓ Сохранено автоматически"}catch(e){state.textContent="Ошибка сохранения"}},450)}`;
const newScript=`let saving=false,pending=false;const doSave=async()=>{if(saving){pending=true;return}saving=true;state.textContent="Сохраняю…";try{let r=await fetch("/action",{method:"POST",body:new FormData(f),credentials:"same-origin"});if(!r.ok)throw Error("save failed");state.textContent="✓ Сохранено автоматически"}catch(e){state.textContent="Ошибка сохранения — повторите изменение"}finally{saving=false;if(pending){pending=false;doSave()}}};const save=()=>{clearTimeout(timer);timer=setTimeout(doSave,350)}`;
if(!s.includes(oldScript))throw Error('autosave script marker missing');
s=s.replace(oldScript,newScript);

if(!s.includes('pending=false;doSave()')||!s.includes('Number(prevEnd[1]||0)'))throw Error('autosave persistence patch incomplete');
fs.writeFileSync(p,s);
console.log('Hall shift autosave persistence fixed');
