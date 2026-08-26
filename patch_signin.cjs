const fs = require('fs');
let content = fs.readFileSync('client/src/components/Navbar.tsx', 'utf8');

if (!content.includes('UserIcon')) {
  content = content.replace(
    'LayoutDashboard } from "lucide-react";',
    'LayoutDashboard, User as UserIcon } from "lucide-react";'
  );
}

const oldSignInBtn = `            <button
              onClick={() => navigate("/login")}
              className="font-bold text-sm text-slate-500 hover:text-slate-800 hidden md:block transition-colors whitespace-nowrap px-2"
            >
              Sign In
            </button>`;

const newSignInBtn = `            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-sm transition-colors px-2 lg:px-3 py-1.5 rounded-md hidden md:flex items-center gap-1.5 whitespace-nowrap text-slate-600 hover:text-blue-600 hover:bg-slate-50"
            >
              <UserIcon className="w-4 h-4" /> Sign In
            </button>`;

content = content.replace(oldSignInBtn, newSignInBtn);
fs.writeFileSync('client/src/components/Navbar.tsx', content);
console.log('Sign in updated');
