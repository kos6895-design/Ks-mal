import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const navOld=`<a class="btn" href="/?view=coststats">Себестоимость смен</a>`;
const navNew=`<a class="btn" href="/?view=coststats">Себестоимость смен</a><a class="btn" href="/?view=productusage">Расход продуктов</a>`;
if(!s.includes(navOld))throw Error('statistics nav marker missing');
s=s.replace(navOld,navNew);

const marker=`if(view==='coststats'&&isAdmin(u)){`;
if(!s.includes(marker))throw Error('coststats marker missing');
const page=`if(view==='productusage'&&isAdmin(u)){let from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'',ingredientId=url.searchParams.get('ingredient')||'',norm=v=>v?new Date(v).getTime():null,fromTs=norm(from),toTs=norm(to),inRange=d=>{let t=new Date(d).getTime();return(!fromTs||t>=fromTs)&&(!toTs||t<=toTs)},usage=new Map;for(let o of (s.orders||[])){if(o.cancelled)continue;let sh=(s.shifts||[]).find(x=>x.id===o.shiftId),at=o.paidAt||o.created||sh?.opened;if(!at||!inRange(at))continue;for(let l of (o.lines||[])){if(!['ready','served'].includes(l.status))continue;for(let [iid,q] of (l.recipe||[])){if(ingredientId&&iid!==ingredientId)continue;let ing=s.ingredients.find(z=>z.id===iid);if(!ing)continue;let qty=(Number(q)||0)*(Number(l.qty)||0),pp=ing.purchase||{},pack=Number(pp.packQty||0),price=Number(pp.price||0),cost=pack>0?qty*(price/pack):0,r=usage.get(iid)||{id:iid,name:ing.name,unit:ing.unit,qty:0,cost:0};r.qty+=qty;r.cost+=cost;usage.set(iid,r)}}}let rows=[...usage.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru')),totalCost=rows.reduce((n,r)=>n+r.cost,0);body+='<div class="card"><h2>Расход продуктов</h2><div class="muted">Расход считается по техкартам фактически приготовленных/выданных позиций.</div><form class="inline" method="get"><input type="hidden" name="view" value="productusage"><label>С <input name="from" type="datetime-local" value="'+E(from)+'"></label><label>По <input name="to" type="datetime-local" value="'+E(to)+'"></label><label>Наименование <select name="ingredient"><option value="">Все продукты</option>'+s.ingredients.slice().sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(i=>'<option value="'+E(i.id)+'" '+(ingredientId===i.id?'selected':'')+'>'+E(i.name)+'</option>').join('')+'</select></label><button class="btn primary">Показать</button><a class="btn" href="/?view=productusage">Сбросить</a></form></div><div class="grid"><div class="card"><div class="muted">Позиций</div><div class="big">'+rows.length+'</div></div><div class="card"><div class="muted">Общая себестоимость расхода</div><div class="big">'+money(totalCost)+'</div></div></div><div class="card"><div class="row"><b class="grow">Наименование</b><b>Количество</b><b style="min-width:120px;text-align:right">Себестоимость</b></div>'+(rows.map(r=>'<div class="row"><div class="grow"><b>'+E(r.name)+'</b></div><span>'+r.qty.toFixed(3).replace(/\\.?0+$/,'')+' '+E(r.unit)+'</span><b style="min-width:120px;text-align:right">'+money(r.cost)+'</b></div>').join('')||'<div class="muted">За выбранный период расхода нет</div>')+'</div>'}
`;
s=s.replace(marker,page+marker);

if(!s.includes("view==='productusage'")||!s.includes('Расход продуктов'))throw Error('product usage patch incomplete');
fs.writeFileSync(p,s);
console.log('Product usage statistics applied');
