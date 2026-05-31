import React, { useMemo } from 'react';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';
import { Pulse, Folder, Warning, WarningCircle, Calendar, CheckCircle, TrendUp, Users, FileText, Star } from '@phosphor-icons/react';
import { computeDashboardKPIs } from '../../lib/kpi-engine';

export function CommandCentre() {
  const currentDate = new Date('2026-05-23');
  
  const { user, programs, activities, documentation, actions, feedback, classes, teachers } = useSupabaseContext();

  const userMetadata = user?.user_metadata || user?.raw_user_meta_data || {};
  const displayName = userMetadata.full_name || user?.email?.split('@')[0] || 'User';
  const roleName = userMetadata.role || 'Principal';

  const {
    activeProgramsCount,
    activityCompletion,
    studentReach,
    totalStudents,
    classReachCount,
    totalClasses,
    docCompletion,
    openActionsCount,
    overdueActionsCount,
    avgFeedback,
    programHealth,
    timeline,
    docAlerts,
    topActions
  } = useMemo(() => computeDashboardKPIs({
    programs, activities, documentation, actions, feedback, classes, currentDate
  }), [programs, activities, documentation, actions, feedback, classes]);

  const kpiItems = [
    { label: 'Active Programs', value: activeProgramsCount, icon: Folder, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Activity Completion', value: `${Math.round(activityCompletion)}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Students Reached', value: `${studentReach} / ${totalStudents}`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Classes Covered', value: `${classReachCount} / ${totalClasses}`, icon: TrendUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Docs Approved', value: `${Math.round(docCompletion)}%`, icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Open Actions', value: openActionsCount, icon: WarningCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue Actions', value: overdueActionsCount, icon: Warning, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Avg Feedback', value: `${avgFeedback.toFixed(1)} / 5`, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' }
  ];

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'Good': return <Badge variant="success">Good</Badge>;
      case 'Watch': return <Badge variant="warning">Watch</Badge>;
      case 'At Risk': return <Badge variant="danger">At Risk</Badge>;
      default: return <Badge>{health}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 font-sans">Command Centre</h1>
          <p className="text-sm text-slate-500 mt-1 font-light">Status tracking for academic operations.</p>
        </div>
      </div>

      {/* Core Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Programs */}
        <Card className="border-slate-200 shadow-none hover:shadow-sm transition-shadow relative overflow-hidden bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Active initiatives</p>
              <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mt-3">{activeProgramsCount}</h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">Programs actively running</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
              <Folder className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Activity Logs */}
        <Card className="border-slate-200 shadow-none hover:shadow-sm transition-shadow relative overflow-hidden bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Session completion</p>
              <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mt-3">{Math.round(activityCompletion)}%</h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">Scheduled sessions completed</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Evidence Approved */}
        <Card className="border-slate-200 shadow-none hover:shadow-sm transition-shadow relative overflow-hidden bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Evidence verified</p>
              <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mt-3">{Math.round(docCompletion)}%</h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">Approved compliance logs</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Open Action Items */}
        <Card className="border-slate-200 shadow-none hover:shadow-sm transition-shadow relative overflow-hidden bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Open actions</p>
              <h2 className="text-3xl font-semibold tracking-tighter text-rose-600 mt-3">{openActionsCount}</h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">{overdueActionsCount} currently overdue</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
              <WarningCircle className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Coverage & Feedback Strip */}
      <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 text-sm text-slate-600 px-6 font-medium shadow-sm">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <span className="flex items-center gap-2 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
            Cohort coverage: <span className="font-semibold text-slate-950">{studentReach.toLocaleString()}</span> of {totalStudents.toLocaleString()} students engaged
          </span>
          <span className="flex items-center gap-2 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            Class coverage: <span className="font-semibold text-slate-950">{classReachCount}</span> of {totalClasses} classes covered
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 leading-none">
          <span className="font-mono text-slate-500 uppercase text-xs tracking-wider">Sentiment</span>
          <span className="font-semibold text-slate-950 ml-1 bg-slate-100 px-2.5 py-1 rounded whitespace-nowrap">{avgFeedback.toFixed(1)} / 5.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Program Health (spans 2) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-none bg-white">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-slate-950">
                <span>Compliance Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 font-mono tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-medium text-slate-500 uppercase">Program name</th>
                      <th className="px-6 py-3 font-medium hidden sm:table-cell text-slate-500 uppercase">Category</th>
                      <th className="px-6 py-3 font-medium text-center text-slate-500 uppercase">Progress</th>
                      <th className="px-6 py-3 font-medium text-center text-slate-500 uppercase">Verification</th>
                      <th className="px-6 py-3 font-medium text-center text-slate-500 uppercase">Actions</th>
                      <th className="px-6 py-3 font-medium text-right text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programHealth.map(prog => (
                      <tr key={prog.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{prog.name}</div>
                          <div className="text-xs text-slate-500 mt-1">{prog.vendor}</div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-slate-500 text-xs font-medium">
                          {prog.category}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={prog.actComp < 50 ? 'text-rose-600 font-semibold' : 'text-slate-700 font-semibold'}>
                            {Math.round(prog.actComp)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={prog.docComp < 50 ? 'text-rose-600 font-semibold' : 'text-slate-700 font-semibold'}>
                            {Math.round(prog.docComp)}%
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           {prog.openActions > 0 ? (
                             <span className="inline-flex items-center justify-center bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                               {prog.openActions}
                             </span>
                           ) : (
                             <span className="text-slate-300">-</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {getHealthBadge(prog.indicator)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Focus */}
          <Card className="border-slate-200 shadow-none bg-white">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-slate-950 border-none">
                  <span>Action requests</span>
                </CardTitle>
                <div className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{topActions.length} pending items</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <ul className="divide-y divide-slate-100">
                  {topActions.map((action: any) => {
                    const isOverdue = new Date(action.due_date) < currentDate;
                    return (
                      <li key={action.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start space-x-4">
                           <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${action.severity === 'Critical' ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                           <div>
                             <p className="text-sm font-medium text-slate-900">{action.description}</p>
                             <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                               <span>Owner: <span className="font-medium text-slate-700">{teachers.find((t: any) => t.id === action.owner_id)?.name || 'Unknown'}</span></span>
                             </p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4 sm:flex-col sm:items-end sm:space-x-0 sm:space-y-2">
                           <Badge variant={action.severity === 'Critical' ? 'danger' : 'warning'} className="text-[10px] px-2 shadow-sm uppercase tracking-wider font-mono">
                             {action.severity}
                           </Badge>
                           <span className={`text-[11px] font-mono tracking-tight font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                             {isOverdue ? 'OVERDUE: ' : 'DUE: '} {action.due_date}
                           </span>
                        </div>
                      </li>
                    );
                  })}
                  {topActions.length === 0 && (
                    <li className="p-8 text-center text-sm text-slate-500">No high priority actions open.</li>
                  )}
               </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Alerts */}
        <div className="space-y-6">
          
          <Card className="border-slate-200 shadow-none bg-white">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-slate-950">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Activities schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              
              {/* Delayed */}
              {timeline.delayed.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-widest mb-3 flex items-center font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 flex-shrink-0"></span>
                    Delayed
                  </h4>
                  <div className="space-y-2">
                    {timeline.delayed.map((act: any) => (
                       <div key={act.id} className="text-sm bg-rose-50/50 p-3 rounded-lg border border-rose-100/50">
                         <div className="font-medium text-slate-900 leading-snug">{act.topic}</div>
                         <div className="flex justify-between items-center mt-2">
                           <span className="text-[11px] text-slate-500 tracking-tight font-medium uppercase">{programs.find((pItem: any)=>pItem.id===act.program_id)?.name}</span>
                           <span className="text-[10px] text-rose-600 font-bold tracking-wider font-mono">WAS: {act.target_date}</span>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {timeline.upcoming.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-3 flex items-center font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2 flex-shrink-0"></span>
                    Next 7 Days
                  </h4>
                  <div className="space-y-2">
                    {timeline.upcoming.map((act: any) => (
                       <div key={act.id} className="text-sm border border-slate-100 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                         <div className="font-medium text-slate-900 leading-snug">{act.topic}</div>
                         <div className="flex justify-between items-center mt-2">
                           <span className="text-[11px] text-slate-500 tracking-tight font-medium uppercase">{programs.find((pItem: any)=>pItem.id===act.program_id)?.name}</span>
                           <span className="text-[10px] text-slate-900 font-bold tracking-wider font-mono bg-slate-100 px-1.5 py-0.5 rounded">{act.target_date}</span>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none bg-white">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-slate-950">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Document tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <ul className="divide-y divide-slate-100">
                  {docAlerts.map((doc: any) => {
                    const isMissing = doc.status === 'Missing';
                    return (
                      <li key={doc.id} className="p-4 flex items-center justify-between gap-3 group hover:bg-slate-50 transition-colors cursor-default">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{programs.find((pItem: any)=>pItem.id===doc.program_id)?.name || 'Unknown Program'}</p>
                        </div>
                        <Badge variant={isMissing ? 'danger' : 'warning'} className="flex-shrink-0 text-[10px] uppercase tracking-wider font-mono shadow-sm">
                          {doc.status}
                        </Badge>
                      </li>
                    );
                  })}
                  {docAlerts.length === 0 && (
                    <li className="p-6 text-center text-sm text-slate-500">All documentation is up to date.</li>
                  )}
               </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
