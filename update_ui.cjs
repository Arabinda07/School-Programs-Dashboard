const fs = require('fs');

let content = fs.readFileSync('src/components/ui.tsx', 'utf8');

// Change colors
content = content.replace(/gray-/g, 'slate-');

// Simplify Card
content = content.replace(/bg-white rounded-xl border border-slate-200 shadow-sm/g, 'bg-white rounded-xl border border-slate-200 shadow-none');

// Simplify Badge defaults (slate)
content = content.replace(/bg-slate-100 text-slate-800/g, 'bg-slate-100 text-slate-900 border border-slate-200');

// Simplify Button shapes
content = content.replace(/rounded-lg focus/g, 'rounded-md focus');
content = content.replace(/shadow-sm/g, 'shadow-none');

// Update typography to remove font-display (if desired, or leave it)
content = content.replace(/font-display/g, 'font-sans');

fs.writeFileSync('src/components/ui.tsx', content);
console.log('Updated ui.tsx');
