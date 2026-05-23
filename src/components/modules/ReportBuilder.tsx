import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { Download, FileText, FileSpreadsheet, BarChart3, AlertTriangle, Lightbulb, TrendingUp, Presentation, FolderGit2 } from 'lucide-react';

export function ReportBuilder() {
  const { programs, activities, classes, teachers, assessments, documentation, actions } = useSupabaseContext();
  const currentDate = new Date('2026-05-23');

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
    const studentReach = completedClasses.reduce((sum, clsId) => {
      const cls = classes.find((c: any) => c.id === clsId);
      return sum + (cls ? cls.student_strength : 0);
    }, 0);

    const teacherInvolvement = new Set(activities.map((a: any) => a.facilitator_id)).size;
    const docCompletion = documentation.length > 0 ? (documentation.filter((d: any) => d.status === 'Approved').length / documentation.length) * 100 : 0;
    const openActionsCount = actions.filter((a: any) => ['Open', 'In Progress'].includes(a.status)).length;

    // 2. Program Reports
    const programReports = programs.map((prog: any) => {
        const pActs = activities.filter((a: any) => a.program_id === prog.id);
        const pDocs = documentation.filter((d: any) => d.program_id === prog.id);
        const pAsms = assessments.filter((a: any) => a.program_id === prog.id);
        const pActions = actions.filter((a: any) => a.program_id === prog.id && !['Resolved', 'Cancelled'].includes(a.status));

        const actCompCount = pActs.filter((a: any) => a.status === 'Completed').length;
        const actComp = pActs.length ? (actCompCount / pActs.length) * 100 : 0;
        const docComp = pDocs.length ? (pDocs.filter((d: any) => d.status === 'Approved').length / pDocs.length) * 100 : 0;

        const progClasses = [...new Set(pActs.filter((a: any) => a.status === 'Completed').map((a: any) => a.class_id))];
        const reach = progClasses.reduce((sum, clsId) => {
          const cls = classes.find((c: any) => c.id === clsId);
          return sum + (cls ? cls.student_strength : 0);
        }, 0);

        return {
            ...prog,
            actComp,
            docComp,
            reach,
            completedActs: actCompCount,
            totalActs: pActs.length,
            pendingDocs: pDocs.filter((d: any) => ['Missing', 'Pending'].includes(d.status)).length,
            assessmentsDone: pAsms.length,
            openActions: pActions.length,
        }
    });

    // 3. Automated Insights
    const insightsList: Array<{type: 'warning' | 'info' | 'success', text: string}> = [];

    const criticalOverdue = actions.filter((a: any) => a.severity === 'Critical' && ['Open', 'In Progress'].includes(a.status) && new Date(a.due_date) < currentDate);
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
  }, [programs, activities, classes, teachers, assessments, documentation, actions]);

  const summaryCards = [
    { label: 'Active Programs', value: activeProgramsCount, suffix: 'programs' },
    { label: 'Completed Activities', value: completedActsCount, suffix: 'sessions' },
    { label: 'Students Reached', value: studentReach, suffix: 'students' },
    { label: 'Teachers Engaged', value: teacherInvolvement, suffix: 'educators' },
    { label: 'Evidence Approved', value: `${Math.round(docCompletion)}%`, suffix: 'compliance' },
    { label: 'Open Actions', value: openActionsCount, suffix: 'issues' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Insights & Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Management summaries and printable data views</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => alert("Excel Export not implemented yet.")} className="text-xs bg-white">
             <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Summary
          </Button>
          <Button variant="outline" onClick={() => alert("Docs Export not implemented yet.")} className="text-xs bg-white text-rose-700 border-rose-200 hover:bg-rose-50 hover:text-rose-800">
             <AlertTriangle className="w-4 h-4 mr-2" /> Pending Docs
          </Button>
          <Button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => alert("PDF Export not implemented yet.")}>
             <Download className="w-4 h-4 mr-2" /> Download Monthly PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Insights & Monthly KPI */}
        <div className="space-y-6 md:col-span-1">
          {/* Key Insights */}
          <Card className="border-gray-200/60 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader className="py-4 border-b border-indigo-100/50">
              <CardTitle className="text-base flex items-center space-x-2 text-indigo-900">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span>Automated Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
               <ul className="space-y-3">
                 {insightsList.map((insight, idx) => (
                   <li key={idx} className="flex items-start space-x-3 text-sm">
                     <span className="mt-0.5">
                       {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                       {insight.type === 'info' && <FolderGit2 className="w-4 h-4 text-blue-500" />}
                       {insight.type === 'success' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
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
              <CardTitle className="text-base flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span>Monthly Snapshot (May '26)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 border-b border-gray-100">
                 {summaryCards.map((card, idx) => (
                   <div key={idx} className="p-4 flex flex-col justify-center items-center text-center bg-white">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{card.label}</p>
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
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Program Printouts</h3>
          
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
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity Setup</p>
                    <div className="mt-1 flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-gray-900">{prog.completedActs} / {prog.totalActs}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${prog.actComp}%` }}></div>
                    </div>
                  </div>

                  {/* Reach */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Students Reached</p>
                    <div className="mt-1 flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-gray-900">{prog.reach}</span>
                      <span className="text-[10px] text-gray-500">out of {prog.target_student_count}</span>
                    </div>
                  </div>

                  {/* Documentation */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documentation</p>
                    <div className="mt-1 flex flex-col">
                      <span className="text-lg font-bold text-gray-900">{Math.round(prog.docComp)}%</span>
                      {prog.pendingDocs > 0 ? (
                        <span className="text-[10px] font-medium text-rose-600 flex items-center mt-1"><AlertTriangle className="w-3 h-3 mr-1 inline"/> {prog.pendingDocs} pending</span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 mt-1">All approved</span>
                      )}
                    </div>
                  </div>

                  {/* Health/Actions */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action Items</p>
                    <div className="mt-1 flex flex-col">
                      <span className="text-lg font-bold text-gray-900">{prog.openActions}</span>
                      <span className="text-[10px] text-gray-500 mt-1">open tasks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Schedule</p>
                    <p className="text-sm text-gray-700">{prog.start_date} to {prog.end_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Target Strength</p>
                    <p className="text-sm text-gray-700">{prog.target_student_count} students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
        </div>
      </div>
    </div>
  );
}

