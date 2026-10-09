import fs from 'node:fs';
const p='worker-direct.js'; let s=fs.readFileSync(p,'utf8');
if(s.includes('MALINA_SHIFT_SECTION_V3')) process.exit(0);
// Apply the existing v2 migration first when needed.
if(!s.includes('MALINA_SHIFT_SECTION_V2')) throw new Error('Run v2 migration first');
// Keep shift date immutable and based on the local date submitted by the browser.
s=s.replace("let now=new Date(),bd=now.toISOString().slice(0,10),p=s.calcShifts.at(-1);s.calcShifts.push({id:U(),opened:now.toISOString(),businessDate:bd,closed:null,groups:","let now=new Date(),bd=String(f.get('shiftDate')||'');if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(bd))bd=now.toISOString().slice(0,10);let p=s.calcShifts.at(-1);s.calcShifts.push({id:U(),opened:now.toISOString(),businessDate:bd,closed:null,cash:{start:{1:0,5:0,10:0,50:0,100:0},end:{1:0,5:0,10:0,50:0,100:0}},groups:");
// Opening button submits browser-local business date.
s=s.replace("<input type=\"hidden\" name=\"type\" value=\"calcOpen\"><button class=\"btn primary\">Открыть текущую смену</button>","<input type=\"hidden\" name=\"type\" value=\"calcOpen\"><input type=\"hidden\" name=\"shiftDate\" id=\"shiftDate\"><script>(()=>{let d=new Date(),p=n=>String(n).padStart(2,'0');document.getElementById('shiftDate').value=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())})()</script><button class=\"btn primary\">Открыть текущую смену</button>");
// Save cash denomination quantities when fields exist.
s=s.replace("for(let i=0;i<6;i++){x.groups[i]", "x.cash=x.cash||{start:{},end:{}};for(let d of [1,5,10,50,100]){x.cash.start[d]=num('cs'+d);x.cash.end[d]=num('ce'+d)}for(let i=0;i<6;i++){x.groups[i]");
// Insert clear cash start/end block before buttons.
const cash=`<div class="card"><h3>Касса на начало смены</h3><div class="muted">Укажите количество купюр/монет каждого номинала</div>${[1,5,10,50,100].map(d=>`<div class="row"><b class="grow">${d}</b><input name="cs${d}" type="number" min="0" step="1" value="'+n(show.cash?.start?.[${d}])+'" '+(lock?'disabled':'')+'><span>шт. =</span><b>'+fmt(n(show.cash?.start?.[${d}])*${d})+'</b></div>`).join('')}<div class="row"><b class="grow">Итого в кассе на начало смены</b><b>'+fmt([1,5,10,50,100].reduce((a,d)=>a+n(show.cash?.start?.[d])*d,0))+'</b></div></div><div class="card"><h3>Касса на конец смены</h3>${[1,5,10,50,100].map(d=>`<div class="row"><b class="grow">${d}</b><input name="ce${d}" type="number" min="0" step="1" value="'+n(show.cash?.end?.[${d}])+'" '+(lock?'disabled':'')+'><span>шт. =</span><b>'+fmt(n(show.cash?.end?.[${d}])*${d})+'</b></div>`).join('')}<div class="row"><b class="grow">Изменение кассы</b><b>'+fmt(Math.abs([1,5,10,50,100].reduce((a,d)=>a+(n(show.cash?.end?.[d])-n(show.cash?.start?.[d]))*d,0)))+'</b></div></div>`;
s=s.replace("<div class=\"card\"><h3>Кнопки · группы 1–6</h3>",cash+"<div class=\"card\"><h3>Кнопки · группы 1–6</h3>");
// Monthly statistics explicitly includes total revenue.
s=s.replace("<span>Расходы '+fmt(z.expenses)+'</span><b>Итог '+fmt(z.buttons+z.tables-z.expenses)+'</b>","<span>Выручка '+fmt(z.buttons+z.tables)+'</span><span>Расходы '+fmt(z.expenses)+'</span><b>Итог '+fmt(z.buttons+z.tables-z.expenses)+'</b>");
s=s.replace('/* MALINA_SHIFT_SECTION_V2 */','/* MALINA_SHIFT_SECTION_V2 MALINA_SHIFT_SECTION_V3 */');
fs.writeFileSync(p,s);
console.log('MALINA shift section v3 applied');
