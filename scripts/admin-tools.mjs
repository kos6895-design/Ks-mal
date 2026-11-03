import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// Add Expenses link to HALL navigation for both hall admin and owner.
s=s.replace('<a href="/?view=shiftlist">Список смен</a><a href="/?view=debts">Долги</a></div>', '<a href="/?view=shiftlist">Список смен</a><a href="/?view=debts">Долги</a><a href="/?view=calcexpenses">Расходы</a></div>');
s=s.replace('<a href="/?view=shiftlist">Список смен</a><a href="/?view=shiftstats">Статистика смен</a><a href="/?view=debts">Долги</a>', '<a href="/?view=shiftlist">Список смен</a><a href="/?view=shiftstats">Статистика смен</a><a href="/?view=debts">Долги</a><a href="/?view=calcexpenses">Расходы</a>');

// Allow adding an expense directly to every closed calculation shift.
const shiftListNeedle="+'<h3>Заказы</h3>'";
const shiftListInsert="+'<h3>Добавить расход</h3><form class=\"inline\" method=\"post\" action=\"/action\"><input type=\"hidden\" name=\"type\" value=\"calcClosedExpense\"><input type=\"hidden\" name=\"id\" value=\"'+E(x.id)+'\"><input name=\"name\" placeholder=\"Наименование расхода\" required><input name=\"amount\" type=\"number\" min=\"0.01\" step=\"0.01\" placeholder=\"Сумма\" required><button class=\"btn primary\">Добавить расход</button></form><h3>Заказы</h3>'";
if(!s.includes(shiftListNeedle))throw Error('shift list orders marker missing');
s=s.replace(shiftListNeedle,shiftListInsert);

// Add grouped expense report for calculation shifts.
const reportMarker=" if(view==='shiftstats'&&isAdmin(u)){";
const ri=s.indexOf(reportMarker);
if(ri<0)throw Error('shiftstats marker missing');
const report=` if(view==='calcexpenses'&&isAdmin(u)){let cs=s.calcShifts||[],from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'',norm=v=>v?new Date(v).getTime():null,ft=norm(from),tt=norm(to),inRange=x=>{let t=new Date((x.businessDate||String(x.opened||'').slice(0,10))+'T00:00:00').getTime();return(!ft||t>=ft)&&(!tt||t<=tt)},rows=cs.filter(inRange),groups=new Map,total=0;for(let x of rows)for(let e of (x.expenses||[])){let name=String(e.name||'Без наименования').trim()||'Без наименования',key=name.toLocaleLowerCase('ru'),r=groups.get(key)||{name,amount:0,count:0};r.amount+=Number(e.amount)||0;r.count++;total+=Number(e.amount)||0;groups.set(key,r)}let gr=[...groups.values()].sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name,'ru'));body+='<div class="card"><h2>Расходы</h2><div class="muted">Расходы расчётных смен сгруппированы по наименованию.</div><form class="inline" method="get"><input type="hidden" name="view" value="calcexpenses"><label>С <input name="from" type="date" value="'+E(from)+'"></label><label>По <input name="to" type="date" value="'+E(to)+'"></label><button class="btn primary">Показать</button><a class="btn" href="/?view=calcexpenses">Сбросить</a></form></div><div class="grid"><div class="card"><div class="muted">Общий расход</div><div class="big">'+money(total)+'</div></div><div class="card"><div class="muted">Наименований</div><div class="big">'+gr.length+'</div></div></div><div class="card"><div class="row"><b class="grow">Наименование</b><b>Количество</b><b style="min-width:120px;text-align:right">Сумма</b></div>'+(gr.map(r=>'<div class="row"><div class="grow"><b>'+E(r.name)+'</b></div><span>'+r.count+'</span><b style="min-width:120px;text-align:right">'+money(r.amount)+'</b></div>').join('')||'<div class="muted">Расходов за выбранный период нет</div>')+'</div>'}\n`;
s=s.slice(0,ri)+report+s.slice(ri);

// Add action for closed-shift expense. Closed status is intentionally allowed.
const actionMarker="}else if(t==='calcOpen'){";
const ai=s.indexOf(actionMarker);
if(ai<0)throw Error('calcOpen action marker missing');
const action=`}else if(t==='calcClosedExpense'){if(!isAdmin(u))throw Error('Нет доступа');let x=(s.calcShifts||[]).find(z=>z.id===f.get('id')&&z.closed);if(!x)throw Error('Закрытая смена не найдена');let name=String(f.get('name')||'').trim(),amount=Number(String(f.get('amount')||'0').replace(',','.'));if(!name)throw Error('Укажите наименование расхода');if(!Number.isFinite(amount)||amount<=0)throw Error('Укажите сумму расхода');x.expenses=x.expenses||[];x.expenses.push({id:U(),name:name.slice(0,120),amount,at:new Date().toISOString(),who:u.name});`;
s=s.slice(0,ai)+action+s.slice(ai+1);

// Return to shift list after adding a closed-shift expense.
const redirectOld="t.startsWith('calc')?'shiftcalc'";
const redirectNew="t==='calcClosedExpense'?'shiftlist':t.startsWith('calc')?'shiftcalc'";
if(!s.includes(redirectOld))throw Error('calc redirect marker missing');
s=s.replace(redirectOld,redirectNew);

if(!s.includes("view==='calcexpenses'")||!s.includes("t==='calcClosedExpense'")||!s.includes('Общий расход'))throw Error('expense patch incomplete');
fs.writeFileSync(p,s);
console.log('Closed-shift expenses and grouped expense report installed');
