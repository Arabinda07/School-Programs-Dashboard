const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add List, X icons
content = content.replace(
  /Sparkle\n} from '@phosphor-icons\/react';/,
  "Sparkle,\n  List,\n  X\n} from '@phosphor-icons/react';"
);

// Add mobileMenuOpen state
content = content.replace(
  /const \[showSettingsMenu, setShowSettingsMenu\] = useState\(false\);/,
  "const [showSettingsMenu, setShowSettingsMenu] = useState(false);\n  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);"
);

// Add Mobile backdrop and update sidebar classes
content = content.replace(
  /<div className="w-64 bg-slate-950 text-slate-300 flex flex-col print:hidden flex-shrink-0 relative z-20">/,
  `{/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={cn(
        "fixed inset-y-0 left-0 bg-slate-950 text-slate-300 flex flex-col print:hidden flex-shrink-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>`
);

// Close menu on tab click
content = content.replace(
  /onClick=\{\(\) => setActiveTab\(tab\.id\)\}/g,
  "onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}"
);

// Update Header
content = content.replace(
  /<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 print:hidden z-10 relative">/,
  `<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 print:hidden z-10 relative">`
);

content = content.replace(
  /<div className="flex items-center space-x-6 text-sm text-slate-500 font-mono tracking-tight">\s+<div className="flex items-center border-r border-slate-200 pr-6">\s+<span className="font-semibold text-slate-900 mr-2">ORG:<\/span> Sunrise Public School\s+<\/div>\s+<div className="flex items-center border-r border-slate-200 pr-6">\s+<span className="font-semibold text-slate-900 mr-2">CY:<\/span> 2025-26\s+<\/div>\s+<div className="text-xs text-slate-400">\s+SYNC_TIME: MAY-23-2026\s+<\/div>\s+<\/div>\s+<div className="flex items-center space-x-4 relative">/,
  `<div className="flex items-center">
             <button
               onClick={() => setMobileMenuOpen(true)}
               className="p-1 mr-3 md:hidden rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
             >
               <List className="w-6 h-6" />
             </button>
             <div className="hidden sm:flex items-center space-x-4 md:space-x-6 text-xs md:text-sm text-slate-500 font-mono tracking-tight">
               <div className="flex items-center border-r border-slate-200 pr-4 md:pr-6">
                  <span className="font-semibold text-slate-900 mr-2">ORG:</span> Sunrise Public School
               </div>
               <div className="flex items-center border-r border-slate-200 pr-4 md:pr-6">
                  <span className="font-semibold text-slate-900 mr-2">CY:</span> 2025-26
               </div>
               <div className="text-[10px] md:text-xs text-slate-400">
                  SYNC_TIME: MAY-23-2026
               </div>
             </div>
             <div className="sm:hidden font-mono text-[11px] font-semibold text-slate-900">Sunrise Public</div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 relative">`
);

// Update dropdown panels top spacing so they don't go offscreen
// E.g. Top 10 to top 12, right-12 to right-2 or 0, max width
content = content.replace(
  /<div className="absolute right-12 top-10 w-96 bg-white rounded-xl shadow-2xl border border-slate-100 py-2.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">/,
  `<div className="absolute right-0 md:right-12 top-12 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 py-2.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">`
);

content = content.replace(
  /<div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-4.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">/,
  `<div className="absolute right-0 top-12 w-72 md:w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-4.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">`
);

// Main padding
content = content.replace(
  /<main className="flex-1 overflow-y-auto bg-slate-50 p-8 pt-10 print:p-0 print:bg-white relative">/,
  `<main className="flex-1 overflow-y-auto bg-slate-50 p-4 pt-6 md:p-8 md:pt-10 print:p-0 print:bg-white relative">`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Updated App.tsx responsiveness');
