const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8');

// Add "Season Calendar" link after "Become A Sponsor"
const becomeASponsor = `<button className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">
                    Become A Sponsor
                  </button>
                } 
              />`;

const withCalendar = `<button className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">
                    Become A Sponsor
                  </button>
                } 
              />
              
              <button 
                onClick={() => navigate("/calendar")}
                className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors"
              >
                Season Calendar
              </button>`;

content = content.replace(becomeASponsor, withCalendar);
fs.writeFileSync('client/src/pages/Directory.tsx', content);
console.log('Added Season Calendar link');
