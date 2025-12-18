'use client';

import { HTMLAttributes, forwardRef, useEffect, useRef, ReactNode, useCallback } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  dismissable?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
} as const;

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      footer,
      size = 'md',
      dismissable = true,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && dismissable && open) {
          onClose();
        }
      },
      [dismissable, onClose, open]
    );

    useEffect(() => {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [handleEscape]);

    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (dismissable && e.target === overlayRef.current) {
        onClose();
      }
    };

    if (!open) return null;

    return (
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        aria-modal="true"
        role="dialog"
      >
        <div
          ref={ref}
          className={`
            relative w-full ${sizeClasses[size]} bg-surface rounded-xl shadow-2xl
            animate-in zoom-in-95 duration-200
            ${className}
          `}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            {title && (
              <h2 className="text-lg font-semibold text-text">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors ml-auto"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
