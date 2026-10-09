import fs from 'node:fs';

const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// Add delete controls to operational/bar shifts shown in Statistics.
const oldRow="return '<div class=\"row\"><div class=\"grow\"><b>'+E(String(x.opened).replace('T',' ').slice(0,16))+'</b><div class=\"muted\">'+(x.closed?'Закрыта '+E(String(x.closed).replace('T',' ').slice(0,16)):'Открыта')+' · заказов '+active.length+' · бонусных '+active.filter(o=>o.bonus).length+' · отменено '+os.filter(o=>o.cancelled).length+'</div></div><b>'+money(rev)+'</b></div>'";
const newRow="return '<div class=\"row\"><div class=\"grow\"><b>'+E(String(x.opened).replace('T',' ').slice(0,16))+'</b><div class=\"muted\">'+(x.closed?'Закрыта '+E(String(x.closed).replace('T',' ').slice(0,16)):'Открыта')+' · заказов '+active.length+' · бонусных '+active.filter(o=>o.bonus).length+' · отменено '+os.filter(o=>o.cancelled).length+'</div></div><b>'+money(rev)+'</b>'+(u.role==='admin'?'<form class=\"admin-delete\" method=\"post\" action=\"/action\" onsubmit=\"return confirm(&quot;Удалить смену бара?&quot;)\"><input type=\"hidden\" name=\"type\" value=\"adminDeleteBarShift\"><input type=\"hidden\" name=\"id\" value=\"'+E(x.id)+'\"><input name=\"comment\" placeholder=\"Причина удаления\" required><button class=\"btn danger\">Удалить</button></form>':'')+'</div>'";
if(!s.includes('adminDeleteBarShift')) {
  if(!s.includes(oldRow)) throw new Error('stats shift row not found');
  s=s.replace(oldRow,newRow);
}

// Add server-side deletion handler for bar shifts. Only the main admin can use it.
if(!s.includes("if(t==='adminDeleteBarShift')")) {
  const marker="if(t==='adminDeleteShift'){";
  if(!s.includes(marker)) throw new Error('adminDeleteShift handler not found');
  const handler=`if(t==='adminDeleteBarShift'){
  if(u.role!=='admin') throw Error('Только главный администратор может удалять смены бара');
  let id=String(f.get('id')||'');
  let comment=String(f.get('comment')||'').trim();
  if(!comment) throw Error('Укажите причину удаления');
  let x=(s.shifts||[]).find(z=>String(z.id)===id);
  if(!x) throw Error('Смена бара не найдена');
  s.shifts=(s.shifts||[]).filter(z=>String(z.id)!==id);
  s.logs=s.logs||[];
  s.logs.unshift({id:U(),at:new Date().toISOString(),who:u.name,text:'Удалил смену бара '+String(x.opened||'').replace('T',' ').slice(0,16)+' · Причина: '+comment});
}else `;
  s=s.replace(marker,handler+marker);
}

// Calculation shifts already use adminDeleteShift. Make its lookup strictly calcShifts.
s=s.replace("let x=(s.calcShifts||[]).find(z=>String(z.id)===id)||\n        (s.shifts||[]).find(z=>String(z.id)===id);","let x=(s.calcShifts||[]).find(z=>String(z.id)===id);");

if(!s.includes("value=\"adminDeleteBarShift\"")) throw new Error('bar shift delete UI missing');
if(!s.includes("if(t==='adminDeleteBarShift')")) throw new Error('bar shift delete handler missing');
if(!s.includes("value=\"adminDeleteShift\"")) throw new Error('calculation shift delete UI missing');
if(!s.includes("if(t==='adminDeleteShift')")) throw new Error('calculation shift delete handler missing');

fs.writeFileSync(p,s);
console.log('Admin-only deletion enabled for both bar and calculation shifts');
