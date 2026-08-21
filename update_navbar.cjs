const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8');

const navBarRegex = /<nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">[\s\S]*?<\/nav>/;

const newNavBar = `
      {/* Top Navigation Bar */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/lambton-county-sports-logo.png" alt="Lambton County Sports" className="h-10 w-auto" />
              <span className="font-display font-bold text-xl text-slate-800 hidden sm:block tracking-tight">Lambton County Sports</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6 border-l border-slate-200 pl-8">
              <button 
                onClick={() => {
                  const el = document.getElementById("directory-start");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }} 
                className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors"
              >
                Browse Programs
              </button>
              
              <HighLevelModal 
                formId="submit_registration" 
                title="Submit a Registration" 
                trigger={
                  <button className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">
                    Submit A Program
                  </button>
                } 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm uppercase tracking-wider transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 hidden md:block"
              >
                Admin Panel
              </button>
            )}
            <button 
              onClick={() => {
                const el = document.getElementById("alerts");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#4A8C2A] hover:bg-[#3A7A1A] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              Get Alerts
            </button>
          </div>
        </div>
      </nav>
`;

if (content.match(navBarRegex)) {
    content = content.replace(navBarRegex, newNavBar.trim());
    content = content.replace('<section className="bg-slate-900 py-20 px-6 lg:px-8 relative overflow-hidden border-t border-slate-800">', '<section id="alerts" className="bg-slate-900 py-20 px-6 lg:px-8 relative overflow-hidden border-t border-slate-800">');
    fs.writeFileSync('client/src/pages/Directory.tsx', content);
    console.log('Successfully updated navbar');
} else {
    console.log('Navbar not found');
}
