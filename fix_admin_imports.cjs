const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Admin.tsx', 'utf8');
content = content.replace('RefreshCw, Loader2\r\n  UsersIcon, Package, Download', 'RefreshCw, Loader2,\r\n  UsersIcon, Package, Download');
content = content.replace('RefreshCw, Loader2\n  UsersIcon, Package, Download', 'RefreshCw, Loader2,\n  UsersIcon, Package, Download');

fs.writeFileSync('client/src/pages/Admin.tsx', content);
console.log('Fixed Admin.tsx imports');
