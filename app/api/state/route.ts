import { db } from '@/lib/db';
import { session,sameOrigin } from '@/lib/auth';
import { apply,type State, type Action } from '@/lib/bar';
import { installBarCard } from '@/lib/bar-menu';
import { installPhotoMenu } from '@/lib/photo-menu';
import { installPreparedStock } from '@/lib/prepared-stock';
import { installInventory } from '@/lib/inventory';
async function read(){
  const binding = db();
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await binding.prepare('SELECT revision,data FROM bar_state WHERE id=1').first<{revision:number;data:string}>();
    if (!row) return null;
    const original = JSON.parse(row.data) as State;
    const updated = installInventory(installPreparedStock(installPhotoMenu(installBarCard(original))));
    if (updated === original) return row;
    const data = JSON.stringify(updated);
    const result = await binding.prepare('UPDATE bar_state SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(data,row.revision).run();
    if (result.meta.changes) return { data, revision: row.revision + 1 };
  }
  throw Error('Данные обновляются. Повторите запрос.');
}
function visible(s:State,role:string){if(role==='admin')return s;return {...s,stockBaseline:undefined,stockMovements:[],inventories:[],orders:s.orders.filter(o=>o.shiftId===s.shifts.find(x=>!x.closed)?.id),logs:[],cashExpenses:[],shifts:s.shifts.filter(x=>!x.closed).map(x=>({...x,openingCash:0,openingStock:undefined})),ingredients:s.ingredients.map(i=>({...i,qty:0}))};}
export async function GET(req:Request){try{const u=await session(req);if(!u)return Response.json({error:'Войдите в приложение'},{status:401});const row=await read();if(!row)throw Error('Учёт не настроен');return Response.json({revision:row.revision,state:visible(JSON.parse(row.data),u.role)},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error(e);return Response.json({error:'Не удалось загрузить учёт. Повторите запрос.'},{status:503})}}
export async function POST(req:Request){try{sameOrigin(req);const u=await session(req);if(!u)return Response.json({error:'Войдите в приложение'},{status:401});const a=await req.json() as {revision:number;action:Action},row=await read();if(!row)throw Error('Учёт не настроен');if(a.revision!==row.revision)return Response.json({error:'Данные изменились на другом устройстве. Обновите экран и повторите действие.'},{status:409});const s=apply(JSON.parse(row.data),a.action,u);const result=await db().prepare('UPDATE bar_state SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(s),row.revision).run();if(!result.meta.changes)return Response.json({error:'Данные изменились. Повторите действие.'},{status:409});return Response.json({state:visible(s,u.role),revision:row.revision+1});}catch(e){console.error(e);return Response.json({error:e instanceof Error?e.message:'Не удалось сохранить данные'},{status:400})}}
