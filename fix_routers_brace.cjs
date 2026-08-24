const fs = require('fs');
let content = fs.readFileSync('server/routers.ts', 'utf8');

content = content.replace(
  'listAll: adminProcedure.query(() => listAllSwapListings()),\n  //  Users Management (Admin)',
  'listAll: adminProcedure.query(() => listAllSwapListings()),\n  }),\n\n  //  Users Management (Admin)'
);
content = content.replace(
  'listAll: adminProcedure.query(() => listAllSwapListings()),\r\n  //  Users Management (Admin)',
  'listAll: adminProcedure.query(() => listAllSwapListings()),\r\n  }),\r\n\r\n  //  Users Management (Admin)'
);

fs.writeFileSync('server/routers.ts', content);
console.log('Fixed missing brace in routers.ts');
