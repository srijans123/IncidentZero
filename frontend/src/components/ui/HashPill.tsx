import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';

interface HashPillProps {
  hash: string;
  truncateLength?: number;
  className?: string;
}

export const HashPill: React.FC<HashPillProps> = ({
  hash,
  truncateLength = 8,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const displayHash =
    hash.length > truncateLength * 2 + 3
      ? `${hash.substring(0, truncateLength)}...${hash.substring(hash.length - truncateLength)}`
      : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Click to copy: ${hash}`}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tabular-nums bg-white/[0.04] hover:bg-white/[0.08] text-[#9BA1AE] hover:text-[#F3F4F6] border border-white/[0.07] hover:border-white/[0.14] transition-all cursor-pointer shrink-0 max-w-full group select-all',
        className
      )}
    >
      <span className="truncate">{displayHash}</span>
      {copied ? (
        <Check className="w-3 h-3 text-[#10B981] shrink-0" />
      ) : (
        <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 shrink-0 transition-opacity" />
      )}
    </button>
  );
};
