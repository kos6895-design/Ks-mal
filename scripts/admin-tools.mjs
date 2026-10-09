import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');
const bad=`document.querySelector('form input[name="type"][value="calcSave"]')?.form`;
const good=`document.querySelector(\"form input[name='type'][value='calcSave']\")?.form`;
if(!s.includes(bad))throw Error('autosave syntax marker missing');
s=s.replace(bad,good);
fs.writeFileSync(p,s);
console.log('Autosave syntax fixed');
