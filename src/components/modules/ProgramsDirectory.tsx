import React, { useState, useMemo } from 'react';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { FolderGit2, Search, Filter, ChevronDown, ChevronUp, FileText, AlertCircle, PlayCircle, Settings2 } from 'lucide-react';

export function ProgramsDirectory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<any>(null);

  const { programs, activities, documentation, actions, teachers, updateItem } = useSupabaseContext();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    try {
      await updateItem('programs', editingProgram.id, {
         name: editingProgram.name,
         status: editingProgram.status,
         budget_consumed: parseInt(editingProgram.budget_consumed, 10)
      });
      setEditingProgram(null);
    } catch (err: any) {
      alert("Failed to update program: " + err.message);
    }
  };

  const enrichedPrograms = useMemo(() => {
    return programs.map((prog: any) => {
      const pActs = activities.filter((a: any) => a.program_id === prog.id);
      const actComp = pActs.length ? (pActs.filter((a: any) => a.status === 'Completed').length / pActs.length) * 100 : 0;
      
      const pDocs = documentation.filter((d: any) => d.program_id === prog.id);
      const docComp = pDocs.length ? (pDocs.filter((d: any) => d.status === 'Approved').length / pDocs.length) * 100 : 0;
      
      const pActions = actions.filter((a: any) => a.program_id === prog.id && ['Open', 'In Progress'].includes(a.status));
      const owner = teachers.find((t: any) => t.id === prog.owner_id);

      return {
        ...prog,
        actComp,
        docComp,
        openActions: pActions,
        ownerName: owner ? owner.name : 'Unknown',
        pActs,
        pDocs
      };
    });
  }, [programs, activities, documentation, actions, teachers]);

  const filteredPrograms = useMemo(() => {
    return enrichedPrograms.filter((p: any) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [enrichedPrograms, search, statusFilter, categoryFilter]);

  const categories = ['All', ...Array.from(new Set(programs.map((p: any) => p.category)))];
  const statuses = ['All', ...Array.from(new Set(programs.map((p: any) => p.status)))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="success">Active</Badge>;
      case 'Completed': return <Badge variant="info">Completed</Badge>;
      case 'Delayed': return <Badge variant="warning">Delayed</Badge>;
      case 'At Risk': return <Badge variant="danger">At Risk</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Programs Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Master list of all active initiatives and vendors</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search programs..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <Filter className="w-4 h-4 text-gray-500 ml-2" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-gray-700 cursor-pointer"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-gray-700 cursor-pointer pl-3"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statuses.map((s: any) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      <Card className="border-gray-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Program Name</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Category / Vendor</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">Owner</th>
                <th className="px-6 py-4 font-medium text-center">Progress</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FolderGit2 className="w-8 h-8 mb-3 text-gray-300" />
                      <p>No programs found matching the filters.</p>
                      <Button variant="ghost" className="mt-2" onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); }}>Clear Filters</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog: any) => (
                  <React.Fragment key={prog.id}>
                    <tr className={`hover:bg-gray-50/50 transition-colors ${expandedId === prog.id ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{prog.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5" title="Target Students">{prog.target_student_count} Students Target</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {prog.category}
                        </div>
                        <div className="text-xs text-gray-500 mt-1.5">by {prog.vendor}</div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-gray-900">{prog.ownerName}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-xs font-medium text-gray-700" title="Activities Completed">{Math.round(prog.actComp)}% Act.</span>
                          <span className="text-xs font-medium text-gray-500" title="Documentation Approved">{Math.round(prog.docComp)}% Doc.</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(prog.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          className="px-2 py-1 text-xs"
                          onClick={() => setExpandedId(expandedId === prog.id ? null : prog.id)}
                        >
                          {expandedId === prog.id ? 'Hide Details' : 'View Details'}
                          {expandedId === prog.id ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                        </Button>
                      </td>
                    </tr>
                    {expandedId === prog.id && (
                      <tr className="bg-gray-50/30 border-b border-gray-100">
                        <td colSpan={6} className="px-0 py-0">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
                            {/* Budget & Timeline */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">Logistics & Budget</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between"><span>Timeline:</span> <span className="font-medium text-gray-900">{prog.start_date} to {prog.end_date}</span></div>
                                <div className="flex justify-between"><span>Budget Allocated:</span> <span className="font-medium text-gray-900">₹{prog.budget_allocated?.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Budget Consumed:</span> <span className="font-medium text-gray-900">₹{prog.budget_consumed?.toLocaleString()}</span></div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                  <div className="bg-gray-900 h-full" style={{ width: `${(prog.budget_consumed / prog.budget_allocated) * 100}%` }}></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Summary Metrics */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                              <Button 
                                variant="ghost" 
                                className="absolute top-2 right-2 p-1 h-auto"
                                onClick={() => setEditingProgram({ ...prog })}
                                title="Edit Program Details"
                              >
                                <Settings2 className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                              </Button>
                              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">Activities & Docs</h4>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded"><PlayCircle className="w-4 h-4" /></div>
                                  <div>
                                    <div className="text-xs text-gray-500">Activities Completed</div>
                                    <div className="text-sm font-semibold text-gray-900">{prog.pActs.filter((a:any)=>a.status==='Completed').length} / {prog.pActs.length}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-teal-50 text-teal-600 rounded"><FileText className="w-4 h-4" /></div>
                                  <div>
                                    <div className="text-xs text-gray-500">Documentation Status</div>
                                    <div className="text-sm font-semibold text-gray-900">{prog.pDocs.filter((d:any)=>d.status==='Approved').length} Approved, {prog.pDocs.filter((d:any)=>d.status==='Missing' || d.status==='Pending').length} Pending</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Open Action Items */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3 flex items-center justify-between">
                                <span>Open Actions</span>
                                {prog.openActions.length > 0 && <Badge variant="warning">{prog.openActions.length}</Badge>}
                              </h4>
                              {prog.openActions.length > 0 ? (
                                <ul className="space-y-2 mt-2">
                                  {prog.openActions.slice(0, 3).map((act: any) => (
                                    <li key={act.id} className="text-xs flex items-start space-x-2">
                                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${act.severity === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`} />
                                      <span className="text-gray-700 leading-snug line-clamp-2" title={act.description}>{act.description}</span>
                                    </li>
                                  ))}
                                  {prog.openActions.length > 3 && (
                                    <li className="text-xs text-gray-500 indent-6">+ {prog.openActions.length - 3} more actions</li>
                                  )}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 mt-2 italic">No open action items.</p>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
           <form onSubmit={handleEditSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Program: {editingProgram.id}</h3>
             
             <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Program Name</label>
                  <input type="text" className="w-full text-sm border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" value={editingProgram.name} onChange={e => setEditingProgram({...editingProgram, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full text-sm border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" value={editingProgram.status} onChange={e => setEditingProgram({...editingProgram, status: e.target.value})}>
                     <option value="Active">Active</option>
                     <option value="Delayed">Delayed</option>
                     <option value="At Risk">At Risk</option>
                     <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Budget Consumed (₹)</label>
                  <input type="number" className="w-full text-sm border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" value={editingProgram.budget_consumed} onChange={e => setEditingProgram({...editingProgram, budget_consumed: e.target.value})} />
                </div>
             </div>

             <div className="flex justify-end space-x-3">
               <Button variant="ghost" onClick={() => setEditingProgram(null)} type="button">Cancel</Button>
               <Button type="submit">Save Changes</Button>
             </div>
           </form>
        </div>
      )}
    </div>
  );
}

