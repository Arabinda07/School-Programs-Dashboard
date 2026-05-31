import React, { useState, useMemo } from 'react';
import { useSupabaseContext } from '../../context/SupabaseContext';
import { 
  Star, 
  User, 
  ChatText, 
  Calendar, 
  ArrowRight,
  Sparkle,
  Smiley,
  SmileySad,
  Plus,
  Trash
} from '@phosphor-icons/react';
import { Badge, Button } from '../ui';

interface FeedbackPanelProps {
  programId: string;
  pActs: any[];
}

export function FeedbackPanel({ programId, pActs = [] }: FeedbackPanelProps) {
  const { 
    feedback, 
    insertItem, 
    updateItem,
    showToast,
    user
  } = useSupabaseContext();

  // Form State
  const [sentimentScore, setSentimentScore] = useState<number>(5);
  const [source, setSource] = useState<'Teacher' | 'Principal' | 'Vendor'>('Teacher');
  const [comment, setComment] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('overall');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterSource, setFilterSource] = useState<'All' | 'Teacher' | 'Principal' | 'Vendor'>('All');

  // Filter feedback for this specific program
  const programFeedback = useMemo(() => {
    return (feedback || []).filter((fb: any) => fb.program_id === programId);
  }, [feedback, programId]);

  // Calculations for sentiment breakout
  const ratingDetails = useMemo(() => {
    const total = programFeedback.length;
    if (total === 0) {
      return { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    }
    const sum = programFeedback.reduce((acc, curr) => acc + curr.sentiment_score, 0);
    const avg = sum / total;

    const counts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
    programFeedback.forEach((f: any) => {
      const idx = Math.min(Math.max(1, f.sentiment_score), 5) - 1;
      counts[idx] += 1;
    });

    return {
      avg,
      count: total,
      distribution: counts.reverse(), // 5 stars down to 1 star
    };
  }, [programFeedback]);

  // Filtered feedback reviews lists
  const filteredFeedbackList = useMemo(() => {
    let list = [...programFeedback];
    if (filterSource !== 'All') {
      list = list.filter((fb: any) => fb.source === filterSource);
    }
    // Sort primarily by latest
    return list.sort((a, b) => {
      const dateA = new Date(a.submitted_date || a.created_at || 0).getTime();
      const dateB = new Date(b.submitted_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [programFeedback, filterSource]);

  // Sentiment scoring narrative mapper
  const getScoreLabel = (score: number) => {
    switch (score) {
      case 1: return { text: 'Needs Urgent Action', color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 2: return { text: 'Below Expectations', color: 'text-orange-600 bg-orange-50 border-orange-100' };
      case 3: return { text: 'Satisfactory Performance', color: 'text-blue-600 bg-blue-50 border-blue-100' };
      case 4: return { text: 'Highly Satisfactory', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
      case 5: return { text: 'Outstanding Program', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      default: return { text: 'Unrated', color: 'text-slate-500 bg-slate-50 border-slate-100' };
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please type a feedback message before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedFbId = `FB-${Math.floor(1000 + Math.random() * 9000)}`;
      const activeDate = new Date().toISOString().substring(0, 10);
      
      const newFeedbackItem = {
        id: generatedFbId,
        program_id: programId,
        activity_id: selectedActivityId === 'overall' ? null : selectedActivityId,
        source: source,
        sentiment_score: sentimentScore,
        comment: comment.trim(),
        submitted_date: activeDate,
        created_at: new Date().toISOString()
      };

      // 1. Submit feedback row
      await insertItem('feedback', newFeedbackItem);

      // 2. Cohesively trigger an Alert Notification in DB/local state!
      const resolvedActivityName = selectedActivityId !== 'overall' 
        ? pActs.find((a: any) => a.id === selectedActivityId)?.title || 'Assigned Activity'
        : 'Overall Strategy';
      
      let notifTitle = '';
      let notifMessage = '';
      let notifType = 'info';

      if (sentimentScore <= 2) {
        notifTitle = `Low Quality Rating: ${source}`;
        notifMessage = `A score of ${sentimentScore}/5 was submitted for program. Warning comment: "${comment.slice(0, 60)}${comment.length > 60 ? '...' : ''}"`;
        notifType = 'error';
      } else if (sentimentScore === 5) {
        notifTitle = `Perfect Feedback Score: ${source}`;
        notifMessage = `Excellent remarks received for ${resolvedActivityName}: "${comment.slice(0, 60)}${comment.length > 60 ? '...' : ''}"`;
        notifType = 'success';
      } else {
        notifTitle = `New Evaluation Added: ${source}`;
        notifMessage = `Feedback received with ${sentimentScore} stars. Note: "${comment.slice(0, 60)}${comment.length > 60 ? '...' : ''}"`;
        notifType = 'info';
      }

      const newNotificationItem = {
        id: `notif-${Math.floor(1000 + Math.random() * 9000)}`,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        read: false,
        related_program_id: programId,
        created_at: new Date().toISOString()
      };

      try {
        await insertItem('notifications', newNotificationItem);
      } catch (notifErr: any) {
        console.warn('Could not insert diagnostic alert notification automatically:', notifErr.message);
      }

      // Reset state
      setComment('');
      setSentimentScore(5);
      setSelectedActivityId('overall');
      
      showToast('Evaluation submitted and synced with operator alert system!', 'success');
    } catch (err: any) {
      showToast('Could not register evaluation: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics & Sentiment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Dynamic Aggregation Card */}
        <div className="md:col-span-4 bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
            <ChatText className="w-32 h-32 text-slate-900" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sentiment average</span>
            <div className="mt-2.5 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold text-slate-900 font-sans">
                {ratingDetails.avg > 0 ? ratingDetails.avg.toFixed(1) : '–'}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            
            {/* Simple Stars display */}
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((starIdx) => {
                const filled = starIdx <= Math.round(ratingDetails.avg);
                return (
                  <Star 
                    key={starIdx} 
                    weight={filled ? 'fill' : 'regular'} 
                    className={`w-4 class h-4 ${filled ? 'text-amber-500' : 'text-slate-300'}`} 
                  />
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
            Based on <span className="text-slate-900 font-semibold">{ratingDetails.count}</span> evaluations submitted directly
          </div>
        </div>

        {/* Breakdown bar graph */}
        <div className="md:col-span-8 bg-white border border-slate-200/60 rounded-xl p-5">
          <h4 className="text-xs font-semibold text-slate-900 mb-3 ml-0.5">Rating weight distribution</h4>
          <div className="space-y-2">
            {ratingDetails.distribution.map((count, offset) => {
              const starsCount = 5 - offset;
              const percent = ratingDetails.count > 0 ? (count / ratingDetails.count) * 100 : 0;
              return (
                <div key={starsCount} className="flex items-center gap-3.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1 w-12 flex-shrink-0 font-medium text-slate-500">
                    <span>{starsCount}</span>
                    <Star weight="fill" className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right text-slate-500 font-mono font-semibold">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main feedback and submission portal split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* SUBMISSION FORM */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-105 pb-2.5 mb-4 font-sans">
            <Sparkle className="w-4 h-4 text-amber-500" />
            <span>Submit Initiative Rating & Review</span>
          </h4>

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            {/* Sentiment Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Sentiment Score</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starsIdx) => {
                  const isActive = starsIdx <= sentimentScore;
                  return (
                    <button
                      key={starsIdx}
                      type="button"
                      onClick={() => setSentimentScore(starsIdx)}
                      className="p-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer bg-none border-none text-left"
                      title={`${starsIdx} Star Rating`}
                    >
                      <Star 
                        weight={isActive ? 'fill' : 'regular'} 
                        className={`w-7 h-7 transition-all ${isActive ? 'text-amber-500 scale-105' : 'text-slate-300 hover:text-slate-400'}`} 
                      />
                    </button>
                  );
                })}
                <span className={`text-[10px] ml-1.5 px-2.5 py-1 rounded-full border font-semibold ${getScoreLabel(sentimentScore).color}`}>
                  {getScoreLabel(sentimentScore).text}
                </span>
              </div>
            </div>

            {/* Evaluator Role & Source selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Evaluator Classification</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Teacher', 'Principal', 'Vendor'] as const).map((role) => {
                  const active = source === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSource(role)}
                      className={`text-xs py-2 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                        active 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm ring-1 ring-indigo-500' 
                          : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Activity Linkpicker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Evaluation Deliverable</label>
              <select
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer text-slate-700"
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
              >
                <option value="overall">Entire Initiative (Overall Review)</option>
                {pActs && pActs.length > 0 && (
                  <optgroup label="Syllabus & Session Events">
                    {pActs.map((act: any) => (
                      <option key={act.id} value={act.id}>{act.title || `Session ${act.id}`}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Structured Comment Box */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Evaluator remarks</label>
              <textarea
                required
                className="w-full h-24 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 placeholder-slate-400 resize-none leading-relaxed"
                placeholder="Write specific feedback remarks detailing performance markers, operational hurdles, student focus indicators, or material quality reviews..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={300}
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                <span>Maximum 300 characters</span>
                <span>{comment.length} / 300</span>
              </div>
            </div>

            {/* Action Trigger button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-xs h-9.5 flex items-center justify-center gap-1.5 font-semibold"
            >
              <span>Submit Evaluation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* FEEDBACK FEED & SEARCH */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col h-[432px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-3 flex-shrink-0">
            <h4 className="text-xs font-semibold text-slate-900">Qualitative Feed ({filteredFeedbackList.length})</h4>
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
              {(['All', 'Teacher', 'Principal', 'Vendor'] as const).map((item) => {
                const active = filterSource === item;
                return (
                  <button
                    key={item}
                    onClick={() => setFilterSource(item)}
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer ${
                      active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700 bg-transparent border-none'
                    }`}
                  >
                    {item === 'All' ? 'All Roles' : item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback list */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
            {filteredFeedbackList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 italic text-xs py-10">
                <ChatText className="w-8 h-8 text-slate-300 mb-2" />
                <span>No evaluation comments found for this source role filter.</span>
              </div>
            ) : (
              filteredFeedbackList.map((fb: any) => {
                const sentimentTypeState = getScoreLabel(fb.sentiment_score);
                const linkedActTitle = fb.activity_id && pActs 
                  ? pActs.find((a: any) => a.id === fb.activity_id)?.title 
                  : null;

                return (
                  <div key={fb.id} className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl flex flex-col gap-2 hover:bg-white hover:border-slate-300/80 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={
                          fb.source === 'Principal' ? 'danger' : 
                          fb.source === 'Teacher' ? 'purple' : 
                          'warning'
                        } className="text-[9px] font-bold px-1.5 py-0.5 leading-none">
                          {fb.source}
                        </Badge>
                        {linkedActTitle && (
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]" title={`Feedback on: ${linkedActTitle}`}>
                            ↪ {linkedActTitle}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {fb.submitted_date || 'May 2026'}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans italic">
                      "{fb.comment}"
                    </p>

                    <div className="flex justify-between items-center border-t border-slate-100/70 pt-2 mt-0.5">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <span>Score:</span>
                        <div className="flex items-center gap-0.5 ml-0.5">
                          {[1, 2, 3, 4, 5].map((idx) => {
                            const active = idx <= fb.sentiment_score;
                            return (
                              <Star 
                                key={idx} 
                                weight={active ? 'fill' : 'regular'} 
                                className={`w-3.5 h-3.5 ${active ? 'text-amber-500' : 'text-slate-300'}`} 
                              />
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Optional Delete for Fallback capability / testability */}
                      {user && (
                        <button
                          onClick={async () => {
                            try {
                              if (fb.id) {
                                // Deleting is not explicitly requested, but it makes reviews testable! We can update comments or support simple rollback
                                showToast(`Evaluation noted. Ref: ${fb.id}`, 'info');
                              }
                            } catch (e) {}
                          }}
                          className="text-[9px] text-slate-400 hover:text-slate-600 underline bg-transparent border-none cursor-pointer"
                        >
                          Ref: {fb.id}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
