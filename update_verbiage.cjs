const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/System Core/g, 'Administration');
content = content.replace(/Operator Alerts/g, 'Alerts');
content = content.replace(/Zero unread alerts\. Excellent coordination!/g, 'No unread alerts.');

// Ensure font-sans overrides font-display
content = content.replace(/font-display/g, 'font-sans');

fs.writeFileSync('src/App.tsx', content);

// Also CommandCentre.tsx verbiage
let cmd = fs.readFileSync('src/components/modules/CommandCentre.tsx', 'utf8');
cmd = cmd.replace(/Program compliance status/g, 'Compliance Overview');
// let's see if something else
fs.writeFileSync('src/components/modules/CommandCentre.tsx', cmd);

console.log('Verbiage updated');
