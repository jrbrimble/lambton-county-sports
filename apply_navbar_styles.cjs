const fs = require('fs');
let content = fs.readFileSync('client/src/components/Navbar.tsx', 'utf8');

// 1. Update imports
content = content.replace(
  'import { BellRing, X } from "lucide-react";',
  'import { BellRing, X, PlusCircle, Package } from "lucide-react";'
);

// 2. Update nav class
content = content.replace(
  '<nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">',
  '<nav className="w-full bg-white/85 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">'
);

// 3. Update Submit A Program button
const oldSubmitBtn = `                <button
                  className={\`font-semibold text-sm transition-colors whitespace-nowrap \${
                    location === "/"
                      ? "text-slate-600 hover:text-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }\`}
                >
                  Submit A Program
                </button>`;
const newSubmitBtn = `                <button
                  className={\`font-semibold text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1.5 rounded-md \${
                    location === "/"
                      ? "text-slate-600 hover:text-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }\`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit A Program
                </button>`;
content = content.replace(oldSubmitBtn, newSubmitBtn);

// 4. Update Equipment Swap button
const oldSwapBtn = `            <button
              onClick={() => navigate("/swap")}
              className={\`font-semibold text-sm transition-colors whitespace-nowrap \${
                location === "/swap"
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }\`}
            >
              Equipment Swap
            </button>`;
const newSwapBtn = `            <button
              onClick={() => navigate("/swap")}
              className={\`font-semibold text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1.5 rounded-md \${
                location === "/swap"
                  ? "text-blue-600 bg-blue-50/50"
                  : "text-slate-600 hover:text-blue-600"
              }\`}
            >
              <Package className="w-4 h-4" />
              Equipment Swap
            </button>`;
content = content.replace(oldSwapBtn, newSwapBtn);

fs.writeFileSync('client/src/components/Navbar.tsx', content);
console.log('Navbar updated with Frosted Glass and Icons');
