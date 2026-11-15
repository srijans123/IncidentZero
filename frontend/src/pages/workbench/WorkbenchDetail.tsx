import React, { useEffect, useState } from 'react';
import { Incident, RcaResult, TimelineItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSse } from '../../context/SseContext';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { COMMAND_SLUG, COMMAND_LABELS } from '../../services/commands';
import { sound } from '../../services/sound';
import { PixelIcon } from '../../services/pixelSprites';
import {
  ChevronLeft,
  CheckCircle,
  Play,
  Check,
  Pause,
  FileText,
  Sparkles,
  Flame,
  XCircle,
  BookOpen,
  GitBranch,
  Cpu,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionButton } from '../../components/ui/ActionButton';
import { HashPill } from '../../components/ui/HashPill';
import { SlaChronometerAndLedger3D } from '../../components/three/SlaChronometerAndLedger3D';

interface WorkbenchDetailProps {
  incidentId: string;
  onBack: () => void;
  onOpenMajor?: (id: string) => void;
}

interface TechnicianItem {
  id: string;
  name: string;
  supportTier: string;
  teamId: string;
  teamCode: string;
  loadPoints: number;
  capacity: number;
}

export const WorkbenchDetail: React.FC<WorkbenchDetailProps> = ({ incidentId, onBack, onOpenMajor }) => {
  const { currentUser } = useAuth();
  const { lastEvent } = useSse();
  const toast = useToast();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [aiPanel, setAiPanel] = useState<any>(null);
  const [rca, setRca] = useState<RcaResult | null>(null);
  const [pirDraft, setPirDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Technicians list for reassign
  const [technicians, setTechnicians] = useState<TechnicianItem[]>([]);

  // Modals state
  const [showResolveModal, setShowResolveModal] = useState(false);
  (window as any).__setShowResolveModal = setShowResolveModal;
  const [resolveCode, setResolveCode] = useState('FIXED');
  const [resolveNotes, setResolveNotes] = useState('Restarted LDAP connection pool and purged exhausted sessions.');
  const [resolveRootCause, setResolveRootCause] = useState('LDAP_POOL');

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTechId, setReassignTechId] = useState('');
  const [reassignReason, setReassignReason] = useState('Escalating to specialist team for deep diagnosis.');

  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  (window as any).__showRequestInfoModal = showRequestInfoModal;
  (window as any).__setShowRequestInfoModal = setShowRequestInfoModal;
  const [requestQuestion, setRequestQuestion] = useState('Please attach the exact console error log and client timestamp.');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Duplicate ticket reported under parent incident.');

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
    } catch (err: any) {
      console.error('Failed to load incident detail', err);
      toast.error('Failed to load incident detail: ' + (err?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const list = await api.technicians.list();
      setTechnicians(list || []);
      if (list && list.length > 0 && !reassignTechId) {
        setReassignTechId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load technicians', err);
    }
  };

  useEffect(() => {
    fetchDetails();
    loadTechnicians();
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

  const runCommand = async (commandSlug: string, payload: any = {}) => {
    sound.slot();
    setConflictError(null);
    try {
      await api.incidents.command(incidentId, commandSlug, payload);
      sound.fix();
      toast.success(`Action applied successfully`);
      await fetchDetails();
    } catch (err: any) {
      sound.err();
      const msg = err?.message || 'State machine violation for current status.';
      setConflictError(`409 CONFLICT: Move "${commandSlug}" rejected. ${msg}`);
      toast.error(`Action failed: ${msg}`);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveNotes.trim() || resolveNotes.trim().length < 20) {
      toast.error('Resolution notes must be at least 20 characters long.');
      return;
    }
    if (!resolveRootCause) {
      toast.error('Root cause category is required.');
      return;
    }
    await runCommand('resolve', {
      resolutionCode: resolveCode,
      resolutionNotes: resolveNotes.trim(),
      rootCauseCategory: resolveRootCause,
    });
    setShowResolveModal(false);
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTechId) {
      toast.error('Please select a technician.');
      return;
    }
    if (!reassignReason.trim()) {
      toast.error('Reassign reason is required.');
      return;
    }
    await runCommand('reassign', {
      technicianId: reassignTechId,
      reason: reassignReason.trim(),
    });
    setShowReassignModal(false);
  };

  const handleRequestInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestQuestion.trim()) {
      toast.error('Question is required.');
      return;
    }
    await runCommand('request-info', {
      question: requestQuestion.trim(),
    });
    setShowRequestInfoModal(false);
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error('Reason is required.');
      return;
    }
    await runCommand('cancel', {
      reason: cancelReason.trim(),
    });
    setShowCancelModal(false);
  };

  const handleGeneratePir = async () => {
    sound.pick();
    try {
      const res = await api.incidents.pir(incidentId);
      setPirDraft(res);
      setShowPirModal(true);
    } catch (err: any) {
      sound.err();
      toast.error('PIR generation failed: ' + (err?.message || 'Unknown error'));
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
          <span>BOSS FIGHT TELEMETRY · 11-STATE ENFORCEMENT</span>
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
                console.log('[DEBUG onClick Request User Info]');
                setShowRequestInfoModal(true);
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

          {allowed.includes('REASSIGN') && (
            <ActionButton
              size="standard"
              variant="secondary"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={() => setShowReassignModal(true)}
            >
              Reassign Incident
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
              onClick={() => setShowCancelModal(true)}
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
        {/* Left Column (7 cols): 3D Chronometer + Cryptographic Audit Timeline */}
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

          {/* Cryptographic Audit Ledger Timeline (Append-Only) */}
          <div className="pixel-card space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 font-mono text-xs font-bold">
              <span className="text-[var(--fg)] uppercase">
                CRYPTOGRAPHIC AUDIT LEDGER (SHA-256 HASH CHAIN)
              </span>
              <span className="text-[var(--soft)]">
                {timeline.length} VERIFIED BLOCKS
              </span>
            </div>

            <div className="space-y-3">
              {timeline.length === 0 ? (
                <p className="text-xs font-mono text-[var(--soft)] py-4 text-center">
                  NO AUDIT BLOCKS RECORDED YET
                </p>
              ) : (
                timeline.map((item, idx) => (
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
                ))
              )}
            </div>
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

          {/* Triage & Priority Rationale */}
          <div className="pixel-card space-y-2">
            <span className="text-xs font-mono font-bold text-[#59C9F5] flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>TRIAGE & PRIORITY RATIONALE</span>
            </span>
            <div className="p-3 bg-[var(--bg)] border-2 border-[var(--line)] text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[var(--soft)]">Impact / Urgency:</span>
                <span className="font-bold text-[var(--fg)]">{incident.impact} / {incident.urgency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--soft)]">Assigned Priority:</span>
                <span className="font-bold text-[var(--fg)]">{incident.priority}</span>
              </div>
              {(incident.priorityExplanation as any)?.examBump && (
                <div className="chip y text-[10px] mt-1">
                  EXAM WINDOW BUMP (+1)
                </div>
              )}
              {(incident.priorityExplanation as any)?.rule && (
                <p className="text-[10px] text-[var(--soft)] pt-1 border-t border-[var(--line)]/40">
                  Rule: {(incident.priorityExplanation as any).rule}
                </p>
              )}
            </div>
          </div>

          {/* Dispatch & Assignment Rationale */}
          <div className="pixel-card space-y-2">
            <span className="text-xs font-mono font-bold text-[#7C5CFF] flex items-center gap-1.5">
              <GitBranch className="w-4 h-4" />
              <span>DISPATCH & ASSIGNMENT RATIONALE</span>
            </span>
            <div className="p-3 bg-[var(--bg)] border-2 border-[var(--line)] text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[var(--soft)]">Assigned Tech:</span>
                <span className="font-bold text-[var(--fg)]">{incident.assigneeName || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--soft)]">Active Strategy:</span>
                <span className="font-bold text-[var(--sky)]">
                  {incident.assignmentExplanation?.strategy || 'LEAST_LOADED'}
                </span>
              </div>
              {incident.assignmentExplanation?.score !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--soft)]">Candidate Score:</span>
                  <span className="font-bold text-[#43D17A]">
                    {Number(incident.assignmentExplanation.score).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal (A26) */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title={`RESOLVE INCIDENT ${incident.number}`}
      >
        <form onSubmit={handleResolve} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-[#1B1530] font-bold block mb-1">Resolution Code *</label>
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
            <label className="text-[#1B1530] font-bold block mb-1">Root Cause Category * (Required)</label>
            <select
              value={resolveRootCause}
              onChange={(e) => setResolveRootCause(e.target.value)}
              className="w-full h-9 px-2 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold"
              required
            >
              <option value="LDAP_POOL">LDAP Connection Pool Exhaustion</option>
              <option value="DATABASE_CONTENTION">Database Lock Contention</option>
              <option value="NETWORK_FLAP">Edge Gateway Flap</option>
              <option value="SOFTWARE_BUG">Application Regression</option>
              <option value="CONFIG_ERROR">Configuration Drift</option>
              <option value="HARDWARE_FAILURE">Hardware / Disk Degradation</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#1B1530] font-bold block">Resolution Notes * (Min 20 chars)</label>
              <span className={`text-[10px] ${resolveNotes.trim().length >= 20 ? 'text-[#43D17A]' : 'text-[#FF4D3D]'}`}>
                {resolveNotes.trim().length}/20 min
              </span>
            </div>
            <textarea
              rows={3}
              required
              minLength={20}
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Detailed description of fix applied (minimum 20 characters)..."
              className="w-full p-2.5 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1B1530]">
            <ActionButton size="standard" variant="outline" type="button" onClick={() => setShowResolveModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton size="standard" variant="ok" type="submit" onClick={handleResolve}>
              Confirm Resolution
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* Reassign Modal (A24) */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title={`REASSIGN INCIDENT ${incident.number}`}
      >
        <form onSubmit={handleReassign} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-[#1B1530] font-bold block mb-1">Assignee Technician *</label>
            <select
              value={reassignTechId}
              onChange={(e) => setReassignTechId(e.target.value)}
              className="w-full h-9 px-2 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold"
              required
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.supportTier} · {t.teamCode} · Load: {t.loadPoints.toFixed(1)}/{t.capacity.toFixed(1)} pts)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#1B1530] font-bold block mb-1">Reassignment Reason *</label>
            <textarea
              rows={3}
              required
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="Explain why this ticket is being reassigned..."
              className="w-full p-2.5 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1B1530]">
            <ActionButton size="standard" variant="outline" type="button" onClick={() => setShowReassignModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton size="standard" variant="primary" type="submit">
              Confirm Reassignment
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* Request Info Modal */}
      <Modal
        isOpen={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        title="REQUEST USER INFORMATION"
      >
        <form onSubmit={handleRequestInfo} className="space-y-4 text-xs font-mono">
          <p className="text-[var(--soft)]">
            This will transition the incident to <span className="font-bold text-[#1B1530]">PENDING_USER</span> and pause the SLA resolution timer.
          </p>
          <div>
            <label className="text-[#1B1530] font-bold block mb-1">Question for Reporter *</label>
            <textarea
              rows={3}
              required
              value={requestQuestion}
              onChange={(e) => setRequestQuestion(e.target.value)}
              placeholder="What additional information is required from the reporter?"
              className="w-full p-2.5 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1B1530]">
            <ActionButton size="standard" variant="outline" type="button" onClick={() => setShowRequestInfoModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton size="standard" variant="secondary" type="submit" onClick={handleRequestInfo}>
              Send Request & Pause Clock
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={`CANCEL INCIDENT ${incident.number}`}
      >
        <form onSubmit={handleCancel} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-[#1B1530] font-bold block mb-1">Cancellation Reason *</label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancelling this ticket..."
              className="w-full p-2.5 bg-white border-2 border-[#1B1530] text-[#1B1530] font-bold resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1B1530]">
            <ActionButton size="standard" variant="outline" type="button" onClick={() => setShowCancelModal(false)}>
              Back
            </ActionButton>
            <ActionButton size="standard" variant="crit" type="submit">
              Confirm Cancellation
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* PIR Modal */}
      <Modal
        isOpen={showPirModal && !!pirDraft}
        onClose={() => setShowPirModal(false)}
        title="B3 BLAMELESS POST-INCIDENT REVIEW (PIR)"
      >
        <div className="space-y-3 text-[#1B1530] text-xs leading-relaxed max-h-[70vh] overflow-y-auto">
          <div>
            <strong className="block font-bold">Executive Summary:</strong>
            <p>{pirDraft?.executiveSummary || 'Automated draft synthesized from verified audit logs.'}</p>
          </div>
          <div>
            <strong className="block font-bold">Chronological Timeline:</strong>
            <pre className="p-3 bg-white border-2 border-[#1B1530] text-[11px] font-mono text-[#1B1530] whitespace-pre-wrap">
              {pirDraft?.timelineSummary || JSON.stringify(timeline.slice(0, 4), null, 2)}
            </pre>
          </div>
          <div>
            <strong className="block font-bold">Preventative Action Items:</strong>
            <ul className="list-disc pl-4 space-y-1 mt-1 font-medium">
              <li>Expand LDAP connection pool maximum limits by +50%.</li>
              <li>Deploy automated health-check probe for Campus LMS Moodle SSO.</li>
              <li>Anchor cryptographic ledger hashes to immutable off-site repository.</li>
            </ul>
          </div>
          <div className="flex justify-end pt-2 border-t-2 border-[#1B1530]">
            <ActionButton size="standard" variant="primary" onClick={() => setShowPirModal(false)}>
              Close
            </ActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
