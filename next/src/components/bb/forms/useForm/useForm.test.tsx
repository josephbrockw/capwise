import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useForm, FormProvider, useFormContext, validators, ValidationRule } from './useForm';

describe('useForm', () => {
  describe('Initial state', () => {
    it('initializes with provided values', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John', email: 'john@example.com' },
        })
      );

      expect(result.current.values).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('starts with empty errors', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      expect(result.current.errors).toEqual({});
    });

    it('starts with empty touched state', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      expect(result.current.touched).toEqual({});
    });

    it('isSubmitting is false initially', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      expect(result.current.isSubmitting).toBe(false);
    });

    it('isValid is true when no errors', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('isDirty is false initially', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: 'John' } })
      );

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('setValue', () => {
    it('updates a single value', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '', email: '' } })
      );

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.values.name).toBe('Jane');
      expect(result.current.values.email).toBe('');
    });

    it('marks form as dirty', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: 'John' } })
      );

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('setValues', () => {
    it('updates multiple values', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '', email: '', age: 0 } })
      );

      act(() => {
        result.current.setValues({ name: 'Jane', email: 'jane@test.com' });
      });

      expect(result.current.values).toEqual({
        name: 'Jane',
        email: 'jane@test.com',
        age: 0,
      });
    });
  });

  describe('setTouched', () => {
    it('marks field as touched', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      act(() => {
        result.current.setTouched('name');
      });

      expect(result.current.touched.name).toBe(true);
    });

    it('can unmark field as touched', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      act(() => {
        result.current.setTouched('name', true);
        result.current.setTouched('name', false);
      });

      expect(result.current.touched.name).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error for a field', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      act(() => {
        result.current.setError('name', 'Name is required');
      });

      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.isValid).toBe(false);
    });

    it('clears error when set to undefined', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      act(() => {
        result.current.setError('name', 'Error');
        result.current.setError('name', undefined);
      });

      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('validate', () => {
    it('validates all fields', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
          validationSchema: {
            name: [validators.required()],
            email: [validators.required(), validators.email() as ValidationRule],
          },
        })
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.name).toBe('This field is required');
      expect(result.current.errors.email).toBe('This field is required');
    });

    it('validates a single field', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
          validationSchema: {
            name: [validators.required()],
            email: [validators.required()],
          },
        })
      );

      act(() => {
        result.current.validate('name');
      });

      expect(result.current.errors.name).toBe('This field is required');
      expect(result.current.errors.email).toBeUndefined();
    });

    it('returns true when validation passes', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
          validationSchema: {
            name: [validators.required()],
          },
        })
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid!).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets to initial values', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: 'John' } })
      );

      act(() => {
        result.current.setValue('name', 'Jane');
        result.current.setError('name', 'Error');
        result.current.setTouched('name');
        result.current.reset();
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });

    it('can reset to new values', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: 'John' } })
      );

      act(() => {
        result.current.reset({ name: 'Jane' });
      });

      expect(result.current.values.name).toBe('Jane');
    });
  });

  describe('handleSubmit', () => {
    it('calls onSubmit when validation passes', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
          validationSchema: { name: [validators.required()] },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    });

    it('does not call onSubmit when validation fails', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validationSchema: { name: [validators.required()] },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('sets isSubmitting during submission', async () => {
      const onSubmit = vi.fn((): Promise<void> => new Promise((r) => setTimeout(r, 100)));
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
          onSubmit,
        })
      );

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.isSubmitting).toBe(true);

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('marks all fields as touched on submit', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
          validationSchema: { name: [validators.required()] },
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);
    });

    it('prevents default form event', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: 'John' }, onSubmit })
      );

      const mockEvent = { preventDefault: vi.fn() };

      await act(async () => {
        await result.current.handleSubmit(mockEvent as unknown as React.FormEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('getFieldProps', () => {
    it('returns correct props for a field', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: 'John' } })
      );

      const props = result.current.getFieldProps('name');

      expect(props.name).toBe('name');
      expect(props.value).toBe('John');
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onBlur).toBe('function');
    });

    it('onChange updates value', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: '' } })
      );

      act(() => {
        result.current.getFieldProps('name').onChange({ target: { value: 'Jane' } });
      });

      expect(result.current.values.name).toBe('Jane');
    });

    it('onBlur marks field as touched and validates', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validationSchema: { name: [validators.required()] },
        })
      );

      act(() => {
        result.current.getFieldProps('name').onBlur();
      });

      expect(result.current.touched.name).toBe(true);
      expect(result.current.errors.name).toBe('This field is required');
    });

    it('includes error only when field is touched', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validationSchema: { name: [validators.required()] },
        })
      );

      expect(result.current.getFieldProps('name').error).toBeUndefined();

      act(() => {
        result.current.setTouched('name');
        result.current.validate('name');
      });

      expect(result.current.getFieldProps('name').error).toBe('This field is required');
    });
  });
});

