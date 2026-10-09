import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const old="return redir('/?view='+(t==='status'?'prep':t==='stock'||t==='ingredient'||t==='writeoff'||t==='ingredientDelete'?'stock':t==='inventory'?'inventory':t==='menuAdd'||t==='menuEdit'||t==='menuDelete'?'menu':t==='recipeSet'||t==='recipeRemove'||t==='recipeClear'?'recipes':t.startsWith('calc')?'shiftcalc':t==='order'||t==='pay'||t==='cancelOrder'?'orders':'overview'))";
const neu="return redir('/?view='+(t==='status'?'prep':t==='purchasePrice'?'purchaseprices':t==='adminDeleteBarShift'?'stats':t==='adminDeleteShift'?'shiftcalc':t==='adminDeleteInventory'?'inventory':t==='stock'||t==='ingredient'||t==='writeoff'||t==='ingredientDelete'?'stock':t==='inventory'?'inventory':t==='menuAdd'||t==='menuEdit'||t==='menuDelete'?'menu':t==='recipeSet'||t==='recipeRemove'||t==='recipeClear'?'recipes':t.startsWith('calc')?'shiftcalc':t==='order'||t==='pay'||t==='cancelOrder'?'orders':'overview'))";
if(!s.includes(old))throw Error('redirect marker missing');
s=s.replace(old,neu);
if(!s.includes("t==='adminDeleteBarShift'?'stats'"))throw Error('bar shift redirect missing');
if(!s.includes("t==='purchasePrice'?'purchaseprices'"))throw Error('purchase redirect missing');
fs.writeFileSync(p,s);
console.log('Page-preserving redirects applied');
