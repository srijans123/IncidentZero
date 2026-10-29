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
} from 'lucide-react';

interface PortalDetailProps {
  incidentId: string;
  onBack: () => void;
}

const LIFECYCLE_STEPS = [
  'NEW',
  'CLASSIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
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
    if (lastEvent?.type?.startsWith('incident.') && lastEvent?.data?.id === incidentId) {
      fetchDetails();
    }
  }, [lastEvent, incidentId]);

  const handleProvideInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfoInput.trim()) return;

    try {
      setIsSubmittingInfo(true);
      await api.incidents.command(incidentId, 'provide-info', {
        comment: userInfoInput,
      });
      setUserInfoInput('');
      await fetchDetails();
    } catch (err: any) {
      alert('Failed to submit response: ' + (err.message || 'Error'));
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      await api.incidents.command(incidentId, 'verify', {
        rating: starRating,
        comment: verifyFeedback || 'Verified by employee. Excellent support.',
      });
      await fetchDetails();
    } catch (err: any) {
      alert('Verification failed: ' + (err.message || 'Error'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please describe why the issue was not resolved:', 'The login error still occurs on the registration portal.');
    if (!reason) return;

    try {
      setIsRejecting(true);
      await api.incidents.command(incidentId, 'reject', { reason });
      await fetchDetails();
    } catch (err: any) {
      alert('Rejection failed: ' + (err.message || 'Error'));
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
        Loading incident details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-400" />
        <h2 className="text-lg font-bold text-slate-200">Incident Not Found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-semibold"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(
    incident.state === 'PENDING_USER'
      ? 'IN_PROGRESS'
      : incident.state === 'VERIFIED'
      ? 'RESOLVED'
      : incident.state === 'REOPENED'
      ? 'IN_PROGRESS'
      : incident.state
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Incidents</span>
        </button>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {incident.number || `INC-${incident.id.slice(0, 8)}`}
          </span>
          <button
            onClick={fetchDetails}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        {/* Header with Title and Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <span>Reported on {new Date(incident.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{incident.serviceCode || 'APP-LMS'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {incident.title}
            </h1>
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
              <span>SLA: {incident.slaStatus || 'ON_TRACK'}</span>
            </div>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Resolution Progress Stepper
          </div>
          <div className="grid grid-cols-6 gap-2">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="text-center space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? 'bg-indigo-500'
                        : isCurrent
                        ? 'bg-cyan-400 animate-pulse'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold block uppercase tracking-tight ${
                      isCurrent
                        ? 'text-cyan-300 font-bold'
                        : isPast
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Tech Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Assigned Engineer</div>
            <div className="text-slate-200 font-semibold mt-0.5 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{incident.assigneeName || 'Rohan Kulkarni (Senior Tech)'}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Current Status</div>
            <div className="text-indigo-300 font-semibold mt-0.5 font-mono">
              {incident.state} {incident.reopenCount > 0 ? `(Reopened ×${incident.reopenCount})` : ''}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Resolution Target</div>
            <div className="text-slate-200 font-semibold mt-0.5 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{incident.resolutionDueAt ? new Date(incident.resolutionDueAt).toLocaleTimeString() : 'Active 24x7'}</span>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            {incident.description}
          </div>
        </div>

        {/* Interactive Action 1: PENDING_USER (Clock Paused) */}
        {incident.state === 'PENDING_USER' && (
          <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>Technician Awaiting Your Response (SLA Clock Paused)</span>
            </div>
            <p className="text-xs text-slate-300">
              The assigned engineer requested clarification. The resolution countdown clock is paused until you reply so your SLA is not penalized:
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-200 italic">
              "Please paste the exact SSO error code or screenshot URL from Nalanda LMS."
            </div>
            <form onSubmit={handleProvideInfo} className="space-y-3">
              <textarea
                rows={2}
                placeholder="Type your response or paste error message..."
                value={userInfoInput}
                onChange={(e) => setUserInfoInput(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isSubmittingInfo}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingInfo ? 'Sending...' : 'Send Information & Resume Clock'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Interactive Action 2: RESOLVED (Verify 1-5 Stars or Reject) */}
        {incident.state === 'RESOLVED' && (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Technician Has Marked This Incident as Resolved</span>
            </div>
            <p className="text-xs text-slate-300">
              Please test your access and rate the resolution. If everything works, click Verify. If the issue is still not fixed, you can Reject to automatically reopen this ticket.
            </p>

            <div className="flex items-center space-x-2 py-1">
              <span className="text-xs font-semibold text-slate-300 mr-2">Satisfaction Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-amber-300 font-bold ml-2">{starRating} of 5 Stars</span>
            </div>

            <input
              type="text"
              placeholder="Optional feedback for technician..."
              value={verifyFeedback}
              onChange={(e) => setVerifyFeedback(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying...' : 'Verify Resolution'}</span>
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="px-5 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{isRejecting ? 'Reopening...' : 'Reject & Reopen Ticket'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Public Timeline */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Public Incident Activity & History</span>
          </div>

          <div className="space-y-3">
            {timeline.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">
                Initial triage completed. Awaiting technician notes.
              </div>
            ) : (
              timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-850 flex items-start space-x-3 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">{item.action || 'Event'}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-1">{item.comment || item.message || 'Status updated'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
