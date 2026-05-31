const fs = require('fs');

let content = fs.readFileSync('src/context/SupabaseContext.tsx', 'utf8');

// Add useToast import
content = content.replace(/import \{ CheckCircle, Warning, WarningCircle, Info, X \} from '@phosphor-icons\/react';\nimport \{ motion, AnimatePresence \} from 'motion\/react';/, "import { useToast } from './ToastContext';");

// Remove Toast interface
content = content.replace(/export interface Toast \{[\s\S]*?\}\n/, "");

// Inject useToast into SupabaseProvider
content = content.replace(/const \[toasts, setToasts\] = useState<Toast\[\]>\(\[\]\);/, "const { showToast } = useToast();");

// Remove showToast definition
content = content.replace(/const showToast = \([^)]*\) => \{[\s\S]*?\}, 4000\);\n  \};\n/, "");

// Remove Toast Portal from return statement
let portalRegex = /\{\/\* Dynamic Elegant Toast Portal Overlay \*\/\}[\s\S]*?<\/div>/;
content = content.replace(portalRegex, "");

// Remove getToastStyles 
content = content.replace(/const getToastStyles = [^{]*\{[\s\S]*?default:[\s\S]*?\}\n    \}\n  \};\n\n  \/\/ Define WarningOctagon[\s\S]*?;/, "");

fs.writeFileSync('src/context/SupabaseContext.tsx', content);
console.log('Done refactoring SupabaseContext Toasts');
