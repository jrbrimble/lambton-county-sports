const fs = require("fs");

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  // Remove all non-ASCII characters
  content = content.replace(/[^\x00-\x7F]/g, "");
  fs.writeFileSync(filePath, content);
  console.log("Cleaned", filePath);
}

cleanFile("client/src/pages/Admin.tsx");
cleanFile("server/routers.ts");
cleanFile("drizzle/schema.ts");
cleanFile("server/db.ts");
