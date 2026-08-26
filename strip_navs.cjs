const fs = require("fs");

// 1. Remove the nav from Directory.tsx
let dir = fs.readFileSync("client/src/pages/Directory.tsx", "utf8");
const dirNavRegex =
  /\{\/\* Top Navigation Bar \*\/\}\s*<nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">[\s\S]*?<\/nav>\s*/;
dir = dir.replace(dirNavRegex, "");
fs.writeFileSync("client/src/pages/Directory.tsx", dir);
console.log("Removed nav from Directory.tsx");

// 2. Remove the nav from Calendar.tsx
let cal = fs.readFileSync("client/src/pages/Calendar.tsx", "utf8");
const calNavRegex =
  /\{\/\* Top Navigation \*\/\}\s*<nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">[\s\S]*?<\/nav>\s*/;
cal = cal.replace(calNavRegex, "");
fs.writeFileSync("client/src/pages/Calendar.tsx", cal);
console.log("Removed nav from Calendar.tsx");
