const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Directory.tsx', 'utf8');

const regex = /(<header className="relative w-full h-\[400px\] overflow-hidden">[\s\S]*?){\/\* Search & Filters \*\//;
const match = content.match(regex);
if (match) {
    console.log(match[1]);
} else {
    console.log('Not found');
}
