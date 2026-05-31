const fs = require('fs');

const files = [
  'src/components/modules/ActivityLog.tsx',
  'src/components/modules/AssessmentView.tsx',
  'src/components/modules/AIAdvisor.tsx',
  'src/components/modules/ActionTracker.tsx',
  'src/components/modules/FeedbackPanel.tsx',
  'src/components/modules/ReportBuilder.tsx',
  'src/components/modules/EvidencePortal.tsx',
  'src/components/modules/ProgramsDirectory.tsx',
  'src/components/modules/CommandCentre.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Change p-4 to p-5 or p-6 in KPI cards for better internal spacing
  content = content.replace(/CardContent className="p-4 flex items-center space-x-4"/g, 'CardContent className="p-5 flex items-center space-x-4"');
  content = content.replace(/CardContent className="p-4 flex flex-col justify-center items-center text-center"/g, 'CardContent className="p-6 flex flex-col justify-center items-center text-center"');
  
  // Make gap a bit larger on flex wrap items
  content = content.replace(/flex flex-wrap gap-3 items-center/g, 'flex flex-wrap gap-4 items-center');

  // Remove `border-gray-200` everywhere
  content = content.replace(/border-gray-/g, 'border-slate-');
  content = content.replace(/divide-gray-/g, 'divide-slate-');
  content = content.replace(/bg-gray-/g, 'bg-slate-');
  content = content.replace(/text-gray-/g, 'text-slate-');
  content = content.replace(/ring-gray-/g, 'ring-slate-');

  // Adjust table text
  content = content.replace(/text-xs border-b/g, 'text-xs uppercase tracking-wider border-b');
  content = content.replace(/font-medium text-slate-500/g, 'font-medium text-slate-500');

  // Any remaining fixed inset-0
  content = content.replace(/fixed inset-0 bg-black\/50/g, 'fixed inset-0 bg-slate-900/50');
  
  fs.writeFileSync(file, content);
  console.log(`Updated layout and spacing in ${file}`);
});
