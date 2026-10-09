import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// New stock items: choose how the product is accounted for.
const oldAdd='<input name="name" placeholder="Название" required><input name="unit" placeholder="Ед. (шт, г, мл, порц)" required><button class="btn primary">Добавить</button>';
const newAdd='<input name="name" placeholder="Название" required><select name="measure" required><option value="volume">Объём (мл)</option><option value="pieces">Количество (шт.)</option></select><button class="btn primary">Добавить</button>';
if(s.includes(oldAdd))s=s.replace(oldAdd,newAdd);

const oldIngredient="let name=String(f.get('name')||'').trim(),unit=String(f.get('unit')||'').trim();if(!name||!unit)throw Error('Укажите название и единицу');s.ingredients.push({id:'custom-'+U(),name:name.slice(0,100),unit:unit.slice(0,20),qty:0})";
const newIngredient="let name=String(f.get('name')||'').trim(),measure=String(f.get('measure')||'volume'),unit=measure==='pieces'?'шт.':'мл';if(!name)throw Error('Укажите название');s.ingredients.push({id:'custom-'+U(),name:name.slice(0,100),measure,unit,qty:0})";
if(s.includes(oldIngredient))s=s.replace(oldIngredient,newIngredient);

// Purchase prices: explicit volume/quantity wording per item.
const oldPP='<input name="packQty" type="number" min="0.001" step="0.001" placeholder="Объём / количество" value="'+"'+(pack||'')+'"+'" '+"'+(u.role==='admin'?'':'disabled')+'"+' required>';
const newPP='<input name="packQty" type="number" min="0.001" step="0.001" placeholder="'+"'+((i.measure==='pieces'||i.unit==='шт'||i.unit==='шт.')?'Количество, шт.':'Объём, мл')+'"+'" value="'+"'+(pack||'')+'"+'" '+"'+(u.role==='admin'?'':'disabled')+'"+' required>';
if(s.includes(oldPP))s=s.replace(oldPP,newPP);

// Allow changing existing products between volume and pieces from purchase-price page.
const oldHidden='<input type="hidden" name="id" value="'+"'+E(i.id)+'"+'"><div class="grow"><b>'+"'+E(i.name)+'"+'";</nconst newHidden='<input type="hidden" name="id" value="'+"'+E(i.id)+'"+'"><div class="grow"><b>'+"'+E(i.name)+'"+'";
// Keep UI minimally invasive: add selector before packQty.
s=s.replace("</div><input name=\"packQty\" type=\"number\" min=\"0.001\" step=\"0.001\" placeholder=\"'+((i.measure==='pieces'||i.unit==='шт'||i.unit==='шт.')?'Количество, шт.':'Объём, мл')+'\"", "</div><select name=\"measure\" "+"'+(u.role==='admin'?'':'disabled')+'"+"><option value=\"volume\" "+"'+((i.measure!=='pieces'&&i.unit!=='шт'&&i.unit!=='шт.')?'selected':'')+'"+">Объём (мл)</option><option value=\"pieces\" "+"'+((i.measure==='pieces'||i.unit==='шт'||i.unit==='шт.')?'selected':'')+'"+">Количество (шт.)</option></select><input name=\"packQty\" type=\"number\" min=\"0.001\" step=\"0.001\" placeholder=\"'+((i.measure==='pieces'||i.unit==='шт'||i.unit==='шт.')?'Количество, шт.':'Объём, мл')+'\"");

// Saving purchase price also saves selected accounting type.
const purchaseNeedle="i.purchase={packQty,price,updatedAt:new Date().toISOString(),updatedBy:u.name}";
if(s.includes(purchaseNeedle))s=s.replace(purchaseNeedle,"let measure=String(f.get('measure')||i.measure||'volume');i.measure=measure;i.unit=measure==='pieces'?'шт.':'мл';i.purchase={packQty,price,updatedAt:new Date().toISOString(),updatedBy:u.name}");

if(!s.includes('Объём (мл)')||!s.includes('Количество (шт.)'))throw Error('measure selector missing');
fs.writeFileSync(p,s);
console.log('Volume/pieces product units applied');
