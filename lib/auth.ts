import {db} from './db';
import type {User} from './bar';
export async function hash(pin:string,salt:string){const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},raw,256);return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');}
export async function session(req:Request):Promise<User|null>{const token=req.headers.get('cookie')?.match(/(?:^|;\s*)bar_session=([^;]+)/)?.[1];if(!token)return null;return await db().prepare('SELECT u.id,u.name,u.role FROM bar_users u JOIN bar_sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>?').bind(token,Date.now()).first<User>();}
export function sameOrigin(req:Request){const o=req.headers.get('origin');if(!o||o!==new URL(req.url).origin)throw Error('Недопустимый источник запроса');}
export const safeUser=(u:User)=>({id:u.id,name:u.name,role:u.role});
