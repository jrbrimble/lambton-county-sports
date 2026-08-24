const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Admin.tsx', 'utf8');

const lines = content.split('\n');
const cleanLines = lines.filter(line => {
  // Check if line contains any character with charCode > 127
  for (let i = 0; i < line.length; i++) {
    if (line.charCodeAt(i) === 65533) { // 65533 is the replacement character ''
      return false; // drop the line
    }
  }
  return true;
});

fs.writeFileSync('client/src/pages/Admin.tsx', cleanLines.join('\n'));
console.log('Cleaned up Admin.tsx lines');
