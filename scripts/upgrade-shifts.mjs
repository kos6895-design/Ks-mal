import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');
const broken="p=n=>String(n).padStart(2,'0');document.getElementById('shiftDate').value=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())";
const fixed='p=n=>String(n).padStart(2,"0");document.getElementById("shiftDate").value=d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())';
if(s.includes(broken)) s=s.replace(broken,fixed);
if(!s.includes(fixed)) throw new Error('Shift date script fix was not applied');
fs.writeFileSync(p,s);
console.log('Fixed shift date script syntax');
