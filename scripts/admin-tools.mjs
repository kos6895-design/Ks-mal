import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');
const old='<button class="btn primary" type="submit">Сохранить смену</button><span class="muted">После изменения данных нажмите «Сохранить смену»</span>';
const neu='<button class="btn primary" type="submit">Сохранить изменения</button><span class="muted">После изменения данных нажмите «Сохранить изменения»</span>';
if(!s.includes(old))throw Error('manual save button missing');
s=s.replace(old,neu);
fs.writeFileSync(p,s);
console.log('Current-shift save button renamed');
