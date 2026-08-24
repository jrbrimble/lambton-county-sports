const fs = require('fs');
let content = fs.readFileSync('server/routers.ts', 'utf8');

// The users block was inserted after the closing }); of appRouter.
// I will just use regex to fix the closing brace.
content = content.replace(
  /}\);\s*\/\/\s*── Users Management \(Admin\)/,
  ', // ── Users Management (Admin)'
);
// wait, the exact string injected was:
/*
  }),

  // ── Users Management (Admin) ─────────────────────────────────────────────────
  users: router({
  ...
  }),

export type AppRouter = typeof appRouter;
*/

// If the original had `});\n\nexport type AppRouter = typeof appRouter;`
// And I replaced `export type AppRouter...` with the users router and `export type...`
// Then it looks like:
// });
// 
//   // ── Users Management (Admin)
//   users: router({ ... }),
// export type AppRouter = typeof appRouter;

content = content.replace('});\n\n  // ── Users Management', '  // ── Users Management');
content = content.replace('  }),\n\nexport type AppRouter', '  }),\n});\n\nexport type AppRouter');
// actually let's just make it robust:
content = content.replace(/}\);\s*\/\/\s*── Users Management/, '  // ── Users Management');
content = content.replace(/  }\),\s*export type AppRouter/, '  }),\n});\n\nexport type AppRouter');

fs.writeFileSync('server/routers.ts', content);
console.log('routers.ts syntax fixed');
