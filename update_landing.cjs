const fs = require('fs');

const files = [
  'src/components/LandingPage.tsx',
  'src/components/ArchitectureSpecs.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Update gray to slate
  content = content.replace(/gray-/g, 'slate-');
  content = content.replace(/font-display/g, 'font-sans');
  content = content.replace(/border-slate-200\/60 shadow-sm/g, 'border-slate-200 shadow-none bg-white');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
