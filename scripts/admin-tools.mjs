import fs from 'node:fs';

const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');

// Previous generated HTML contained \\' inside single-quoted JS strings.
// Replace the malformed onsubmit attributes with quote-safe HTML entities.
s=s.replace(/onsubmit="return confirm\(\\\\'Удалить сотрудника\?\\\\'\)"/g,
  'onsubmit="return confirm(&quot;Удалить сотрудника?&quot;)"');
s=s.replace(/onsubmit="return confirm\(\\\\'Удалить инвентаризацию\?\\\\'\)"/g,
  'onsubmit="return confirm(&quot;Удалить инвентаризацию?&quot;)"');

// Also handle the one-backslash variant if present.
s=s.replace(/onsubmit="return confirm\(\\'Удалить сотрудника\?\\'\)"/g,
  'onsubmit="return confirm(&quot;Удалить сотрудника?&quot;)"');
s=s.replace(/onsubmit="return confirm\(\\'Удалить инвентаризацию\?\\'\)"/g,
  'onsubmit="return confirm(&quot;Удалить инвентаризацию?&quot;)"');

if(!s.includes("adminDeleteShift")) throw new Error('shift delete action missing');
if(!s.includes("name=\"comment\" placeholder=\"Причина удаления\" required")) throw new Error('required deletion reason missing');

// Force a worker commit so the Cloudflare deploy workflow is triggered.
s=s.replace(/\/\* MALINA_DEPLOY_FIX_[^*]* \*\/\n?$/,'');
s+='\n/* MALINA_DEPLOY_FIX_20261010 */\n';
fs.writeFileSync(p,s);
console.log('Worker repaired and marked for deployment');
