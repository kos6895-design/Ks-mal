import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const oldAdd=`<input name="name" placeholder="Название" required><input name="unit" placeholder="Ед. (шт, г, мл, порц)" required><button class="btn primary">Добавить</button>`;
const newAdd=`<input name="name" placeholder="Название" required><select name="measure" required><option value="volume">Объём (мл)</option><option value="pieces">Количество (шт.)</option></select><button class="btn primary">Добавить</button>`;
if(s.includes(oldAdd))s=s.replace(oldAdd,newAdd);

const oldIngredient=`let name=String(f.get('name')||'').trim(),unit=String(f.get('unit')||'').trim();if(!name||!unit)throw Error('Укажите название и единицу');s.ingredients.push({id:'custom-'+U(),name:name.slice(0,100),unit:unit.slice(0,20),qty:0})`;
const newIngredient=`let name=String(f.get('name')||'').trim(),measure=String(f.get('measure')||'volume'),unit=measure==='pieces'?'шт.':'мл';if(!name)throw Error('Укажите название');s.ingredients.push({id:'custom-'+U(),name:name.slice(0,100),measure,unit,qty:0})`;
if(s.includes(oldIngredient))s=s.replace(oldIngredient,newIngredient);

const oldPurchase=`<div class="grow"><b>'+E(i.name)+'</b><div class="muted">'+E(i.unit)+' · за 1 '+E(i.unit)+': '+(uc?money(uc):'не задано')+'</div></div><input name="packQty" type="number" min="0.001" step="0.001" placeholder="Объём / количество" value="'+(pack||'')+'" '+(u.role==='admin'?'':'disabled')+' required>`;
const newPurchase=`<div class="grow"><b>'+E(i.name)+'</b><div class="muted">'+E(i.unit)+' · за 1 '+E(i.unit)+': '+(uc?money(uc):'не задано')+'</div></div><select name="measure" '+(u.role==='admin'?'':'disabled')+'><option value="volume" '+((i.measure!=='pieces'&&i.unit!=='шт'&&i.unit!=='шт.')?'selected':'')+'>Объём (мл)</option><option value="pieces" '+((i.measure==='pieces'||i.unit==='шт'||i.unit==='шт.')?'selected':'')+'>Количество (шт.)</option></select><input name="packQty" type="number" min="0.001" step="0.001" placeholder="Объём / количество" value="'+(pack||'')+'" '+(u.role==='admin'?'':'disabled')+' required>`;
if(s.includes(oldPurchase))s=s.replace(oldPurchase,newPurchase);

const purchaseNeedle=`i.purchase={packQty,price,updatedAt:new Date().toISOString(),updatedBy:u.name}`;
const purchaseReplacement=`let measure=String(f.get('measure')||i.measure||'volume');i.measure=measure;i.unit=measure==='pieces'?'шт.':'мл';i.purchase={packQty,price,updatedAt:new Date().toISOString(),updatedBy:u.name}`;
if(s.includes(purchaseNeedle))s=s.replace(purchaseNeedle,purchaseReplacement);

if(!s.includes('<select name="measure" required><option value="volume">Объём (мл)</option>'))throw Error('stock measure selector missing');
if(!s.includes('<option value="pieces" '+"'"+'+((i.measure'))throw Error('purchase measure selector missing');
fs.writeFileSync(p,s);
console.log('Volume/pieces product units applied');
