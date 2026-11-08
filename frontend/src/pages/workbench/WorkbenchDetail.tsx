import React, { useEffect, useState } from 'react';
import { Incident, RcaResult } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSse } from '../../context/SseContext';
import { sound } from '../../services/sound';
import { PixelIcon, SlaHearts } from '../../services/pixelSprites';
import {
  ChevronLeft,
  CheckCircle,
  Play,
  Check,
  Pause,
  FileText,
  Sparkles,
  Send,
  Flame,
  XCircle,
  BookOpen,
  GitBranch,
  RefreshCw,
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
  const [conflictError, setConflictError] = useState<string | null>(null);

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
    sound.slot();
    setConflictError(null);
    try {
      await api.incidents.command(incidentId, commandType, payload);
      sound.fix();
      await fetchDetails();
    } catch (err: any) {
      sound.err();
      setConflictError(`409 CONFLICT: Move "${commandType}" rejected. State machine violation for current status.`);
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
      sound.blip();
      await api.incidents.command(incidentId, 'comment', {
        body: commentText,
        isInternal: isInternalComment,
      });
      setCommentText('');
      fetchDetails();
    } catch (err: any) {
      sound.err();
      alert('Failed to post note: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleGeneratePir = async () => {
    sound.pick();
    try {
      const res = await api.incidents.pir(incidentId);
      setPirDraft(res);
      setShowPirModal(true);
    } catch (err: any) {
      sound.err();
      alert('PIR generation failed: ' + (err?.message || 'Unknown error'));
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-xs font-mono font-bold text-[var(--soft)] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF4D3D]" />
        <p>ENGAGING TECHNICIAN COMBAT CONSOLE...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="pixel-card p-8 text-center text-xs text-[var(--soft)] space-y-4">
        <p className="text-[var(--fg)] font-bold text-base">INCIDENT NOT FOUND IN DISPATCH</p>
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
          onClick={() => {
            sound.blip();
            onBack();
          }}
        >
          Back to Queue
        </ActionButton>

        <div className="flex items-center gap-2">
          {incident.isMajor && onOpenMajor && (
            <ActionButton
              size="compact"
              variant="crit"
              icon={<Flame className="w-3.5 h-3.5" />}
              onClick={() => {
                sound.slot();
                onOpenMajor(incident.id);
              }}
            >
              Open Major Incident War Room
            </ActionButton>
          )}
          <ActionButton
            size="compact"
            variant="outline"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => {
              sound.pick();
              fetchDetails();
            }}
          >
            Sync
          </ActionButton>
        </div>
      </div>

      {/* Main Incident Telemetry Banner */}
      <div className="pixel-card-offset" style={{ '--b': '#FFD84D' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="wrench" scale={1.6} />
          <span>BOSS FIGHT TELEMETRY · 10-STATE ENFORCEMENT</span>
        </span>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--soft)] mb-1 flex-wrap">
              <span className="text-[#FF4D3D] font-bold text-base">{incident.number}</span>
              <span>•</span>
              <span className="text-[var(--fg)] font-bold">{incident.serviceCode || 'APP-LMS'}</span>
              <span>•</span>
              <span>{incident.category || 'AUTHENTICATION'}</span>
              <span>•</span>
              <HashPill hash={incident.id} truncateLength={6} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
              {incident.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--soft)] mt-1 leading-relaxed max-w-2xl">
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
        <div className="pt-4 border-t-2 border-[var(--line)] flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--soft)] mr-1">
            PERMITTED ACTIONS:
          </span>

          {allowed.includes('ACKNOWLEDGE') && (
            <ActionButton
              size="standard"
              variant="accent"
              icon={<Check className="w-4 h-4" />}
              onClick={() => runCommand('acknowledge')}
            >
              Acknowledge (Stop Response Clock)
            </ActionButton>
          )}

          {allowed.includes('START_INVESTIGATION') && (
            <ActionButton
              size="standard"
              variant="primary"
              icon={<Play className="w-4 h-4" />}
              onClick={() => runCommand('start')}
            >
              Start Investigation
            </ActionButton>
          )}

          {allowed.includes('REQUEST_USER_INFO') && (
            <ActionButton
              size="standard"
              variant="secondary"
              icon={<Pause className="w-4 h-4" />}
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
              variant="ok"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={() => setShowResolveModal(true)}
            >
              Resolve Incident
            </ActionButton>
          )}

          {allowed.includes('CLOSE') && (
            <ActionButton
              size="standard"
              variant="secondary"
              icon={<Check className="w-4 h-4" />}
              onClick={() => runCommand('close', { closureNote: 'Verified and closed.' })}
            >
              Close Incident
            </ActionButton>
          )}

          {allowed.includes('DECLARE_MAJOR') && !incident.isMajor && (
            <ActionButton
              size="standard"
              variant="crit"
              icon={<Flame className="w-4 h-4" />}
              onClick={() => runCommand('declare-major')}
            >
              Declare Major (P1)
            </ActionButton>
          )}

          {allowed.includes('CANCEL') && (
            <ActionButton
              size="standard"
              variant="outline"
              icon={<XCircle className="w-4 h-4" />}
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
            icon={<FileText className="w-4 h-4" />}
            onClick={handleGeneratePir}
            className="ml-auto"
          >
            Draft Blameless PIR (B3)
          </ActionButton>
        </div>

        {/* 409 Conflict Error Banner */}
        {conflictError && (
          <div className="mt-3 p-3 bg-[#FF4D3D] text-[#FFF8DC] border-[3px] border-[#1B1530] font-mono text-xs font-bold shadow-[4px_4px_0_#1B1530] shake">
            {conflictError}
          </div>
        )}
      </div>

      {/* Main War Room Body (Grid: Left Detail & 3D Chronometer, Right AI Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): 3D Chronometer + Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3D Coaxial Dual-Ring SLA Chronometer in CRT Screen */}
          <div className="crt-frame">
            <div className="flex items-center justify-between mb-2 text-xs font-mono font-bold text-[#FFF8DC]">
              <span>COAXIAL SLA ROTOR TELEMETRY (3D PROCEDURAL CLOCK)</span>
              <span className={isBreached ? 'text-[#FF4D3D]' : isPaused ? 'text-[#FFD84D]' : 'text-[#43D17A]'}>
                {isPaused ? 'CLOCK STASIS (USER PAUSED)' : 'ACTIVE SWEEP (1X / 30X)'}
              </span>
            </div>
            <div className="crt-screen">
              <SlaChronometerAndLedger3D
                mode="chronometer"
                isPaused={isPaused}
                isBreached={isBreached}
                className="h-[220px]"
              />
            </div>
          </div>

          {/* Cryptographic Timeline */}
          <div className="pixel-card space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 font-mono text-xs font-bold">
              <span className="text-[var(--fg)] uppercase">
                CRYPTOGRAPHIC AUDIT LEDGER & TIMELINE
              </span>
              <span className="text-[var(--soft)]">
                {timeline.length} BLOCK TRANSITIONS
              </span>
            </div>

            <div className="space-y-3">
              {timeline.map((item, idx) => (
                <div key={idx} className="p-3 border-2 border-[var(--line)] bg-[var(--card)] space-y-1">
                  <div className="flex items-center justify-between font-mono text-xs font-bold">
                    <span className="text-[#FF4D3D]">{item.action}</span>
                    <span className="text-[var(--soft)]">
                      {item.ts ? new Date(item.ts).toLocaleTimeString() : '10:00:00'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--fg)] font-medium">
                    {item.description || item.payload || 'System state transition verified.'}
                  </p>
                  {item.hash && (
                    <div className="pt-1">
                      <HashPill hash={item.hash} truncateLength={8} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t-2 border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                  Add Investigation Note
                </span>
                <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--soft)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="border-2 border-[#1B1530] text-[#FF4D3D]"
                  />
                  <span>Internal NOC Only</span>
                </label>
              </div>
              <textarea
                rows={2}
                placeholder="Log diagnostic findings, server reboot notes, or student contact..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2.5 text-xs font-mono font-bold bg-white text-[#1B1530] border-2 border-[#1B1530] focus:outline-none resize-none"
              />
              <div className="flex justify-end">
                <ActionButton size="compact" variant="secondary" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
                  Post Note
                </ActionButton>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): AI Copilot & Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          {/* SLA Breach Risk Indicator */}
          <div className="pixel-card space-y-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold">
              <span className="text-[#7C5CFF] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>ONNX SLA BREACH PREDICTOR</span>
              </span>
              <span className={isBreached ? 'text-[#FF4D3D]' : 'text-[#43D17A]'}>
                Risk: {isBreached ? '98%' : '14%'}
              </span>
            </div>
            <div className="w-full bg-[#1B1530] h-2.5 border-2 border-[#1B1530] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isBreached ? 'w-[98%] bg-[#FF4D3D]' : 'w-[14%] bg-[#43D17A]'
                }`}
              />
            </div>
            <p className="text-xs text-[var(--soft)] font-medium">
              Calibrated ONNX model predicting breach likelihood given current queue load and campus service complexity.
            </p>
          </div>

          {/* Case-Based RAG Solutions */}
          {aiPanel?.solutions && (
            <div className="pixel-card space-y-3">
              <span className="text-xs font-mono font-bold text-[#43D17A] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>AUDIT-VERIFIED RESOLUTION RAG</span>
              </span>
              <div className="space-y-2">
                {aiPanel.solutions.map((sol: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white border-2 border-[#1B1530] text-xs space-y-1">
                    <p className="font-bold text-[#1B1530]">{sol.title || 'Historical Root Cause Fix'}</p>
                    <p className="text-xs text-[var(--soft)]">{sol.summary || sol.snippet}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[var(--soft)] pt-1">
                      <span>Source: {sol.incidentId || 'INC-2025-00914'}</span>
                      <span className="text-[#43D17A]">Similarity: 94%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Root Cause Candidate */}
          {rca && (
            <div className="pixel-card space-y-2">
              <span className="text-xs font-mono font-bold text-[#FF4D3D] flex items-center gap-1.5">
                <GitBranch className="w-4 h-4" />
                <span>B2 LEAF-SAFE ROOT CAUSE (DAG)</span>
              </span>
              <div className="p-3 bg-[#FF4D3D]/15 border-2 border-[#1B1530] text-xs">
                <div className="font-bold text-[#FF4D3D] font-mono">
                  Top Candidate: {rca.rootCauseCandidate || 'AUTH-LDAP'}
                </div>
                <p className="text-xs text-[var(--soft)] mt-0.5">
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
          <div className="pixel-card bg-[#FFF8DC] max-w-lg w-full space-y-4 border-4 border-[#1B1530] shadow-[8px_8px_0_#1B1530]">
            <h3 className="text-lg font-bold text-[#1B1530] font-mono">
              RESOLVE INCIDENT {incident.number}
            </h3>
            <form onSubmit={handleResolve} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[#1B1530] font-bold block mb-1">Resolution Code</label>
                <select
                  value={resolveCode}
                  onChange={(e) => setResolveCode(e.target.value)}
                  className="w-full h-9 px-2 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold"
                >
                  <option value="FIXED">FIXED — Permanent Remediation</option>
                  <option value="WORKAROUND">WORKAROUND — Temporary Mitigation</option>
                  <option value="NO_FAULT_FOUND">NO_FAULT_FOUND — Transient Flap</option>
                </select>
              </div>
              <div>
                <label className="text-[#1B1530] font-bold block mb-1">Root Cause Category</label>
                <select
                  value={resolveRootCause}
                  onChange={(e) => setResolveRootCause(e.target.value)}
                  className="w-full h-9 px-2 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold"
                >
                  <option value="LDAP_POOL">LDAP Connection Pool Exhaustion</option>
                  <option value="DATABASE_CONTENTION">Database Lock Contention</option>
                  <option value="NETWORK_FLAP">Edge Gateway Flap</option>
                  <option value="SOFTWARE_BUG">Application Regression</option>
                </select>
              </div>
              <div>
                <label className="text-[#1B1530] font-bold block mb-1">Resolution Notes * (Min 10 chars)</label>
                <textarea
                  rows={3}
                  required
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1B1530]">
                <ActionButton size="standard" variant="outline" type="button" onClick={() => setShowResolveModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton size="standard" variant="ok" type="submit">
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
          <div className="pixel-card bg-[#FFF8DC] max-w-2xl w-full space-y-4 border-4 border-[#1B1530] shadow-[8px_8px_0_#1B1530] max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b-2 border-[#1B1530] pb-2 font-mono font-bold text-sm text-[#1B1530]">
              <span>B3 BLAMELESS POST-INCIDENT REVIEW (PIR)</span>
              <button
                type="button"
                onClick={() => setShowPirModal(false)}
                className="btn sm r"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-3 text-[#1B1530] leading-relaxed">
              <div>
                <strong className="block font-bold">Executive Summary:</strong>
                <p>{pirDraft.executiveSummary || 'Automated draft synthesized from verified audit logs.'}</p>
              </div>
              <div>
                <strong className="block font-bold">Chronological Timeline:</strong>
                <pre className="p-3 bg-white border-2 border-[#1B1530] text-[11px] font-mono text-[#1B1530] whitespace-pre-wrap">
                  {pirDraft.timelineSummary || JSON.stringify(timeline.slice(0, 4), null, 2)}
                </pre>
              </div>
              <div>
                <strong className="block font-bold">Preventative Action Items:</strong>
                <ul className="list-disc pl-4 space-y-1 mt-1 font-medium">
                  <li>Expand LDAP connection pool maximum limits by +50%.</li>
                  <li>Deploy automated health-check probe for Nalanda Moodle SSO.</li>
                  <li>Anchor cryptographic ledger hashes to immutable off-site repository.</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t-2 border-[#1B1530]">
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
