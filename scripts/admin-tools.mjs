import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

const navStart=s.indexOf('function nav(u){');
const navEnd=s.indexOf('\nasync function page(',navStart);
if(navStart<0||navEnd<0)throw Error('nav markers missing');
const nav=`function nav(u){
  if(!isAdmin(u))return '<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a></div>';
  if(u.role==='hall_admin')return '<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a><a href="/?view=stock">Склад</a><a href="/?view=inventory">Инвентаризация</a><div class="nav-title">ЗАЛ</div><a href="/?view=shiftcalc">Текущая смена</a><a href="/?view=shiftlist">Список смен</a></div>';
  let x='<div class="nav"><div class="nav-title">БАР</div><a href="/?view=overview">Обзор</a><a href="/?view=orders">Заказы</a><a href="/?view=prep">Приготовление</a><a href="/?view=stock">Склад</a><a href="/?view=purchaseprices">Закупочные цены</a><a href="/?view=inventory">Инвентаризация</a><a href="/?view=menu">Меню</a><a href="/?view=recipes">Техкарты</a><div class="nav-title">ЗАЛ</div><a href="/?view=shiftcalc">Текущая смена</a><a href="/?view=shiftlist">Список смен</a><div class="nav-title">СТАТИСТИКА</div><a href="/?view=stats">Бар</a><a href="/?view=coststats">Себестоимость смен</a><a href="/?view=productusage">Расход продуктов</a><a href="/?view=shiftstats">Расчёт смен</a>';
  if(u.role==='admin')x+='<div class="nav-title">АДМИНИСТРИРОВАНИЕ</div><a href="/?view=staff">Сотрудники</a><a href="/?view=audit">Действия сотрудников</a>';
  return x+'</div>';
}`;
s=s.slice(0,navStart)+nav+s.slice(navEnd);

const old=`if(view==='shiftlist'&&isAdmin(u)){let closed=(s.shifts||[]).filter(x=>x.closed).slice().reverse();`;
const neu=`if(view==='shiftlist'&&isAdmin(u)){let closed=(s.shifts||[]).filter(x=>x.closed).slice().reverse();if(u.role==='hall_admin')closed=closed.slice(0,2);`;
if(!s.includes(old))throw Error('shiftlist marker missing');
s=s.replace(old,neu);

if(!s.includes("if(u.role==='hall_admin')return")||!s.includes("closed=closed.slice(0,2)"))throw Error('hall admin access patch incomplete');
fs.writeFileSync(p,s);
console.log('Hall admin navigation and shift history limited');
