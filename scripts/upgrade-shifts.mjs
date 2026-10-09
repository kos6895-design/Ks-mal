import fs from 'node:fs';
const p='worker-direct.js';let s=fs.readFileSync(p,'utf8');
if(s.includes('MALINA_LOGO_FIX_V6'))process.exit(0);
const nav=`function nav(u){if(!isAdmin(u))return '<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a></div>';return '<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a><a href="/?view=stock">Склад</a><a href="/?view=inventory">Инвентаризация</a><a href="/?view=menu">Меню</a><a href="/?view=recipes">Техкарты</a><div class="nav-title">ЗАЛ</div><a href="/?view=shiftcalc">Текущая смена</a><a href="/?view=shiftlist">Список смен</a><div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=shiftstats">Расчёт смен</a></div>'}`;
const m=s.match(/function nav\(u\)\{.*?\}\nasync function page/s);if(!m)throw new Error('nav function not found');
s=s.replace(m[0],nav+'\nasync function page');
// Keep the embedded MALINA logo in the top brand, but remove any malformed logo markup injected into navigation.
s=s.replace('</style></head><body><div class="top"><div class="brand">MALINA', '</style></head><body><div class="top"><div class="brand">MALINA');
s=s.replace('/* MALINA_SHIFT_SECTION_V2 MALINA_SHIFT_SECTION_V3 MALINA_ADMIN_NAV_V4 MALINA_GOLD_THEME_V5 */','/* MALINA_SHIFT_SECTION_V2 MALINA_SHIFT_SECTION_V3 MALINA_ADMIN_NAV_V4 MALINA_GOLD_THEME_V5 MALINA_LOGO_FIX_V6 */');
fs.writeFileSync(p,s);console.log('MALINA logo/nav syntax fixed');
