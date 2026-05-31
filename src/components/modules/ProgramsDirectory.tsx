import React, { useState, useMemo } from 'react';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { Folder, MagnifyingGlass, Funnel, CaretDown, CaretUp, FileText, WarningCircle, PlayCircle, Sliders, Plus, Trash, CloudArrowUp } from '@phosphor-icons/react';
import { FeedbackPanel } from './FeedbackPanel';

export function ProgramsDirectory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: '',
    category: 'Academic Enrichment',
    vendor: '',
    owner_id: '',
    target_student_count: 300,
    status: 'Active',
    start_date: new Date().toISOString().substring(0, 10),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    budget_allocated: 50000,
    budget_consumed: 0,
    description: '',
    attachments: [] as any[]
  });

  const { programs, activities, documentation, actions, teachers, updateItem, insertItem, showToast } = useSupabaseContext();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    try {
      await updateItem('programs', editingProgram.id, {
         name: editingProgram.name,
         status: editingProgram.status,
         budget_consumed: parseInt(editingProgram.budget_consumed, 10),
         vendor: editingProgram.vendor,
         budget_allocated: parseInt(editingProgram.budget_allocated, 10),
         target_student_count: parseInt(editingProgram.target_student_count, 10)
      });
      setEditingProgram(null);
      showToast('Program updated successfully!', 'success');
    } catch (err: any) {
      showToast("Failed to update program: " + err.message, 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.name.trim()) {
      showToast('Program name is required', 'warning');
      return;
    }
    try {
      const generatedId = `PRG-${Math.floor(100 + Math.random() * 900)}`;
      await insertItem('programs', {
        id: generatedId,
        name: newProgram.name,
        category: newProgram.category,
        vendor: newProgram.vendor || 'Internal',
        owner_id: newProgram.owner_id || (teachers[0]?.id || 'TCH-001'),
        target_student_count: Number(newProgram.target_student_count),
        status: newProgram.status,
        start_date: newProgram.start_date,
        end_date: newProgram.end_date,
        budget_allocated: Number(newProgram.budget_allocated),
        budget_consumed: Number(newProgram.budget_consumed),
        description: newProgram.description,
        attachments: newProgram.attachments || []
      });
      setShowCreateModal(false);
      setNewProgram({
        name: '',
        category: 'Academic Enrichment',
        vendor: '',
        owner_id: '',
        target_student_count: 300,
        status: 'Active',
        start_date: new Date().toISOString().substring(0, 10),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        budget_allocated: 50000,
        budget_consumed: 0,
        description: '',
        attachments: []
      });
      showToast('Program registered successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to register program: ' + err.message, 'error');
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
          <h1 className="text-xl font-bold text-slate-900 font-sans">Program directory</h1>
          <p className="text-xs text-slate-500 mt-1">Active programs, vendors, and cost centers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search programs..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-1.5 h-9 text-xs">
            <Plus className="w-4 h-4" />
            <span>Register Initiative</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1">
          <Funnel className="w-4 h-4 text-slate-500 ml-2" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-slate-700 cursor-pointer"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1">
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-slate-700 cursor-pointer pl-3"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statuses.map((s: any) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      <Card className="border-slate-200 shadow-none bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100/80">
              <tr>
                <th className="px-6 py-2.5 font-medium text-slate-500">Program name</th>
                <th className="px-6 py-2.5 font-medium hidden md:table-cell text-slate-500">Category and vendor</th>
                <th className="px-6 py-2.5 font-medium hidden lg:table-cell text-slate-500">Owner</th>
                <th className="px-6 py-2.5 font-medium text-center text-slate-500">Progress</th>
                <th className="px-6 py-2.5 font-medium text-center text-slate-500">Status</th>
                <th className="px-6 py-2.5 font-medium text-right text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Folder className="w-8 h-8 mb-3 text-slate-300" />
                      <p>No programs found matching the filters.</p>
                      <Button variant="ghost" className="mt-2" onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); }}>Clear Filters</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog: any) => (
                  <React.Fragment key={prog.id}>
                    <tr className={`hover:bg-slate-50/50 transition-colors ${expandedId === prog.id ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{prog.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5" title="Target Students">{prog.target_student_count} Students Target</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {prog.category}
                        </div>
                        <div className="text-xs text-slate-500 mt-1.5">by {prog.vendor}</div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-slate-900">{prog.ownerName}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-xs font-medium text-slate-700" title="Activities Completed">{Math.round(prog.actComp)}% Act.</span>
                          <span className="text-xs font-medium text-slate-500" title="Documentation Approved">{Math.round(prog.docComp)}% Doc.</span>
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
                          {expandedId === prog.id ? <CaretUp className="w-4 h-4 ml-1" /> : <CaretDown className="w-4 h-4 ml-1" />}
                        </Button>
                      </td>
                    </tr>
                    {expandedId === prog.id && (
                      <tr className="bg-slate-50/25 border-b border-slate-100">
                        <td colSpan={6} className="px-0 py-0">
                          <div className="p-6 space-y-6 shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {/* Budget & Timeline */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-none bg-white">
                                <h4 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Logistics and budget</h4>
                                <div className="space-y-2 text-sm text-slate-600">
                                  <div className="flex justify-between"><span>Timeline:</span> <span className="font-medium text-slate-900">{prog.start_date} to {prog.end_date}</span></div>
                                  <div className="flex justify-between"><span>Budget Allocated:</span> <span className="font-medium text-slate-900">₹{prog.budget_allocated?.toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>Budget Consumed:</span> <span className="font-medium text-slate-900">₹{prog.budget_consumed?.toLocaleString()}</span></div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-slate-900 h-full" style={{ width: `${(prog.budget_consumed / prog.budget_allocated) * 100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Summary Metrics */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-none bg-white relative">
                                <Button 
                                  variant="ghost" 
                                  className="absolute top-2 right-2 p-1 h-auto"
                                  onClick={() => setEditingProgram({ ...prog })}
                                  title="Edit Program Details"
                                >
                                  <Sliders className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                                </Button>
                                <h4 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Activity summary</h4>
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded"><PlayCircle className="w-4 h-4" /></div>
                                    <div>
                                      <div className="text-xs text-slate-500">Activities Completed</div>
                                      <div className="text-sm font-semibold text-slate-900">{prog.pActs.filter((a:any)=>a.status==='Completed').length} / {prog.pActs.length}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-teal-50 text-teal-600 rounded"><FileText className="w-4 h-4" /></div>
                                    <div>
                                      <div className="text-xs text-slate-500">Documentation Status</div>
                                      <div className="text-sm font-semibold text-slate-900">{prog.pDocs.filter((d:any)=>d.status==='Approved').length} Approved, {prog.pDocs.filter((d:any)=>d.status==='Missing' || d.status==='Pending').length} Pending</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Open Action Items */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-none bg-white">
                                <h4 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                                  <span>Open Actions</span>
                                  {prog.openActions.length > 0 && <Badge variant="warning">{prog.openActions.length}</Badge>}
                                </h4>
                                {prog.openActions.length > 0 ? (
                                  <ul className="space-y-2 mt-2">
                                    {prog.openActions.slice(0, 3).map((act: any) => (
                                      <li key={act.id} className="text-xs flex items-start space-x-2">
                                        <WarningCircle className={`w-4 h-4 flex-shrink-0 ${act.severity === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`} />
                                        <span className="text-slate-700 leading-snug line-clamp-2" title={act.description}>{act.description}</span>
                                      </li>
                                    ))}
                                    {prog.openActions.length > 3 && (
                                      <li className="text-xs text-slate-505 indent-6">+ {prog.openActions.length - 3} more actions</li>
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-slate-500 mt-2 italic">No open action items.</p>
                                )}
                              </div>
                            </div>

                            {/* Detailed Upload & Scope Panel */}
                            <div className="border-t border-slate-150 pt-5">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Program Description Textarea */}
                                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-none bg-white space-y-3">
                                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                                      <FileText className="w-4 h-4 text-indigo-500" />
                                      <span>Program Description & Scope Guidelines</span>
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-medium">Autosaves on focus-out</span>
                                  </div>
                                  <textarea
                                    className="w-full h-32 p-3 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 text-slate-700 font-sans resize-none leading-relaxed bg-slate-50/40 hover:bg-white focus:bg-white"
                                    placeholder="Briefly state dynamic deliverables, syllabus components, key vendor points, target results, and execution scope details..."
                                    defaultValue={prog.description || ''}
                                    onBlur={async (e) => {
                                      try {
                                        await updateItem('programs', prog.id, { description: e.target.value });
                                        showToast('Program description updated successfully', 'success');
                                      } catch (err: any) {
                                        showToast('Failed to save description: ' + err.message, 'error');
                                      }
                                    }}
                                  />
                                </div>

                                {/* Custom Live Upload Centre */}
                                <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-none bg-white flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                                      <CloudArrowUp className="w-4 h-4 text-emerald-500" />
                                      <span>Program Attachments</span>
                                    </h4>

                                    <div 
                                      className="border border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-3 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/10 mb-3"
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.multiple = true;
                                        input.onchange = async (event: any) => {
                                          const files = event.target.files;
                                          if (files && files.length > 0) {
                                            const updatedAttachments = [...(prog.attachments || [])];
                                            for (let i = 0; i < files.length; i++) {
                                              const file = files[i];
                                              const sizeStr = file.size > 1024 * 1024 
                                                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                                                : `${Math.round(file.size / 1024)} KB`;
                                              updatedAttachments.push({
                                                id: Math.random().toString(36).substring(2, 9),
                                                name: file.name,
                                                size: sizeStr,
                                                uploadedAt: new Date().toLocaleDateString('en-IN', {
                                                   day: 'numeric',
                                                   month: 'short',
                                                   year: 'numeric'
                                                })
                                              });
                                            }
                                            await updateItem('programs', prog.id, { attachments: updatedAttachments });
                                            showToast(`${files.length} attachment(s) loaded successfully!`, 'success');
                                          }
                                        };
                                        input.click();
                                      }}
                                    >
                                      <CloudArrowUp className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                                      <span className="block text-[10px] font-semibold text-slate-700">Drag files or click to upload details</span>
                                      <span className="block text-[9px] text-slate-400 mt-0.5">Syllabus, budget sheet, contracts (Max 10MB)</span>
                                    </div>

                                    {prog.attachments && prog.attachments.length > 0 ? (
                                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                                        {prog.attachments.map((file: any, index: number) => (
                                          <div key={file.id || index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-700">
                                            <div className="flex items-center space-x-1.5 min-w-0 pr-2">
                                              <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                                              <span 
                                                className="truncate font-medium hover:underline cursor-pointer" 
                                                title={`${file.name} (Uploaded ${file.uploadedAt})`} 
                                                onClick={() => showToast(`Opening program document "${file.name}"...`, 'info')}
                                              >
                                                {file.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                                              <span className="text-[9px] text-slate-405">{file.size}</span>
                                              <button 
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  const updated = prog.attachments.filter((_: any, idx: number) => idx !== index);
                                                  await updateItem('programs', prog.id, { attachments: updated });
                                                  showToast('Program attachment removed.', 'warning');
                                                }}
                                                className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                                                title="Delete file"
                                              >
                                                <Trash className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-2.5 border border-dashed border-slate-200 bg-slate-50/20 rounded-lg text-slate-450 text-[10px] italic">
                                        No files attached yet.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Interactive Qualitative Feedback and Rating Panel */}
                            <div className="border-t border-slate-150 pt-5">
                              <FeedbackPanel programId={prog.id} pActs={prog.pActs} />
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
        <div className="fixed inset-0 bg-slate-900/50 flex items-end md:items-center justify-center z-50 animate-in fade-in sm:p-4">
           <form onSubmit={handleEditSubmit} className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-md p-5 md:p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95">
             <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-4">
               <div>
                 <h3 className="text-xs font-bold text-slate-900 font-sans">Edit Program Logistics</h3>
                 <p className="text-[10px] text-slate-500 mt-0.5">Modify logistics characteristics for {editingProgram.id}</p>
               </div>
               <button type="button" onClick={() => setEditingProgram(null)} className="text-slate-400 hover:text-slate-655 text-xs">✕</button>
             </div>
             
             <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Program Name</label>
                  <input type="text" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={editingProgram.name} onChange={e => setEditingProgram({...editingProgram, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor Partner</label>
                  <input type="text" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={editingProgram.vendor} onChange={e => setEditingProgram({...editingProgram, vendor: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                    <select className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={editingProgram.status} onChange={e => setEditingProgram({...editingProgram, status: e.target.value})}>
                       <option value="Active">Active</option>
                       <option value="Delayed">Delayed</option>
                       <option value="At Risk">At Risk</option>
                       <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Cohort Size</label>
                    <input type="number" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={editingProgram.target_student_count} onChange={e => setEditingProgram({...editingProgram, target_student_count: parseInt(e.target.value, 10) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Budget Allocated (₹)</label>
                    <input type="number" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={editingProgram.budget_allocated} onChange={e => setEditingProgram({...editingProgram, budget_allocated: parseInt(e.target.value, 10) || 0})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Budget Consumed (₹)</label>
                    <input type="number" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={editingProgram.budget_consumed} onChange={e => setEditingProgram({...editingProgram, budget_consumed: parseInt(e.target.value, 10) || 0})} />
                  </div>
                </div>
             </div>

             <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
               <Button variant="ghost" className="text-xs py-1 px-3 h-8" onClick={() => setEditingProgram(null)} type="button">Cancel</Button>
               <Button type="submit" className="text-xs py-1 px-3 h-8">Save Changes</Button>
             </div>
           </form>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-end md:items-center justify-center z-50 animate-in fade-in sm:p-4">
           <form onSubmit={handleCreateSubmit} className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-lg p-5 md:p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95">
             <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
               <div>
                 <h3 className="text-sm font-bold text-slate-900 font-sans">Register New Initiative</h3>
                 <p className="text-[10px] text-slate-505 mt-0.5">Establish a new program, outline logistics, and upload specifications</p>
               </div>
               <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-655 text-xs">✕</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Program Name</label>
                  <input required placeholder="e.g. Science Circle / Robotics Bootcamp" type="text" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.name} onChange={e => setNewProgram({...newProgram, name: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.category} onChange={e => setNewProgram({...newProgram, category: e.target.value})}>
                     <option value="Academic Enrichment">Academic Enrichment</option>
                     <option value="STEM / Robotics / AI">STEM / Robotics / AI</option>
                     <option value="Life Skills">Life Skills</option>
                     <option value="Teacher Orientation">Teacher Orientation</option>
                     <option value="Events / Competitions">Events / Competitions</option>
                     <option value="Vocational training">Vocational training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor Partner</label>
                  <input placeholder="e.g. Internal / Creya / Mindler" type="text" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.vendor} onChange={e => setNewProgram({...newProgram, vendor: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Executive Owner</label>
                  <select className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.owner_id} onChange={e => setNewProgram({...newProgram, owner_id: e.target.value})}>
                     <option value="">Select owner...</option>
                     {teachers.map((t: any) => (
                       <option key={t.id} value={t.id}>{t.name} ({t.role || 'Teacher'})</option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Cohort (Students)</label>
                  <input type="number" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.target_student_count} onChange={e => setNewProgram({...newProgram, target_student_count: parseInt(e.target.value, 10) || 0})} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Allocated Budget (₹)</label>
                  <input type="number" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.budget_allocated} onChange={e => setNewProgram({...newProgram, budget_allocated: parseInt(e.target.value, 10) || 0})} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Consumed Budget (₹)</label>
                  <input type="number" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.budget_consumed} onChange={e => setNewProgram({...newProgram, budget_consumed: parseInt(e.target.value, 10) || 0})} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Date</label>
                  <input type="date" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.start_date} onChange={e => setNewProgram({...newProgram, start_date: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Date</label>
                  <input type="date" className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white" value={newProgram.end_date} onChange={e => setNewProgram({...newProgram, end_date: e.target.value})} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Initial Description / Objectives</label>
                  <textarea placeholder="e.g. detailed benchmarks, target deliverables, or vendor outline details..." className="w-full h-20 text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 resize-none font-sans bg-slate-50/50 focus:bg-white" value={newProgram.description} onChange={e => setNewProgram({...newProgram, description: e.target.value})} />
                </div>
             </div>

             <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
               <Button variant="ghost" className="text-xs py-1 px-3 h-8" onClick={() => setShowCreateModal(false)} type="button">Cancel</Button>
               <Button type="submit" className="text-xs py-1 px-3 h-8">Register Initiative</Button>
             </div>
           </form>
        </div>
      )}
    </div>
  );
}

