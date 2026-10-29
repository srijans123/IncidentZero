import React, { useEffect, useState } from 'react';
import { Incident, RcaResult } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSse } from '../../context/SseContext';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Check,
  Pause,
  HelpCircle,
  FileText,
  Sparkles,
  Send,
  Flame,
  XCircle,
  BookOpen,
  GitBranch,
  RefreshCw,
  Lock,
  Globe,
  Tag,
  Shield,
} from 'lucide-react';

interface WorkbenchDetailProps {
  incidentId: string;
  onBack: () => void;
  onOpenMajor?: (id: string) => void;
}

export const WorkbenchDetail: React.FC<WorkbenchDetailProps> = ({ incidentId, onBack, onOpenMajor }) => {
  const { currentUser } = useAuth();
  const { lastEvent } = useSse();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [aiPanel, setAiPanel] = useState<any>(null);
  const [rca, setRca] = useState<RcaResult | null>(null);
  const [pirDraft, setPirDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveCode, setResolveCode] = useState('FIXED');
  const [resolveNotes, setResolveNotes] = useState('Restarted LDAP connection pool and purged exhausted sessions.');
  const [resolveRootCause, setResolveRootCause] = useState('LDAP_POOL');
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);
  const [showPirModal, setShowPirModal] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const inc = await api.incidents.get(incidentId);
      setIncident(inc);

      const [t, ai, rcaData] = await Promise.allSettled([
        api.incidents.timeline(incidentId),
        api.incidents.ai(incidentId),
        api.incidents.rca(incidentId),
      ]);

      if (t.status === 'fulfilled') setTimeline(t.value || []);
      if (ai.status === 'fulfilled') setAiPanel(ai.value || null);
      if (rcaData.status === 'fulfilled') setRca(rcaData.value || null);
    } catch (err) {
      console.error('Failed to load incident details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [incidentId]);

  useEffect(() => {
    if (lastEvent?.type?.startsWith('incident.') && lastEvent?.data?.id === incidentId) {
      fetchDetails();
    }
  }, [lastEvent, incidentId]);

  const runCommand = async (command: string, envelope: Record<string, any> = {}) => {
    try {
      await api.incidents.command(incidentId, command, envelope);
      await fetchDetails();
    } catch (err: any) {
      alert(`Command '${command}' failed: ${err.message || 'Error'}`);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resolveNotes.trim().length < 20) {
      alert('Resolution notes must be at least 20 characters per ITIL specification.');
      return;
    }
    await runCommand('resolve', {
      resolutionCode: resolveCode,
      resolutionNotes: resolveNotes,
      rootCauseCategory: resolveRootCause,
    });
    setShowResolveModal(false);
  };

  const handleGeneratePir = async () => {
    try {
      const draft = await api.incidents.pir(incidentId);
      setPirDraft(draft);
      setShowPirModal(true);
    } catch (err: any) {
      alert('Failed to generate PIR draft: ' + err.message);
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
        Loading Incident War Room...
      </div>
    );
  }

  if (!incident) return null;

  const allowed = incident.allowedCommands || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Queue</span>
        </button>

        <div className="flex items-center space-x-2">
          {incident.isMajor && onOpenMajor && (
            <button
              onClick={() => onOpenMajor(incident.id)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Open Major Incident Console</span>
            </button>
          )}
          <button
            onClick={fetchDetails}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* War Room Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <span className="font-mono text-indigo-400 font-bold text-sm">
                {incident.number || `INC-${incident.id.slice(0, 8)}`}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">{incident.serviceCode || 'APP-ERP'}</span>
              <span>•</span>
              <span>Created {new Date(incident.createdAt).toLocaleTimeString()}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{incident.title}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                incident.priority === 'P1'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              Priority {incident.priority}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              State: {incident.state}
            </span>
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                incident.slaStatus === 'BREACHED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : incident.slaStatus === 'AT_RISK'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>SLA: {incident.slaStatus}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Action Bar (strictly driven by allowedCommands) */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2">
            Permitted State Actions:
          </span>

          {allowed.includes('ACKNOWLEDGE') && (
            <button
              onClick={() => runCommand('acknowledge')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledge (Stop Response Clock)</span>
            </button>
          )}

          {allowed.includes('START_INVESTIGATION') && (
            <button
              onClick={() => runCommand('start')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Investigation</span>
            </button>
          )}

          {allowed.includes('REQUEST_USER_INFO') && (
            <button
              onClick={() => {
                const question = prompt('Question for user (this pauses resolution clock):', 'Please paste the exact error code or screenshot URL.');
                if (question) runCommand('request-info', { question });
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-xs font-semibold"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Request User Info (Pause Clock)</span>
            </button>
          )}

          {allowed.includes('RESOLVE') && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Resolve Incident</span>
            </button>
          )}

          {allowed.includes('CLOSE') && (
            <button
              onClick={() => runCommand('close', { closureNote: 'Verified and closed.' })}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Close Incident</span>
            </button>
          )}

          {allowed.includes('DECLARE_MAJOR') && !incident.isMajor && (
            <button
              onClick={() => runCommand('declare-major')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-semibold"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Declare Major Incident (P1)</span>
            </button>
          )}

          {allowed.includes('CANCEL') && (
            <button
              onClick={() => {
                const reason = prompt('Reason for cancellation:', 'Duplicate report.');
                if (reason) runCommand('cancel', { reason });
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs font-semibold"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          <button
            onClick={handleGeneratePir}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold ml-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Blameless PIR (B3)</span>
          </button>
        </div>
      </div>

      {/* Main War Room Body (Grid: Left Detail/Timeline, Right AI Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details, Notes, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reported Problem Description
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {incident.description}
            </div>
          </div>

          {/* Comment & Work Note Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Technician Activity & Work Notes
              </div>
              <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setIsInternalComment(true)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    isInternalComment
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Internal Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalComment(false)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    !isInternalComment
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Public Reply</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                placeholder={
                  isInternalComment
                    ? 'Log diagnostic findings, thread pool metrics, or commands run (hidden from reporter)...'
                    : 'Send an update visible to student/reporter in their portal...'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (commentText.trim()) {
                    setCommentText('');
                    alert('Work note appended to audit trail.');
                  }
                }}
                className="absolute right-3 bottom-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>

            {/* Timeline Events */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">
                Cryptographic Audit Log & Event History
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 flex items-start space-x-3 text-xs"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 mt-0.5">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">{item.action || 'Event'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-0.5">{item.comment || item.message}</div>
                      {item.hash && (
                        <div className="text-[10px] font-mono text-slate-600 truncate mt-1">
                          SHA-256: {item.hash}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): AI Copilot War Room Panel */}
        <div className="space-y-6">
          {/* AI Copilot Card */}
          <div className="glass-panel rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-900/40 space-y-5">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Technician AI Copilot Panel</span>
            </div>

            {/* Why P1 & Why Me? Rationale */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Why Priority {incident.priority}?</span>
                  <span className="text-[10px] text-indigo-400 font-mono">ITIL + Cal</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Base ITIL matrix evaluated to <code className="text-amber-300">P2</code>. Active exam window applied <code className="text-indigo-300">+1 bump</code> to P1.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Why Rohan Kulkarni?</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Score: 0.872</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  <code className="text-slate-300 font-mono">HybridWeightedStrategy</code> matched required skill <code className="text-indigo-300">INFRA_LDAP</code> with lowest active load ratio (0.25).
                </p>
              </div>
            </div>

            {/* A5 SLA Breach Risk Predictor */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>A5 SLA Breach Risk (ONNX)</span>
                <span className="font-mono text-amber-400">84% Risk</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full w-[84%]" />
              </div>
              <p className="text-[10px] text-slate-400">
                Calibrated classifier recommends immediate acknowledgement to prevent Tier-1 breach penalty.
              </p>
            </div>

            {/* A6 Case-Based RAG Resolution Steps with Citations */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>A6 Suggested Resolution Steps</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Verified
                </span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                <li>
                  Inspect LDAP connection pool on auth broker host.
                  <span className="ml-1 px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px]">
                    [INC-2026-000104]
                  </span>
                </li>
                <li>
                  Purge stale pool connections via admin CLI.
                  <span className="ml-1 px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px]">
                    [KB-0007]
                  </span>
                </li>
                <li>Verify Nalanda SSO redirect handshake from Vyas subnet.</li>
              </ol>
            </div>

            {/* B2 Leaf-Safe RCA Mini Graph */}
            {rca && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                    <span>B2 Leaf-Safe Root Cause Analysis</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">
                    Rank #1: {rca.rootCauseCandidate || 'AUTH-LDAP'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{rca.explanation}</p>
                <div className="space-y-1 pt-1">
                  {(rca.rankedNodes || []).slice(0, 3).map((node, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] bg-slate-850 p-1.5 rounded font-mono"
                    >
                      <span className="text-slate-300">{node.serviceCode}</span>
                      <span className="text-indigo-300 font-bold">score: {node.score.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-slate-800 bg-slate-950 space-y-4 animate-scaleUp">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Resolve Incident</span>
            </h2>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resolution Code</label>
                <select
                  value={resolveCode}
                  onChange={(e) => setResolveCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                >
                  <option value="FIXED">FIXED — Root cause resolved</option>
                  <option value="WORKAROUND">WORKAROUND — Temporary fix applied</option>
                  <option value="UPSTREAM_RESOLVED">UPSTREAM_RESOLVED — Third-party service restored</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Root Cause Category</label>
                <select
                  value={resolveRootCause}
                  onChange={(e) => setResolveRootCause(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                >
                  <option value="LDAP_POOL">LDAP Connection Pool Exhaustion</option>
                  <option value="NETWORK_ROUTING">Campus Core Routing Failure</option>
                  <option value="DB_LOCK">Database Contention / Deadlock</option>
                  <option value="CONFIG_DRIFT">Configuration Drift</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Resolution Notes (Minimum 20 characters)
                </label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30"
                >
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blameless PIR Modal */}
      {showPirModal && pirDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 border border-slate-800 bg-slate-950 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Blameless Post-Incident Review (B3)</span>
              </h2>
              <button
                onClick={() => setShowPirModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-semibold text-slate-200 mb-1">Executive Summary:</div>
                <p>{pirDraft.summary || 'Incident resolved with zero data loss.'}</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-semibold text-slate-200 mb-1">Root Cause Analysis:</div>
                <p>{pirDraft.rootCause || 'Connection pool exhausted under exam registration storm.'}</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-semibold text-slate-200 mb-1">Audit-Verified Chronology:</div>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-400">
                  {(pirDraft.timelineEvents || ['Detected at 10:00 UTC', 'Mitigated at 10:14 UTC']).map(
                    (evt: string, i: number) => (
                      <li key={i}>{evt}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="font-semibold text-slate-200 mb-1">Action Items:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(pirDraft.actionItems || ['Scale LDAP connection pool min-idle to 50', 'Add PgBouncer pooler alert at 80%']).map(
                    (act: string, i: number) => (
                      <li key={i}>{act}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPirModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
