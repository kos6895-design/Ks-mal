import fs from 'node:fs';
const p='worker-direct.js';let s=fs.readFileSync(p,'utf8');
const logo=fs.readFileSync('assets/malina-logo.b64','utf8').trim();
// Always repair the embedded image from the checked-in logo asset.
const dataUri='data:image/jpeg;base64,'+logo;
if(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+/.test(s)) s=s.replace(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+/g,dataUri);
else s=s.replace('<div class="brand">MALINA','<div class="brand"><img class="brand-logo" src="'+dataUri+'" alt="MALINA">MALINA');
// Keep navigation valid and free of injected image markup.
const nav=`function nav(u){if(!isAdmin(u))return '<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a></div>';return '<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a><a href="/?view=stock">Склад</a><a href="/?view=inventory">Инвентаризация</a><a href="/?view=menu">Меню</a><a href="/?view=recipes">Техкарты</a><div class="nav-title">ЗАЛ</div><a href="/?view=shiftcalc">Текущая смена</a><a href="/?view=shiftlist">Список смен</a><div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=shiftstats">Расчёт смен</a></div>'}`;
const m=s.match(/function nav\(u\)\{.*?\}\nasync function page/s);if(!m)throw new Error('nav function not found');
s=s.replace(m[0],nav+'\nasync function page');
if(!s.includes('MALINA_LOGO_ASSET_V7')) s=s.replace('MALINA_LOGO_FIX_V6','MALINA_LOGO_FIX_V6 MALINA_LOGO_ASSET_V7');
fs.writeFileSync(p,s);console.log('MALINA logo asset repaired');
