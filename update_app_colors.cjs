const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Change colors
content = content.replace(/gray-/g, 'slate-');

fs.writeFileSync('src/App.tsx', content);
console.log('Updated App.tsx fully');
