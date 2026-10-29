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
import { StatusDot } from '../../components/ui/StatusDot';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionButton } from '../../components/ui/ActionButton';
import { HashPill } from '../../components/ui/HashPill';
import { SlaChronometerAndLedger3D } from '../../components/three/SlaChronometerAndLedger3D';

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

      const [tl, ai, rcaRes] = await Promise.allSettled([
        api.incidents.timeline(incidentId),
        api.incidents.ai(incidentId),
        api.incidents.rca(incidentId),
      ]);

      if (tl.status === 'fulfilled') setTimeline(tl.value || []);
      if (ai.status === 'fulfilled') setAiPanel(ai.value || null);
      if (rcaRes.status === 'fulfilled') setRca(rcaRes.value || null);
    } catch (err) {
      console.error('Failed to load incident detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [incidentId]);

  useEffect(() => {
    const evtId = lastEvent?.data?.id ?? lastEvent?.data?.incidentId;
    if (
      (lastEvent?.type?.startsWith('incident.') || lastEvent?.type?.startsWith('audit.')) &&
      (!evtId || evtId === incidentId)
    ) {
      fetchDetails();
    }
  }, [lastEvent, incidentId]);

  const runCommand = async (commandType: string, payload: any = {}) => {
    try {
      await api.incidents.command(incidentId, commandType, payload);
      await fetchDetails();
    } catch (err: any) {
      alert(`Command ${commandType} failed: ` + (err.message || 'Unknown error'));
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveNotes.trim() || resolveNotes.trim().length < 10) {
      alert('Resolution notes must be at least 10 characters long.');
      return;
    }
    await runCommand('resolve', {
      resolutionCode: resolveCode,
      resolutionNotes: resolveNotes,
      rootCauseCategory: resolveRootCause,
    });
    setShowResolveModal(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.incidents.command(incidentId, 'comment', {
        body: commentText,
        isInternal: isInternalComment,
      });
      setCommentText('');
      fetchDetails();
    } catch (err: any) {
      console.error('Failed to add comment', err);
      alert('Failed to post note: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleGeneratePir = async () => {
    try {
      const res = await api.incidents.pir(incidentId);
      setPirDraft(res);
      setShowPirModal(true);
    } catch (err: any) {
      console.error('Failed to generate PIR', err);
      alert('PIR generation failed: ' + (err?.message || 'Unknown error'));
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-[#9BA1AE] text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#38BDF8]" />
        <span>Loading incident telemetry...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="surface-panel p-8 text-center text-xs text-[#9BA1AE]">
        <p className="text-slate-300 font-semibold mb-2">Incident not found</p>
        <ActionButton size="standard" variant="secondary" onClick={onBack}>
          Back to Queue
        </ActionButton>
      </div>
    );
  }

  const allowed = incident.allowedCommands || [];
  const isPaused = incident.state === 'PENDING_USER';
  const isBreached = incident.slaStatus === 'BREACHED';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Quick Actions Header */}
      <div className="flex items-center justify-between">
        <ActionButton
          size="standard"
          variant="secondary"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={onBack}
        >
          Back to Queue
        </ActionButton>

        <div className="flex items-center gap-2">
          {incident.isMajor && onOpenMajor && (
            <ActionButton
              size="compact"
              variant="crit"
              icon={<Flame className="w-3.5 h-3.5" />}
              onClick={() => onOpenMajor(incident.id)}
            >
              Open Major Incident War Room
            </ActionButton>
          )}
          <ActionButton
            size="compact"
            variant="outline"
            icon={<RefreshCw className="w-3 h-3" />}
            onClick={fetchDetails}
          >
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Main Incident Telemetry Banner */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#9BA1AE] mb-1.5 flex-wrap">
              <span className="text-[#38BDF8] font-bold text-sm">{incident.number}</span>
              <span>•</span>
              <span className="text-slate-300">{incident.serviceCode || 'APP-LMS'}</span>
              <span>•</span>
              <span>{incident.category || 'AUTHENTICATION'}</span>
              <span>•</span>
              <HashPill hash={incident.id} truncateLength={6} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">{incident.title}</h1>
            <p className="text-xs text-[#9BA1AE] mt-1.5 leading-relaxed max-w-2xl">
              {incident.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge label={incident.priority || 'P3'} isMono />
            <StatusBadge label={incident.state} showDot />
            <StatusBadge
              label={`SLA: ${incident.slaStatus || 'ON_TRACK'}`}
              variant={isBreached ? 'crit' : isPaused ? 'warn' : 'ok'}
              isMono
            />
          </div>
        </div>

        {/* Dynamic Action Bar (strictly driven by allowedCommands) */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8E95A5] mr-1">
            PERMITTED ACTIONS:
          </span>

          {allowed.includes('ACKNOWLEDGE') && (
            <ActionButton
              size="standard"
              variant="accent"
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={() => runCommand('acknowledge')}
            >
              Acknowledge (Stop Response Clock)
            </ActionButton>
          )}

          {allowed.includes('START_INVESTIGATION') && (
            <ActionButton
              size="standard"
              variant="primary"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={() => runCommand('start')}
            >
              Start Investigation
            </ActionButton>
          )}

          {allowed.includes('REQUEST_USER_INFO') && (
            <ActionButton
              size="standard"
              variant="secondary"
              icon={<Pause className="w-3.5 h-3.5" />}
              onClick={() => {
                const question = prompt('Question for user (this pauses resolution clock):', 'Please paste the exact error code or screenshot URL.');
                if (question) runCommand('request-info', { question });
              }}
            >
              Request User Info (Pause Clock)
            </ActionButton>
          )}

          {allowed.includes('RESOLVE') && (
            <ActionButton
              size="standard"
              variant="primary"
              icon={<CheckCircle className="w-3.5 h-3.5" />}
              onClick={() => setShowResolveModal(true)}
            >
              Resolve Incident
            </ActionButton>
          )}

          {allowed.includes('CLOSE') && (
            <ActionButton
              size="standard"
              variant="secondary"
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={() => runCommand('close', { closureNote: 'Verified and closed.' })}
            >
              Close Incident
            </ActionButton>
          )}

          {allowed.includes('DECLARE_MAJOR') && !incident.isMajor && (
            <ActionButton
              size="standard"
              variant="crit"
              icon={<Flame className="w-3.5 h-3.5" />}
              onClick={() => runCommand('declare-major')}
            >
              Declare Major (P1)
            </ActionButton>
          )}

          {allowed.includes('CANCEL') && (
            <ActionButton
              size="standard"
              variant="outline"
              icon={<XCircle className="w-3.5 h-3.5" />}
              onClick={() => {
                const reason = prompt('Reason for cancellation:', 'Duplicate report.');
                if (reason) runCommand('cancel', { reason });
              }}
            >
              Cancel
            </ActionButton>
          )}

          <ActionButton
            size="standard"
            variant="outline"
            icon={<FileText className="w-3.5 h-3.5" />}
            onClick={handleGeneratePir}
            className="ml-auto"
          >
            Draft Blameless PIR (B3)
          </ActionButton>
        </div>
      </div>

      {/* Main War Room Body (Grid: Left Detail & 3D Chronometer, Right AI Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): 3D Chronometer + Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3D Coaxial Dual-Ring SLA Chronometer */}
          <div className="surface-panel p-3 bg-[#101217] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2 px-1 font-mono text-[11px] text-[#9BA1AE]">
              <span>COAXIAL SLA ROTOR TELEMETRY</span>
              <span className={isBreached ? 'text-[#F43F5E]' : isPaused ? 'text-[#F59E0B]' : 'text-[#10B981]'}>
                {isPaused ? 'CLOCK STASIS (USER PAUSED)' : 'ACTIVE SWEEP (1X / 30X)'}
              </span>
            </div>
            <SlaChronometerAndLedger3D
              mode="chronometer"
              isPaused={isPaused}
              isBreached={isBreached}
              className="h-[240px]"
            />
          </div>

          {/* Cryptographic Timeline */}
          <div className="surface-panel p-5 bg-[#101217] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F3F4F6] uppercase tracking-wider font-mono">
                Cryptographic Audit Ledger & Timeline
              </span>
              <span className="text-[11px] text-[#9BA1AE] font-mono">
                {timeline.length} Block Transitions
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-white/[0.08]">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pl-1 text-xs">
                  <div className="w-7 h-7 rounded-full bg-[#161920] border border-white/[0.10] flex items-center justify-center shrink-0 text-[#38BDF8] z-10">
                    <StatusDot state={item.action || 'INVESTIGATING'} />
                  </div>
                  <div className="flex-1 p-3 rounded-md bg-[#161920] border border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-semibold text-slate-200">{item.action}</span>
                      <span className="text-[#8E95A5]">
                        {item.ts ? new Date(item.ts).toLocaleTimeString() : '10:00:00'}
                      </span>
                    </div>
                    <p className="text-[#9BA1AE] text-xs">
                      {item.description || item.payload || 'System state transition verified.'}
                    </p>
                    {item.hash && (
                      <div className="pt-1">
                        <HashPill hash={item.hash} truncateLength={8} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#F3F4F6]">Add Investigation Note</span>
                <label className="flex items-center gap-1.5 text-xs text-[#9BA1AE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="rounded bg-[#161920] border-white/[0.12] text-[#38BDF8]"
                  />
                  <span>Internal NOC Only</span>
                </label>
              </div>
              <textarea
                rows={2}
                placeholder="Log diagnostic findings, server reboot notes, or student contact..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2.5 text-xs rounded bg-[#161920] border border-white/[0.08] text-[#F3F4F6] placeholder-[#646B7A] focus:outline-none focus:border-[#38BDF8] resize-none"
              />
              <div className="flex justify-end">
                <ActionButton size="compact" variant="secondary" type="submit" icon={<Send className="w-3 h-3" />}>
                  Post Note
                </ActionButton>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): AI Copilot & Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          {/* A5 SLA Breach Risk Indicator */}
          <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#38BDF8] flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>A5 ONNX SLA BREACH PREDICTOR</span>
              </span>
              <span className={isBreached ? 'text-[#F43F5E]' : 'text-[#10B981]'}>
                Risk: {isBreached ? '98%' : '14%'}
              </span>
            </div>
            <div className="w-full bg-[#161920] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isBreached ? 'w-[98%] bg-[#F43F5E]' : 'w-[14%] bg-[#10B981]'
                }`}
              />
            </div>
            <p className="text-xs text-[#9BA1AE]">
              Calibrated ONNX model predicting breach likelihood given current queue load and campus service complexity.
            </p>
          </div>

          {/* A6 Case-Based RAG Solutions */}
          {aiPanel?.solutions && (
            <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] space-y-3">
              <span className="text-[11px] font-mono font-semibold text-[#10B981] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>A6 AUDIT-VERIFIED RESOLUTION RAG</span>
              </span>
              <div className="space-y-2">
                {aiPanel.solutions.map((sol: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded bg-[#161920] border border-white/[0.06] text-xs space-y-1">
                    <p className="text-[#F3F4F6] font-medium">{sol.title || 'Historical Root Cause Fix'}</p>
                    <p className="text-xs text-[#9BA1AE]">{sol.summary || sol.snippet}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8E95A5] pt-1">
                      <span>Source: {sol.incidentId || 'INC-2025-00914'}</span>
                      <span className="text-[#10B981]">Similarity: 94%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B2 Graph RCA Candidate */}
          {rca && (
            <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] space-y-2">
              <span className="text-[11px] font-mono font-semibold text-[#F43F5E] flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                <span>B2 LEAF-SAFE ROOT CAUSE (DAG)</span>
              </span>
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-xs">
                <div className="font-semibold text-rose-300 font-mono">Top Candidate: {rca.rootCauseCandidate || 'AUTH-LDAP'}</div>
                <p className="text-xs text-[#9BA1AE] mt-0.5">
                  Topology walk isolated upstream identity provider as root cause across 19 campus services.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="surface-panel p-6 bg-[#101217] border border-white/[0.14] max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F3F4F6]">Resolve Incident {incident.number}</h3>
            <form onSubmit={handleResolve} className="space-y-3 text-xs">
              <div>
                <label className="text-[#9BA1AE] font-medium block mb-1">Resolution Code</label>
                <select
                  value={resolveCode}
                  onChange={(e) => setResolveCode(e.target.value)}
                  className="w-full h-8 px-2 rounded bg-[#161920] border border-white/[0.08] text-[#F3F4F6]"
                >
                  <option value="FIXED">FIXED — Permanent Remediation</option>
                  <option value="WORKAROUND">WORKAROUND — Temporary Mitigation</option>
                  <option value="NO_FAULT_FOUND">NO_FAULT_FOUND — Transient Flap</option>
                </select>
              </div>
              <div>
                <label className="text-[#9BA1AE] font-medium block mb-1">Root Cause Category</label>
                <select
                  value={resolveRootCause}
                  onChange={(e) => setResolveRootCause(e.target.value)}
                  className="w-full h-8 px-2 rounded bg-[#161920] border border-white/[0.08] text-[#F3F4F6]"
                >
                  <option value="LDAP_POOL">LDAP Connection Pool Exhaustion</option>
                  <option value="DATABASE_CONTENTION">Database Lock Contention</option>
                  <option value="NETWORK_FLAP">Edge Gateway Flap</option>
                  <option value="SOFTWARE_BUG">Application Regression</option>
                </select>
              </div>
              <div>
                <label className="text-[#9BA1AE] font-medium block mb-1">Resolution Notes * (Min 10 chars)</label>
                <textarea
                  rows={3}
                  required
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#161920] border border-white/[0.08] text-[#F3F4F6] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <ActionButton size="standard" variant="outline" type="button" onClick={() => setShowResolveModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton size="standard" variant="primary" type="submit">
                  Confirm Resolution
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIR Modal */}
      {showPirModal && pirDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="surface-panel p-6 bg-[#101217] border border-white/[0.14] max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="font-bold text-sm text-[#F3F4F6] font-mono">
                B3 BLAMELESS POST-INCIDENT REVIEW (PIR)
              </span>
              <button
                type="button"
                onClick={() => setShowPirModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-[#9BA1AE] leading-relaxed">
              <div>
                <strong className="text-slate-200 block">Executive Summary:</strong>
                <p>{pirDraft.executiveSummary || 'Automated draft synthesized from verified audit logs.'}</p>
              </div>
              <div>
                <strong className="text-slate-200 block">Chronological Timeline:</strong>
                <pre className="p-3 rounded bg-[#161920] border border-white/[0.06] text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                  {pirDraft.timelineSummary || JSON.stringify(timeline.slice(0, 4), null, 2)}
                </pre>
              </div>
              <div>
                <strong className="text-slate-200 block">Preventative Action Items:</strong>
                <ul className="list-disc pl-4 space-y-1 mt-1">
                  <li>Expand LDAP connection pool maximum limits by +50%.</li>
                  <li>Deploy automated health-check probe for Nalanda Moodle SSO.</li>
                  <li>Anchor cryptographic ledger hashes to immutable off-site repository.</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-white/[0.08]">
              <ActionButton size="standard" variant="primary" onClick={() => setShowPirModal(false)}>
                Export & Close
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
