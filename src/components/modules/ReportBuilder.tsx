import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { Download, FileText, FileXls, ChartBar, Warning, Lightbulb, TrendUp, Presentation, Folder, Faders, CheckSquareOffset, Scan } from '@phosphor-icons/react';

export function ReportBuilder() {
  const { programs, activities, classes, teachers, assessments, documentation, actions, feedback, showToast } = useSupabaseContext();
  const currentDate = new Date('2026-05-23').getTime();

  const [activeTab, setActiveTab] = useState<'standard' | 'advanced'>('standard');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['costPerStudent', 'completionVelocity']);

  const {
    activeProgramsCount,
    completedActsCount,
    studentReach,
    teacherInvolvement,
    docCompletion,
    openActionsCount,
    programReports,
    insightsList
  } = useMemo(() => {
    // 1. Monthly Overview
    const activePrograms = programs.filter((p: any) => p.status === 'Active' || p.status === 'Delayed' || p.status === 'At Risk');
    const activeProgramsCount = activePrograms.length;

    const completedActs = activities.filter((a: any) => a.status === 'Completed');
    const completedActsCount = completedActs.length;

    const completedClasses = [...new Set(completedActs.map((a: any) => a.class_id))];
    const studentReach = completedClasses.reduce((sum: number, clsId: any) => {
      const cls = classes.find((c: any) => c.id === clsId);
      return sum + (cls ? Number(cls.student_strength) : 0);
    }, 0);

    const teacherInvolvement = new Set(activities.map((a: any) => a.facilitator_id)).size;
    const docCompletion = documentation.length > 0 ? (documentation.filter((d: any) => d.status === 'Approved').length / documentation.length) * 100 : 0;
    const openActionsCount = actions.filter((a: any) => ['Open', 'In Progress'].includes(a.status)).length;

    // 2. Program Reports & Custom Metrics
    const programReports = programs.map((prog: any) => {
        const pActs = activities.filter((a: any) => a.program_id === prog.id);
        const pDocs = documentation.filter((d: any) => d.program_id === prog.id);
        const pAsms = assessments.filter((a: any) => a.program_id === prog.id);
        const pActions = actions.filter((a: any) => a.program_id === prog.id && !['Resolved', 'Cancelled'].includes(a.status));
        const pFeedback = (feedback || []).filter((f: any) => f.program_id === prog.id);

        const actCompCount = pActs.filter((a: any) => a.status === 'Completed').length;
        const actComp = pActs.length ? (actCompCount / pActs.length) * 100 : 0;
        const docComp = pDocs.length ? (pDocs.filter((d: any) => d.status === 'Approved').length / pDocs.length) * 100 : 0;

        const progClasses = [...new Set(pActs.filter((a: any) => a.status === 'Completed').map((a: any) => a.class_id))];
        const reach = progClasses.reduce((sum: number, clsId: any) => {
          const cls = classes.find((c: any) => c.id === clsId);
          return sum + (cls ? Number(cls.student_strength) : 0);
        }, 0);

        // Custom Evaluation Metrics
        const reachNum = Number(reach);
        const costPerStudent = reachNum > 0 ? (prog.budget_consumed || 0) / reachNum : 0;
        
        let completionVelocity = 0;
        const start = new Date(prog.start_date).getTime();
        const end = new Date(prog.end_date).getTime();
        if (end > start && currentDate > start) {
           const timeElapsedStr = Math.min(100, ((currentDate - start) / (end - start)) * 100);
           completionVelocity = actComp - timeElapsedStr; // Positive means ahead of schedule, negative means lagging
        }

        const sentimentScore = pFeedback.length > 0 
          ? pFeedback.reduce((acc: number, val: any) => acc + (val.sentiment_score || 3), 0) / pFeedback.length 
          : null;

        return {
            ...prog,
            actComp,
            docComp,
            reach: reachNum,
            completedActs: actCompCount,
            totalActs: pActs.length,
            pendingDocs: pDocs.filter((d: any) => ['Missing', 'Pending'].includes(d.status)).length,
            assessmentsDone: pAsms.length,
            openActions: pActions.length,
            costPerStudent,
            completionVelocity,
            sentimentScore
        }
    });

    // 3. Automated Insights
    const insightsList: Array<{type: 'warning' | 'info' | 'success', text: string}> = [];

    const criticalOverdue = actions.filter((a: any) => a.severity === 'Critical' && ['Open', 'In Progress'].includes(a.status) && new Date(a.due_date).getTime() < currentDate);
    if (criticalOverdue.length > 0) {
        insightsList.push({ type: 'warning', text: `${criticalOverdue.length} high-priority action item(s) are overdue this week.` });
    }

    programs.forEach((prog: any) => {
        const pActs = activities.filter((a: any) => a.program_id === prog.id);
        const pDocs = documentation.filter((d: any) => d.program_id === prog.id);
        const pAsm = assessments.filter((a: any) => a.program_id === prog.id);
        
        const pActsComp = pActs.filter((a: any) => a.status === 'Completed').length;
        const docsMissing = pDocs.filter((d: any) => d.status === 'Missing');

        if (pActsComp > (pActs.length / 2) && docsMissing.length > 0) {
            insightsList.push({ 
                type: 'info', 
                text: `${prog.name} has strong activity completion, but ${docsMissing.length} documentation item(s) are missing.` 
            });
        }

        const lowTurnout = pAsm.filter((a: any) => {
            const cls = classes.find((c: any) => c.id === a.class_id);
            return cls && (a.students_participated / cls.student_strength) < 0.7;
        });

        if (lowTurnout.length > 0) {
            insightsList.push({
                type: 'warning',
                text: `${prog.name} assessment has low turnout in Class ${lowTurnout.map((a: any) => `${classes.find((c: any) => c.id === a.class_id)?.grade_level}${classes.find((c: any) => c.id === a.class_id)?.section}`).join(', ')}.`
            });
        }
    });

    if (insightsList.length === 0) {
        insightsList.push({ type: 'success', text: "All programs are progressing as planned. No major anomalies detected." });
    }

    insightsList.sort((a, b) => a.type === 'warning' ? -1 : 1);

    return {
      activeProgramsCount,
      completedActsCount,
      studentReach,
      teacherInvolvement,
      docCompletion,
      openActionsCount,
      programReports,
      insightsList: insightsList.slice(0, 4)
    };
  }, [programs, activities, classes, teachers, assessments, documentation, actions, feedback]);

  const summaryCards = [
    { label: 'Active Programs', value: activeProgramsCount, suffix: 'programs' },
    { label: 'Completed Activities', value: completedActsCount, suffix: 'sessions' },
    { label: 'Students Reached', value: studentReach, suffix: 'students' },
    { label: 'Teachers Engaged', value: teacherInvolvement, suffix: 'educators' },
    { label: 'Evidence Approved', value: `${Math.round(docCompletion)}%`, suffix: 'compliance' },
    { label: 'Open Actions', value: openActionsCount, suffix: 'issues' }
  ];

  const handleToggleProgram = (id: string) => {
    setSelectedPrograms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleToggleMetric = (metric: string) => {
    setSelectedMetrics(prev => prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">Insights and reports</h1>
          <p className="text-xs text-gray-500 mt-1">Exportable summaries, strategic observations, and initiative details.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
             onClick={() => setActiveTab('standard')}
             className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'standard' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Standard Snapshot
          </button>
          <button 
             onClick={() => setActiveTab('advanced')}
             className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'advanced' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Faders className="w-3.5 h-3.5" />
            Advanced Compilations
          </button>
        </div>
      </div>

      {activeTab === 'standard' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Col: Insights & Monthly KPI */}
          <div className="space-y-6 md:col-span-1">
            {/* Key Insights */}
            <Card className="border-gray-200/60 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader className="py-4 border-b border-indigo-100/50">
                <CardTitle className="text-xs font-semibold flex items-center space-x-2 text-indigo-950">
                  <Lightbulb className="w-4 h-4 text-indigo-500" />
                  <span>Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <ul className="space-y-3">
                   {insightsList.map((insight, idx) => (
                     <li key={idx} className="flex items-start space-x-3 text-sm">
                       <span className="mt-0.5">
                         {insight.type === 'warning' && <Warning className="w-4 h-4 text-amber-500" />}
                         {insight.type === 'info' && <Folder className="w-4 h-4 text-blue-500" />}
                         {insight.type === 'success' && <TrendUp className="w-4 h-4 text-emerald-500" />}
                       </span>
                       <span className="text-gray-700 leading-snug">{insight.text}</span>
                     </li>
                   ))}
                 </ul>
              </CardContent>
            </Card>

            {/* Monthly KPI */}
            <Card className="border-gray-200/60 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                <CardTitle className="text-xs font-semibold flex items-center space-x-2 text-gray-950">
                  <ChartBar className="w-4 h-4 text-gray-400" />
                  <span>Monthly snapshot (May 2026)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 border-b border-gray-100">
                   {summaryCards.map((card, idx) => (
                     <div key={idx} className="p-4 flex flex-col justify-center items-center text-center bg-white">
                        <p className="text-[10px] font-semibold text-gray-500">{card.label}</p>
                        <h4 className="text-2xl font-bold text-gray-900 my-1">{card.value}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{card.suffix}</p>
                     </div>
                   ))}
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Program Printouts */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Program reports</h3>
            
            {programReports.map(prog => (
              <Card key={prog.id} className="border-gray-200/60 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-gray-50/30">
                  <div>
                    <CardTitle className="text-base text-gray-900">{prog.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">by {prog.vendor} • {prog.category}</p>
                  </div>
                  <Badge variant={prog.status === 'Active' ? 'success' : (prog.status === 'Delayed' ? 'warning' : 'default')} className="uppercase tracking-wide text-[10px]">
                    {prog.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Progress */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Activity summary</p>
                      <div className="mt-1 flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-gray-900">{prog.completedActs} / {prog.totalActs}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${prog.actComp}%` }}></div>
                      </div>
                    </div>

                    {/* Reach */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Students engaged</p>
                      <div className="mt-1 flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-gray-900">{prog.reach}</span>
                        <span className="text-[10px] text-gray-500">out of {prog.target_student_count}</span>
                      </div>
                    </div>

                    {/* Documentation */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Compliance</p>
                      <div className="mt-1 flex flex-col">
                        <span className="text-lg font-bold text-gray-900">{Math.round(prog.docComp)}%</span>
                        {prog.pendingDocs > 0 ? (
                          <span className="text-[10px] font-medium text-rose-600 flex items-center mt-1"><Warning className="w-3 h-3 mr-1 inline"/> {prog.pendingDocs} pending</span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-600 mt-1">All approved</span>
                        )}
                      </div>
                    </div>

                    {/* Health/Actions */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Action items</p>
                      <div className="mt-1 flex flex-col">
                        <span className="text-lg font-bold text-gray-900">{prog.openActions}</span>
                        <span className="text-[10px] text-gray-500 mt-1">open tasks</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Program schedule</p>
                      <p className="text-xs font-medium text-gray-700">{prog.start_date} to {prog.end_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Target cohort</p>
                      <p className="text-xs font-medium text-gray-700">{prog.target_student_count} students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Builder Controls */}
          <div className="xl:col-span-4 space-y-5">
             <Card className="border-gray-200 shadow-sm border-t-4 border-t-indigo-600">
               <CardHeader className="pb-3">
                 <CardTitle className="text-sm border-b border-gray-100 pb-2">Custom Metrics Selector</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 pt-0">
                 <div className="space-y-2">
                   <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Metrics Inclusion</p>
                   {[
                     { id: 'costPerStudent', name: 'Cost per Engaged Student', desc: 'Evalutes efficiency of consumed budget vs actual attendance.' },
                     { id: 'completionVelocity', name: 'Schedule Velocity Variance', desc: 'Measures activity completion parity against the timeline (%)' },
                     { id: 'sentimentIndex', name: 'Vendor Sentiment Index', desc: 'Averages qualitative scores (1-5) derived from active feedback.' },
                     { id: 'complianceDeficit', name: 'Compliance Deficit Level', desc: 'Ratio of unapproved mandatory evidence attachments.' }
                   ].map(metric => (
                     <label key={metric.id} className="flex items-start space-x-3 p-2.5 border border-gray-150 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                       <input 
                         type="checkbox" 
                         className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                         checked={selectedMetrics.includes(metric.id)}
                         onChange={() => handleToggleMetric(metric.id)}
                       />
                       <div>
                         <p className="text-xs font-semibold text-gray-800">{metric.name}</p>
                         <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{metric.desc}</p>
                       </div>
                     </label>
                   ))}
                 </div>
                 
                 <div className="pt-2">
                   <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter Scope</p>
                   <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                     {programs.map((p: any) => (
                       <label key={p.id} className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                            checked={selectedPrograms.includes(p.id)}
                            onChange={() => handleToggleProgram(p.id)}
                          />
                          <span className="truncate">{p.name} <span className="text-gray-400">({p.vendor})</span></span>
                       </label>
                     ))}
                     {programs.length === 0 && <span className="text-xs text-gray-500">No programs available</span>}
                   </div>
                 </div>

                 <Button 
                   className="w-full mt-4 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                   onClick={() => showToast("Compiling sophisticated custom evaluation report...", 'success')}
                   disabled={selectedPrograms.length === 0 || selectedMetrics.length === 0}
                 >
                   <Scan className="w-4 h-4 mr-2" />
                   Generate Evaluation Matrix
                 </Button>
               </CardContent>
             </Card>
          </div>

          {/* Compiled Output Preview */}
          <div className="xl:col-span-8">
             <Card className="border-gray-200 shadow-lg min-h-[500px] bg-white">
               <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row justify-between items-center py-4">
                 <div className="flex items-center gap-2">
                   <Presentation className="w-5 h-5 text-indigo-600" />
                   <CardTitle className="text-sm font-display tracking-wide">Advanced Output Compass</CardTitle>
                 </div>
                 <Button variant="outline" className="text-xs h-8 border-gray-200 text-gray-600 hover:bg-white shadow-sm" onClick={() => window.print()}>
                   <Download className="w-3.5 h-3.5 mr-1.5" />
                   Print Matrix
                 </Button>
               </CardHeader>
               <CardContent className="p-6">
                 {selectedPrograms.length === 0 || selectedMetrics.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                     <CheckSquareOffset className="w-12 h-12 mb-3 text-gray-200" />
                     <p className="text-sm font-medium">No Compilation Context</p>
                     <p className="text-xs mt-1 text-center max-w-sm">Select at least one metric and one program scope from the builder parameters to generate the evaluation matrix.</p>
                   </div>
                 ) : (
                   <div className="overflow-x-auto print-friendly-matrix">
                     <table className="w-full text-left text-sm border-collapse">
                       <thead>
                         <tr>
                           <th className="border-b-2 border-gray-800 py-3 px-4 font-bold text-xs text-gray-900 uppercase tracking-wider">Initiative</th>
                           {selectedMetrics.includes('costPerStudent') && <th className="border-b-2 border-gray-800 py-3 px-4 font-bold text-xs text-gray-900 uppercase tracking-wider text-right">Cost Per Student</th>}
                           {selectedMetrics.includes('completionVelocity') && <th className="border-b-2 border-gray-800 py-3 px-4 font-bold text-xs text-gray-900 uppercase tracking-wider text-center">Velocity Variance</th>}
                           {selectedMetrics.includes('sentimentIndex') && <th className="border-b-2 border-gray-800 py-3 px-4 font-bold text-xs text-gray-900 uppercase tracking-wider text-center">Sentiment Index</th>}
                           {selectedMetrics.includes('complianceDeficit') && <th className="border-b-2 border-gray-800 py-3 px-4 font-bold text-xs text-gray-900 uppercase tracking-wider text-center">Compliance Deficit</th>}
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200">
                         {programReports.filter(pr => selectedPrograms.includes(pr.id)).map(pr => (
                           <tr key={pr.id} className="hover:bg-gray-50 transition-colors">
                             <td className="py-4 px-4">
                               <p className="font-semibold text-gray-900">{pr.name}</p>
                               <p className="text-[10px] text-gray-500">{pr.vendor}</p>
                             </td>
                             {selectedMetrics.includes('costPerStudent') && (
                               <td className="py-4 px-4 text-right">
                                 <span className="font-mono text-gray-800">
                                   {pr.costPerStudent > 0 ? `₹${Math.round(pr.costPerStudent).toLocaleString()}` : '--'}
                                 </span>
                               </td>
                             )}
                             {selectedMetrics.includes('completionVelocity') && (
                               <td className="py-4 px-4 text-center">
                                 <Badge variant={pr.completionVelocity >= 0 ? 'success' : 'danger'} className="font-mono text-[10px]">
                                   {pr.completionVelocity > 0 ? '+' : ''}{Math.round(pr.completionVelocity)}%
                                 </Badge>
                               </td>
                             )}
                             {selectedMetrics.includes('sentimentIndex') && (
                               <td className="py-4 px-4 text-center">
                                 <span className={`font-semibold ${!pr.sentimentScore ? 'text-gray-400 font-normal' : (pr.sentimentScore >= 4 ? 'text-emerald-600' : (pr.sentimentScore <= 2 ? 'text-rose-600' : 'text-amber-600'))}`}>
                                   {pr.sentimentScore ? pr.sentimentScore.toFixed(1) + ' / 5.0' : 'N/A'}
                                 </span>
                               </td>
                             )}
                             {selectedMetrics.includes('complianceDeficit') && (
                               <td className="py-4 px-4 text-center">
                                 <span className={`font-semibold ${pr.pendingDocs === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                   {pr.pendingDocs} pending
                                 </span>
                               </td>
                             )}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     <div className="mt-8 pt-4 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
                       <span>Report generated on {new Date(currentDate).toLocaleDateString()}</span>
                       <span>School Program Command Centre Operations</span>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}


