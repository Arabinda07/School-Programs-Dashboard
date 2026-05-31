const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ useSupabaseContext \} from '.\/context\/SupabaseContext';/, "import { useSupabaseContext } from './context/SupabaseContext';\nimport { useNotifications } from './hooks/useDataRepositories';");

// Use the hook
let hookReplace = `  const contextData = useSupabaseContext();
  const { user, seedData, showToast } = contextData;
  const data = contextData; // for compatibility with subcomponents
  const { markAsRead, markAllAsRead, unreadCount } = useNotifications();`;
code = code.replace(/  const contextData = useSupabaseContext\(\);\n  const \{ user, seedData, showToast \} = contextData;\n  const data = contextData; \/\/ for compatibility with subcomponents/, hookReplace);

// Remove local unreadCount
code = code.replace(/  const unreadCount = data\.notifications \? data\.notifications\.filter\(\(n: any\) => !n\.read\)\.length : 0;\n/, "");

// Replace the deep implementation for marking all as read
let oldMarkAll = /try \{\n[\s\S]*?if \(data\.useFallback\) \{[\s\S]*?\/\/ Mark all locally[\s\S]*?initialData\.notifications\.forEach\(n => n\.read = true\);[\s\S]*?showToast\("All notifications marked as read\.", "success"\);[\s\S]*?\} else \{[\s\S]*?\/\/ Mark all in database[\s\S]*?const \{ error \} = await supabase\.from\('notifications'\)\.update\(\{ read: true \}\)\.eq\('read', false\);[\s\S]*?if \(error\) throw error;[\s\S]*?await data\.refreshData\(\);[\s\S]*?showToast\("All notifications marked as read in database\.", "success"\);[\s\S]*?\}[\s\S]*?setShowNotifMenu\(false\);[\s\S]*?\} catch \(err: any\) \{[\s\S]*?showToast\("Failed to mark all read: " \+ err\.message, "error"\);[\s\S]*?\}/;
let newMarkAll = `const success = await markAllAsRead(data.useFallback, () => {
                             initialData.notifications.forEach(n => n.read = true);
                           });
                           if (!success && !data.useFallback) {
                             try {
                               const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
                               if (error) throw error;
                               await data.refreshData();
                               showToast("All notifications marked as read in database.", "success");
                             } catch (err: any) {
                               showToast("Failed to mark all read: " + err.message, "error");
                             }
                           }
                           setShowNotifMenu(false);`;
code = code.replace(oldMarkAll, newMarkAll);

// Replace individual mark as read
let oldSingleRead = /try \{\n[\s\S]*?await data\.updateItem\('notifications', notif\.id, \{ read: true \}\);\n[\s\S]*?showToast\("Marked as read\.", "success"\);\n[\s\S]*?\} catch \(err: any\) \{\n[\s\S]*?showToast\("Could not mark as read\.", "error"\);\n[\s\S]*?\}/;
let newSingleRead = `await markAsRead(notif.id);`;
code = code.replace(oldSingleRead, newSingleRead);

fs.writeFileSync('src/App.tsx', code);
