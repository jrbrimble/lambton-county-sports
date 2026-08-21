const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8');

const oldHero = `<div className="lg:col-span-7 flex flex-col justify-center py-8 pr-4">
              <h1 className="font-display text-4xl md:text-5xl lg:text-[4.25rem] font-extrabold mb-6 leading-[1.1] tracking-tight text-white drop-shadow-md">
                Find Every Kids Sport Signup in Lambton County
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 font-medium leading-relaxed max-w-2xl">
                Registration dates, age groups, and sign-up links for all youth sports programs. All in one place.
              </p>
              <div>
                <button 
                  onClick={handleScrollToDirectory}
                  className="bg-[#4A8C2A] text-white px-10 py-5 rounded-xl font-extrabold hover:bg-[#3A7A1A] transition-all transform hover:-translate-y-1 hover:shadow-lg uppercase tracking-wider text-base"
                >
                  Browse Programs
                </button>
              </div>
            </div>`;

const newHero = `<div className="lg:col-span-7 flex flex-col justify-center py-8 lg:pr-4 text-center lg:text-left items-center lg:items-start">
              <h1 className="font-display text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold mb-6 leading-[1.1] tracking-tight text-white drop-shadow-md">
                Find Every Kids Sport Signup in Lambton County
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 font-medium leading-relaxed max-w-2xl">
                Registration dates, age groups, and sign-up links for all youth sports programs. All in one place.
              </p>
              <div>
                <button 
                  onClick={handleScrollToDirectory}
                  className="bg-[#4A8C2A] text-white px-10 py-5 rounded-xl font-extrabold hover:bg-[#3A7A1A] transition-all transform hover:-translate-y-1 hover:shadow-lg uppercase tracking-wider text-base"
                >
                  Browse Programs
                </button>
              </div>
            </div>`;

content = content.replace(oldHero, newHero);
fs.writeFileSync('client/src/pages/Directory.tsx', content);
console.log('Replaced');
