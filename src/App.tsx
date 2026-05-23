import React, { useState } from 'react';
import { initialData } from './data';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CalendarDays, 
  Target, 
  FileCheck, 
  AlertTriangle, 
  BarChart3,
  School,
  Settings,
  Bell
} from 'lucide-react';
import { CommandCentre } from './components/modules/CommandCentre';
import { ProgramsDirectory } from './components/modules/ProgramsDirectory';
import { ActivityLog } from './components/modules/ActivityLog';
import { AssessmentView } from './components/modules/AssessmentView';
import { EvidencePortal } from './components/modules/EvidencePortal';
import { ActionTracker } from './components/modules/ActionTracker';
import { ReportBuilder } from './components/modules/ReportBuilder';
import { cn } from './lib/utils';
import { Badge } from './components/ui';

type Tab = 'overview' | 'programs' | 'sessions' | 'assessments' | 'evidence' | 'actions' | 'reports';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  // Simple read-only state for V1 prototype
  const [data] = useState(initialData);

  const tabs = [
    { id: 'overview', name: 'Command Centre', icon: LayoutDashboard },
    { id: 'programs', name: 'Program Directory', icon: FolderGit2 },
    { id: 'sessions', name: 'Scheduler & Logs', icon: CalendarDays },
    { id: 'assessments', name: 'Diagnostic Center', icon: Target },
    { id: 'evidence', name: 'Evidence Portal', icon: FileCheck },
    { id: 'actions', name: 'Action Tracker', icon: AlertTriangle },
    { id: 'reports', name: 'Report Builder', icon: BarChart3 },
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
      default: return null;
    }
  };

  const actionCount = data.actions.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col print:hidden flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-950">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <School className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">SPCC Admin</span>
        </div>
        
        <div className="px-6 py-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">School Modules</div>
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

        <div className="mt-auto px-6 py-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white border border-gray-600">
              PR
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Principal Desk</p>
              <p className="text-xs text-gray-400">Command Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Ribbon */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 print:hidden shadow-sm z-10">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
             <div className="flex items-center border-r border-gray-200 pr-6">
               <span className="font-semibold text-gray-900 mr-2">School:</span> Sunrise Public School
             </div>
             <div className="flex items-center border-r border-gray-200 pr-6">
               <span className="font-semibold text-gray-900 mr-2">Academic Year:</span> 2025-26
             </div>
             <div className="flex items-center flex-1 max-w-sm text-xs">
                <span className="text-gray-500 mr-3">Last updated: May 23, 2026</span>
                <Badge variant="success" className="px-1.5 py-0">Systems Nominal</Badge>
             </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
             <button className="hover:text-gray-600 relative">
               <Bell className="w-5 h-5"/>
               <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
             </button>
             <button className="hover:text-gray-600"><Settings className="w-5 h-5"/></button>
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
