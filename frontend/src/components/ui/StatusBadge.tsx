import React from 'react';
import clsx from 'clsx';
import { StatusDot } from './StatusDot';

export type BadgeVariant = 'ok' | 'warn' | 'crit' | 'accent' | 'neutral' | 'purple';

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
  let effectiveVariant = variant;
  const upper = label.toUpperCase();

  if (!effectiveVariant) {
    if (
      upper.includes('RESOLVED') ||
      upper.includes('VERIFIED') ||
      upper.includes('CLOSED') ||
      upper.includes('ON_TRACK') ||
      upper.includes('HEALTHY') ||
      upper.includes('P4') ||
      upper.includes('DONE') ||
      upper.includes('CLEAN')
    ) {
      effectiveVariant = 'ok';
    } else if (
      upper.includes('PAUSED') ||
      upper.includes('AT_RISK') ||
      upper.includes('ASSIGNED') ||
      upper.includes('ACKNOWLEDGED') ||
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
      upper.includes('MAJOR') ||
      upper.includes('TAMPER') ||
      upper.includes('OUTAGE')
    ) {
      effectiveVariant = 'crit';
    } else if (upper.includes('ESCALATED')) {
      effectiveVariant = 'purple';
    } else if (
      upper.includes('INVESTIGATING') ||
      upper.includes('NEW') ||
      upper.includes('CLASSIFIED') ||
      upper.includes('IN_PROGRESS') ||
      upper.includes('WORK')
    ) {
      effectiveVariant = 'accent';
    } else {
      effectiveVariant = 'neutral';
    }
  }

  const variantStyles = {
    ok: 'bg-[#43D17A] text-[#1B1530] border-[#1B1530]',
    warn: 'bg-[#FFD84D] text-[#1B1530] border-[#1B1530]',
    crit: 'bg-[#FF4D3D] text-[#FFF8DC] border-[#1B1530]',
    accent: 'bg-[#59C9F5] text-[#1B1530] border-[#1B1530]',
    purple: 'bg-[#7C5CFF] text-[#FFF8DC] border-[#1B1530]',
    neutral: 'bg-[#FFF8DC] text-[#1B1530] border-[#1B1530]',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-bold leading-none border-2 border-solid shadow-[2px_2px_0_var(--shadow-col)] whitespace-nowrap align-middle select-none',
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
