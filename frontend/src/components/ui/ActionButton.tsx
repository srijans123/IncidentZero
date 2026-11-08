import React from 'react';
import clsx from 'clsx';
import { sound } from '../../services/sound';

export type ButtonSize = 'compact' | 'standard' | 'cta';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'crit' | 'accent' | 'ok' | 'ghost';

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
  onClick,
  ...props
}) => {
  const sizeStyles = {
    compact: 'h-8 px-2.5 text-xs font-mono font-bold shadow-[3px_3px_0_var(--shadow-col)]',
    standard: 'h-10 px-4 text-sm font-bold shadow-[4px_4px_0_var(--shadow-col)]',
    cta: 'h-11 px-5 text-base font-bold shadow-[5px_5px_0_var(--shadow-col)]',
  };

  const variantStyles = {
    primary: 'bg-[#FFD84D] text-[#1B1530] border-[#1B1530] hover:bg-[#FFE066]',
    secondary: 'bg-[#FFF8DC] text-[#1B1530] border-[#1B1530] hover:bg-[#FFFDF0]',
    outline: 'bg-transparent text-[var(--fg)] border-[var(--line)] hover:bg-[var(--card)]',
    crit: 'bg-[#FF4D3D] text-[#FFF8DC] border-[#1B1530] hover:bg-[#FF6657]',
    accent: 'bg-[#59C9F5] text-[#1B1530] border-[#1B1530] hover:bg-[#7FD6FA]',
    ok: 'bg-[#43D17A] text-[#1B1530] border-[#1B1530] hover:bg-[#60DD91]',
    ghost: 'bg-transparent text-[var(--fg)] border-transparent shadow-none hover:bg-black/10',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      sound.blip();
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      className={clsx(
        'btn inline-flex items-center justify-center gap-2 border-[3px] border-solid select-none leading-none whitespace-nowrap shrink-0 transition-transform duration-75 font-sans',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-none animate-spin shrink-0" />
      ) : icon ? (
        <span className="flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
