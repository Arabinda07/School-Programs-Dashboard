import React, { useState, useEffect } from 'react';
import { useSupabaseContext } from './context/SupabaseContext';
import { 
  Gauge, 
  Folders, 
  Calendar, 
  Target, 
  FileText, 
  Warning, 
  ChartBar, 
  GraduationCap, 
  Gear, 
  Bell, 
  Database, 
  SignOut,
  CheckCircle,
  WarningCircle,
  Info,
  Sparkle
} from '@phosphor-icons/react';
import { CommandCentre } from './components/modules/CommandCentre';
import { ProgramsDirectory } from './components/modules/ProgramsDirectory';
import { ActivityLog } from './components/modules/ActivityLog';
import { AssessmentView } from './components/modules/AssessmentView';
import { EvidencePortal } from './components/modules/EvidencePortal';
import { ActionTracker } from './components/modules/ActionTracker';
import { ReportBuilder } from './components/modules/ReportBuilder';
import { AIAdvisor } from './components/modules/AIAdvisor';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { ArchitectureSpecs } from './components/ArchitectureSpecs';
import { cn } from './lib/utils';
import { Badge, Button } from './components/ui';
import { supabase } from './lib/supabase';
import { initialData } from './data';

type Tab = 'overview' | 'programs' | 'sessions' | 'assessments' | 'evidence' | 'actions' | 'reports' | 'ai-advisor';

const AlertIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'warning': return <Warning className="w-4 h-4" />;
    case 'error': return <WarningCircle className="w-4 h-4" />;
    case 'success': return <CheckCircle className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
};

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'app' | 'specs'>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const contextData = useSupabaseContext();
  const { user, seedData, showToast } = contextData;
  const data = contextData; // for compatibility with subcomponents

  useEffect(() => {
    if (user && view !== 'app') {
      setView('app');
    }
  }, [user, view]);

  if (view === 'landing' && !user) {
    return <LandingPage onGetStarted={() => setView('auth')} onViewSpecs={() => setView('specs')} />;
  }

  if (view === 'specs' && !user) {
    return <ArchitectureSpecs onBack={() => setView('landing')} />;
  }

  if (view === 'auth' && !user) {
    return <AuthScreen onBack={() => setView('landing')} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const tabs = [
    { id: 'overview', name: 'Command Centre', icon: Gauge },
    { id: 'programs', name: 'Program Directory', icon: Folders },
    { id: 'sessions', name: 'Scheduler & Logs', icon: Calendar },
    { id: 'assessments', name: 'Diagnostic Center', icon: Target },
    { id: 'evidence', name: 'Evidence Portal', icon: FileText },
    { id: 'actions', name: 'Action Tracker', icon: Warning },
    { id: 'reports', name: 'Report Builder', icon: ChartBar },
    { id: 'ai-advisor', name: 'AI Advisory Centre', icon: Sparkle },
  ] as const;


  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <CommandCentre data={data} />;
      case 'programs': return <ProgramsDirectory data={data} />;
      case 'sessions': return <ActivityLog data={data} />;
      case 'assessments': return <AssessmentView data={data} />;
      case 'evidence': return <EvidencePortal data={data} />;
      case 'actions': return <ActionTracker data={data} />;
      case 'reports': return <ReportBuilder data={data} />;
      case 'ai-advisor': return <AIAdvisor data={data} />;
      default: return null;
    }
  };

  const userMetadata = user?.user_metadata || user?.raw_user_meta_data || {};
  const displayName = userMetadata.full_name || user?.email?.split('@')[0] || 'User';
  const roleName = userMetadata.role || 'Principal';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const actionCount = data.actions.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;
  const unreadCount = data.notifications ? data.notifications.filter((n: any) => !n.read).length : 0;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col print:hidden flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-950">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-semibold text-white text-base tracking-tight">Initiatives Hub</span>
        </div>
        
        <div className="px-6 py-4">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white" 
                    : "hover:bg-gray-800 hover:text-white"
                )}
              >
                <tab.icon className={cn(
                  "flex-shrink-0 w-5 h-5 mr-3",
                  activeTab === tab.id ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                )} />
                <span className="flex-1 text-left">{tab.name}</span>
                {tab.id === 'actions' && actionCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {actionCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-6 py-4 border-t border-gray-800 bg-gray-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1 mr-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white border border-indigo-500 flex-shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate" title={displayName}>{displayName}</p>
                <p className="text-xs text-gray-400 truncate" title={roleName}>{roleName}</p>
              </div>
            </div>
            <button onClick={() => supabase.auth.signOut()} title="Sign Out" className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
              <SignOut className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex justify-between items-center text-[10px] text-gray-500">
             <span>Admin Panel</span>
             <button onClick={seedData} className="hover:text-indigo-400 transition-colors underline bg-transparent border-none p-0 cursor-pointer">Reset Data</button>
          </div>
        </div>
      </div>

      {/* Main Content Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Ribbon */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 print:hidden z-10">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
             <div className="flex items-center border-r border-gray-200 pr-6">
                <span className="font-semibold text-gray-900 mr-2">School:</span> Sunrise Public School
             </div>
             <div className="flex items-center border-r border-gray-200 pr-6">
                <span className="font-semibold text-gray-900 mr-2">Year:</span> 2025-26
             </div>
             <div className="text-xs text-gray-400">
                Data current as of May 23, 2026
             </div>
          </div>
          <div className="flex items-center space-x-4 relative">
             {/* Notifications Trigger */}
             <button 
               title="Notifications" 
               onClick={() => {
                 setShowNotifMenu(prev => !prev);
                 setShowSettingsMenu(false);
               }} 
               className={cn(
                 "p-1.5 rounded-lg hover:bg-gray-100 transition-colors relative cursor-pointer", 
                 showNotifMenu ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600"
               )}
             >
               <Bell className="w-5 h-5"/>
               {unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 block h-4.5 w-4.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white animate-pulse">
                   {unreadCount}
                 </span>
               )}
             </button>

             {/* Settings Trigger */}
             <button 
               title="Settings" 
               onClick={() => {
                 setShowSettingsMenu(prev => !prev);
                 setShowNotifMenu(false);
               }} 
               className={cn(
                 "p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer", 
                 showSettingsMenu ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600"
               )}
             >
               <Gear className="w-5 h-5"/>
             </button>

             {/* Notifications Dropdown Panel */}
             {showNotifMenu && (
               <div className="absolute right-12 top-10 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 py-2.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                 <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                   <h3 className="font-semibold text-gray-900 text-sm">Operator Alerts</h3>
                   {unreadCount > 0 && (
                     <button 
                       onClick={async () => {
                         try {
                           if (data.useFallback) {
                             // Mark all locally
                             initialData.notifications.forEach(n => n.read = true);
                             showToast("All notifications marked as read.", "success");
                           } else {
                             // Mark all in database
                             const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
                             if (error) throw error;
                             await data.refreshData();
                             showToast("All notifications marked as read in database.", "success");
                           }
                           setShowNotifMenu(false);
                         } catch (err: any) {
                           showToast("Failed to mark all read: " + err.message, "error");
                         }
                       }} 
                       className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                     >
                       Mark all read
                     </button>
                   )}
                 </div>
                 <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                   {(!data.notifications || data.notifications.length === 0) ? (
                     <div className="px-4 py-8 text-center text-xs text-gray-400">
                       Zero unread alerts. Excellent coordination!
                     </div>
                   ) : (
                     data.notifications.map((notif: any) => (
                       <div key={notif.id} className={cn("p-4 transition-colors hover:bg-gray-50 flex items-start gap-3", !notif.read && "bg-indigo-50/20")}>
                         <div className={cn("p-1.5 rounded-lg flex-shrink-0 mt-0.5", 
                           notif.type === 'warning' ? "bg-amber-100 text-amber-700" :
                           notif.type === 'error' ? "bg-rose-100 text-rose-700" :
                           notif.type === 'success' ? "bg-emerald-100 text-emerald-700" :
                           "bg-indigo-100 text-indigo-700"
                         )}>
                           <AlertIcon type={notif.type} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-semibold text-gray-900 leading-tight">{notif.title}</p>
                           <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                           <span className="text-[9px] text-gray-400 mt-2 block font-mono">
                             {new Date(notif.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </span>
                         </div>
                         {!notif.read && (
                           <button 
                             onClick={async () => {
                               try {
                                 await data.updateItem('notifications', notif.id, { read: true });
                                 showToast("Marked as read.", "success");
                               } catch (err: any) {
                                 showToast("Could not mark as read.", "error");
                               }
                             }}
                             className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold bg-gray-100 hover:bg-indigo-50 px-2 py-0.5 rounded-md flex-shrink-0 cursor-pointer"
                           >
                             Read
                           </button>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}

             {/* Settings Dropdown Panel */}
             {showSettingsMenu && (
               <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-4.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                 <h3 className="font-semibold text-gray-900 text-sm mb-3.5 border-b border-gray-150 pb-1.5">System Settings</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 font-mono">Database Connection</span>
                     <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                       <div className="min-w-0">
                         <p className="text-xs font-semibold text-gray-800 truncate">Supabase Postgres</p>
                         <p className="text-[10px] text-gray-500 mt-0.5 mt-1 font-mono">
                           {data.useFallback ? "Using local JSON" : "Live synchronization"}
                         </p>
                       </div>
                       <Badge variant={data.useFallback ? "warning" : "success"}>
                         {data.useFallback ? "Fallback" : "Live"}
                       </Badge>
                     </div>
                   </div>

                   <div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 font-mono">Migration Seeds</span>
                     <p className="text-[11px] text-gray-500 mb-2.5">Re-populate standard schemas with Sunrise Public School baseline data.</p>
                     <Button 
                       variant="outline" 
                       onClick={async () => {
                         await seedData();
                         setShowSettingsMenu(false);
                       }} 
                       className="w-full text-xs py-1.5 flex items-center justify-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                     >
                       <Database className="w-4 h-4" /> Seed Tables
                     </Button>
                   </div>

                   <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                     <span>Deployment Host</span>
                     <span>Cloud Run v1.0</span>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 print:p-0 print:bg-white relative">
           <div className="max-w-7xl mx-auto h-full">
             {renderContent()}
           </div>
        </main>
      </div>
    </div>
  );
}
