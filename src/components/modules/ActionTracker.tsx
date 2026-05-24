import React, { useState, useMemo } from 'react';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { Warning, MagnifyingGlass, Funnel, WarningCircle, Clock, CheckCircle, ShieldWarning } from '@phosphor-icons/react';

export function ActionTracker() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const { actions, programs, teachers, updateItem, showToast } = useSupabaseContext();
  const currentDate = new Date('2026-05-23');

  const handleMarkResolved = async (id: string) => {
    try {
      await updateItem('actions', id, { 
        status: 'Resolved', 
        resolved_date: new Date().toISOString().split('T')[0] 
      });
      showToast('Action item resolved successfully!', 'success');
    } catch (e: any) {
      showToast('Failed to update action: ' + e.message, 'error');
    }
  };

  const enrichedActions = useMemo(() => {
    return actions.map((act: any) => {
      const prog = programs.find((p: any) => p.id === act.program_id);
      const owner = teachers.find((t: any) => t.id === act.owner_id);
      const isOverdue = new Date(act.due_date) < currentDate && act.status !== 'Resolved';
      
      return {
        ...act,
        programName: prog ? prog.name : 'Unknown Program',
        ownerName: owner ? owner.name : 'Unknown',
        isOverdue,
      };
    }).sort((a: any, b: any) => {
      if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
      if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [actions, programs, teachers]);

  const filteredActions = useMemo(() => {
    return enrichedActions.filter((act: any) => {
      const matchSearch = act.description.toLowerCase().includes(search.toLowerCase()) || 
                          act.programName.toLowerCase().includes(search.toLowerCase()) || 
                          act.ownerName.toLowerCase().includes(search.toLowerCase());
      const matchProgram = programFilter === 'All' || act.program_id === programFilter;
      const matchOwner = ownerFilter === 'All' || act.owner_id === ownerFilter;
      const matchSeverity = severityFilter === 'All' || act.severity === severityFilter;

      let matchTab = true;
      if (activeTab === 'Open') matchTab = act.status === 'Open' || act.status === 'In Progress';
      if (activeTab === 'Overdue') matchTab = act.isOverdue;
      if (activeTab === 'Critical') matchTab = act.severity === 'Critical' && act.status !== 'Resolved';
      if (activeTab === 'Resolved') matchTab = act.status === 'Resolved';

      return matchSearch && matchProgram && matchOwner && matchSeverity && matchTab;
    });
  }, [enrichedActions, search, programFilter, ownerFilter, severityFilter, activeTab]);

  // KPIs
  const openCount = enrichedActions.filter((a: any) => a.status === 'Open' || a.status === 'In Progress').length;
  const overdueCount = enrichedActions.filter((a: any) => a.isOverdue).length;
  const highPriorityCount = enrichedActions.filter((a: any) => a.severity === 'Critical' && a.status !== 'Resolved').length;
  // Let's define 'blocked' as Open tasks that are Critical and Overdue for the sake of KPI
  const blockedCount = enrichedActions.filter((a: any) => a.status === 'Open' && a.severity === 'Critical' && a.isOverdue).length;

  const programsList = ['All', ...Array.from(new Set(programs.map((p: any) => p.id)))];
  const ownersList = ['All', ...Array.from(new Set(actions.map((a: any) => a.owner_id)))];
  const severitiesList = ['All', ...Array.from(new Set(actions.map((a: any) => a.severity)))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved': return <Badge variant="success">Resolved</Badge>;
      case 'In Progress': return <Badge variant="info">In Progress</Badge>;
      case 'Open': return <Badge variant="warning">Open</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return <Badge variant="danger">Critical</Badge>;
      case 'High': return <Badge variant="warning">High</Badge>;
      case 'Medium': return <Badge variant="info">Medium</Badge>;
      case 'Low': return <Badge variant="default">Low</Badge>;
      default: return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">Action tracker</h1>
          <p className="text-xs text-gray-500 mt-1">Risk monitoring, program delays, and resolved action listings.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg self-stretch md:self-auto overflow-x-auto">
           {['All', 'Open', 'Overdue', 'Critical', 'Resolved'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                 activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               {tab} {tab === 'Overdue' && overdueCount > 0 && <span className="ml-1 text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">{overdueCount}</span>}
             </button>
           ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><WarningCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500">Open items</p>
              <h4 className="text-base font-bold text-gray-900 mt-0.5">{openCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500">Overdue items</p>
              <h4 className="text-base font-bold text-gray-900 mt-0.5">{overdueCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-lg"><Warning className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500">High priority</p>
              <h4 className="text-base font-bold text-gray-900 mt-0.5">{highPriorityCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><ShieldWarning className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500">Blocked tracker</p>
              <h4 className="text-base font-bold text-gray-900 mt-0.5">{blockedCount}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder="Search action items..."
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
            value={ownerFilter}
            onChange={e => setOwnerFilter(e.target.value)}
          >
            <option value="All">All Owners</option>
            {ownersList.filter(o => o !== 'All').map((o: any) => (
               <option key={o} value={o}>{teachers.find((t: any) => t.id === o)?.name || o}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-gray-700 cursor-pointer"
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
          >
            {severitiesList.map((s: any) => <option key={s} value={s}>{s === 'All' ? 'All Severities' : s}</option>)}
          </select>
        </div>
      </div>

      <Card className="border-gray-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs border-b border-gray-100/80">
              <tr>
                <th className="px-6 py-2.5 font-medium text-gray-500">Task and context</th>
                <th className="px-6 py-2.5 font-medium hidden md:table-cell text-gray-500">Owner</th>
                <th className="px-6 py-2.5 font-medium text-center text-gray-500">Due date</th>
                <th className="px-6 py-2.5 font-medium text-center text-gray-500">Priority</th>
                <th className="px-6 py-2.5 font-medium text-center text-gray-500">Status</th>
                <th className="px-6 py-2.5 font-medium text-right text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                     <CheckCircle className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                     <p>No action items found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredActions.map((act: any) => {
                  return (
                    <tr key={act.id} className={`transition-colors ${act.status === 'Resolved' ? 'bg-gray-50/30' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${act.status === 'Resolved' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {act.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{act.programName}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-gray-900">{act.ownerName}</div>
                      </td>
                      <td className="px-6 py-4 text-center border-l border-r border-transparent">
                        <div className={`text-xs ${act.isOverdue ? 'text-rose-600 font-bold' : 'text-gray-700'}`}>
                          {act.due_date}
                        </div>
                        {act.isOverdue && <div className="text-[10px] text-rose-500 mt-0.5">Overdue</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getSeverityBadge(act.severity)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(act.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {act.status !== 'Resolved' ? (
                           <Button onClick={() => handleMarkResolved(act.id)} variant="outline" className="text-xs px-2 py-1 h-auto">Mark Resolved</Button>
                        ) : (
                           <span className="text-xs text-gray-400 italic">Done on<br/>{act.resolved_date}</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  );
}
