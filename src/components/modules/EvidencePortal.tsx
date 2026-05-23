import React, { useState, useMemo } from 'react';
import { EmptyState, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { initialData } from '../../data';
import { FileCheck, Search, Filter, AlertCircle, Clock, FileX, CheckCircle } from 'lucide-react';

export function EvidencePortal() {
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const { documentation, programs, activities } = initialData;

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
          <h1 className="text-2xl font-bold text-gray-900 font-display">Evidence Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Audit trail and compliance documentation</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><FileCheck className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Required</p>
              <h4 className="text-lg font-bold text-gray-900">{totalRequired}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uploaded</p>
              <h4 className="text-lg font-bold text-gray-900">{uploadedCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approved</p>
              <h4 className="text-lg font-bold text-gray-900">{Math.round(completionPercent)}%</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</p>
              <h4 className="text-lg font-bold text-gray-900">{pendingCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg"><FileX className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Missing</p>
              <h4 className="text-lg font-bold text-gray-900">{missingCount}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <Filter className="w-4 h-4 text-gray-500 ml-2" />
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
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {typesList.map((t: any) => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent py-1 pr-8 text-gray-700 cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusesList.map((s: any) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      <Card className="border-gray-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Document Title</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Context</th>
                <th className="px-6 py-4 font-medium text-center">Type</th>
                <th className="px-6 py-4 font-medium text-center">Due / Uploaded</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                     <FileCheck className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                     <p>No documents found matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc: any) => {
                  const isMissing = doc.status === 'Missing';
                  const isPending = doc.status === 'Pending';
                  
                  return (
                    <tr key={doc.id} className={`hover:bg-gray-50/50 transition-colors ${isMissing ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{doc.title}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {doc.id}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-gray-900">{doc.programName}</div>
                        {doc.activityName && <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={doc.activityName}>Act: {doc.activityName}</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium tracking-wide">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-xs text-gray-900">Due: {doc.due_date}</div>
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
                        {(isMissing || isPending) ? (
                          <Button variant="outline" className="text-xs px-2 py-1 h-auto">Upload</Button>
                        ) : (
                          <Button variant="ghost" className="text-xs px-2 py-1 h-auto">View</Button>
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
