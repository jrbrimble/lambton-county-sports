const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8');

const replacement = `
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 pb-12">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/lambton-county-sports-logo.png" alt="Lambton County Sports" className="h-10 w-auto" />
            <span className="font-display font-bold text-lg text-slate-800 hidden sm:block">Lambton County Sports</span>
          </div>
          
          <div className="flex items-center gap-3">
            <HighLevelModal 
              formId="submit_registration" 
              title="Submit a Registration" 
              trigger={
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                  <span className="text-lg leading-none mb-[2px]">+</span> Add a Program
                </button>
              } 
            />
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </nav>

      <header className="relative w-full h-[320px] overflow-hidden">
        {HERO_IMAGES.map((src, idx) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: currentImageIdx === idx ? 1 : 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40 z-10" />
            <img
              src={src}
              alt="Sports Hero"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
        
        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="max-w-2xl mt-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-tight mb-4 drop-shadow-sm">
              Find Your Sport.
              <br />
              <span className="text-blue-400">Join the Game.</span>
            </h1>
            <p className="text-lg text-slate-200 max-w-xl mx-auto font-medium">
              The ultimate directory for youth and adult sports programs across Lambton County.
            </p>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
`;

// We need to replace the start of the return statement up to Stats Bar
const regex = /return \(\s*<div className="min-h-screen[\s\S]*?\{\/\* Stats Bar \*\//m;

if (content.match(regex)) {
    content = content.replace(regex, replacement.trim());
    fs.writeFileSync('client/src/pages/Directory.tsx', content);
    console.log('Replaced layout');
} else {
    console.log('Regex did not match');
}
