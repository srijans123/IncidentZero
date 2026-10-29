import React from 'react';
import clsx from 'clsx';

export type ButtonSize = 'compact' | 'standard' | 'cta';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'crit' | 'accent' | 'ghost';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  size = 'standard',
  variant = 'secondary',
  icon,
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    compact: 'h-7 px-2.5 text-xs font-medium',
    standard: 'h-8 px-3 text-[13px] font-medium',
    cta: 'h-9 px-4 text-[13px] font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#E2E8F0] hover:bg-white text-[#090A0D] border border-transparent shadow-sm active:scale-[0.98]',
    secondary:
      'bg-[#161920] hover:bg-[#1D212A] text-[#F3F4F6] border border-white/[0.08] hover:border-white/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-white/[0.05] text-[#9BA1AE] hover:text-[#F3F4F6] border border-white/[0.10] active:scale-[0.98]',
    crit:
      'bg-[rgba(244,63,94,0.12)] hover:bg-[rgba(244,63,94,0.20)] text-[#FDA4AF] border border-[rgba(244,63,94,0.35)] active:scale-[0.98]',
    accent:
      'bg-[rgba(56,189,248,0.12)] hover:bg-[rgba(56,189,248,0.20)] text-[#7DD3FC] border border-[rgba(56,189,248,0.35)] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-[#9BA1AE] hover:text-[#F3F4F6] border border-transparent active:scale-[0.98]',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-md leading-none whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-1 focus:ring-[#38BDF8]',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
