import { HTMLAttributes, forwardRef } from 'react';

export interface FormGroupProps extends HTMLAttributes<HTMLFieldSetElement> {
  title?: string;
  description?: string;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

const gapClasses = {
  none: 'space-y-0',
  sm: 'space-y-3',
  md: 'space-y-4',
  lg: 'space-y-6',
} as const;

export const FormGroup = forwardRef<HTMLFieldSetElement, FormGroupProps>(
  (
    {
      title,
      description,
      gap = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <fieldset
        ref={ref}
        className={`border-none p-0 m-0 ${className}`}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <legend className="text-base font-semibold text-text">
                {title}
              </legend>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={gapClasses[gap]}>
          {children}
        </div>
      </fieldset>
    );
  }
);

FormGroup.displayName = 'FormGroup';
