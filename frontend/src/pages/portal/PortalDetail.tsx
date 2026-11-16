import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Incident, TimelineItem } from '../../types';
import { sound } from '../../services/sound';
import { PixelIcon, SlaHearts } from '../../services/pixelSprites';
import {
  ChevronLeft,
  RefreshCw,
  Send,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Ban,
} from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { HashPill } from '../../components/ui/HashPill';
import { SlaPriorityPanel } from '../../components/SlaPriorityPanel';
import { useSse } from '../../context/SseContext';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';

interface PortalDetailProps {
  incidentId: string;
  onBack: () => void;
}

// 8 canonical lifecycle progression states
const LIFECYCLE_STEPS = [
  'NEW',
  'CLASSIFIED',
  'ASSIGNED',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'RESOLVED',
  'VERIFIED',
  'CLOSED',
];

export const PortalDetail: React.FC<PortalDetailProps> = ({ incidentId, onBack }) => {
  const { showError, showSuccess } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfoInput, setUserInfoInput] = useState('');
  const [starRating, setStarRating] = useState<number>(5);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const { lastEvent } = useSse();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const inc = await api.incidents.get(incidentId);
      setIncident(inc);

      const items = await api.incidents.timeline(incidentId);
      setTimeline(items);
    } catch (err: any) {
      console.error('Failed to load incident detail', err);
      showError(err, 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [incidentId]);

  useEffect(() => {
    if (
      lastEvent?.type === 'incident.updated' &&
      lastEvent?.data?.incidentId === incidentId
    ) {
      fetchDetails();
    }
  }, [lastEvent, incidentId]);

  const handleProvideInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfoInput.trim()) return;

    sound.slot();
    try {
      setIsSubmittingInfo(true);
      await api.incidents.command(incidentId, 'provide-info', {
        answer: userInfoInput.trim(),
      });
      setUserInfoInput('');
      sound.fix();
      showSuccess('Diagnostic reply sent! SLA resolution clock resumed.');
      fetchDetails();
    } catch (err: any) {
      sound.err();
      showError(err, 'Failed to send diagnostic response');
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleVerifyResolution = async () => {
    sound.win();
    try {
      setIsVerifying(true);
      // A9: send 'verify' with { rating }
      await api.incidents.command(incidentId, 'verify', {
        rating: starRating,
      });
      showSuccess('Resolution confirmed! Waiting for service desk to close the ticket.');
      fetchDetails();
    } catch (err: any) {
      sound.err();
      showError(err, 'Failed to confirm resolution');
    } finally {
      setIsVerifying(false);
    }
  };

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    sound.err();
    try {
      setIsRejecting(true);
      await api.incidents.command(incidentId, 'reject', { reason: rejectReason.trim() });
      setIsRejectModalOpen(false);
      setRejectReason('');
      showSuccess('Ticket returned to service desk for further investigation.');
      fetchDetails();
    } catch (err: any) {
      showError(err, 'Failed to reject resolution');
    } finally {
      setIsRejecting(false);
    }
  };

  const submitCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    sound.blip();
    try {
      setIsCancelling(true);
      await api.incidents.command(incidentId, 'cancel', { reason: cancelReason.trim() });
      setIsCancelModalOpen(false);
      setCancelReason('');
      showSuccess('Ticket successfully cancelled.');
      fetchDetails();
    } catch (err: any) {
      showError(err, 'Failed to cancel ticket');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-xs font-mono font-bold text-[var(--soft)] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF4D3D]" />
        <p>LOADING INCIDENT STATUS & CRYPTOGRAPHIC TIMELINE...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="pixel-card p-8 text-center text-xs text-[var(--soft)] space-y-4">
        <p className="text-[var(--fg)] font-bold text-base">INCIDENT NOT FOUND</p>
        <ActionButton size="standard" variant="secondary" onClick={onBack}>
          Back to List
        </ActionButton>
      </div>
    );
  }

  const isPendingUserInfo = incident.state === 'PENDING_USER';
  const isResolved = incident.state === 'RESOLVED';
  const isVerified = incident.state === 'VERIFIED';
  const isClosed = incident.state === 'CLOSED';
  const isCancelled = incident.state === 'CANCELLED';
  const isReopened = incident.state === 'REOPENED';
  const canCancel = incident.allowedCommands?.includes('CANCEL');

  // Find index in 8-step progression
  const stepIndex = LIFECYCLE_STEPS.indexOf(incident.state);
  const effectiveIndex =
    stepIndex >= 0
      ? stepIndex
      : incident.state === 'PENDING_USER' || incident.state === 'REOPENED'
      ? LIFECYCLE_STEPS.indexOf('IN_PROGRESS')
      : incident.state === 'CANCELLED'
      ? LIFECYCLE_STEPS.indexOf('CLOSED')
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
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
          Back to My Incidents
        </ActionButton>
        <div className="flex items-center gap-2">
          {canCancel && (
            <ActionButton
              size="compact"
              variant="crit"
              icon={<Ban className="w-3.5 h-3.5" />}
              onClick={() => {
                sound.blip();
                setIsCancelModalOpen(true);
              }}
            >
              Cancel My Ticket
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
            Sync Status
          </ActionButton>
        </div>
      </div>

      {/* Main Incident Card */}
      <div className="pixel-card-offset" style={{ '--b': '#59C9F5' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="shield" scale={1.6} />
          <span>INCIDENT TELEMETRY DOSSIER</span>
        </span>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--soft)] mb-1 flex-wrap">
              <span className="text-[#FF4D3D] font-bold text-base">{incident.number}</span>
              <span>•</span>
              <span className="text-[var(--fg)] font-bold">{incident.serviceCode || 'APP-LMS'}</span>
              <span>•</span>
              <HashPill hash={incident.id} truncateLength={6} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
              {incident.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--soft)] mt-1.5 leading-relaxed max-w-2xl">
              {incident.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <StatusBadge label={incident.priority || 'P3'} isMono />
            <StatusBadge label={incident.state} showDot />
            {isPendingUserInfo && (
              <span className="px-2 py-0.5 bg-[#FF9F43] text-[#1B1530] font-mono text-xs font-bold border border-[#1B1530]">
                AWAITING USER INPUT
              </span>
            )}
            {isReopened && (
              <span className="px-2 py-0.5 bg-[#FF4D3D] text-[#FFF8DC] font-mono text-xs font-bold border border-[#1B1530]">
                REOPENED ({incident.reopenCount}x)
              </span>
            )}
            {isCancelled && (
              <span className="px-2 py-0.5 bg-slate-500 text-white font-mono text-xs font-bold border border-[#1B1530]">
                CANCELLED
              </span>
            )}
          </div>
        </div>

        {/* Linear Lifecycle Step Progress Bar (8-Step) */}
        <div className="pt-4 border-t-2 border-[var(--line)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase text-[var(--soft)]">
              8-Step Lifecycle Progression
            </span>
            <span className="text-[11px] font-mono font-bold text-[var(--fg)]">
              Current State: <strong className="text-[#59C9F5]">{incident.state}</strong>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-center text-xs">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx <= effectiveIndex;
              const isCurrent = idx === effectiveIndex;
              return (
                <div
                  key={step}
                  className={`p-2 border-2 border-[var(--line)] font-mono font-bold text-[11px] transition-colors ${
                    isCurrent
                      ? 'bg-[#FFD84D] text-[#1B1530] shadow-[2px_2px_0_#1B1530] -translate-y-0.5'
                      : isPast
                      ? 'bg-[#43D17A] text-[#1B1530]'
                      : 'bg-white/40 text-[var(--soft)]'
                  }`}
                >
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority steps and SLA targets, straight from the backend */}
      <SlaPriorityPanel incident={incident} />

      {/* Action Banner: User Info Requested (Clock Paused) */}
      {isPendingUserInfo && (
        <div className="pixel-card bg-[#FF9F43]/20 border-[3px] border-[#1B1530] space-y-3">
          <div className="flex items-center gap-2 text-[#1B1530] font-bold text-xs font-mono">
            <AlertTriangle className="w-4 h-4 text-[#FF4D3D]" />
            <span>TECHNICIAN AWAITING YOUR INPUT (RESOLUTION SLA PAUSED)</span>
          </div>
          <p className="text-xs text-[var(--fg)] leading-relaxed">
            The assigned engineer paused their work pending your diagnostic input. Please answer below so the clock resumes immediately:
          </p>
          <form onSubmit={handleProvideInfo} className="space-y-2">
            <textarea
              rows={2}
              required
              placeholder="e.g. Cleared browser cookies as requested; still seeing HTTP 504 on LMS quiz page."
              value={userInfoInput}
              onChange={(e) => setUserInfoInput(e.target.value)}
              className="w-full p-2.5 text-xs font-mono font-bold bg-white text-[#1B1530] border-2 border-[#1B1530] focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <ActionButton
                size="standard"
                variant="primary"
                type="submit"
                isLoading={isSubmittingInfo}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Send Diagnostic Reply & Resume
              </ActionButton>
            </div>
          </form>
        </div>
      )}

      {/* Action Banner: Verification and Rating (When RESOLVED) */}
      {isResolved && (
        <div className="pixel-card bg-[#43D17A]/20 border-[3px] border-[#1B1530] space-y-3">
          <div className="flex items-center gap-2 text-[#1B1530] font-bold text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#43D17A]" />
            <span>TECHNICIAN HAS RESOLVED YOUR ISSUE</span>
          </div>
          {incident.resolution?.notes && (
            <div className="p-3 bg-white text-[#1B1530] border-2 border-[#1B1530] font-mono text-xs">
              <span className="font-bold text-[#FF4D3D]">Resolution Notes: </span>
              {incident.resolution.notes}
            </div>
          )}
          <p className="text-xs text-[var(--fg)]">
            Please verify whether the service is functioning correctly for you:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    sound.blip();
                    setStarRating(star);
                  }}
                  className="p-1 cursor-pointer hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= starRating ? 'text-[#FFD84D] fill-[#FFD84D]' : 'text-slate-400'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-[var(--fg)] ml-2">Rating: {starRating}/5</span>
            </div>

            <div className="flex items-center gap-2">
              <ActionButton
                size="standard"
                variant="outline"
                isLoading={isRejecting}
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => {
                  sound.blip();
                  setIsRejectModalOpen(true);
                }}
              >
                Not Fixed (Reject)
              </ActionButton>
              <ActionButton
                size="standard"
                variant="ok"
                isLoading={isVerifying}
                icon={<CheckCircle2 className="w-4 h-4 text-[#1B1530]" />}
                onClick={handleVerifyResolution}
              >
                Confirm It Is Fixed
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Verified Banner: Waiting for Service Desk to Close */}
      {isVerified && (
        <div className="pixel-card bg-[#59C9F5]/20 border-[3px] border-[#1B1530] space-y-2">
          <div className="flex items-center gap-2 text-[#1B1530] font-bold text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#59C9F5]" />
            <span>RESOLUTION CONFIRMED</span>
          </div>
          <p className="text-xs text-[var(--fg)] font-mono font-bold">
            Waiting for the service desk to close the ticket.
          </p>
        </div>
      )}

      {/* Closed Banner */}
      {isClosed && (
        <div className="pixel-card bg-[#43D17A]/20 border-[3px] border-[#1B1530] space-y-2">
          <div className="flex items-center gap-2 text-[#1B1530] font-bold text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#43D17A]" />
            <span>TICKET CLOSED</span>
          </div>
          {incident.closureNote && (
            <p className="text-xs text-[var(--fg)] font-mono">
              Closure Note: {incident.closureNote}
            </p>
          )}
        </div>
      )}

      {/* Public Verified Timeline */}
      <div className="pixel-card space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 font-mono text-xs font-bold">
          <span className="text-[var(--fg)] uppercase">
            PUBLIC TIMELINE & STATUS HISTORY
          </span>
          <span className="text-[var(--soft)]">
            {timeline.length} RECORDED STEPS
          </span>
        </div>

        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="p-3 border-2 border-[var(--line)] bg-[var(--card)] space-y-1">
              <div className="flex items-center justify-between font-mono text-xs font-bold">
                <span className="text-[#FF4D3D]">{item.action}</span>
                <span className="text-[var(--soft)]">
                  {item.actor ? `${item.actor} • ` : ''}
                  {item.ts ? new Date(item.ts).toLocaleTimeString() : ''}
                </span>
              </div>
              <p className="text-xs text-[var(--fg)] font-medium">
                {item.description || (typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload))}
              </p>
              {item.hash && (
                <div className="pt-1">
                  <HashPill hash={item.hash} truncateLength={8} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Resolution & Reopen Ticket"
        footer={
          <>
            <ActionButton
              size="standard"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton
              size="standard"
              variant="crit"
              disabled={!rejectReason.trim() || isRejecting}
              isLoading={isRejecting}
              onClick={submitReject}
            >
              Submit Rejection
            </ActionButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[var(--soft)] font-mono">
            Please describe why the issue is not resolved. This reason will be logged in the immutable audit ledger.
          </p>
          <textarea
            rows={4}
            required
            placeholder="e.g. Tried accessing the LMS quiz again on Vyas Bhawan Wi-Fi, but gateway timeout still occurs."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-white text-[#1B1530] border-2 border-[#1B1530] focus:outline-none"
          />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Incident Ticket"
        footer={
          <>
            <ActionButton
              size="standard"
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Back
            </ActionButton>
            <ActionButton
              size="standard"
              variant="crit"
              disabled={!cancelReason.trim() || isCancelling}
              isLoading={isCancelling}
              onClick={submitCancel}
            >
              Confirm Cancellation
            </ActionButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[var(--soft)] font-mono">
            Are you sure you want to cancel this ticket? Please provide a reason for cancelling.
          </p>
          <textarea
            rows={3}
            required
            placeholder="e.g. Issue resolved itself after reconnecting to campus network."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-white text-[#1B1530] border-2 border-[#1B1530] focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
};
