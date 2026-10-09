import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const overviewEnd=`if(canOperate(u))body+='<div class="card"><form class="inline" method="post" action="/action"><input type="hidden" name="type" value="'+(sh?'close':'open')+'"><input name="cash" type="number" min="0" step="1" value="0"><button class="btn '+(sh?'danger':'primary')+'">'+(sh?'Закрыть смену':'Открыть смену')+'</button></form></div>'}`;
if(!s.includes(overviewEnd))throw Error('overview marker missing');
s=s.replace(overviewEnd,overviewEnd+`;if(sh&&canOperate(u)){let ee=(s.barExpenses||[]).filter(e=>e.shiftId===sh.id),et=ee.reduce((n,e)=>n+(Number(e.amount)||0),0);body+='<div class="card"><h3>Расходы</h3><form class="inline" method="post" action="/action"><input type="hidden" name="type" value="barExpense"><input name="name" placeholder="Наименование расхода" required><input name="amount" type="number" min="0.01" step="0.01" placeholder="Сумма, ₽" required><button class="btn primary">Добавить расход</button></form><div class="row"><b class="grow">Всего расходов текущей смены</b><b>'+money(et)+'</b></div>'+ee.slice().reverse().map(e=>'<div class="row"><div class="grow"><b>'+E(e.name)+'</b><div class="muted">'+E(e.who||'')+' · '+E(String(e.at||'').replace('T',' ').slice(0,16))+'</div></div><b>'+money(Number(e.amount)||0)+'</b></div>').join('')+'</div>'}`);

const actionMarker=`}else if(t==='open'){`;
if(!s.includes(actionMarker))throw Error('action marker missing');
s=s.replace(actionMarker,`}else if(t==='barExpense'){if(!canOperate(u))throw Error('Нет доступа');if(!sh)throw Error('Сначала откройте смену');let name=String(f.get('name')||'').trim(),amount=Number(String(f.get('amount')||'0').replace(',','.'));if(!name)throw Error('Укажите наименование расхода');if(!Number.isFinite(amount)||amount<=0)throw Error('Укажите сумму расхода');s.barExpenses=s.barExpenses||[];s.barExpenses.push({id:U(),shiftId:sh.id,name:name.slice(0,120),amount,at:new Date().toISOString(),who:u.name})}else if(t==='open'){`);

const statsMarker=`if(view==='stats'&&isAdmin(u)){`;
if(!s.includes(statsMarker))throw Error('stats marker missing');
s=s.replace(statsMarker,`if(view==='expensestats'&&isAdmin(u)){let from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'',sid=url.searchParams.get('shift')||'',norm=v=>v?new Date(v).getTime():null,ft=norm(from),tt=norm(to),rows=(s.barExpenses||[]).filter(e=>{let t=new Date(e.at).getTime();return(!ft||t>=ft)&&(!tt||t<=tt)&&(!sid||e.shiftId===sid)}).slice().reverse(),total=rows.reduce((n,e)=>n+(Number(e.amount)||0),0);body+='<div class="card"><h2>Расходы</h2><form class="inline" method="get"><input type="hidden" name="view" value="expensestats"><label>С <input name="from" type="datetime-local" value="'+E(from)+'"></label><label>По <input name="to" type="datetime-local" value="'+E(to)+'"></label><select name="shift"><option value="">Все смены</option>'+s.shifts.slice().reverse().map(x=>'<option value="'+E(x.id)+'" '+(sid===x.id?'selected':'')+'>'+E(String(x.opened||'').replace('T',' ').slice(0,16))+'</option>').join('')+'</select><button class="btn primary">Показать</button><a class="btn" href="/?view=expensestats">Сбросить</a></form></div><div class="card"><div class="row"><b class="grow">Всего расходов</b><b>'+money(total)+'</b></div>'+((rows.map(e=>'<div class="row"><div class="grow"><b>'+E(e.name)+'</b><div class="muted">'+E(String(e.at||'').replace('T',' ').slice(0,16))+' · '+E(e.who||'')+'</div></div><b>'+money(Number(e.amount)||0)+'</b></div>').join(''))||'<div class="muted">Расходов за выбранный период нет</div>')+'</div>'}
`+statsMarker);

const navMarker=`<a href="/?view=stats">Бар</a>`;
if(!s.includes(navMarker))throw Error('nav marker missing');
s=s.replace(navMarker,navMarker+`<a href="/?view=expensestats">Расходы</a>`);

const shiftMarker=` if(view==='shiftcalc'&&isAdmin(u)){`;
if(!s.includes(shiftMarker))throw Error('shiftcalc marker missing');
const shiftList=` if(view==='shiftlist'&&isAdmin(u)){let closed=(s.shifts||[]).filter(x=>x.closed).slice().reverse();body+='<div class="card"><h2>Завершённые смены</h2><div class="muted">Можно открыть любую закрытую смену и посмотреть заказы, выручку и расходы.</div></div>'+((closed.map(x=>{let os=(s.orders||[]).filter(o=>o.shiftId===x.id),active=os.filter(o=>!o.cancelled),rev=active.filter(o=>o.paid&&!o.bonus).reduce((n,o)=>n+tot(o),0),ee=(s.barExpenses||[]).filter(e=>e.shiftId===x.id),ex=ee.reduce((n,e)=>n+(Number(e.amount)||0),0);return '<details class="card"><summary><b>'+E(String(x.opened||'').replace('T',' ').slice(0,16))+' → '+E(String(x.closed||'').replace('T',' ').slice(0,16))+'</b> · выручка '+money(rev)+' · расходы '+money(ex)+'</summary><div class="row"><div class="grow">Заказов: '+active.length+' · отменено: '+os.filter(o=>o.cancelled).length+'</div><b>Итог: '+money(rev-ex)+'</b></div><h3>Расходы</h3>'+(ee.map(e=>'<div class="row"><div class="grow">'+E(e.name)+'</div><b>'+money(Number(e.amount)||0)+'</b></div>').join('')||'<div class="muted">Нет расходов</div>')+'<h3>Заказы</h3>'+(os.slice().reverse().map(o=>'<div class="row"><div class="grow"><b>'+E(o.table||'')+'</b><div class="muted">'+E(o.employee||'')+' · '+E(String(o.created||'').replace('T',' ').slice(0,16))+(o.cancelled?' · отменён':'')+'</div></div><b>'+money(o.cancelled||o.bonus?0:tot(o))+'</b></div>').join('')||'<div class="muted">Нет заказов</div>')+'</details>'}).join(''))||'<div class="card muted">Завершённых смен пока нет</div>')}
`;
s=s.replace(shiftMarker,shiftList+shiftMarker);

const redirectOld=`t==='order'||t==='pay'||t==='cancelOrder'?'orders':'overview'`;
if(!s.includes(redirectOld))throw Error('redirect marker missing');
s=s.replace(redirectOld,`t==='barExpense'?'overview':t==='order'||t==='pay'||t==='cancelOrder'?'orders':'overview'`);

if(!s.includes("view==='expensestats'")||!s.includes("view==='shiftlist'")||!s.includes("t==='barExpense'"))throw Error('patch incomplete');
fs.writeFileSync(p,s);
console.log('Expenses and completed shifts applied');
