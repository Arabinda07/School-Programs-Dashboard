const fs = require('fs');

let content = fs.readFileSync('src/components/modules/ReportBuilder.tsx', 'utf8');

// Change standard tab Monthly snapshot grid layout
content = content.replace(
  /grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-100/g,
  'grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-slate-100 border-b border-slate-100'
);

// Improved program cards typography and layout
// "Activity summary"
content = content.replace(/text-xs font-semibold text-slate-500/g, 'text-[10px] font-semibold text-slate-500 uppercase tracking-wider');

// Update labels
content = content.replace(/>Activity summary</g, '>Progress<');
content = content.replace(/>Students engaged</g, '>Students<');

// Improve insights list layout
content = content.replace(
  /<li key=\{idx\} className="flex items-start space-x-3 text-sm">/g,
  '<li key={idx} className="flex items-start space-x-3 text-sm p-2 rounded-lg hover:bg-slate-50/50 transition-colors">'
);

// Advanced Output matrix table updates
content = content.replace(
  /<th className="border-b-2 border-slate-800 py-3 px-4 font-bold text-xs text-slate-900 uppercase tracking-wider/g,
  '<th className="border-b-2 border-slate-200 py-3 px-4 font-semibold text-[10px] text-slate-500 uppercase tracking-wider'
);
content = content.replace(
  /<table className="w-full text-left text-sm border-collapse">/g,
  '<table className="w-full text-left text-sm border-collapse mt-2">'
);
content = content.replace(
  /bg-slate-50\/50 border-b border-slate-100 flex flex-row justify-between items-center py-4/g,
  'bg-transparent border-b border-slate-100 flex flex-row justify-between items-center py-5 px-6'
);

// Make standard snapshot Monthly header look better
content = content.replace(
  /bg-slate-50\/50 border-b border-slate-100 py-4/g,
  'bg-transparent border-b border-slate-100 py-4'
);

// Program snapshot headers
content = content.replace(
  /className="py-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50\/30"/g,
  'className="py-4 border-b border-slate-100 flex flex-row items-center justify-between bg-transparent"'
);


fs.writeFileSync('src/components/modules/ReportBuilder.tsx', content);
