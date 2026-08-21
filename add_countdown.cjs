const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8');

// Add Clock and Timer icons to lucide imports
if (!content.includes('Clock,')) {
    content = content.replace(
        /import {([^}]+)} from "lucide-react";/,
        'import {$1, Clock} from "lucide-react";'
    );
}

// Add the countdown helper function inside ProgramCard, right after the formatDate function
const afterFormatDate = `const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };`;

const countdownHelper = `const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCountdown = () => {
    const now = new Date();
    const open = program.registrationOpenDate ? new Date(program.registrationOpenDate) : null;
    const close = program.registrationCloseDate ? new Date(program.registrationCloseDate) : null;
    
    if (status === "open" && close) {
      const diff = close.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return null;
      if (days === 1) return { text: "Closes tomorrow", urgent: true };
      if (days <= 7) return { text: \`Closes in \${days} days\`, urgent: true };
      if (days <= 30) return { text: \`Closes in \${days} days\`, urgent: false };
      return null;
    }
    
    if (status === "upcoming" && open) {
      const diff = open.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return null;
      if (days === 1) return { text: "Opens tomorrow", urgent: false };
      if (days <= 14) return { text: \`Opens in \${days} days\`, urgent: false };
      return null;
    }
    
    return null;
  };

  const countdown = getCountdown();`;

content = content.replace(afterFormatDate, countdownHelper);

// Now inject the countdown display right before the Footer Area
const footerMarker = `{/* Footer Area */}
        <div className="mt-auto flex gap-2">`;

const countdownUI = `{/* Countdown */}
        {countdown && (
          <div className={\`flex items-center gap-2 text-xs font-bold rounded-lg px-3 py-2 mb-3 \${
            countdown.urgent 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }\`}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {countdown.text}
          </div>
        )}

        {/* Footer Area */}
        <div className="mt-auto flex gap-2">`;

content = content.replace(footerMarker, countdownUI);

fs.writeFileSync('client/src/pages/Directory.tsx', content);
console.log('Done — countdown timer added');
