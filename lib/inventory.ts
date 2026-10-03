import type { State, Ingredient } from './bar';

export type StockSnapshot={at:string;items:Ingredient[]};
export type StockMovement={id:string;at:string;who:string;ingredientId:string;kind:'receipt'|'consumption';qty:number;shiftId?:string;orderId?:string;lineId?:string};
export type InventoryRow={id:string;name:string;unit:string;opening:number;received:number;consumed:number;expected:number;actual:number;difference:number};
export type InventoryRecord={id:string;at:string;who:string;from:string;movementEnd:number;rows:InventoryRow[];shiftId?:string};
export const rounded=(n:number)=>Math.round(n*1000)/1000;
export const stamp=(at:string)=>new Date(at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'});
export function installInventory(s:State,now=new Date().toISOString()):State{
 if(s.stockBaseline)return s;
 return {...s,stockBaseline:{at:now,items:structuredClone(s.ingredients)},stockMovements:[],inventories:[]};
}
export function stockSignature(s:State){return JSON.stringify([s.stockMovements?.length??0,s.inventories?.at(-1)?.id??'',s.ingredients.map(i=>[i.id,i.qty])]);}
export function inventoryRows(s:State):InventoryRow[]{
 const previous=s.inventories?.at(-1),start=previous?.movementEnd??0;
 const movements=(s.stockMovements??[]).slice(start);
 return s.ingredients.map(i=>{
  const opening=previous?.rows.find(r=>r.id===i.id)?.actual??s.stockBaseline?.items.find(r=>r.id===i.id)?.qty??0;
  const received=rounded(movements.filter(m=>m.ingredientId===i.id&&m.kind==='receipt').reduce((n,m)=>n+m.qty,0));
  const consumed=rounded(movements.filter(m=>m.ingredientId===i.id&&m.kind==='consumption').reduce((n,m)=>n+m.qty,0));
  return {id:i.id,name:i.name,unit:i.unit,opening,received,consumed,expected:rounded(opening+received-consumed),actual:0,difference:0};
 });
}
export function statisticsCsv(s:State){
 const rows:(string|number)[][]=[['MALINA — статистика и инвентаризация'],['Время: Москва (UTC+3)'],[],['НАЧАЛО УЧЁТА ОСТАТКОВ'],['Дата и время','Наименование','Ед.','Остаток']];
 for(const i of s.stockBaseline?.items??[])rows.push([stamp(s.stockBaseline!.at),i.name,i.unit,i.qty]);
 rows.push([],['НАЧАЛО РАБОТЫ ПО СМЕНАМ'],['Дата и время открытия','Дата смены','Наименование','Ед.','Остаток']);
 for(const sh of s.shifts){if(sh.openingStock){for(const i of sh.openingStock)rows.push([stamp(sh.opened),sh.date,i.name,i.unit,i.qty]);}else rows.push([stamp(sh.opened),sh.date,'Начальные остатки не фиксировались']);}
 rows.push([],['ИНВЕНТАРИЗАЦИИ'],['Начало периода','Дата и время проверки','Сотрудник','Наименование','Ед.','На начало','Приход','Расход по техкартам','Ожидалось','Факт','Расхождение (факт − ожидалось)']);
 for(const inv of s.inventories??[])for(const r of inv.rows)rows.push([stamp(inv.from),stamp(inv.at),inv.who,r.name,r.unit,r.opening,r.received,r.consumed,r.expected,r.actual,r.difference]);
 rows.push([],['ТЕКУЩИЙ ПЕРИОД'],['С','По','Наименование','Ед.','На начало','Приход','Расход по техкартам','Ожидалось']);
 for(const r of inventoryRows(s))rows.push([s.stockBaseline?stamp(s.inventories?.at(-1)?.at??s.stockBaseline.at):'',stamp(new Date().toISOString()),r.name,r.unit,r.opening,r.received,r.consumed,r.expected]);
 rows.push([],['АРХИВ ПЕРЕСЧЁТОВ ПРИ ЗАКРЫТИИ СМЕН'],['Дата проверки','Наименование','Ед.','Ожидалось','Факт','Расхождение']);
 for(const sh of s.shifts.filter(sh=>sh.closed&&sh.stockCounts))for(const [id,qty] of Object.entries(sh.stockCounts!)){const i=s.ingredients.find(i=>i.id===id);rows.push([stamp(sh.closed!),i?.name??id,i?.unit??'',sh.stockExpected?.[id]??'',qty,rounded(qty-(sh.stockExpected?.[id]??qty))]);}
 rows.push([],['ЖУРНАЛ ДЕЙСТВИЙ'],['Дата и время','Сотрудник','Действие']);
 for(const l of s.logs)rows.push([stamp(l.at),l.who,l.text]);
 const cell=(v:string|number)=>{let text=typeof v==='number'?String(v).replace('.',','):v;if(typeof v==='string'&&/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'}; 
 return '\uFEFF'+rows.map(r=>r.map(cell).join(';')).join('\r\n');
}
