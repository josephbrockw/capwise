---
sidebar_position: 5
---

# Form Components

Components for building forms with validation and layout.

**Location:** `next/src/components/bb/forms/`

## Importing

```tsx
import { FormField, FormGroup, useForm } from '@/components/bb/forms';
```

---

## FormField

A form field wrapper with label and error handling.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | | Field label |
| `htmlFor` | string | | Associated input id |
| `error` | string | | Error message |
| `helperText` | string | | Helper text |
| `required` | boolean | `false` | Show required indicator |
| `disabled` | boolean | `false` | Disabled styling |
| `children` | ReactNode | | Input element |

**Usage:**

```tsx
import { FormField } from '@/components/bb/forms';
import { Input } from '@/components/bb/ui';

<FormField
  label="Email Address"
  htmlFor="email"
  error={errors.email}
  required
>
  <Input
    id="email"
    name="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>

// With helper text
<FormField
  label="Password"
  htmlFor="password"
  helperText="Must be at least 8 characters"
  error={errors.password}
  required
>
  <Input
    id="password"
    name="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
</FormField>
```

---

## FormGroup

A form group container for organizing form sections.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | | Section title |
| `description` | string | | Section description |
| `children` | ReactNode | | Form fields |

**Usage:**

```tsx
<FormGroup
  title="Personal Information"
  description="Enter your personal details below."
>
  <FormField label="First Name" htmlFor="firstName">
    <Input id="firstName" name="firstName" />
  </FormField>
  <FormField label="Last Name" htmlFor="lastName">
    <Input id="lastName" name="lastName" />
  </FormField>
</FormGroup>

<FormGroup
  title="Contact Information"
  description="How can we reach you?"
>
  <FormField label="Email" htmlFor="email" required>
    <Input id="email" name="email" type="email" />
  </FormField>
  <FormField label="Phone" htmlFor="phone">
    <Input id="phone" name="phone" type="tel" />
  </FormField>
</FormGroup>
```

---

## useForm Hook

A form state management hook for handling form data and validation.

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `initialValues` | object | Initial form values |
| `validate` | function | Validation function |
| `onSubmit` | function | Submit handler |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `values` | object | Current form values |
| `errors` | object | Validation errors |
| `touched` | object | Touched fields |
| `isSubmitting` | boolean | Submit in progress |
| `handleChange` | function | Input change handler |
| `handleBlur` | function | Input blur handler |
| `handleSubmit` | function | Form submit handler |
| `setFieldValue` | function | Set a specific field |
| `setFieldError` | function | Set a specific error |
| `resetForm` | function | Reset to initial values |

**Usage:**

```tsx
import { useForm } from '@/components/bb/forms';
import { FormField } from '@/components/bb/forms';
import { Input, Button } from '@/components/bb/ui';

function RegistrationForm() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      return errors;
    },
    onSubmit: async (values) => {
      await registerUser(values);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email"
        htmlFor="email"
        error={touched.email && errors.email}
        required
      >
        <Input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        error={touched.password && errors.password}
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FormField>

      <FormField
        label="Confirm Password"
        htmlFor="confirmPassword"
        error={touched.confirmPassword && errors.confirmPassword}
        required
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </Button>
    </form>
  );
}
```
