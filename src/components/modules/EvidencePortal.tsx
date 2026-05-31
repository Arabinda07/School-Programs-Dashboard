import React, { useState, useMemo, useRef } from 'react';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { FileText, MagnifyingGlass, Funnel, WarningCircle, Clock, CheckCircle, Trash } from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';

export function EvidencePortal() {
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [uploadDocId, setUploadDocId] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { documentation, programs, activities, updateItem, user, useFallback, showToast } = useSupabaseContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocId) return;
    if (!file && !useFallback) {
      showToast("Please select a file to upload.", 'error');
      return;
    }
    
    setUploading(true);
    try {
      let filePath = null;

      if (!useFallback && file && user) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uploadDocId}.${fileExt}`;
        filePath = `${user.id}/documentation/${uploadDocId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('app-files')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;
      }

      const updates: any = {
         status: 'Pending',
         uploaded_date: new Date().toISOString().split('T')[0]
      };
      if (filePath) {
         updates.file_path = filePath;
      }

      await updateItem('documentation', uploadDocId, updates);
      setUploadDocId(null);
      setFile(null);
      showToast('Evidence uploaded successfully and queued for review.', 'success');
    } catch (err: any) {
      showToast("Failed to upload: " + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (doc: any) => {
    if (!doc.file_path) {
      showToast("No file path found for this document! Local mockup only.", 'warning');
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from('app-files')
        .createSignedUrl(doc.file_path, 60 * 60); // 1 hour access

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      showToast("Failed to open file: " + err.message, 'error');
    }
  };

  const handleDelete = async (doc: any) => {
    if (!confirm("Are you sure you want to delete this evidence?")) return;
    try {
      if (doc.file_path && !useFallback) {
        const { error: removeError } = await supabase.storage
          .from('app-files')
          .remove([doc.file_path]);
        if (removeError) {
           console.warn("Storage removal warning:", removeError);
        }
      }
      
      await updateItem('documentation', doc.id, {
        status: 'Missing',
        uploaded_date: null,
        file_path: null
      });
      showToast('Evidence removed.', 'info');
    } catch (err: any) {
      showToast("Failed to delete: " + err.message, 'error');
    }
  };

  const enrichedDocs = useMemo(() => {
    return documentation.map((doc: any) => {
      const prog = programs.find((p: any) => p.id === doc.program_id);
      const act = activities.find((a: any) => a.id === doc.activity_id);
      
      return {
        ...doc,
        programName: prog ? prog.name : 'Unknown Program',
        activityName: act ? act.topic : null,
      };
    }).sort((a: any, b: any) => {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [documentation, programs, activities]);

  const filteredDocs = useMemo(() => {
    return enrichedDocs.filter((doc: any) => {
      const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                          doc.programName.toLowerCase().includes(search.toLowerCase());
                          
      const matchProgram = programFilter === 'All' || doc.program_id === programFilter;
      const matchStatus = statusFilter === 'All' || doc.status === statusFilter;
      const matchType = typeFilter === 'All' || doc.type === typeFilter;
      
      return matchSearch && matchProgram && matchStatus && matchType;
    });
  }, [enrichedDocs, search, programFilter, statusFilter, typeFilter]);

  // KPIs
  const totalRequired = enrichedDocs.length;
  const missingCount = enrichedDocs.filter((d: any) => d.status === 'Missing').length;
  const pendingCount = enrichedDocs.filter((d: any) => d.status === 'Pending').length;
  const approvedCount = enrichedDocs.filter((d: any) => d.status === 'Approved').length;
  const uploadedCount = enrichedDocs.filter((d: any) => d.uploaded_date).length;
  const completionPercent = totalRequired > 0 ? (approvedCount / totalRequired) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Pending': return <Badge variant="warning">Pending Review</Badge>;
      case 'Missing': return <Badge variant="danger">Missing</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const programsList = ['All', ...Array.from(new Set(programs.map((p: any) => p.id)))];
  const typesList = ['All', ...Array.from(new Set(documentation.map((d: any) => d.type)))];
  const statusesList = ['All', ...Array.from(new Set(documentation.map((d: any) => d.status)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 font-sans">Document verification</h1>
          <p className="text-sm text-slate-500 mt-1 font-light">Audit logs, compliance files, and program evidence uploads.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 shadow-none bg-white">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg"><FileText className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">Required</p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{totalRequired}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none bg-white">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">Uploaded</p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{uploadedCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none bg-white">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">Approved</p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{Math.round(completionPercent)}%</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none bg-white">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">Pending</p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{pendingCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none bg-white">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg"><FileText className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">Missing</p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{missingCount}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text"
            placeholder="Search documents..."
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
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-slate-700 cursor-pointer"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {typesList.map((t: any) => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1">
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-slate-700 cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusesList.map((s: any) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      <Card className="border-slate-200 shadow-none bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100/80">
              <tr>
                <th className="px-6 py-2.5 font-medium text-slate-500">Document title</th>
                <th className="px-6 py-2.5 font-medium hidden md:table-cell text-slate-500">Context</th>
                <th className="px-6 py-2.5 font-medium text-center text-slate-500">Type</th>
                <th className="px-6 py-2.5 font-medium text-center text-slate-500">Due and uploaded</th>
                <th className="px-6 py-2.5 font-medium text-center text-slate-500">Status</th>
                <th className="px-6 py-2.5 font-medium text-right text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                     <FileText className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                     <p>No documents found matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc: any) => {
                  const isMissing = doc.status === 'Missing';
                  const isPending = doc.status === 'Pending';
                  
                  return (
                    <tr key={doc.id} className={`hover:bg-slate-50/50 transition-colors ${isMissing ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{doc.title}</div>
                        <div className="text-xs text-slate-500 mt-1">ID: {doc.id}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-slate-900">{doc.programName}</div>
                        {doc.activityName && <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={doc.activityName}>Act: {doc.activityName}</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium tracking-wide">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-xs text-slate-900">Due: {doc.due_date}</div>
                        {doc.uploaded_date ? (
                          <div className="text-xs text-emerald-600 mt-1">Up: {doc.uploaded_date}</div>
                        ) : (
                          <div className="text-xs text-rose-500 mt-1">Not Uploaded</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(isMissing || isPending || doc.status === 'Rejected') ? (
                          <div className="flex items-center justify-end space-x-2">
                             {(doc.file_path || useFallback) && !isMissing && (
                               <Button variant="ghost" onClick={() => handleView(doc)} className="text-xs px-2 py-1 h-auto text-indigo-600 hover:text-indigo-800 focus:ring-0">View</Button>
                             )}
                             {isPending && (
                               <>
                                 <Button 
                                   variant="outline" 
                                   onClick={async () => {
                                     try {
                                       await updateItem('documentation', doc.id, { status: 'Approved' });
                                       showToast('Evidence approved successfully.', 'success');
                                     } catch (err: any) {
                                       showToast('Failed to approve evidence: ' + err.message, 'error');
                                     }
                                   }} 
                                   className="text-xs px-2.5 py-1 h-auto text-emerald-600 border-emerald-200 hover:bg-emerald-50/70 hover:text-emerald-700"
                                 >
                                   Approve
                                 </Button>
                                 <Button 
                                   variant="outline" 
                                   onClick={async () => {
                                     try {
                                       await updateItem('documentation', doc.id, { status: 'Rejected' });
                                       showToast('Evidence rejected.', 'warning');
                                     } catch (err: any) {
                                       showToast('Failed to reject evidence: ' + err.message, 'error');
                                     }
                                   }} 
                                   className="text-xs px-2.5 py-1 h-auto text-rose-600 border-rose-200 hover:bg-rose-50/70 hover:text-rose-700"
                                 >
                                   Reject
                                 </Button>
                               </>
                             )}
                             <Button onClick={() => setUploadDocId(doc.id)} variant="outline" className="text-xs px-2 py-1 h-auto">
                               {(doc.file_path || useFallback) && !isMissing ? 'Replace' : 'Upload'}
                             </Button>
                             {(doc.file_path || useFallback) && !isMissing && (
                               <Button variant="ghost" onClick={() => handleDelete(doc)} className="text-xs px-2 py-1 h-auto text-rose-600 hover:text-rose-800 hover:bg-rose-50 focus:ring-0"><Trash className="w-4 h-4"/></Button>
                             )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                             <Button variant="ghost" onClick={() => handleView(doc)} className="text-xs px-2 py-1 h-auto text-indigo-600 hover:text-indigo-800 focus:ring-0">View</Button>
                             <Button variant="outline" onClick={async () => {
                               try {
                                 await updateItem('documentation', doc.id, { status: 'Pending' });
                                 showToast('Evidence status set back to Pending Review.', 'info');
                               } catch (err: any) {
                                 showToast('Failed to transition evidence status: ' + err.message, 'error');
                               }
                             }} className="text-xs px-2 py-1 h-auto text-slate-500 border-slate-200 hover:bg-slate-50">
                               Revert to Pending
                             </Button>
                             <Button variant="ghost" onClick={() => handleDelete(doc)} className="text-xs px-2 py-1 h-auto text-rose-600 hover:text-rose-800 hover:bg-rose-50 focus:ring-0"><Trash className="w-4 h-4"/></Button>
                          </div>
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
      
      {uploadDocId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-end md:items-center justify-center z-50 animate-in fade-in sm:p-4">
           <form onSubmit={handleUploadSubmit} className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-md p-5 md:p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95">
             <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Evidence</h3>
             <p className="text-sm text-slate-500 mb-4">Please upload a valid PDF or image file.</p>
             
             <div 
               className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50 mb-4 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-colors"
               onClick={() => fileInputRef.current?.click()}
             >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <FileText className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                <p className="text-sm font-medium text-slate-700">
                   {file ? file.name : "Click to browse or drag file here"}
                </p>
                {file && <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
             </div>

             <div className="flex justify-end space-x-3">
               <Button variant="ghost" disabled={uploading} onClick={() => {
                 setUploadDocId(null);
                 setFile(null);
               }} type="button">Cancel</Button>
               <Button type="submit" disabled={uploading}>
                 {uploading ? 'Processing...' : 'Submit Evidence'}
               </Button>
             </div>
           </form>
        </div>
      )}

    </div>
  );
}
