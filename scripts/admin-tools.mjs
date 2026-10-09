import fs from 'node:fs';

const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');
if(s.includes('MALINA_ADMIN_TOOLS_V4')) process.exit(0);
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

// Main-admin-only navigation.
s=s.replace(/function nav\(u\)\{[\s\S]*?\}\nasync function page/, `function nav(u){
  if(!isAdmin(u))return '<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a></div>';
  let x='<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a><a href="/?view=stock">Склад</a><a href="/?view=inventory">Инвентаризация</a><a href="/?view=menu">Меню</a><a href="/?view=recipes">Техкарты</a><div class="nav-title">ЗАЛ</div><a href="/?view=shiftcalc">Текущая смена</a><a href="/?view=shiftlist">Список смен</a><div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=shiftstats">Расчёт смен</a>';
  if(u.role==='admin')x+='<div class="nav-title">АДМИНИСТРИРОВАНИЕ</div><a href="/?view=staff">Сотрудники</a><a href="/?view=audit">Действия сотрудников</a>';
  return x+'</div>';
}
async function page`);

// Remove staff management from Overview.
const overviewStaff=/;if\(isAdmin\(u\)\)body\+='<div class="card"><h3>Добавить сотрудника<\/h3>[\s\S]*?\.join\(''\)\+'<\/div>'(?=\})/;
must(overviewStaff.test(s),'overview staff block not found');
s=s.replace(overviewStaff,'');

// Add delete control to calculated shift list, only for main admin.
const oldShift="cs.slice().reverse().map(x=>'<a class=\"row\" href=\"/?view=shiftcalc&id='+E(x.id)+'\"><div class=\"grow\"><b>'+E(x.businessDate||String(x.opened||'').slice(0,10))+'</b><div class=\"muted\">Открыта '+E(String(x.opened||'').replace('T',' ').slice(0,16))+(x.closed?' · закрыта '+E(String(x.closed).replace('T',' ').slice(0,16)):' · открыта сейчас')+'</div></div><span>Выручка '+fmt(bt(x)+tt(x))+'</span><b>Итог '+fmt(bt(x)+tt(x)-ex(x))+'</b></a>').join('')";
const newShift="cs.slice().reverse().map(x=>'<div class=\"row\"><a class=\"grow\" href=\"/?view=shiftcalc&id='+E(x.id)+'\"><b>'+E(x.businessDate||String(x.opened||'').slice(0,10))+'</b><div class=\"muted\">Открыта '+E(String(x.opened||'').replace('T',' ').slice(0,16))+(x.closed?' · закрыта '+E(String(x.closed).replace('T',' ').slice(0,16)):' · открыта сейчас')+'</div><div>Выручка '+fmt(bt(x)+tt(x))+' · Итог '+fmt(bt(x)+tt(x)-ex(x))+'</div></a>'+(u.role==='admin'?'<form class=\"admin-delete\" method=\"post\" action=\"/action\"><input type=\"hidden\" name=\"type\" value=\"adminDeleteShift\"><input type=\"hidden\" name=\"id\" value=\"'+E(x.id)+'\"><input name=\"comment\" placeholder=\"Причина удаления\" required><button class=\"btn danger\">Удалить</button></form>':'')+'</div>').join('')";
must(s.includes(oldShift),'shift list anchor not found');
s=s.replace(oldShift,newShift);

// Inventory delete: use timestamp as stable key so old inventories can also be deleted.
s=s.replace("let id=String(f.get('id')||'');\n  let comment=String(f.get('comment')||'').trim();\n\n  if(!comment)\n    throw Error('Укажите причину удаления');\n\n  let x=(s.inventories||[])\n    .find(z=>String(z.id)===id);", "let key=String(f.get('key')||'');\n  let comment=String(f.get('comment')||'').trim();\n\n  if(!comment) throw Error('Укажите причину удаления');\n  let x=(s.inventories||[]).find(z=>String(z.at)===key);");
s=s.replace("s.inventories=(s.inventories||[])\n    .filter(z=>String(z.id)!==id);", "s.inventories=(s.inventories||[]).filter(z=>String(z.at)!==key);");
s=s.replace("<input type=\"hidden\" name=\"id\" value=\"'+E(x.id)+'\">'+\n          '<input name=\"comment\" placeholder=\"Причина удаления\" required>", "<input type=\"hidden\" name=\"key\" value=\"'+E(x.at)+'\">'+\n          '<input name=\"comment\" placeholder=\"Причина удаления\" required>");

// Shift deletion must preserve operational orders/history; delete only calculation shift.
s=s.replace(/\n\s*s\.shifts=\(s\.shifts\|\|\[\]\)\n\s*\.filter\(z=>String\(z\.id\)!==id\);/,'');

// Staff create/delete is main-admin-only even on direct POST.
s=s.replace("if(t==='staff'){let u=await usr(req,env);if(!isAdmin(u))", "if(t==='staff'){let u=await usr(req,env);if(u?.role!=='admin')");
s=s.replace("if(t==='staffDelete'){let u=await usr(req,env);if(!isAdmin(u))", "if(t==='staffDelete'){let u=await usr(req,env);if(u?.role!=='admin')");

// Mark version and validate required UI/actions.
s=s.replace('/* MALINA_SHIFT_SECTION_V2', '/* MALINA_ADMIN_TOOLS_V4 MALINA_SHIFT_SECTION_V2');
must(s.includes("view==='staff'&&u.role==='admin'"),'staff page missing');
must(s.includes("view==='audit'&&u.role==='admin'"),'audit page missing');
must(s.includes("adminDeleteShift"),'shift delete action missing');
must(s.includes("adminDeleteInventory"),'inventory delete action missing');
fs.writeFileSync(p,s);
console.log('MALINA admin tools v4 applied');
