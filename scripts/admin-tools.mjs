import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');
const bad="who:u.name});else if(t==='calcOpen'){";
const good="who:u.name});}else if(t==='calcOpen'){";
if(!s.includes(bad)){
  if(s.includes(good)){
    console.log('Closed-shift expense syntax already fixed');
    process.exit(0);
  }
  throw Error('calcClosedExpense syntax marker missing');
}
s=s.replace(bad,good);
fs.writeFileSync(p,s);
const check=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
if(check.status!==0){
  process.stderr.write(check.stderr||check.stdout||'Syntax check failed');
  process.exit(check.status||1);
}
console.log('Closed-shift expense syntax fixed and validated');
