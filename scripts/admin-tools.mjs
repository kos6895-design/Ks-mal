import fs from 'node:fs';

const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// Fix the malformed confirmation string introduced by the previous admin-tools patch.
// Using &quot; keeps the generated HTML attribute valid and avoids breaking the outer JS string.
s=s.replaceAll("confirm(\\\\'Удалить сотрудника?\\\\')", "confirm(&quot;Удалить сотрудника?&quot;)");
s=s.replaceAll("confirm(\\'Удалить сотрудника?\\')", "confirm(&quot;Удалить сотрудника?&quot;)");

// Safety checks: the requested admin controls must still be present.
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
must(s.includes("view==='staff'&&u.role==='admin'"),'staff page missing');
must(s.includes("view==='audit'&&u.role==='admin'"),'audit page missing');
must(s.includes("adminDeleteShift"),'shift delete action missing');
must(s.includes("adminDeleteInventory"),'inventory delete action missing');
must(s.includes("name=\"comment\" placeholder=\"Причина удаления\" required"),'required deletion reason missing');

fs.writeFileSync(p,s);
console.log('MALINA worker syntax fixed; admin deletion controls preserved');
