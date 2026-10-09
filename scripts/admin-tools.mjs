import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// Navigation.
s=s.replace('<a href="/?view=stock">Склад</a><a href="/?view=inventory">Инвентаризация</a>', '<a href="/?view=stock">Склад</a><a href="/?view=purchaseprices">Закупочные цены</a><a href="/?view=inventory">Инвентаризация</a>');
s=s.replace('<div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=shiftstats">Расчёт смен</a>', '<div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=coststats">Себестоимость смен</a><a href="/?view=shiftstats">Расчёт смен</a>');

// Purchase prices page. Main admin can edit; other admins can view.
const inventoryMarker=" if(view==='inventory'){";
if(!s.includes("view==='purchaseprices'")){
  const page=` if(view==='purchaseprices'&&isAdmin(u)){body+='<div class="card"><h2>Закупочные цены</h2><div class="muted">Для каждой позиции укажите объём или количество закупки и полную закупочную цену. Стоимость единицы рассчитывается автоматически.</div></div><div class="card">'+s.ingredients.map(i=>{let pp=i.purchase||{},pack=Number(pp.packQty||0),price=Number(pp.price||0),unitCost=pack>0?price/pack:0;return '<form class="row" method="post" action="/action"><input type="hidden" name="type" value="purchasePrice"><input type="hidden" name="id" value="'+E(i.id)+'"><div class="grow"><b>'+E(i.name)+'</b><div class="muted">Единица склада: '+E(i.unit)+' · цена за 1 '+E(i.unit)+': '+(unitCost?money(unitCost):'не задана')+'</div></div><label>Объём / количество <input name="packQty" type="number" min="0.001" step="0.001" value="'+(pack||'')+'" '+(u.role==='admin'?'':'disabled')+' required></label><label>Цена закупки, ₽ <input name="price" type="number" min="0" step="0.01" value="'+(price||'')+'" '+(u.role==='admin'?'':'disabled')+' required></label>'+(u.role==='admin'?'<button class="btn primary">Сохранить</button>':'')+'</form>'}).join('')+'</div>'}\n`;
  if(!s.includes(inventoryMarker)) throw new Error('inventory page marker missing');
  s=s.replace(inventoryMarker,page+inventoryMarker);
}

// Shift cost statistics: cost is based on recipes actually deducted when order lines became ready.
if(!s.includes("view==='coststats'")){
  const statsMarker=" if(view==='stats'&&isAdmin(u)){";
  const page=` if(view==='coststats'&&isAdmin(u)){let rows=(s.shifts||[]).slice().reverse().map(x=>{let os=(s.orders||[]).filter(o=>o.shiftId===x.id&&!o.cancelled),revenue=os.filter(o=>o.paid&&!o.bonus).reduce((n,o)=>n+tot(o),0),cost=0;for(let o of os){for(let l of (o.lines||[])){if(!['ready','served'].includes(l.status))continue;for(let [iid,q] of (l.recipe||[])){let ing=s.ingredients.find(z=>z.id===iid),pp=ing?.purchase||{},pack=Number(pp.packQty||0),price=Number(pp.price||0);if(pack>0)cost+=(Number(q)||0)*(Number(l.qty)||0)*(price/pack)}}}return {x,revenue,cost,net:revenue-cost}});let tr=rows.reduce((n,r)=>n+r.revenue,0),tc=rows.reduce((n,r)=>n+r.cost,0);body+='<div class="card"><h2>Себестоимость смен</h2><div class="muted">Себестоимость считается по фактически использованным продуктам из техкарт и сохранённым закупочным ценам.</div></div><div class="grid"><div class="card"><div class="muted">Общая выручка смен</div><div class="big">'+money(tr)+'</div></div><div class="card"><div class="muted">Себестоимость смен</div><div class="big">'+money(tc)+'</div></div><div class="card"><div class="muted">Выручка после себестоимости</div><div class="big">'+money(tr-tc)+'</div></div></div><div class="card">'+(rows.map(r=>'<div class="row"><div class="grow"><b>'+E(String(r.x.opened||'').replace('T',' ').slice(0,16))+'</b><div class="muted">'+(r.x.closed?'Закрыта '+E(String(r.x.closed).replace('T',' ').slice(0,16)):'Открыта')+'</div></div><div><div>Общая выручка: <b>'+money(r.revenue)+'</b></div><div>Себестоимость: <b>'+money(r.cost)+'</b></div><div>Выручка: <b>'+money(r.net)+'</b></div></div></div>').join('')||'<div class="muted">Смен пока нет</div>')+'</div>'}\n`;
  if(!s.includes(statsMarker)) throw new Error('stats page marker missing');
  s=s.replace(statsMarker,page+statsMarker);
}

// Main-admin-only purchase price write handler.
if(!s.includes("t==='purchasePrice'")){
  const actionMarker="if(t==='adminDeleteBarShift'){";
  const handler=`if(t==='purchasePrice'){if(u.role!=='admin')throw Error('Только главный администратор может менять закупочные цены');let i=s.ingredients.find(x=>x.id===f.get('id'));if(!i)throw Error('Позиция склада не найдена');let packQty=Number(f.get('packQty')),price=Number(f.get('price'));if(!Number.isFinite(packQty)||packQty<=0)throw Error('Укажите объём или количество закупки');if(!Number.isFinite(price)||price<0)throw Error('Укажите закупочную цену');i.purchase={packQty,price,updatedAt:new Date().toISOString(),updatedBy:u.name};s.logs=s.logs||[];s.logs.unshift({id:U(),at:new Date().toISOString(),who:u.name,text:'Закупочная цена: '+i.name+' · '+packQty+' '+i.unit+' = '+price+' ₽'});}else `;
  if(!s.includes(actionMarker)) throw new Error('action marker missing');
  s=s.replace(actionMarker,handler+actionMarker);
}

if(!s.includes("view==='purchaseprices'")) throw new Error('purchase prices page missing');
if(!s.includes("view==='coststats'")) throw new Error('cost stats page missing');
if(!s.includes("t==='purchasePrice'")) throw new Error('purchase price handler missing');
fs.writeFileSync(p,s);
console.log('Purchase prices and shift cost statistics added');
