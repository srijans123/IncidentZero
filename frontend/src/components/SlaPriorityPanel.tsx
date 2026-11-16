import React from 'react';
import { Incident } from '../types';

/**
 * "Why this priority, and how long do we have?"
 * Shows only values the backend returned: the priority steps recorded by
 * ItilMatrixPriorityStrategy, and the SLA targets and due times of this ticket.
 * Nothing in this panel is computed or guessed in the browser.
 */
export const SlaPriorityPanel: React.FC<{ incident: Incident }> = ({ incident }) => {
  const steps: any[] = Array.isArray(incident.priorityExplanation) ? incident.priorityExplanation : [];
  const sla: any = incident.sla || {};
  const responseMin = sla.responseTargetMinutes ?? sla.responseTimeMinutes;
  const resolutionMin = sla.resolutionTargetMinutes ?? sla.resolutionTimeMinutes;
  const time = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);
  const minutes = (m?: number) => (m == null ? 'n/a' : m >= 120 && m % 60 === 0 ? `${m / 60} hours` : `${m} min`);
  const statusColour =
    incident.slaStatus === 'BREACHED' ? 'bg-[#FF4D3D] text-[#FFF8DC]' : incident.slaStatus === 'AT_RISK' ? 'bg-[#FF9F43] text-[#1B1530]' : 'bg-[#43D17A] text-[#1B1530]';

  const clockLine = (label: string, target: number | undefined, dueAt: string | undefined, stoppedAt: string | undefined, stoppedWord: string) => (
    <div className="flex items-center justify-between gap-3" data-testid={`sla-${label.toLowerCase()}`}>
      <span className="text-[var(--soft)]">{label} within</span>
      <span className="font-bold text-[var(--fg)] text-right">
        {minutes(target)}
        <span className="font-normal text-[var(--soft)]">
          {dueAt ? ` · due ${time(dueAt)}` : stoppedAt ? ` · ${stoppedWord} ${time(stoppedAt)}` : ' · clock not running'}
        </span>
      </span>
    </div>
  );

  return (
    <div className="pixel-card space-y-3" data-testid="sla-priority-panel">
      <div className="flex items-center justify-between font-mono text-xs font-bold">
        <span className="text-[#59C9F5]">PRIORITY &amp; SLA</span>
        <span className={`px-2 py-0.5 border-2 border-[#1B1530] ${statusColour}`} data-testid="sla-status">
          {incident.slaStatus || 'ON_TRACK'}
        </span>
      </div>

      <div className="p-3 bg-[var(--bg)] border-2 border-[var(--line)] text-xs space-y-1.5 font-mono" data-testid="priority-steps">
        <div className="flex items-center justify-between">
          <span className="text-[var(--soft)]">Impact / Urgency</span>
          <span className="font-bold text-[var(--fg)]">
            {incident.impact ?? 'n/a'} / {incident.urgency ?? 'n/a'}
          </span>
        </div>
        {steps.map((s, i) => (
          <div key={i} className="flex items-start justify-between gap-3 pt-1 border-t border-[var(--line)]/30">
            <span className="text-[var(--fg)]">{s.reason || s.rule}</span>
            <span className="font-bold whitespace-nowrap text-[var(--fg)]">
              {s.before ? `${s.before} → ${s.after}` : s.after}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1 border-t-2 border-[var(--line)]">
          <span className="text-[var(--soft)]">Final priority</span>
          <span className="font-bold bg-[#FFD84D] text-[#1B1530] border-2 border-[#1B1530] px-1.5">{incident.priority}</span>
        </div>
      </div>

      <div className="p-3 bg-[var(--bg)] border-2 border-[var(--line)] text-xs space-y-1.5 font-mono" data-testid="sla-targets">
        <div className="flex items-center justify-between">
          <span className="text-[var(--soft)]">Policy</span>
          <span className="font-bold text-[var(--fg)]">
            tier {sla.policyTier ?? 'n/a'} · {incident.priority}
          </span>
        </div>
        {clockLine('Respond', responseMin, incident.responseDueAt, incident.respondedAt, 'answered')}
        {clockLine('Resolve', resolutionMin, incident.resolutionDueAt, incident.resolvedAt, 'resolved')}
        {incident.state === 'PENDING_USER' && (
          <div className="chip y text-[10px] mt-1" data-testid="sla-paused">
            RESOLUTION CLOCK PAUSED · WAITING FOR THE REPORTER
          </div>
        )}
      </div>
    </div>
  );
};
