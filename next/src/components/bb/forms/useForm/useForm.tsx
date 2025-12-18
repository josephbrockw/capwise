'use client';

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  FormEvent,
  ReactNode,
} from 'react';

export type FormValues = Record<string, unknown>;
export type FormErrors = Record<string, string | undefined>;
export type FormTouched = Record<string, boolean>;

export type ValidationRule<T = unknown> = {
  validate: (value: T, values: FormValues) => boolean;
  message: string;
};

export type ValidationSchema = Record<string, ValidationRule[]>;

export interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface FormState<T extends FormValues> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormActions<T extends FormValues> {
  setValue: (name: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string | undefined) => void;
  setTouched: (name: keyof T, touched?: boolean) => void;
  validate: (name?: keyof T) => boolean;
  reset: (values?: Partial<T>) => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
  getFieldProps: (name: keyof T) => {
    name: string;
    value: unknown;
    onChange: (e: { target: { value: unknown } }) => void;
    onBlur: () => void;
    error?: string;
  };
}

export type UseFormReturn<T extends FormValues> = FormState<T> & FormActions<T>;

export function useForm<T extends FormValues>({
  initialValues,
  validationSchema = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: unknown): string | undefined => {
      const rules = validationSchema[name as string];
      if (!rules) return undefined;

      for (const rule of rules) {
        if (!rule.validate(value, values)) {
          return rule.message;
        }
      }
      return undefined;
    },
    [validationSchema, values]
  );

  const validate = useCallback(
    (name?: keyof T): boolean => {
      if (name) {
        const error = validateField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name]: error }));
        return !error;
      }

      const newErrors: FormErrors = {};
      let isValid = true;

      for (const key of Object.keys(validationSchema)) {
        const error = validateField(key as keyof T, values[key as keyof T]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [validateField, values, validationSchema]
  );

  const setValue = useCallback((name: keyof T, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((name: keyof T, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouchedState((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  const reset = useCallback(
    (newValues?: Partial<T>) => {
      setValuesState(newValues ? { ...initialValues, ...newValues } : initialValues);
      setErrors({});
      setTouchedState({});
    },
    [initialValues]
  );

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      const allTouched: FormTouched = {};
      for (const key of Object.keys(values)) {
        allTouched[key] = true;
      }
      setTouchedState(allTouched);

      const isValid = validate();
      if (!isValid || !onSubmit) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: name as string,
      value: values[name],
      onChange: (e: { target: { value: unknown } }) => {
        setValue(name, e.target.value);
        if (touched[name as string]) {
          const error = validateField(name, e.target.value);
          setErrors((prev) => ({ ...prev, [name]: error }));
        }
      },
      onBlur: () => {
        setTouched(name, true);
        validate(name);
      },
      error: touched[name as string] ? errors[name as string] : undefined,
    }),
    [values, touched, errors, setValue, setTouched, validate, validateField]
  );

  const isValid = useMemo(
    () => Object.values(errors).every((error) => !error),
    [errors]
  );

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    setTouched,
    validate,
    reset,
    handleSubmit,
    getFieldProps,
  };
}

// Form Context for nested components
type FormContextValue<T extends FormValues = FormValues> = UseFormReturn<T>;

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext<T extends FormValues = FormValues>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context as FormContextValue<T>;
}

export interface FormProviderProps<T extends FormValues> {
  form: UseFormReturn<T>;
  children: ReactNode;
}

export function FormProvider<T extends FormValues>({
  form,
  children,
}: FormProviderProps<T>) {
  return (
    <FormContext.Provider value={form as FormContextValue}>
      {children}
    </FormContext.Provider>
  );
}

// Common validation helpers
export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= length,
    message: message || `Must be no more than ${length} characters`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),

  match: (fieldName: string, message = 'Fields do not match'): ValidationRule => ({
    validate: (value, values) => value === values[fieldName],
    message,
  }),
};
