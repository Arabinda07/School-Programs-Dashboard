import React, { useState, useMemo } from 'react';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { Calendar, MagnifyingGlass, Funnel, AppWindow, Users } from '@phosphor-icons/react';

export function ActivityLog() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  const { activities, programs, classes, teachers } = useSupabaseContext();

  const enrichedActivities = useMemo(() => {
    return activities.map((act: any) => {
      const prog = programs.find((p: any) => p.id === act.program_id);
      const cls = classes.find((c: any) => c.id === act.class_id);
      const facilitator = teachers.find((t: any) => t.id === act.facilitator_id);
      
      return {
        ...act,
        programName: prog ? prog.name : 'Unknown Program',
        className: cls ? `${cls.grade_level}${cls.section}` : 'N/A',
        facilitatorName: facilitator ? facilitator.name : 'Unknown',
        targetDateObj: new Date(act.target_date),
      };
    }).sort((a: any, b: any) => b.targetDateObj.getTime() - a.targetDateObj.getTime());
  }, [activities, programs, classes, teachers]);

  const filteredActivities = useMemo(() => {
    return enrichedActivities.filter((act: any) => {
      // Tab filter
      if (activeTab === 'Completed' && act.status !== 'Completed') return false;
      if (activeTab === 'Delayed' && act.status !== 'Delayed') return false;
      if (activeTab === 'Upcoming' && (act.status !== 'Planned' || act.targetDateObj < new Date('2026-05-23'))) return false;

      // Dropdown filters
      if (programFilter !== 'All' && act.program_id !== programFilter) return false;
      if (classFilter !== 'All' && act.class_id !== classFilter) return false;

      // Search
      const matchSearch = act.topic.toLowerCase().includes(search.toLowerCase()) || 
                          act.programName.toLowerCase().includes(search.toLowerCase()) ||
                          act.facilitatorName.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      return true;
    });
  }, [enrichedActivities, activeTab, search, programFilter, classFilter]);

  const programOptions = ['All', ...programs.map((p: any) => p.id)];
  const classOptions = ['All', ...classes.map((c: any) => c.id)];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'Delayed': return <Badge variant="danger">Delayed</Badge>;
      case 'Planned': return <Badge variant="info">Planned</Badge>;
      case 'Cancelled': return <Badge variant="warning">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // Highlights
  const delayedCount = enrichedActivities.filter((a: any) => a.status === 'Delayed').length;
  // Ghost sessions (Completed but 0 attendance or no actual date)
  const ghostCount = enrichedActivities.filter((a: any) => a.status === 'Completed' && (!a.actual_date || a.students_attended === 0)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 font-sans">Activity registry</h1>
          <p className="text-sm text-slate-500 mt-1 font-light">Class sessions, attendance logs, and execution timeline.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg self-stretch md:self-auto">
           {['All', 'Upcoming', 'Completed', 'Delayed'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                 activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               {tab} {tab === 'Delayed' && delayedCount > 0 && <span className="ml-1 text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">{delayedCount}</span>}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ghostCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-3">
             <div className="p-1"><AppWindow className="w-5 h-5 text-amber-600" /></div>
             <div>
               <h4 className="text-xs font-semibold text-amber-900">Execution flags</h4>
               <p className="text-xs text-amber-700 mt-0.5">{ghostCount} completed sessions are missing log details or attendance data.</p>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text"
            placeholder="Search topics or facilitators..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1">
          <Funnel className="w-4 h-4 text-slate-500 ml-2" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-slate-700 cursor-pointer max-w-[150px] truncate"
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
          >
            <option value="All">All Programs</option>
            {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1">
          <Users className="w-4 h-4 text-slate-500 ml-2" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-slate-700 cursor-pointer"
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
          >
            <option value="All">All Classes</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.grade_level}{c.section}</option>)}
          </select>
        </div>
      </div>

      <Card className="border-slate-200 shadow-none bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100/80">
              <tr>
                <th className="px-6 py-2.5 font-medium text-slate-500">Session topic</th>
                <th className="px-6 py-2.5 font-medium text-slate-500">Program context</th>
                <th className="px-6 py-2.5 font-medium text-slate-500">Schedule / date</th>
                <th className="px-6 py-2.5 font-medium text-center text-slate-500">Class and attendance</th>
                <th className="px-6 py-2.5 font-medium text-center text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                     <Calendar className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                     <p>No activities found matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act: any) => {
                  const isGhost = act.status === 'Completed' && (!act.actual_date || act.students_attended === 0);
                  return (
                  <tr key={act.id} className={`hover:bg-slate-50/50 transition-colors ${isGhost ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        {act.topic}
                        {isGhost && <AppWindow className="w-4 h-4 text-amber-500" title="Data anomaly: missing details" />}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 font-light flex items-center gap-1">
                         <span className="font-medium text-slate-600 border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-sm">{act.id}</span>
                         <span>by {act.facilitatorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{act.programName}</div>
                      <div className="text-xs text-rose-600 mt-1">{act.notes && `Notes: ${act.notes}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500">Target: <span className="text-slate-900">{act.target_date}</span></div>
                      {act.actual_date ? (
                        <div className="text-xs text-emerald-600 mt-1">Actual: {act.actual_date}</div>
                      ) : (
                        act.status === 'Completed' && <div className="text-xs text-amber-600 mt-1 font-medium">Missing Date</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-medium text-slate-900 bg-slate-100 inline-block px-2 py-0.5 rounded text-xs">{act.className}</div>
                      <div className={`text-xs mt-1 ${isGhost && act.students_attended === 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                        {act.students_attended !== null ? `${act.students_attended} present` : '--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(act.status)}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
