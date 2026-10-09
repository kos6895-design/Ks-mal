import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// Add date/time filter to cost statistics already installed in worker.
const oldCost="if(view==='coststats'&&isAdmin(u)){let rows=(s.shifts||[]).slice().reverse().map(x=>";
const newCost="if(view==='coststats'&&isAdmin(u)){let from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'',norm=v=>v?new Date(v).getTime():null,fromTs=norm(from),toTs=norm(to),inRange=d=>{let t=new Date(d).getTime();return(!fromTs||t>=fromTs)&&(!toTs||t<=toTs)},rows=(s.shifts||[]).filter(x=>inRange(x.opened)).slice().reverse().map(x=>";
if(s.includes(oldCost))s=s.replace(oldCost,newCost);

const oldHead="body+='<div class=\"card\"><h2>Себестоимость смен</h2><div class=\"muted\">По фактически использованным продуктам из техкарт.</div></div><div class=\"grid\">";
const newHead="body+='<div class=\"card\"><h2>Себестоимость смен</h2><div class=\"muted\">По фактически использованным продуктам из техкарт.</div><form class=\"inline\" method=\"get\"><input type=\"hidden\" name=\"view\" value=\"coststats\"><label>С <input name=\"from\" type=\"datetime-local\" value=\"'+E(from)+'\"></label><label>По <input name=\"to\" type=\"datetime-local\" value=\"'+E(to)+'\"></label><button class=\"btn primary\">Показать</button><a class=\"btn\" href=\"/?view=coststats\">Сбросить</a></form></div><div class=\"grid\">";
if(s.includes(oldHead))s=s.replace(oldHead,newHead);

// Make opening cash block easier to understand.
s=s.replace('<div class="card"><h3>Касса на начало смены</h3><div class="muted">Укажите количество купюр/монет каждого номинала</div>', '<div class="card"><h3>Наличные в кассе на начало смены</h3><div class="muted">В каждой строке укажите количество купюр или монет. Справа автоматически показана сумма по этому номиналу.</div>');
s=s.replace('<div class="row"><b class="grow">Итого в кассе на начало смены</b><b>', '<div class="row"><b class="grow">💰 Общая сумма наличных на начало смены</b><b class="big">');

if(!s.includes("name=\"from\" type=\"datetime-local\"")||!s.includes("view=\"coststats\""))throw Error('cost filter missing');
if(!s.includes('Общая сумма наличных на начало смены'))throw Error('opening cash label missing');
fs.writeFileSync(p,s);
console.log('Cost date/time filter and clearer opening cash applied');
