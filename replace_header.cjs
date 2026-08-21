const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8');

// The replacement logic
const headerRegex = /<div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-center max-w-6xl mx-auto w-full">[\s\S]*?<\/div>\s*<div className="absolute inset-0 opacity-5"/;

if (content.match(headerRegex)) {
    // 1. Remove the absolute header div from inside the section
    content = content.replace(headerRegex, '<div className="absolute inset-0 opacity-5"');
    
    // 2. Change pt-28 to pt-12 or pt-16 since we removed the absolute header
    content = content.replace('className="bg-gradient-to-br from-[#1B3A6B] to-[#12284D] text-white pt-28 pb-16 md:pb-24 relative overflow-hidden"', 'className="bg-gradient-to-br from-[#1B3A6B] to-[#12284D] text-white pt-12 lg:pt-16 pb-16 md:pb-24 relative overflow-hidden"');

    // 3. Inject the new navbar right before {/* Hero Section */}
    const navBar = `
      {/* Top Navigation Bar */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/lambton-county-sports-logo.png" alt="Lambton County Sports" className="h-12 w-auto" />
            <span className="font-display font-bold text-xl text-slate-800 hidden sm:block tracking-tight">Lambton County Sports</span>
          </div>
          
          <div className="flex items-center gap-4">
            <HighLevelModal 
              formId="submit_registration" 
              title="Submit a Registration" 
              trigger={
                <button className="bg-[#4A8C2A] hover:bg-[#3A7A1A] text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                  <span className="text-lg leading-none font-light mb-[2px]">+</span> Add a Program
                </button>
              } 
            />
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm uppercase tracking-wider transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}`;
      
    content = content.replace('{/* Hero Section */}', navBar.trim());
    
    fs.writeFileSync('client/src/pages/Directory.tsx', content);
    console.log('Successfully applied navbar changes');
} else {
    console.log('Could not find header regex');
}
