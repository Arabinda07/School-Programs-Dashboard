const fs = require('fs');

const files = [
  'src/components/modules/ActivityLog.tsx',
  'src/components/modules/AssessmentView.tsx',
  'src/components/modules/AIAdvisor.tsx',
  'src/components/modules/FeedbackPanel.tsx',
  'src/components/modules/ReportBuilder.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Update gray to slate
  content = content.replace(/gray-/g, 'slate-');
  
  // Update header typography 
  content = content.replace(/text-xl font-bold text-slate-900 font-display/g, 'text-2xl font-semibold tracking-tight text-slate-950 font-sans');
  content = content.replace(/text-xs text-slate-500 mt-1/g, 'text-sm text-slate-500 mt-1 font-light');

  content = content.replace(/font-display/g, 'font-sans');
  content = content.replace(/border-slate-200\/60 shadow-sm/g, 'border-slate-200 shadow-none bg-white');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
