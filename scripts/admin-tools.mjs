import fs from 'node:fs';

const p = 'worker-direct.js';
let s = fs.readFileSync(p, 'utf8');

if (s.includes('MALINA_ADMIN_TOOLS_V3')) {
  console.log('MALINA admin tools v3 already applied');
  process.exit(0);
}

const must = (ok, msg) => {
  if (!ok) throw new Error(msg);
};

// Добавляем раздел администрирования только главному администратору
const navNeedle =
  '<div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=shiftstats">Расчёт смен</a></div>';

must(s.includes(navNeedle), 'navigation anchor not found');

s = s.replace(
  navNeedle,
  '<div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=shiftstats">Расчёт смен</a>' +
  '\'+(u.role===\\\'admin\\\'?\\\'<div class="nav-title">АДМИНИСТРИРОВАНИЕ</div><a href="/?view=staff">Сотрудники</a><a href="/?view=audit">Действия сотрудников</a>\\\':\\\'\\')+\\\'</div>'
);

// Убираем сотрудников с главной страницы
s = s.replace(
  /if\(isAdmin\(u\)\)body\+='<div class="card"><h3>Добавить сотрудника<\/h3>[\s\S]*?q\.results\.map\(x=>[\s\S]*?<\/div>'\)\.join\(''\)\+'<\/div>';/,
  ''
);

// Отдельные страницы сотрудников и журнала действий
const statsAnchor = "if(view==='stats'&&isAdmin(u)){";
must(s.includes(statsAnchor), 'stats page anchor not found');

const pages = `/* MALINA_ADMIN_TOOLS_V3 */
if(view==='staff'&&u.role==='admin'){
  body+='<div class="card"><h2>Сотрудники</h2><div class="muted">Добавление и удаление сотрудников.</div><form class="inline" method="post" action="/auth"><input type="hidden" name="type" value="staff"><input name="name" placeholder="Имя" required><select name="role"><option value="waiter">Официант</option><option value="cook">Повар-бармен</option><option value="hall_admin">Администратор зала</option></select><input name="pin" placeholder="PIN 6–12 цифр" inputmode="numeric" required><button class="btn primary">Добавить</button></form></div><div class="card">'+q.results.map(x=>'<div class="row"><div class="grow"><b>'+E(x.name)+'</b><div class="muted">'+E(roleName(x.role))+'</div></div>'+(x.id!=='owner'&&x.id!==u.id?'<form method="post" action="/auth" onsubmit="return confirm(\\\\'Удалить сотрудника?\\\\')"><input type="hidden" name="type" value="staffDelete"><input type="hidden" name="id" value="'+E(x.id)+'"><button class="btn danger">Удалить</button></form>':'')+'</div>').join('')+'</div>';
}

if(view==='audit'&&u.role==='admin'){
  let aa=(s.logs||[]).slice(0,500);
  body+='<div class="card"><h2>Действия сотрудников</h2><div class="muted">Последние 500 действий. Удаления сохраняются вместе с обязательным комментарием.</div></div><div class="card">'+(aa.map(x=>'<div class="row"><div class="grow"><b>'+E(x.who||'—')+'</b><div>'+E(x.text||'Действие')+'</div><div class="muted">'+E(String(x.at||'').replace('T',' ').slice(0,19))+'</div></div></div>').join('')||'<div class="muted">Действий пока нет</div>')+'</div>';
}
`;

s = s.replace(statsAnchor, pages + statsAnchor);

// Удаление смены
const actionAnchor = "try{if(t==='open'){";
must(s.includes(actionAnchor), 'action handler anchor not found');

const destructive = `try{
if(t==='adminDeleteShift'){
  if(u.role!=='admin')
    throw Error('Только главный администратор может удалять смены');

  let id=String(f.get('id')||'');
  let comment=String(f.get('comment')||'').trim();

  if(!comment)
    throw Error('Укажите причину удаления');

  let x=(s.calcShifts||[]).find(z=>String(z.id)===id)||
        (s.shifts||[]).find(z=>String(z.id)===id);

  if(!x)
    throw Error('Смена не найдена');

  s.calcShifts=(s.calcShifts||[])
    .filter(z=>String(z.id)!==id);

  s.shifts=(s.shifts||[])
    .filter(z=>String(z.id)!==id);

  s.logs=s.logs||[];

  s.logs.unshift({
    id:U(),
    at:new Date().toISOString(),
    who:u.name,
    text:'Удалил смену '+
      (x.businessDate||String(x.opened||'').slice(0,10))+
      ' · Причина: '+comment
  });

}else if(t==='adminDeleteInventory'){

  if(u.role!=='admin')
    throw Error('Только главный администратор может удалять инвентаризации');

  let id=String(f.get('id')||'');
  let comment=String(f.get('comment')||'').trim();

  if(!comment)
    throw Error('Укажите причину удаления');

  let x=(s.inventories||[])
    .find(z=>String(z.id)===id);

  if(!x)
    throw Error('Инвентаризация не найдена');

  s.inventories=(s.inventories||[])
    .filter(z=>String(z.id)!==id);

  s.logs=s.logs||[];

  s.logs.unshift({
    id:U(),
    at:new Date().toISOString(),
    who:u.name,
    text:'Удалил инвентаризацию '+
      String(x.at||'').replace('T',' ').slice(0,16)+
      ' · Причина: '+comment
  });

}else if(t==='open'){`;

s = s.replace(actionAnchor, destructive);

// Добавляем историю инвентаризаций с удалением
const invStatsAnchor = "if(view==='stats'&&isAdmin(u)){";
const invStart = s.indexOf("if(view==='inventory'){");
const invStop = s.indexOf(invStatsAnchor, invStart);

must(
  invStart >= 0 && invStop > invStart,
  'inventory page block not found'
);

const invExtra = `
if(view==='inventory'&&u.role==='admin'){
  let invs=(s.inventories||[]).slice().reverse();

  body+='<div class="card"><h3>История инвентаризаций</h3>'+
  (
    invs.map(x=>
      '<div class="row">'+
        '<div class="grow">'+
          '<b>'+E(String(x.at||"").replace("T"," ").slice(0,16))+'</b>'+
          '<div class="muted">'+E(x.who||"")+'</div>'+
        '</div>'+
        '<form class="admin-delete" method="post" action="/action" '+
        'onsubmit="return confirm(\\\\'Удалить инвентаризацию?\\\\')">'+
          '<input type="hidden" name="type" value="adminDeleteInventory">'+
          '<input type="hidden" name="id" value="'+E(x.id)+'">'+
          '<input name="comment" placeholder="Причина удаления" required>'+
          '<button class="btn danger">Удалить</button>'+
        '</form>'+
      '</div>'
    ).join('') ||
    '<div class="muted">Инвентаризаций пока нет</div>'
  )+
  '</div>';
}
`;

s =
  s.slice(0, invStop) +
  invExtra +
  s.slice(invStop);

// Стили кнопок удаления
s = s.replace(
  '</style></head>',
  '.admin-delete{display:flex;gap:7px;align-items:center;flex-wrap:wrap}' +
  '.admin-delete input{min-width:180px}' +
  '</style></head>'
);

fs.writeFileSync(p, s);

console.log(
  'MALINA admin tools v3 applied successfully'
);
