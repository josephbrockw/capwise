---
sidebar_position: 2
---

# Basic Registration

The Basic Registration component (`RegistrationPage.jsx`) handles the initial account creation process in BaseBuild, focusing on simplicity and ease of use.

## Component Overview

The Basic Registration page is responsible for collecting essential user information to create an account. It's designed to be straightforward and minimize friction in the user onboarding process.

## File Location

```
client/src/pages/Registration/RegistrationPage.jsx
```

## Features

- **Email Input**: Collects and validates user email addresses
- **Password Creation**: Secure password input with validation
- **Form Validation**: Client-side validation for all inputs
- **Success Messaging**: Clear feedback after successful registration
- **Error Handling**: User-friendly error messages for failed registrations

## Component Structure

The `Register` component (exported from `RegistrationPage.jsx`) is structured as follows:

- State management using React hooks for form data, success messages, and error messages
- Form validation logic for email and password fields
- Form submission handler that communicates with the backend API
- AuthLayout wrapper for consistent styling and user experience

## Implementation Details

### State Management

```jsx
const [formData, setFormData] = useState({
  email: '',
  password1: '',
  password2: ''
});

const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
```

### Form Validation

```jsx
const validateForm = (data) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !data.password1 || !data.password2) {
    return { isValid: false, error: 'All fields are required' };
  }
  if (!emailRegex.test(data.email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  if (data.password1 !== data.password2) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  if (data.password1.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  return { isValid: true };
};
```

### Form Submission

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const validation = validateForm(formData);
  if (!validation.isValid) {
    setErrorMessage(validation.error);
    return;
  }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-up`, {
      email: formData.email,
      password1: formData.password1,
      password2: formData.password2
    });
    if (res.status === 201) {
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      setErrorMessage('');
    } else {
      setErrorMessage('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('There was an error registering!', error);
    setErrorMessage(error.response?.data?.error || 'Registration failed. Please try again.');
    setSuccessMessage('');
  }
};
```

## UI Components Used

The basic registration page uses several reusable UI components:

- **AuthLayout**: Provides consistent layout and styling for authentication pages
- **FloatLabel**: Enhanced input fields with floating labels for better UX
- **Button**: Styled button component for form submission

## Complete Component Example

```jsx
const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password1: '',
    password2: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form validation and submission handlers...

  return (
    <AuthLayout
      title="Register"
      subtitle="Create your account"
      subtext="Already have an account?"
      sublinkText="Log in here."
      sublinkUrl="/login"
      message={successMessage}
      errorMessage={errorMessage}
    >
      <div className="registration-container">
        {!successMessage && (
          <>
            <h2 className="registration-header">Create Account</h2>
            <form onSubmit={handleSubmit}>
              <FloatLabel
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                name="email"
                type="email"
                required
              />
              <FloatLabel
                id="password1"
                label="Password"
                value={formData.password1}
                onChange={handleChange}
                name="password1"
                type="password"
                required
              />
              <FloatLabel
                id="password2"
                label="Confirm Password"
                value={formData.password2}
                onChange={handleChange}
                name="password2"
                type="password"
                required
              />
              <Button type="submit" variant="primary" fullWidth label="Create Account" />
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
```

## Integration with Backend

The Basic Registration component interacts with the backend API by sending a POST request to the `/api/auth/sign-up` endpoint with the user's email and password data.

## Styling

The component uses styles defined in `Registration.css`, which provides consistent styling for all registration-related components.

## Next Steps

After completing the basic registration, users may proceed to the [Payment Registration](payment-registration.md) if they need to select a product and provide payment information.
