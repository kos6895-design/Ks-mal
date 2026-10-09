import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');
const logo='https://raw.githubusercontent.com/kos6895-design/Ks-mal/main/malina-logo-new.svg';
const before=s;
s=s.replace(/src="data:image\/jpeg;base64,[^"]+"/g,`src="${logo}"`);
if(s===before) console.log('MALINA embedded logo not found; leaving source unchanged');
else { fs.writeFileSync(p,s); console.log('MALINA logo replaced for deployment'); }
