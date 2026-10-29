import React, { useEffect, useState } from 'react';
import { Incident } from '../../types';
import { api } from '../../services/api';
import { useSse } from '../../context/SseContext';
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  Send,
  XCircle,
  RefreshCw,
  User,
  Shield,
  Tag,
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

    try {
      setIsSubmittingInfo(true);
      await api.incidents.command(incidentId, 'provide-info', {
        answer: userInfoInput,
      });
      setUserInfoInput('');
      fetchDetails();
    } catch (err: any) {
      console.error('Failed to provide info', err);
      alert('Failed to send diagnostic response: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleVerifyResolution = async () => {
    try {
      setIsVerifying(true);
      await api.incidents.command(incidentId, 'close', {
        rating: starRating,
        closureNote: verifyFeedback || 'Verified resolved by student.',
      });
      fetchDetails();
    } catch (err: any) {
      console.error('Failed to verify resolution', err);
      alert('Failed to verify resolution: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectResolution = async () => {
    const reason = prompt('Please describe why the issue is not resolved:', 'The login error still happens when taking the quiz.');
    if (!reason) return;

    try {
      setIsRejecting(true);
      await api.incidents.command(incidentId, 'reject', { reason });
      fetchDetails();
    } catch (err: any) {
      console.error('Failed to reject resolution', err);
      alert('Failed to reject resolution: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-[#9BA1AE] text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#38BDF8]" />
        <span>Loading incident status...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="surface-panel p-8 text-center text-xs text-[#9BA1AE]">
        <p className="text-slate-300 font-semibold mb-2">Incident not found</p>
        <ActionButton size="standard" variant="secondary" onClick={onBack}>
          Back to List
        </ActionButton>
      </div>
    );
  }

  const isPendingUserInfo = incident.state === 'PENDING_USER';
  const isResolved = incident.state === 'RESOLVED';
  const isClosed = incident.state === 'CLOSED' || incident.state === 'VERIFIED';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <ActionButton
          size="standard"
          variant="secondary"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={onBack}
        >
          Back to My Incidents
        </ActionButton>
        <ActionButton
          size="compact"
          variant="outline"
          icon={<RefreshCw className="w-3 h-3" />}
          onClick={fetchDetails}
        >
          Refresh Status
        </ActionButton>
      </div>

      {/* Main Incident Card */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#9BA1AE] mb-1.5 flex-wrap">
              <span className="text-[#38BDF8] font-bold text-sm">{incident.number}</span>
              <span>•</span>
              <span className="text-slate-300">{incident.serviceCode || 'APP-LMS'}</span>
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
          </div>
        </div>

        {/* Linear Lifecycle Step Progress Bar */}
        <div className="pt-4 border-t border-white/[0.08]">
          <div className="text-[11px] font-mono text-[#8E95A5] uppercase mb-2">Resolution Progress</div>
          <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
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
                  className={`p-2 rounded text-[11px] font-mono transition-colors ${
                    isPast
                      ? 'bg-[#161920] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold'
                      : 'bg-white/[0.02] text-[#8E95A5] border border-white/[0.04]'
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
        <div className="surface-panel p-5 bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Technician Awaiting Your Clarification (Resolution SLA Paused)</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            The assigned engineer paused their work pending your diagnostic input. Please answer below so the clock resumes immediately:
          </p>
          <form onSubmit={handleProvideInfo} className="space-y-2">
            <textarea
              rows={2}
              required
              placeholder="e.g. Cleared browser cookies as requested; still seeing HTTP 504 on Nalanda quiz page."
              value={userInfoInput}
              onChange={(e) => setUserInfoInput(e.target.value)}
              className="w-full p-2.5 text-xs rounded bg-[#161920] border border-white/[0.12] text-[#F3F4F6] placeholder-[#646B7A] focus:outline-none focus:border-[#F59E0B] resize-none"
            />
            <div className="flex justify-end">
              <ActionButton
                size="standard"
                variant="primary"
                type="submit"
                isLoading={isSubmittingInfo}
                icon={<Send className="w-3 h-3" />}
              >
                Send Diagnostic Reply & Resume
              </ActionButton>
            </div>
          </form>
        </div>
      )}

      {/* Action Banner: Verification and Rating (When RESOLVED) */}
      {isResolved && (
        <div className="surface-panel p-5 bg-[#10B981]/10 border border-[#10B981]/30 space-y-4">
          <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Technician Has Resolved Your Issue</span>
          </div>
          <p className="text-xs text-slate-200">
            Please verify whether the service is functioning correctly for you:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono text-[#9BA1AE] ml-2">Rating: {starRating}/5</span>
            </div>

            <div className="flex items-center gap-2">
              <ActionButton
                size="standard"
                variant="outline"
                isLoading={isRejecting}
                icon={<XCircle className="w-3.5 h-3.5" />}
                onClick={handleRejectResolution}
              >
                Not Fixed (Reopen)
              </ActionButton>
              <ActionButton
                size="standard"
                variant="primary"
                isLoading={isVerifying}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
                onClick={handleVerifyResolution}
              >
                Verify & Close
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Public Verified Timeline */}
      <div className="surface-panel p-5 bg-[#101217] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-[#F3F4F6] uppercase font-mono">
            Public Timeline & Status History
          </span>
          <span className="text-[11px] text-[#9BA1AE] font-mono">
            {timeline.length} Recorded Steps
          </span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-white/[0.08]">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative flex items-start gap-3 pl-1 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#161920] border border-white/[0.10] flex items-center justify-center shrink-0 text-[#38BDF8] z-10">
                <StatusDot state={item.action || 'INVESTIGATING'} />
              </div>
              <div className="flex-1 p-3 rounded bg-[#161920] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-semibold text-slate-200">{item.action}</span>
                  <span className="text-[#8E95A5]">
                    {item.ts ? new Date(item.ts).toLocaleTimeString() : '10:00:00'}
                  </span>
                </div>
                <p className="text-[#9BA1AE] text-xs">{item.description || item.payload}</p>
                {item.hash && (
                  <div className="pt-1">
                    <HashPill hash={item.hash} truncateLength={8} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
