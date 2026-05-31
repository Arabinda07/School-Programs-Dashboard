import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';
import { 
  Sparkle,
  PaperPlane, 
  Target, 
  HourglassHigh, 
  WarningCircle, 
  ShieldCheck, 
  Copy, 
  Check, 
  BookmarkSimple,
  DotsThreeCircle,
  Clock,
  CircleNotch,
  ListBullets,
  ArrowClockwise
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';

interface AIAdvisorProps {
  data: {
    programs: any[];
    activities: any[];
    assessments: any[];
    actions: any[];
    feedback: any[];
    documentation: any[];
    classes: any[];
    teachers: any[];
    showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  };
}

export function AIAdvisor({ data }: AIAdvisorProps) {
  const { programs, activities, assessments, actions, feedback, documentation, showToast } = data;
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick statistics to pass to prompts
  const activeProgramsList = useMemo(() => programs.filter(p => p.status !== 'Closed'), [programs]);
  const delayedSessionsCount = useMemo(() => activities.filter(a => a.status === 'Delayed').length, [activities]);
  const highSeverityActionsCount = useMemo(() => actions.filter(ac => ac.severity === 'Critical' && ac.status !== 'Resolved').length, [actions]);
  const missingDocsCount = useMemo(() => documentation.filter(doc => doc.status === 'Missing').length, [documentation]);

  // Formulate absolute context regarding Sunrise Public School for high-fidelity responses
  const getContextJSONSerialized = () => {
    return JSON.stringify({
      school_metadata: {
        school_name: "Sunrise Public School, West Bengal",
        academic_year: "2025-26",
        current_date: "2026-05-23",
        unique_student_capacity: 600
      },
      programs_summary: programs.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        vendor: p.vendor,
        school_owner: p.schoolOwner,
        target_students: p.targetStudents,
        completed_students: p.completedStudents,
        budget_allocated: p.budgetAllocated,
        budget_consumed: p.budgetUsed,
        status: p.status
      })),
      activities_summary: activities.map(a => ({
        program_id: a.programId,
        topic: a.topic,
        target_class: a.targetClass,
        target_date: a.targetDate,
        actual_date: a.actualDate || "N/A",
        status: a.status,
        attendance_percent: a.attendancePercent,
        facilitator: a.facilitator
      })),
      assessments_summary: assessments.map(as => ({
        id: as.id,
        name: as.name,
        subject: as.subject,
        grade_levels: as.gradeLevels,
        conducted_date: as.conductedDate,
        average_marks: as.averageMarks,
        participation_rate: as.participationRate,
        bands: as.competencyBands
      })),
      action_items_summary: actions.map(act => ({
        id: act.id,
        description: act.description,
        owner: act.owner,
        due_date: act.dueDate,
        severity: act.severity,
        status: act.status
      })),
      feedback_summary: feedback.map(fb => ({
        program_id: fb.programId,
        source: fb.source,
        sentiment: fb.sentiment_score,
        comment: fb.comment,
        date: fb.submitted_date
      })),
      documentation_summary: documentation.map(d => ({
        id: d.id,
        program_id: d.programId,
        title: d.title,
        status: d.status,
        type: d.type
      }))
    });
  };

  const executeAdvisoryCall = async (promptText: string, presetName: string | null = null) => {
    setLoading(true);
    setActivePreset(presetName);
    setResponse(null);

    const contextData = getContextJSONSerialized();
    const systemInstruction = 
      "You are a stellar School Program Executive Advisor and AI Co-pilot for Sunrise Public School in West Bengal. " +
      "Use only the provided actual JSON data to formulate your insights. Do not invent any new programs or student personal data, " +
      "and do not use generic AI templates. Highlight real indicators (e.g. specific program IDs, names, teachers, diagnostic names, delayed counts) " +
      "present in the school's context. Always layout your answers in clean logical sections using typography suitable for a printable PDF " +
      "report to the School Principal.";

    const finalizedPrompt = 
      `### GIVEN SCHOOL RECORDS (CONTEXT):
      ${contextData}
      
      ### OBJECTIVE:
      ${promptText}
      
      ### REPORT FORMAT INSTRUCTIONS:
      - Start with a clear Title representing the audit report.
      - Add a short Executive Summary (2-3 sentences) detailing the health score.
      - Use bullet lists to separate findings.
      - Highlight specific named teachers, program targets, or class section designations in your text.
      - Put severe risks or failures under an 'Immediate Operational Risks' section.
      - Provide a concrete, step-by-step 'Corrective Action Plan' pointing out who (Owner) needs to do what.
      - Draft an exact communication announcement or formal register warning if requested.`;

    try {
      const apiRes = await fetch("/api/gemini/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalizedPrompt,
          systemInstruction: systemInstruction
        })
      });

      if (!apiRes.ok) {
        const errorData = await apiRes.json();
        throw new Error(errorData.error || "Failed search request");
      }

      const responseJSON = await apiRes.json();
      setResponse(responseJSON.text || "No insights found.");
      showToast("AI Advice Generated Successfully!", "success");
    } catch (err: any) {
      console.error(err);
      setResponse(`⚠️ Connection Error: ${err.message || "Failed to query the Gemini Advisor engine. Please check your config key secrets."}`);
      showToast("Advisory generation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeAdvisoryCall(query, 'custom');
  };

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    showToast("Report copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Pre-baked macros targeting actual Indian K-12 operations
  const advisorPresets = [
    {
      id: 'remediation',
      title: 'Cognitive Remediation Planner',
      icon: Target,
      desc: 'Analyze competency bands (low performing subjects) & outline class coaching sessions.',
      prompt: 'Perform a comprehensive Cognitive Remediation audit on all Diagnostic Assessments. Identify which grade levels or cohorts got stranded with more than 20% remediation bands in Science/Math, map them directly to their specific vendor program, and outline a 4-week remedial class structure with target checkpoints for coordinators.',
      color: 'border-emerald-250 hover:bg-emerald-50/25 bg-white'
    },
    {
      id: 'delays',
      title: 'Session Lag Stagnation Audit',
      icon: HourglassHigh,
      desc: 'Check scheduled tasks with high delay ratios, identify bottlenecks, & draft warning memos.',
      prompt: 'Analyze high stagnation and delay issues in class Session logs. Identify all activity items that are past their target_dates but are still marked "Delayed" or "Planned", name the specific responsible facilitator, calculate the approximate term hour lag, and write a formal warning email template that the Academic Director can mail to them to enforce compliance.',
      color: 'border-amber-250 hover:bg-amber-50/25 bg-white'
    },
    {
      id: 'risks',
      title: 'Action Item Prioritizer',
      icon: WarningCircle,
      desc: 'Review high severity action tickets & formulate immediate physical alignment steps.',
      prompt: 'Review all action_items that are "Open" or "In Progress". Focus specifically on Critical items. Connect them to their corresponding programs, evaluate risk ratings based on feedback comments, and propose physical solutions (such as vendor replacement, parts sourcing, or asset relocations) stating clear deadlines and owners.',
      color: 'border-rose-250 hover:bg-rose-50/25 bg-white'
    },
    {
      id: 'compliance',
      title: 'Compliance & Document Audit',
      icon: ShieldCheck,
      desc: 'Verify missing certificates, and compose direct vendor progress reminders.',
      prompt: 'Verify all documentation and evidence. Identify programs or physical events that are missing cbse activity certificates or reports (marked "Missing" or "Pending"), evaluate vendor accountability from feedback scores, and formulate an official notice template to request immediate upload.',
      color: 'border-blue-250 hover:bg-blue-50/25 bg-white'
    }
  ];

  // Helper to visually render basic markdown nicely without needing a heavy outer library
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-5 border-b pb-1 border-slate-100 uppercase tracking-wide font-mono">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-indigo-900 mt-6 font-sans">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-bold text-indigo-950 mt-4 border-l-4 border-indigo-600 pl-3 font-sans">{line.replace('# ', '')}</h2>;
      }
      
      // Bullets
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        let content = line.trim().replace(/^[-*]\s+/, '');
        // Highlight bold text inside bullet
        content = content.replace(/\*\*(.*?)\*\*/g, '$1');
        return (
          <li key={idx} className="text-xs text-slate-700 ml-4 pl-1 list-disc mt-2 leading-relaxed">
            {line.includes('**') ? parseLineBolding(line.trim().replace(/^[-*]\s+/, '')) : content}
          </li>
        );
      }

      // Standard paragraphs
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed mt-2.5">
          {line.includes('**') ? parseLineBolding(line) : line}
        </p>
      );
    });
  };

  const parseLineBolding = (line: string) => {
    const parts = line.split(/\*\*(.*?)\*\*/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-slate-900 bg-indigo-50/50 px-1 rounded">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 font-sans flex items-center gap-2">
            <Sparkle className="w-5.5 h-5.5 text-indigo-600 animate-pulse" />
            AI Advisory & Clarification Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-light">
            Analyze live school data (Sunrise Public School) with the Gemini 3.5 GenAI co-pilot to identify academic gaps, delays, and structural risks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-150 rounded-lg px-2.5 py-1.5 font-mono shadow-sm">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Status: 100% Core Bindings</span>
        </div>
      </div>

      {/* Main Grid: Control Panel vs Report Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Preset Macros & Custom Query Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Counters Quick Badge Ribbon */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">
              {activeProgramsList.length} Active Programs
            </Badge>
            {delayedSessionsCount > 0 && (
              <Badge variant="warning">
                {delayedSessionsCount} Delays Pending
              </Badge>
            )}
            {highSeverityActionsCount > 0 && (
              <Badge variant="danger">
                {highSeverityActionsCount} Critical Risks
              </Badge>
            )}
            {missingDocsCount > 0 && (
              <Badge className="bg-purple-100 text-purple-800 border-none">
                {missingDocsCount} Missing Documents
              </Badge>
            )}
          </div>

          {/* Operational Macros Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-3">
              <div className="flex items-center gap-2">
                <ListBullets className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm">One-Click Advisory Audits</CardTitle>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Quickly construct standard CBSET reports based on dynamic database values.</p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {advisorPresets.map(preset => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => executeAdvisoryCall(preset.prompt, preset.id)}
                      disabled={loading}
                      className={`text-left p-3.5 rounded-xl border border-slate-150 transition-all shadow-sm ${preset.color} hover:border-indigo-400 focus:outline-none flex gap-3.5 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="p-2 rounded-lg bg-slate-150/50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors h-fit mt-0.5">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-indigo-900 transition-colors">{preset.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{preset.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Custom Clarification Query Form */}
          <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-white">
            <CardHeader className="pb-3.5 border-b-none">
              <CardTitle className="text-sm">Custom Operator Inquiries</CardTitle>
              <p className="text-[11px] text-slate-400">Ask the co-pilot specific questions about curriculum owners, budget utilization, or vendor performance logs.</p>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Which programs are utilizing their budget poorly and should be reviewed by the principal? Summarize the feedback sentiment for STEMpedia."
                  rows={4}
                  className="w-full text-xs rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed resize-none"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !query.trim()} 
                  className="w-full flex items-center justify-center gap-2 text-xs py-2 bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white rounded-lg transition-colors font-medium"
                >
                  <PaperPlane className="w-3.5 h-3.5" />
                  <span>Submit Advisory Query</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Styled Generated Report */}
        <div className="lg:col-span-7 h-full min-h-[580px]">
          <Card className="border-slate-200 shadow-lg h-full flex flex-col bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex items-center justify-between py-3.5 px-6">
              <div className="flex items-center gap-2.5">
                <BookmarkSimple className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800 tracking-tight font-mono">Operations Report Viewer</span>
              </div>
              
              {response && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={copyToClipboard}
                    className="py-1 px-2.5 rounded-md hover:bg-indigo-50 text-[11px] border-slate-200 text-slate-600 flex items-center gap-1.5 h-8.5 font-sans"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Copied' : 'Copy Report'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setResponse(null);
                      setActivePreset(null);
                    }}
                    className="py-1 px-2 text-[11px] hover:bg-rose-50 border-slate-200 text-slate-500 h-8.5"
                    title="Clear Report"
                  >
                    <ArrowClockwise className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 p-6 relative overflow-y-auto">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/90 z-20"
                  >
                    <CircleNotch className="w-10 h-10 text-indigo-600 animate-spin" />
                    <h3 className="font-semibold text-sm text-slate-800 mt-4 font-sans">Compiling Dynamic School Analysis...</h3>
                    <p className="text-[11px] text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                      Gemini 3.5 is currently auditing Sunrise Public School's logs, checking assessment bands, compliance scores, and formatting your strategic corrective steps.
                    </p>
                    <div className="mt-5 text-[10px] text-slate-300 font-mono italic animate-pulse">
                      Synthesizing: target_students vs competency_variance
                    </div>
                  </motion.div>
                ) : response ? (
                  <motion.div 
                    key="report"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1 font-sans pr-1"
                  >
                    {/* Header Seal/Watermark inside content print frame */}
                    <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-100">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 tracking-widest uppercase font-mono">CBSE Progressive Academic Board</span>
                        <h2 className="text-sm font-bold text-slate-900 font-sans mt-0.5">Sunrise Public School Operations Council</h2>
                      </div>
                      <Badge variant="purple">Internal Advisor Draft</Badge>
                    </div>

                    {renderFormattedText(response)}

                    {/* Official Document Disclaimer Footer */}
                    <div className="pt-8 mt-8 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono flex items-center justify-between pr-2">
                      <span>Source: SPCC Live Relational Synced Engine</span>
                      <span>Authorized Draft: academic_center_v1</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-150 rounded-xl bg-slate-50/50"
                  >
                    <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4.5 shadow-sm">
                      <Sparkle className="w-5.5 h-5.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 font-sans">Awaiting AI Operations Clarification</h3>
                    <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
                      Select one of the **One-Click Advisory Audits** from the left panel, or submit a custom inquiry. The advisor will cross-reference live tables dynamically to build clear reviews.
                    </p>
                    {/* Tiny tip line */}
                    <div className="mt-6 flex items-center gap-1.5 text-[10px] text-indigo-500/80 font-mono bg-indigo-50/45 px-2.5 py-1 rounded-full">
                      <DotsThreeCircle className="w-4 h-4 text-indigo-400" />
                      <span>Powered by Gemini 3.5 Flash & @google/genai SDK</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
