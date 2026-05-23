import React, { useMemo } from 'react';
import { initialData } from '../../data';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';
import { Activity, FolderGit2, AlertTriangle, AlertCircle, CalendarDays, CheckCircle2, TrendingUp, Users, FileCheck, Star } from 'lucide-react';

export function CommandCentre() {
  const currentDate = new Date('2026-05-23');

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
  } = useMemo(() => {
    const p = initialData.programs;
    const a = initialData.activities;
    const d = initialData.documentation;
    const ac = initialData.actions;
    const f = initialData.feedback;
    const c = initialData.classes;

    // KPI: Active programs
    const activeProgramsCount = p.filter((prog: any) => !['Completed', 'Cancelled'].includes(prog.status)).length;
    
    // KPI: Activity completion
    const activityCompletion = a.length > 0 ? (a.filter((act: any) => act.status === 'Completed').length / a.length) * 100 : 0;
    
    // KPI: Class coverage & Students reached
    const completedClasses = [...new Set(a.filter((act: any) => act.status === 'Completed').map((act: any) => act.class_id))];
    const classReachCount = completedClasses.length;
    const totalClasses = c.length;
    const studentReach = completedClasses.reduce((sum, clsId) => {
      const cls = c.find((cl: any) => cl.id === clsId);
      return sum + (cls ? cls.student_strength : 0);
    }, 0);
    const totalStudents = c.reduce((sum: number, cls: any) => sum + cls.student_strength, 0);

    // KPI: Documentation completion
    const docCompletion = d.length > 0 ? (d.filter((doc: any) => doc.status === 'Approved').length / d.length) * 100 : 0;

    // KPI: Actions
    const openActions = ac.filter((act: any) => ['Open', 'In Progress'].includes(act.status));
    const openActionsCount = openActions.length;
    const overdueActions = openActions.filter((act: any) => new Date(act.due_date) < currentDate);
    const overdueActionsCount = overdueActions.length;

    // KPI: Feedback
    const avgFeedback = f.length > 0 ? f.reduce((sum: number, fb: any) => sum + fb.sentiment_score, 0) / f.length : 0;

    // Program Health
    const programHealth = p.map((prog: any) => {
      const pActs = a.filter((act: any) => act.program_id === prog.id);
      const actComp = pActs.length ? (pActs.filter((act: any) => act.status === 'Completed').length / pActs.length) * 100 : 0;
      
      const pDocs = d.filter((doc: any) => doc.program_id === prog.id);
      const docComp = pDocs.length ? (pDocs.filter((doc: any) => doc.status === 'Approved').length / pDocs.length) * 100 : 0;
      
      const pActions = ac.filter((act: any) => act.program_id === prog.id && ['Open', 'In Progress'].includes(act.status));
      const pDocsMissing = pDocs.some((doc: any) => doc.status === 'Missing');
      
      let indicator = 'Good';
      if (prog.status === 'Delayed' || prog.status === 'At Risk' || pActions.some((a: any) => a.severity === 'Critical')) {
         indicator = 'At Risk';
      } else if (actComp < 50 || pDocsMissing || pActions.length > 2) {
         indicator = 'Watch';
      }

      return {
        ...prog,
        actComp,
        docComp,
        openActions: pActions.length,
        indicator
      };
    });

    // Timeline
    const timeline = {
      upcoming: a.filter((act: any) => act.status === 'Planned' && act.target_date && new Date(act.target_date) >= currentDate).sort((a: any, b: any) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()).slice(0, 5),
      delayed: a.filter((act: any) => act.status === 'Delayed').sort((a: any, b: any) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()).slice(0, 5),
      recent: a.filter((act: any) => act.status === 'Completed' && act.actual_date).sort((a: any, b: any) => new Date(b.actual_date).getTime() - new Date(a.actual_date).getTime()).slice(0, 5)
    };

    // Doc Alerts
    const docAlerts = d.filter((doc: any) => ['Missing', 'Pending', 'Rejected'].includes(doc.status)).sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 6);

    // Top actions
    const topActions = openActions.sort((a: any, b: any) => {
      if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
      if (b.severity === 'Critical' && a.severity !== 'Critical') return 1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }).slice(0, 5);

    return {
      activeProgramsCount, activityCompletion, studentReach, totalStudents,
      classReachCount, totalClasses, docCompletion, openActionsCount,
      overdueActionsCount, avgFeedback, programHealth, timeline, docAlerts, topActions
    };
  }, []);

  const kpiItems = [
    { label: 'Active Programs', value: activeProgramsCount, icon: FolderGit2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Activity Completion', value: `${Math.round(activityCompletion)}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Students Reached', value: `${studentReach} / ${totalStudents}`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Classes Covered', value: `${classReachCount} / ${totalClasses}`, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Docs Approved', value: `${Math.round(docCompletion)}%`, icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Open Actions', value: openActionsCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue Actions', value: overdueActionsCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Command Centre Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Holistic view of all school enrichment & academic initiatives</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiItems.map((kpi, idx) => (
          <Card key={idx} className="overflow-hidden border-gray-200/60 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <div className="text-lg font-bold text-gray-900 mt-0.5">{kpi.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Program Health (spans 2) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-gray-200/60 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
              <CardTitle className="text-base flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span>Program Health Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Program</th>
                      <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3 font-medium text-center">Activities</th>
                      <th className="px-4 py-3 font-medium text-center">Docs</th>
                      <th className="px-4 py-3 font-medium text-center">Actions</th>
                      <th className="px-4 py-3 font-medium text-right">Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {programHealth.map(prog => (
                      <tr key={prog.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{prog.name}</div>
                          <div className="text-xs text-gray-500">{prog.vendor}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                          {prog.category}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={prog.actComp < 50 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
                            {Math.round(prog.actComp)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                           <span className={prog.docComp < 50 ? 'text-rose-600 font-medium' : 'text-gray-900'}>
                            {Math.round(prog.docComp)}%
                           </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                           {prog.openActions > 0 ? (
                             <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                               {prog.openActions}
                             </span>
                           ) : (
                             <span className="text-gray-400">-</span>
                           )}
                        </td>
                        <td className="px-4 py-3 text-right">
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
          <Card className="border-gray-200/60 shadow-sm border-l-4 border-l-rose-500">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center space-x-2 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Critical Action Focus</span>
                </CardTitle>
                <div className="text-xs text-gray-500">{topActions.length} items require attention</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <ul className="divide-y divide-gray-100">
                  {topActions.map((action: any) => {
                    const isOverdue = new Date(action.due_date) < currentDate;
                    return (
                      <li key={action.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50/30 transition-colors">
                        <div className="flex items-start space-x-3">
                           <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${action.severity === 'Critical' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                           <div>
                             <p className="text-sm font-medium text-gray-900">{action.description}</p>
                             <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                               <span>Assigned to: <span className="font-medium text-gray-700">{initialData.teachers.find(t => t.id === action.owner_id)?.name || 'Unknown'}</span></span>
                             </p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-3 sm:flex-col sm:items-end sm:space-x-0 sm:space-y-1">
                           <Badge variant={action.severity === 'Critical' ? 'danger' : 'warning'} className="text-[10px] px-1.5 py-0">
                             {action.severity}
                           </Badge>
                           <span className={`text-xs font-medium ${isOverdue ? 'text-rose-600' : 'text-gray-500'}`}>
                             {isOverdue ? 'Overdue: ' : 'Due: '} {action.due_date}
                           </span>
                        </div>
                      </li>
                    );
                  })}
                  {topActions.length === 0 && (
                    <li className="p-8 text-center text-sm text-gray-500">No high priority actions open.</li>
                  )}
               </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Alerts */}
        <div className="space-y-6">
          
          <Card className="border-gray-200/60 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
              <CardTitle className="text-base flex items-center space-x-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span>Activities Pulse</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              
              {/* Delayed */}
              {timeline.delayed.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>
                    Delayed
                  </h4>
                  <div className="space-y-3">
                    {timeline.delayed.map((act: any) => (
                       <div key={act.id} className="text-sm bg-rose-50/50 p-2.5 rounded border border-rose-100">
                         <div className="font-medium text-gray-900">{act.topic}</div>
                         <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500">{initialData.programs.find(p=>p.id===act.program_id)?.name}</span>
                           <span className="text-[10px] text-rose-600 font-medium">Was: {act.target_date}</span>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {timeline.upcoming.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                    Next 7 Days
                  </h4>
                  <div className="space-y-3">
                    {timeline.upcoming.map((act: any) => (
                       <div key={act.id} className="text-sm border border-gray-100 p-2.5 rounded hover:bg-gray-50 transition-colors">
                         <div className="font-medium text-gray-900">{act.topic}</div>
                         <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500">{initialData.programs.find(p=>p.id===act.program_id)?.name}</span>
                           <span className="text-[10px] text-indigo-600 font-medium">{act.target_date}</span>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200/60 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
              <CardTitle className="text-base flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-gray-500" />
                <span>Evidence & Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <ul className="divide-y divide-gray-100">
                  {docAlerts.map((doc: any) => {
                    const isMissing = doc.status === 'Missing';
                    return (
                      <li key={doc.id} className="p-3 flex items-center justify-between gap-3 group hover:bg-gray-50 transition-colors cursor-default">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                          <p className="text-xs text-gray-500 truncate">{initialData.programs.find(p=>p.id===doc.program_id)?.name || 'Unknown Program'}</p>
                        </div>
                        <Badge variant={isMissing ? 'danger' : 'warning'} className="flex-shrink-0 text-[10px]">
                          {doc.status}
                        </Badge>
                      </li>
                    );
                  })}
                  {docAlerts.length === 0 && (
                    <li className="p-6 text-center text-sm text-gray-500">All documentation is up to date.</li>
                  )}
               </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
