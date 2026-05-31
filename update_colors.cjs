const fs = require('fs');
const files = [
  'src/components/modules/ActionTracker.tsx',
  'src/components/modules/EvidencePortal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/gray-/g, 'slate-');
  
  // Update header typography in ActionTracker
  content = content.replace('text-xl font-bold text-slate-900 font-display', 'text-2xl font-semibold tracking-tight text-slate-950 font-sans');
  content = content.replace('text-xs text-slate-500 mt-1', 'text-sm text-slate-500 mt-1 font-light');
  
  // Replace card border
  content = content.replace(/border-slate-200\/60 shadow-sm/g, 'border-slate-200 shadow-none bg-white');
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
