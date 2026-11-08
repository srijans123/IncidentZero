import React, { useState } from 'react';
import { sound } from '../../services/sound';

interface HashPillProps {
  hash: string;
  truncateLength?: number;
  className?: string;
}

export const HashPill: React.FC<HashPillProps> = ({ hash, truncateLength = 6, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const displayHash =
    hash.length > truncateLength * 2
      ? `${hash.slice(0, truncateLength)}..${hash.slice(-truncateLength)}`
      : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.blip();
    navigator.clipboard?.writeText(hash).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Click to copy full SHA-256 hash: ${hash}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border-2 border-[#1B1530] bg-[#FFF8DC] text-[#1B1530] hover:bg-[#FFD84D] shadow-[2px_2px_0_var(--shadow-col)] font-mono text-[11px] font-bold cursor-pointer transition-colors select-none ${className}`}
    >
      <span className="text-[#FF4D3D]">#</span>
      <span>{copied ? 'COPIED!' : displayHash}</span>
    </button>
  );
};
