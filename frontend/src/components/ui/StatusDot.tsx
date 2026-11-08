import React from 'react';
import clsx from 'clsx';

interface StatusDotProps {
  state?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ state = 'HEALTHY', pulse = false, className }) => {
  const upper = (state || '').toUpperCase();

  let colorClass = 'bg-[#43D17A]';
  if (
    upper.includes('BREACH') ||
    upper.includes('CRIT') ||
    upper.includes('DISCONNECT') ||
    upper.includes('OUTAGE') ||
    upper.includes('TAMPER') ||
    upper.includes('P1')
  ) {
    colorClass = 'bg-[#FF4D3D]';
  } else if (
    upper.includes('WARN') ||
    upper.includes('RISK') ||
    upper.includes('PAUSE') ||
    upper.includes('HOLD') ||
    upper.includes('P2') ||
    upper.includes('P3')
  ) {
    colorClass = 'bg-[#FFD84D]';
  } else if (
    upper.includes('INVESTIGATING') ||
    upper.includes('NEW') ||
    upper.includes('CLASSIFIED') ||
    upper.includes('IN_PROGRESS') ||
    upper.includes('WORK')
  ) {
    colorClass = 'bg-[#59C9F5]';
  }

  return (
    <span
      className={clsx(
        'inline-block w-2.5 h-2.5 border-2 border-[#1B1530] shrink-0',
        colorClass,
        pulse && 'animate-pulse',
        className
      )}
      aria-hidden="true"
    />
  );
};
