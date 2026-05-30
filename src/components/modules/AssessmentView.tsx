import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { Target, MagnifyingGlass, Funnel, TrendUp, Users, CheckCircle, Warning, Presentation, BookOpen, WarningCircle, Stack } from '@phosphor-icons/react';

export function AssessmentView() {
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [groupBy, setGroupBy] = useState<'None' | 'Program' | 'Class'>('None');

  const { assessments, programs, classes } = useSupabaseContext();

  const enrichedAssessments = useMemo(() => {
    return assessments.map((asm: any) => {
      const prog = programs.find((p: any) => p.id === asm.program_id);
      const cls = classes.find((c: any) => c.id === asm.class_id);
      
      const studentsAssigned = cls ? cls.student_strength : 0;
      const completionRate = studentsAssigned > 0 ? (asm.students_participated / studentsAssigned) * 100 : 0;

      return {
        ...asm,
        programName: prog ? prog.name : 'Unknown Program',
        category: prog ? prog.category : 'Unknown',
        className: cls ? `${cls.grade_level}${cls.section}` : 'N/A',
        studentsAssigned,
        completionRate
      };
    }).sort((a: any, b: any) => new Date(b.conducted_date).getTime() - new Date(a.conducted_date).getTime());
  }, [assessments, programs, classes]);

  const filteredAssessments = useMemo(() => {
    return enrichedAssessments.filter((asm: any) => {
      const matchSearch = asm.name.toLowerCase().includes(search.toLowerCase()) || 
                          asm.programName.toLowerCase().includes(search.toLowerCase()) ||
                          asm.className.toLowerCase().includes(search.toLowerCase());
      const matchProgram = programFilter === 'All' || asm.program_id === programFilter;
      const matchClass = classFilter === 'All' || asm.class_id === classFilter;
      return matchSearch && matchProgram && matchClass;
    });
  }, [enrichedAssessments, search, programFilter, classFilter]);

  const groupedAssessments = useMemo(() => {
    if (groupBy === 'None') return { 'All Assessments': filteredAssessments };
    const groups: Record<string, any[]> = {};
    filteredAssessments.forEach((asm: any) => {
      const key = groupBy === 'Program' ? asm.programName : `Class ${asm.className}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(asm);
    });
    return groups;
  }, [filteredAssessments, groupBy]);

  // KPIs
  const totalConducted = enrichedAssessments.length;
  const totalAssigned = enrichedAssessments.reduce((sum: number, asm: any) => sum + asm.studentsAssigned, 0);
  const totalCompleted = enrichedAssessments.reduce((sum: number, asm: any) => sum + asm.students_participated, 0);
  const overallCompletionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;
  const averageScore = totalConducted > 0 ? enrichedAssessments.reduce((sum: number, asm: any) => sum + asm.average_score_percent, 0) / totalConducted : 0;
  
  // Averages for variances
  const totalVariance = enrichedAssessments.reduce((sum: number, asm: any) => sum + (asm.baseline_variance || 0), 0);
  const averageImprovement = totalConducted > 0 ? totalVariance / totalConducted : 0;

  // Recommendations logic
  const lowCompletion = enrichedAssessments.filter((a: any) => a.completionRate < 75);
  const highRemediation = enrichedAssessments.filter((a: any) => a.band_remediation_percent > 40);

  const programsList = ['All', ...Array.from(new Set(programs.map((p: any) => p.id)))];
  const classList = ['All', ...Array.from(new Set(classes.map((c: any) => c.id)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">Evaluation outcomes</h1>
          <p className="text-xs text-gray-500 mt-1">Diagnostic and post-program evaluation trends, participation, and remediation tracking.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-gray-200/60 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full mb-2"><BookOpen className="w-5 h-5" /></div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Conducted</p>
            <h4 className="text-xl font-bold text-gray-900 mt-0.5">{totalConducted}</h4>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full mb-2"><Users className="w-5 h-5" /></div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Target Cohort</p>
            <h4 className="text-xl font-bold text-gray-900 mt-0.5">{totalAssigned}</h4>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full mb-2"><CheckCircle className="w-5 h-5" /></div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Completed</p>
            <h4 className="text-xl font-bold text-gray-900 mt-0.5">{totalCompleted}</h4>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-full mb-2"><Target className="w-5 h-5" /></div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Turnout</p>
            <h4 className="text-xl font-bold text-gray-900 mt-0.5">{Math.round(overallCompletionRate)}%</h4>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
             <div className="p-2 bg-violet-50 text-violet-600 rounded-full mb-2"><Presentation className="w-5 h-5" /></div>
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Avg Score</p>
             <h4 className="text-xl font-bold text-gray-900 mt-0.5">{Math.round(averageScore)}%</h4>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className={`p-2 rounded-full mb-2 ${averageImprovement >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
              <TrendUp className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Improvement</p>
            <h4 className={`text-xl font-bold mt-0.5 ${averageImprovement >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
              {averageImprovement > 0 ? '+' : ''}{averageImprovement.toFixed(1)}%
            </h4>
          </CardContent>
        </Card>
      </div>

      {/* Follow Up Recommendations & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-gray-200/60 shadow-sm lg:col-span-2">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
             <CardTitle className="text-xs flex items-center space-x-2 font-semibold text-gray-950">
                <span>Assessment score distribution</span>
             </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
               {enrichedAssessments.slice(0, 5).map((asm: any) => (
                 <div key={asm.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-900">{asm.name} <span className="text-gray-500 font-normal">({asm.className})</span></span>
                      <span className="text-gray-500">Avg {asm.average_score_percent}%</span>
                    </div>
                    <div className="w-full flex h-4 rounded overflow-hidden">
                       <div className="bg-emerald-400 text-[10px] text-white flex items-center justify-center font-medium" style={{ width: `${asm.band_high_percent}%` }} title={`High Performers: ${asm.band_high_percent}%`}>
                         {asm.band_high_percent > 10 ? `${asm.band_high_percent}%` : ''}
                       </div>
                       <div className="bg-amber-300 text-[10px] text-amber-900 flex items-center justify-center font-medium" style={{ width: `${asm.band_target_percent}%` }} title={`On Target: ${asm.band_target_percent}%`}>
                         {asm.band_target_percent > 10 ? `${asm.band_target_percent}%` : ''}
                       </div>
                       <div className="bg-rose-400 text-[10px] text-white flex items-center justify-center font-medium" style={{ width: `${asm.band_remediation_percent}%` }} title={`Needs Remediation: ${asm.band_remediation_percent}%`}>
                         {asm.band_remediation_percent > 10 ? `${asm.band_remediation_percent}%` : ''}
                       </div>
                    </div>
                 </div>
               ))}
               <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm"></span> High</div>
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-300 rounded-sm"></span> On Target</div>
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></span> Remediation</div>
                  </div>
                  <span>Top 5 assessments by date</span>
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-rose-200/60 shadow-sm bg-rose-50/30">
            <CardHeader className="py-3 px-4 border-b border-rose-100">
              <CardTitle className="text-xs text-rose-950 flex items-center space-x-2 font-semibold">
                 <Warning className="w-4 h-4 text-rose-600" />
                 <span>Remediation alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <ul className="divide-y divide-rose-100/50">
                 {highRemediation.map((asm: any) => (
                   <li key={asm.id} className="p-3">
                     <p className="text-sm font-medium text-gray-900">{asm.programName}</p>
                     <p className="text-xs text-rose-700 mt-1">Class {asm.className} has {asm.band_remediation_percent}% students in remediation for {asm.name}.</p>
                   </li>
                 ))}
                 {highRemediation.length === 0 && <li className="p-4 text-xs text-gray-500">No classes currently over 40% remediation.</li>}
               </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200/60 shadow-sm bg-amber-50/30">
            <CardHeader className="py-3 px-4 border-b border-amber-100">
              <CardTitle className="text-xs text-amber-950 flex items-center space-x-2 font-semibold">
                 <WarningCircle className="w-4 h-4 text-amber-600" />
                 <span>Turnout alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <ul className="divide-y divide-amber-100/50">
                 {lowCompletion.map((asm: any) => (
                   <li key={asm.id} className="p-3">
                     <p className="text-sm font-medium text-gray-900 line-clamp-1">{asm.name}</p>
                     <p className="text-xs text-amber-700 mt-1">Class {asm.className}: only {Math.round(asm.completionRate)}% turnout ({asm.students_participated}/{asm.studentsAssigned}).</p>
                   </li>
                 ))}
                 {lowCompletion.length === 0 && <li className="p-4 text-xs text-gray-500">Turnout targets met for all assessments.</li>}
               </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls & Table */}
      <div className="flex flex-wrap gap-3 items-center pt-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder="Search assessments..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <Funnel className="w-4 h-4 text-gray-500 ml-2" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-gray-700 cursor-pointer max-w-[150px] truncate"
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
          >
            <option value="All">All Programs</option>
            {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-gray-700 cursor-pointer"
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
          >
            <option value="All">All Classes</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.grade_level}{c.section}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <Stack className="w-4 h-4 text-gray-500 ml-2" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-gray-700 cursor-pointer"
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as 'None' | 'Program' | 'Class')}
          >
            <option value="None">No Grouping</option>
            <option value="Program">Group by Program</option>
            <option value="Class">Group by Class</option>
          </select>
        </div>
      </div>

      <Card className="border-gray-200/60 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs border-b border-gray-100/80">
              <tr>
                <th className="px-6 py-2.5 font-medium text-gray-500">Evaluation name</th>
                <th className="px-6 py-2.5 font-medium hidden md:table-cell text-gray-500">Context</th>
                <th className="px-6 py-2.5 font-medium text-center text-gray-500">Participation</th>
                <th className="px-6 py-2.5 font-medium text-center text-gray-500">Average score</th>
                <th className="px-6 py-2.5 font-medium text-center text-gray-500">Growth</th>
                <th className="px-6 py-2.5 font-medium text-right text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                     <Target className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                     <p>No assessment records found.</p>
                  </td>
                </tr>
              ) : Object.entries(groupedAssessments).map(([groupName, groupAsms]) => {
                const asms = groupAsms as any[];
                return (
                <React.Fragment key={groupName}>
                  {groupBy !== 'None' && (
                    <tr className="bg-gray-50/80">
                      <td colSpan={6} className="px-6 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                        {groupName} ({asms.length})
                      </td>
                    </tr>
                  )}
                  {asms.map((asm: any) => (
                  <tr key={asm.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{asm.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Class {asm.className}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-gray-900">{asm.programName}</div>
                      <div className="text-xs text-gray-500 mt-1">{asm.category}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-medium text-gray-900">{asm.students_participated} / {asm.studentsAssigned}</div>
                      <div className={`text-[10px] mt-1 ${asm.completionRate < 75 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                        {Math.round(asm.completionRate)}% Turnout
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-gray-900">{asm.average_score_percent}%</div>
                      <div className="w-16 h-1 mt-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-violet-400" style={{ width: `${asm.average_score_percent}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {asm.baseline_variance != null ? (
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${asm.baseline_variance > 0 ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                          {asm.baseline_variance > 0 ? '+' : ''}{asm.baseline_variance}%
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Baseline</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-xs text-gray-600">{asm.conducted_date}</span>
                    </td>
                  </tr>
                  ))}
                </React.Fragment>
              )})}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  );
}

