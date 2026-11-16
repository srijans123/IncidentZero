import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sound } from '../../services/sound';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        sound.blip();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  try {
    return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none">
      <div
        className={`bg-[#FFF8DC] text-[#1B1530] border-[4px] border-[#0B071E] shadow-[8px_8px_0_#0B071E] w-full ${maxWidth} flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Retro Title Bar */}
        <div className="bg-[#1B1530] text-[#FFF8DC] px-3 py-2 border-b-[3px] border-[#0B071E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#FF4D3D] border border-black inline-block" />
            <div className="w-3 h-3 bg-[#FFD84D] border border-black inline-block" />
            <div className="w-3 h-3 bg-[#43D17A] border border-black inline-block" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider ml-1">{title}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.blip();
              onClose();
            }}
            className="w-5 h-5 bg-[#FF4D3D] text-[#FFF8DC] border border-black font-mono font-bold text-xs flex items-center justify-center hover:bg-[#FF6657] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[80vh] font-mono text-xs sm:text-sm">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="p-3 sm:p-4 bg-[#F2ECD0] border-t-[3px] border-[#0B071E] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
  } catch (err) {
    console.error('Modal failed to render', err);
    return null;
  }
};
