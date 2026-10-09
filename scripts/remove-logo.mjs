import fs from 'node:fs';
const p='worker-direct.js';
let s=fs.readFileSync(p,'utf8');
// Remove embedded logo images from header/navigation while keeping MALINA text branding.
s=s.replace(/<img class="brand-logo"[^>]*>/g,'');
s=s.replace(/<img class="nav-logo"[^>]*>/g,'');
// Hide any legacy logo elements that may remain in older generated markup.
s=s.replace('</style></head>','.brand-logo,.nav-logo{display:none!important}</style></head>');
fs.writeFileSync(p,s);
console.log('MALINA logo removed');
