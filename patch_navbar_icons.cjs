const fs = require('fs');
let content = fs.readFileSync('client/src/components/Navbar.tsx', 'utf8');

// 1. Add missing imports
if (!content.includes('Shield')) {
  content = content.replace(
    'import { BellRing, X, PlusCircle, Package } from "lucide-react";',
    'import { BellRing, X, PlusCircle, Package, Shield, LayoutDashboard } from "lucide-react";'
  );
}

// 2. Replace the button code
const oldBtn = `          {user ? (
            <button
              onClick={() =>
                navigate(user.role === "admin" ? "/admin" : "/dashboard")
              }
              className={\`font-bold text-sm uppercase tracking-wider transition-colors px-2 lg:px-3 py-2 rounded-lg hidden md:block whitespace-nowrap \${
                location === "/admin" || location === "/dashboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }\`}
            >
              {user.role === "admin" ? "Admin" : "Dashboard"}
            </button>
          ) : (`;

const newBtn = `          {user ? (
            <button
              onClick={() =>
                navigate(user.role === "admin" ? "/admin" : "/dashboard")
              }
              className={\`font-semibold text-sm transition-colors px-2 lg:px-3 py-1.5 rounded-md hidden md:flex items-center gap-1.5 whitespace-nowrap \${
                location === "/admin" || location === "/dashboard"
                  ? "text-blue-600 bg-blue-50/50"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }\`}
            >
              {user.role === "admin" ? (
                <><Shield className="w-4 h-4" /> Admin</>
              ) : (
                <><LayoutDashboard className="w-4 h-4" /> Dashboard</>
              )}
            </button>
          ) : (`;

content = content.replace(oldBtn, newBtn);

fs.writeFileSync('client/src/components/Navbar.tsx', content);
console.log('Navbar updated with Admin and Dashboard icons!');
