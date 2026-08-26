const fs = require("fs");
let content = fs.readFileSync("server/routers.ts", "utf8");
content = content.replace(
  "  }),\n, //  Users Management (Admin) \n  users: router({",
  "  //  Users Management (Admin) \n  users: router({"
);
// wait, the previous `}),` was for the `swap` block. So it SHOULD be `  }),\n  // Users Management`.
content = content.replace(
  "  }),\r\n, //  Users Management (Admin) ",
  "  }),\r\n  //  Users Management (Admin) "
);
content = content.replace(
  "  }),\n, //  Users Management (Admin) ",
  "  }),\n  //  Users Management (Admin) "
);

fs.writeFileSync("server/routers.ts", content);
console.log("Fixed routers.ts comma");
