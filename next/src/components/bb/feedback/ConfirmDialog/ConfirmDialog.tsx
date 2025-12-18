'use client';

import { forwardRef, ReactNode } from 'react';
import { Modal, ModalProps } from '../Modal/Modal';
import { Button } from '@/components/bb/ui';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps extends Omit<ModalProps, 'footer' | 'children' | 'onClose'> {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const variantButtonClasses: Record<ConfirmDialogVariant, string> = {
  danger: 'bg-danger-500 hover:bg-danger-600 text-white',
  warning: 'bg-warning-500 hover:bg-warning-600 text-white',
  info: 'bg-primary-500 hover:bg-primary-600 text-white',
};

const variantIcons: Record<ConfirmDialogVariant, ReactNode> = {
  danger: (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900/30">
      <svg className="h-6 w-6 text-danger-600 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
  warning: (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900/30">
      <svg className="h-6 w-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
  info: (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
      <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
};

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      title,
      message,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      variant = 'danger',
      onConfirm,
      onCancel,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    return (
      <Modal
        ref={ref}
        size="sm"
        onClose={onCancel}
        {...props}
        title={undefined}
        footer={
          <>
            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
              {cancelLabel}
            </Button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                inline-flex items-center justify-center px-8 py-3.5 rounded-button text-base font-semibold
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${variantButtonClasses[variant]}
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </>
        }
      >
        <div className="text-center">
          {variantIcons[variant]}
          {title && (
            <h3 className="mt-4 text-lg font-semibold text-text">{title}</h3>
          )}
          <p className="mt-2 text-sm text-text-muted">{message}</p>
        </div>
      </Modal>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';