describe('FormProvider and useFormContext', () => {
  it('provides form context to children', () => {
    const TestComponent = () => {
      const form = useFormContext<{ name: string }>();
      return <div data-testid="value">{form.values.name}</div>;
    };

    const ParentComponent = () => {
      const form = useForm({ initialValues: { name: 'John' } });
      return (
        <FormProvider form={form}>
          <TestComponent />
        </FormProvider>
      );
    };

    render(<ParentComponent />);
    expect(screen.getByTestId('value')).toHaveTextContent('John');
  });

  it('throws error when used outside FormProvider', () => {
    const TestComponent = () => {
      useFormContext();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useFormContext must be used within a FormProvider'
    );
  });
});

describe('validators', () => {
  describe('required', () => {
    it('returns false for empty string', () => {
      const rule = validators.required();
      expect(rule.validate('', {})).toBe(false);
    });

    it('returns false for whitespace only', () => {
      const rule = validators.required();
      expect(rule.validate('   ', {})).toBe(false);
    });

    it('returns true for non-empty string', () => {
      const rule = validators.required();
      expect(rule.validate('hello', {})).toBe(true);
    });

    it('returns false for null/undefined', () => {
      const rule = validators.required();
      expect(rule.validate(null, {})).toBe(false);
      expect(rule.validate(undefined, {})).toBe(false);
    });

    it('allows custom message', () => {
      const rule = validators.required('Custom message');
      expect(rule.message).toBe('Custom message');
    });
  });

  describe('email', () => {
    it('returns true for valid email', () => {
      const rule = validators.email();
      expect(rule.validate('test@example.com', {})).toBe(true);
    });

    it('returns false for invalid email', () => {
      const rule = validators.email();
      expect(rule.validate('invalid', {})).toBe(false);
      expect(rule.validate('test@', {})).toBe(false);
      expect(rule.validate('@example.com', {})).toBe(false);
    });
  });

  describe('minLength', () => {
    it('returns true when length meets minimum', () => {
      const rule = validators.minLength(3);
      expect(rule.validate('abc', {})).toBe(true);
      expect(rule.validate('abcd', {})).toBe(true);
    });

    it('returns false when length is below minimum', () => {
      const rule = validators.minLength(3);
      expect(rule.validate('ab', {})).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('returns true when length is within maximum', () => {
      const rule = validators.maxLength(5);
      expect(rule.validate('abc', {})).toBe(true);
      expect(rule.validate('abcde', {})).toBe(true);
    });

    it('returns false when length exceeds maximum', () => {
      const rule = validators.maxLength(5);
      expect(rule.validate('abcdef', {})).toBe(false);
    });
  });

  describe('pattern', () => {
    it('returns true when pattern matches', () => {
      const rule = validators.pattern(/^\d+$/);
      expect(rule.validate('123', {})).toBe(true);
    });

    it('returns false when pattern does not match', () => {
      const rule = validators.pattern(/^\d+$/);
      expect(rule.validate('abc', {})).toBe(false);
    });
  });

  describe('match', () => {
    it('returns true when fields match', () => {
      const rule = validators.match('password');
      expect(rule.validate('secret', { password: 'secret' })).toBe(true);
    });

    it('returns false when fields do not match', () => {
      const rule = validators.match('password');
      expect(rule.validate('secret', { password: 'different' })).toBe(false);
    });
  });
});
