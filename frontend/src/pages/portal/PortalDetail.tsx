import React, { useEffect, useState } from 'react';
import { Incident } from '../../types';
import { api } from '../../services/api';
import { useSse } from '../../context/SseContext';
import { sound } from '../../services/sound';
import { PixelIcon, SlaHearts } from '../../services/pixelSprites';
import {
  ChevronLeft,
  CheckCircle2,
  Star,
  Send,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { HashPill } from '../../components/ui/HashPill';

interface PortalDetailProps {
  incidentId: string;
  onBack: () => void;
}

const LIFECYCLE_STEPS = [
  'NEW',
  'ASSIGNED',
  'INVESTIGATING',
  'RESOLVED',
  'CLOSED',
];

export const PortalDetail: React.FC<PortalDetailProps> = ({ incidentId, onBack }) => {
  const { lastEvent } = useSse();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfoInput, setUserInfoInput] = useState('');
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [starRating, setStarRating] = useState(5);
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const inc = await api.incidents.get(incidentId);
      setIncident(inc);
      const t = await api.incidents.timeline(incidentId);
      setTimeline(t || []);
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

  const handleProvideInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfoInput.trim()) return;

    sound.slot();
    try {
      setIsSubmittingInfo(true);
      await api.incidents.command(incidentId, 'provide-info', {
        answer: userInfoInput,
      });
      setUserInfoInput('');
      sound.fix();
      fetchDetails();
    } catch (err: any) {
      sound.err();
      alert('Failed to send diagnostic response: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleVerifyResolution = async () => {
    sound.win();
    try {
      setIsVerifying(true);
      await api.incidents.command(incidentId, 'close', {
        rating: starRating,
        closureNote: verifyFeedback || 'Verified resolved by student.',
      });
      fetchDetails();
    } catch (err: any) {
      sound.err();
      alert('Failed to verify resolution: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectResolution = async () => {
    const reason = prompt('Please describe why the issue is not resolved:', 'The login error still happens when taking the quiz.');
    if (!reason) return;

    sound.err();
    try {
      setIsRejecting(true);
      await api.incidents.command(incidentId, 'reject', { reason });
      fetchDetails();
    } catch (err: any) {
      alert('Failed to reject resolution: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsRejecting(false);
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

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge label={incident.priority || 'P3'} isMono />
            <StatusBadge label={incident.state} showDot />
          </div>
        </div>

        {/* Linear Lifecycle Step Progress Bar */}
        <div className="pt-4 border-t-2 border-[var(--line)]">
          <div className="text-[11px] font-mono font-bold uppercase text-[var(--soft)] mb-2">
            6-Step Lifecycle Quest Progress
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const normalized =
                incident.state === 'VERIFIED' ? 'CLOSED'
                : incident.state === 'PENDING_USER' || incident.state === 'REOPENED' ? 'INVESTIGATING'
                : incident.state;
              const currentIdx = LIFECYCLE_STEPS.indexOf(normalized);
              const isPast = idx <= (currentIdx >= 0 ? currentIdx : 1);
              return (
                <div
                  key={step}
                  className={`p-2.5 border-2 border-[var(--line)] font-mono font-bold text-xs transition-colors ${
                    isPast
                      ? 'bg-[#43D17A] text-[#1B1530] shadow-[2px_2px_0_#1B1530]'
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
              placeholder="e.g. Cleared browser cookies as requested; still seeing HTTP 504 on Nalanda quiz page."
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
                onClick={handleRejectResolution}
              >
                Not Fixed (Reopen)
              </ActionButton>
              <ActionButton
                size="standard"
                variant="primary"
                isLoading={isVerifying}
                icon={<CheckCircle2 className="w-4 h-4 text-[#1B1530]" />}
                onClick={handleVerifyResolution}
              >
                Verify & Close
              </ActionButton>
            </div>
          </div>
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
            <div key={idx} className="p-3 border-2 border-[var(--line)] bg-[var(--card)] space-y-1">
              <div className="flex items-center justify-between font-mono text-xs font-bold">
                <span className="text-[#FF4D3D]">{item.action}</span>
                <span className="text-[var(--soft)]">
                  {item.ts ? new Date(item.ts).toLocaleTimeString() : '10:00:00'}
                </span>
              </div>
              <p className="text-xs text-[var(--fg)] font-medium">{item.description || item.payload}</p>
              {item.hash && (
                <div className="pt-1">
                  <HashPill hash={item.hash} truncateLength={8} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
