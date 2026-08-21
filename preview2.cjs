const fs = require('fs');
const lines = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('Add a Program'));
if (start !== -1) {
    fs.writeFileSync('preview2.txt', lines.slice(start - 40, start + 40).join('\n'));
}
