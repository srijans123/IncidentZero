import React from 'react';
import clsx from 'clsx';

export type StatusDotState =
  | 'NEW'
  | 'ASSIGNED'
  | 'INVESTIGATING'
  | 'PAUSED'
  | 'PAUSED_PENDING_USER_INFO'
  | 'PAUSED_PENDING_VENDOR'
  | 'REOPENED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'BREACHED'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'HEALTHY'
  | 'WARNING'
  | 'CRITICAL';

interface StatusDotProps {
  state: StatusDotState | string;
  className?: string;
  pulse?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ state, className, pulse = false }) => {
  const normalized = state.toUpperCase();

  let colorClasses = 'bg-slate-500';
  let haloClasses = '';

  if (
    normalized === 'ON_TRACK' ||
    normalized === 'RESOLVED' ||
    normalized === 'CLOSED' ||
    normalized === 'CONNECTED' ||
    normalized === 'HEALTHY'
  ) {
    colorClasses = 'bg-[#10B981]';
    if (pulse || normalized === 'CONNECTED') {
      haloClasses = 'shadow-[0_0_0_3px_rgba(16,185,129,0.18)]';
    }
  } else if (
    normalized === 'AT_RISK' ||
    normalized.startsWith('PAUSED') ||
    normalized === 'ASSIGNED' ||
    normalized === 'WARNING'
  ) {
    colorClasses = 'bg-[#F59E0B]';
    if (pulse) {
      haloClasses = 'shadow-[0_0_0_3px_rgba(245,158,11,0.18)]';
    }
  } else if (
    normalized === 'BREACHED' ||
    normalized === 'CRITICAL' ||
    normalized === 'REOPENED' ||
    normalized === 'P1'
  ) {
    colorClasses = 'bg-[#F43F5E]';
    haloClasses = 'shadow-[0_0_0_3px_rgba(244,63,94,0.22)]';
  } else if (normalized === 'INVESTIGATING' || normalized === 'NEW') {
    colorClasses = 'bg-[#38BDF8]';
    if (pulse) {
      haloClasses = 'shadow-[0_0_0_3px_rgba(56,189,248,0.20)]';
    }
  }

  return (
    <span
      className={clsx(
        'status-dot inline-block w-2 h-2 min-w-[8px] min-h-[8px] max-w-[8px] max-h-[8px] rounded-full shrink-0 align-middle transition-all duration-200',
        colorClasses,
        haloClasses,
        className
      )}
      aria-label={`Status: ${state}`}
    />
  );
};
