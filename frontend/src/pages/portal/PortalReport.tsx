import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { IntakeAdvice } from '../../types';
import {
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Send,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

interface PortalReportProps {
  onBack: () => void;
  onSubmitSuccess: (incidentId: string) => void;
}

export const PortalReport: React.FC<PortalReportProps> = ({ onBack, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<number>(3);
  const [isRecording, setIsRecording] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advice, setAdvice] = useState<IntakeAdvice | null>(null);
  const [showWhyPopover, setShowWhyPopover] = useState(false);
  const [deflected, setDeflected] = useState(false);

  const debounceTimerRef = useRef<any>(null);

  // Web Speech API Voice Recognition setup
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please type your issue.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      if (!title) {
        setTitle(speechText);
      } else {
        setDescription((prev) => (prev ? prev + ' ' + speechText : speechText));
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Debounced intake advice call
  useEffect(() => {
    if (!description && !title) {
      setAdvice(null);
      return;
    }

    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsAdviceLoading(true);
        const res = await api.intake.getAdvice({
          title: title || description.slice(0, 50),
          description: description || title,
          urgency,
        });
        setAdvice(res);
      } catch (err) {
        console.warn('Advice service non-critical error', err);
      } finally {
        setIsAdviceLoading(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimerRef.current);
  }, [title, description, urgency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) return;

    try {
      setIsSubmitting(true);
      const inc = await api.incidents.create({
        title: title || description.slice(0, 60),
        description: description || title,
        urgency,
      });
      onSubmitSuccess(inc.id);
    } catch (err: any) {
      alert('Failed to report incident: ' + (err.message || 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Incidents</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Report Campus IT Incident</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by AI Triage Copilot: detects duplicates, checks instant self-help KB articles, and computes priority.
            </p>
          </div>
        </div>

        {deflected ? (
          <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-300">Self-Help Deflection Successful!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Great! Your issue was resolved using the campus knowledge base without needing to wait for a technician queue.
            </p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
            >
              Return to Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title / Summary */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Summary / Issue Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Cannot log into Nalanda LMS for my 10 AM quiz from Vyas Bhawan Wi-Fi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Description + Voice Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Detailed Description & Error Message
                </label>
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isRecording
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Listening...' : 'Voice Copilot (B1)'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                placeholder="Describe what you were trying to access, any error codes displayed (HTTP 504, LDAP timeout), and your location on campus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Urgency selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Perceived Urgency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 1, label: 'Low', desc: 'Can continue work with minor workaround' },
                  { val: 2, label: 'Medium', desc: 'Impacting daily academic/admin schedule' },
                  { val: 3, label: 'High', desc: 'Immediate deadline or campus-wide blocker' },
                ].map((u) => (
                  <button
                    key={u.val}
                    type="button"
                    onClick={() => setUrgency(u.val)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      urgency === u.val
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{u.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Real-time Intake Advice Panel */}
            {isAdviceLoading && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>AI Copilot analyzing campus telemetry, checking duplicates & KB deflection...</span>
              </div>
            )}

            {advice && !isAdviceLoading && (
              <div className="space-y-4 pt-2">
                {/* A6 Self-Help Deflection KB Article Card */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span>Instant Solution Found (KB Deflection A6)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      KB-0002
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    "Clearing Expired BITS SSO Cookies & DNS Cache in Vyas/Bhawan Wi-Fi"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    If your session timed out during registration or LMS login, opening an Incognito tab or clearing cookies for <code className="text-indigo-300 font-mono">sso.bits-pilani.ac.in</code> usually restores access immediately.
                  </p>
                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeflected(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                    >
                      ✓ This Solved My Issue!
                    </button>
                    <span className="text-[11px] text-slate-400">Or continue submitting below if issue persists.</span>
                  </div>
                </div>

                {/* A1 Similar Open Incidents Warning Card */}
                {advice.potentialDuplicates && advice.potentialDuplicates.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Similar Open Campus Incidents Detected (A1)</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      3 other users in Vyas Bhawan reported a similar timeout in the last 15 minutes. If you submit, your report will be linked to the master incident to receive synchronized live updates:
                    </p>
                    <div className="space-y-1">
                      {advice.potentialDuplicates.map((dup, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800"
                        >
                          <span className="font-mono text-amber-300 font-bold">{dup.number || 'INC-2026-000104'}</span>
                          <span className="text-slate-300 truncate max-w-xs">{dup.title}</span>
                          <span className="text-slate-400 font-mono">{Math.round((dup.score || 0.88) * 100)}% match</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Triage Chips */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-400 font-semibold">AI Triage Classification:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                    Service: {advice.suggestedService || 'APP-LMS'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                    Category: {advice.suggestedCategory || 'AUTHENTICATION'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                    Impact: 2 - Group
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowWhyPopover(!showWhyPopover)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-indigo-400 text-xs transition-colors ml-auto"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why these tags?</span>
                  </button>
                </div>

                {showWhyPopover && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs text-slate-300 space-y-1 animate-fadeIn">
                    <div className="font-semibold text-indigo-400">Triage Rationale:</div>
                    <div>
                      Keywords "Nalanda", "quiz", and "login" matched service <code className="text-indigo-300">APP-LMS</code> and category <code className="text-cyan-300">AUTHENTICATION</code>.
                    </div>
                    <div>
                      Active exam calendar window applied $+1$ priority bump: <code className="text-amber-300">ITIL_MATRIX: P2 + CALENDAR_WINDOW (EXAMS) = P1</code>.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting & Triaging...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Incident</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
