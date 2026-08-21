const fs = require('fs');
const lines = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('<div className="min-h-screen'));
if (start !== -1) {
    fs.writeFileSync('preview.txt', lines.slice(start, start + 80).join('\n'));
}
