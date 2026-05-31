import React, { useState, useEffect } from 'react';
import { useSupabaseContext } from './context/SupabaseContext';
import { useNotifications } from './hooks/useDataRepositories';
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
  Sparkle,
  List,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contextData = useSupabaseContext();
  const { user, seedData, showToast } = contextData;
  const data = contextData; // for compatibility with subcomponents
  const { markAsRead, markAllAsRead, unreadCount } = useNotifications();

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/architecture' || hash === '#architecture') {
        if (hash === '#architecture') {
          // Clean up the hash for the user
          window.history.replaceState({}, '', '/architecture');
        }
        setView('specs');
      } else if (path === '/auth') {
        setView('auth');
      } else if (path === '/dashboard') {
        setView('app');
      } else {
        setView('landing');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (newView: 'landing' | 'auth' | 'app' | 'specs') => {
    setView(newView);
    let path = '/';
    if (newView === 'specs') path = '/architecture';
    if (newView === 'auth') path = '/auth';
    if (newView === 'app') path = '/dashboard';
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    if (user && view !== 'app') {
      navigate('app');
    }
  }, [user, view]);

  if (view === 'landing' && !user) {
    return <LandingPage onGetStarted={() => navigate('auth')} onViewSpecs={() => navigate('specs')} />;
  }

  if (view === 'specs' && !user) {
    return <ArchitectureSpecs onBack={() => navigate('landing')} />;
  }

  if (view === 'auth' && !user) {
    return <AuthScreen onBack={() => navigate('landing')} />;
  }

  if (!user) {
    return <AuthScreen onBack={() => navigate('landing')} />;
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      {/* Mobile Menu Backdrop */}
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
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60 bg-slate-950/50">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-white/5 border border-white/10 shadow-sm">
            <GraduationCap className="w-4 h-4 text-slate-200" />
          </div>
          <span className="font-sans font-medium text-slate-100 text-sm tracking-tight">Administration</span>
        </div>
        
        <div className="px-6 py-4">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                  activeTab === tab.id 
                    ? "bg-slate-800 text-white" 
                    : "hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <tab.icon className={cn(
                  "flex-shrink-0 w-4 h-4 mr-3",
                  activeTab === tab.id ? "text-slate-200" : "text-slate-500 group-hover:text-slate-300"
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

        <div className="mt-auto px-6 py-4 border-t border-slate-800/60 bg-slate-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1 mr-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-300 border border-slate-700 flex-shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate" title={displayName}>{displayName}</p>
                <p className="text-xs text-slate-500 truncate" title={roleName}>{roleName}</p>
              </div>
            </div>
            <button onClick={() => supabase.auth.signOut()} title="Sign Out" className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 cursor-pointer">
              <SignOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Ribbon */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 print:hidden z-10 relative">
          <div className="flex items-center">
             <button
               onClick={() => setMobileMenuOpen(true)}
               className="p-1 mr-3 md:hidden rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
             >
               <List className="w-6 h-6" />
             </button>
             <div className="hidden sm:flex items-center space-x-4 md:space-x-6 text-xs md:text-sm text-slate-500 tracking-tight">
               <div className="flex items-center border-r border-slate-200 pr-4 md:pr-6">
                  <span className="font-semibold text-slate-900 mr-2">School:</span> Sunrise Public School
               </div>
               <div className="flex items-center pr-4 md:pr-6">
                  <span className="font-semibold text-slate-900 mr-2">Year:</span> 2025-26
               </div>
             </div>
             <div className="sm:hidden text-[13px] font-semibold text-slate-900">Sunrise Public School</div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 relative">
             {/* Notifications Trigger */}
             <button 
               title="Notifications" 
               onClick={() => {
                 setShowNotifMenu(prev => !prev);
               }} 
               className={cn(
                 "p-1.5 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer", 
                 showNotifMenu ? "text-slate-900 bg-slate-100" : "text-slate-400 hover:text-slate-600"
               )}
             >
               <Bell className="w-4 h-4"/>
               {unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 block h-4.5 w-4.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white animate-pulse">
                   {unreadCount}
                 </span>
               )}
             </button>

             {/* Notifications Dropdown Panel */}
             {showNotifMenu && (
               <div className="absolute right-0 md:right-12 top-12 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 py-2.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                 <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                   <h3 className="font-semibold text-slate-900 text-sm">Alerts</h3>
                   {unreadCount > 0 && (
                     <button 
                       onClick={async () => {
                         await markAllAsRead(data.useFallback, () => {
                           initialData.notifications.forEach(n => n.read = true);
                         });
                         setShowNotifMenu(false);
                       }} 
                       className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                     >
                       Mark all read
                     </button>
                   )}
                 </div>
                 <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                   {(!data.notifications || data.notifications.length === 0) ? (
                     <div className="px-4 py-8 text-center text-xs text-slate-400">
                       No unread alerts.
                     </div>
                   ) : (
                     data.notifications.map((notif: any) => (
                       <div key={notif.id} className={cn("p-4 transition-colors hover:bg-slate-50 flex items-start gap-3", !notif.read && "bg-indigo-50/20")}>
                         <div className={cn("p-1.5 rounded-lg flex-shrink-0 mt-0.5", 
                           notif.type === 'warning' ? "bg-amber-100 text-amber-700" :
                           notif.type === 'error' ? "bg-rose-100 text-rose-700" :
                           notif.type === 'success' ? "bg-emerald-100 text-emerald-700" :
                           "bg-indigo-100 text-indigo-700"
                         )}>
                           <AlertIcon type={notif.type} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-semibold text-slate-900 leading-tight">{notif.title}</p>
                           <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                           <span className="text-[9px] text-slate-400 mt-2 block font-mono">
                             {new Date(notif.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </span>
                         </div>
                         {!notif.read && (
                           <button 
                             onClick={async () => {
                               await markAsRead(notif.id);
                             }}
                             className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded-md flex-shrink-0 cursor-pointer"
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
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 pt-6 md:p-8 md:pt-10 print:p-0 print:bg-white relative">
           <div className="max-w-[1400px] mx-auto h-full">
             {renderContent()}
           </div>
        </main>
      </div>
    </div>
  );
}
