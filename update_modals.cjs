const fs = require('fs');
const files = [
  'src/components/modules/EvidencePortal.tsx',
  'src/components/modules/ProgramsDirectory.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Update gray to slate
  content = content.replace(/gray-/g, 'slate-');
  content = content.replace(/bg-black\/50/g, 'bg-slate-900/50');
  
  // Make modals responsive (bottom sheet on mobile)
  content = content.replace(
    /className="fixed inset-0 bg-slate-900\/50 flex items-center justify-center z-50 animate-in fade-in"/g,
    'className="fixed inset-0 bg-slate-900/50 flex items-end md:items-center justify-center z-50 animate-in fade-in sm:p-4"'
  );
  
  // Update inner modal container
  content = content.replace(
    /className="bg-white rounded-xl shadow-xl w-full max-w-(md|lg) p-6( max-h-\[90vh\] overflow-y-auto)? animate-in slide-in-from-bottom-4"/g,
    'className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-$1 p-5 md:p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95"'
  );

  content = content.replace(/font-display/g, 'font-sans');
  content = content.replace(/border-slate-200\/60 shadow-sm/g, 'border-slate-200 shadow-none bg-white');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
