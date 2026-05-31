const fs = require('fs');
let code = fs.readFileSync('src/components/modules/CommandCentre.tsx', 'utf8');
code = code.replace(/p\.find/g, 'programs.find');
fs.writeFileSync('src/components/modules/CommandCentre.tsx', code);
