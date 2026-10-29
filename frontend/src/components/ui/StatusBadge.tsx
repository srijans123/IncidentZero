import React from 'react';
import clsx from 'clsx';
import { StatusDot } from './StatusDot';

export type BadgeVariant = 'ok' | 'warn' | 'crit' | 'accent' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  dotState?: string;
  isMono?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  showDot = false,
  dotState,
  isMono = false,
  className,
}) => {
  // Infer variant if not explicitly provided
  let effectiveVariant = variant;
  const upper = label.toUpperCase();
  if (!effectiveVariant) {
    if (
      upper.includes('RESOLVED') ||
      upper.includes('CLOSED') ||
      upper.includes('ON_TRACK') ||
      upper.includes('HEALTHY') ||
      upper.includes('P4')
    ) {
      effectiveVariant = 'ok';
    } else if (
      upper.includes('PAUSED') ||
      upper.includes('AT_RISK') ||
      upper.includes('ASSIGNED') ||
      upper.includes('WARNING') ||
      upper.includes('P2') ||
      upper.includes('P3')
    ) {
      effectiveVariant = 'warn';
    } else if (
      upper.includes('BREACHED') ||
      upper.includes('CRITICAL') ||
      upper.includes('REOPENED') ||
      upper.includes('P1') ||
      upper.includes('MAJOR')
    ) {
      effectiveVariant = 'crit';
    } else if (upper.includes('INVESTIGATING') || upper.includes('NEW')) {
      effectiveVariant = 'accent';
    } else {
      effectiveVariant = 'neutral';
    }
  }

  const variantStyles = {
    ok: 'bg-[rgba(16,185,129,0.10)] border-[rgba(16,185,129,0.28)] text-[#6EE7B7]',
    warn: 'bg-[rgba(245,158,11,0.10)] border-[rgba(245,158,11,0.28)] text-[#FCD34D]',
    crit: 'bg-[rgba(244,63,94,0.12)] border-[rgba(244,63,94,0.35)] text-[#FDA4AF]',
    accent: 'bg-[rgba(56,189,248,0.12)] border-[rgba(56,189,248,0.35)] text-[#7DD3FC]',
    neutral: 'bg-white/[0.04] border-white/[0.08] text-slate-300',
  };

  return (
    <span
      className={clsx(
        'status-badge inline-flex items-center gap-1.5 h-[22px] px-2 text-[11px] font-semibold leading-none rounded shrink-0 border whitespace-nowrap align-middle transition-colors',
        isMono ? 'font-mono tabular-nums' : 'font-sans',
        variantStyles[effectiveVariant || 'neutral'],
        className
      )}
    >
      {showDot && <StatusDot state={dotState || label} />}
      <span>{label}</span>
    </span>
  );
};
