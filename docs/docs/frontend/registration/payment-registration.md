---
sidebar_position: 3
---

# Payment Registration

The Payment Registration component (`PaymentRegistrationPage.jsx`) handles the full registration flow with product selection and payment processing in BaseBuild.

## Component Overview

The Payment Registration page extends the basic registration process by adding product selection and payment processing capabilities. It implements a multi-step form to guide users through the complete registration process.

## File Location

```
client/src/pages/Registration/PaymentRegistrationPage.jsx
```

## Features

- **Multi-step Form**: Guides users through the registration process step by step
- **Account Creation**: Collects user email and password
- **Product Selection**: Allows users to choose from available products and pricing tiers
- **Payment Processing**: Collects and processes payment information
- **Order Summary**: Displays a summary of the selected products and total cost
- **Form Validation**: Validates each step before proceeding

## Component Structure

The `Register` component (exported from `PaymentRegistrationPage.jsx`) is structured as a multi-step form with the following steps:

1. **Personal Info**: Collects user email and password
2. **Product**: Users select the product and pricing tier they want to purchase
3. **Payment**: Collects payment method information
4. **Confirmation**: Shows an order summary and confirms the purchase

## Implementation Details

### State Management

```jsx
const [formData, setFormData] = useState({
  email: '',
  password1: '',
  password2: '',
  productId: null,
  tierId: null,
  priceId: null,
  payment_method_id: null,
  selectedProduct: null,
  selectedPrice: null,
  trialDays: 0,
  discountCode: null
});
const [currentStep, setCurrentStep] = useState(0);
const [validatePayment, setValidatePayment] = useState(() => async () => ({ isValid: true }));
```

### Step Configuration

```jsx
const steps = [
  {
    title: 'Personal Info',
    validate: validateAccountDetails
  },
  {
    title: 'Product',
    validate: validateProductSelection
  },
  {
    title: 'Payment',
    validate: validatePaymentStep
  },
  {
    title: 'Confirmation',
    validate: validateConfirmation
  }
];
```

### Step Validation

Each step has its own validation function to ensure all required information is provided before proceeding:

```jsx
const validateAccountDetails = (data) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email ||  !data.password1 || !data.password2) {
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

const validateProductSelection = (data) => {
  if (!data.productId || !data.tierId || !data.priceId) {
    return { isValid: false, error: 'Please select a product plan to continue' };
  }
  return { isValid: true };
};

const validatePaymentStep = (data) => {
  if (!data.payment_method_id) {
    return { isValid: false, error: 'Please add your payment details to continue' };
  }
  return { isValid: true };
};
```

### Step Navigation

```jsx
const handleContinue = (e) => {
  e.preventDefault();
  const validation = steps[currentStep].validate(formData);
  if (!validation.isValid) {
    setErrorMessage(validation.error);
    return;
  }
  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1);
    setErrorMessage(''); // Clear any error message when moving forward
  } else {
    handleSubmit(e);
  }
};
```

### Step Content Rendering

The component uses a switch statement to render different content based on the current step:

```jsx
const renderStepContent = () => {
  switch (currentStep) {
    case 0:
      return (
        <div>
          <h2 className="step-header">Account Details</h2>
          <FloatLabel
              id="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              type="email"
              required
          />
          {/* Password fields... */}
        </div>
      );
    case 1:
      return (
        <div>
          <h2 className="step-header">Product Selection</h2>
          <Product
            onSelect={(productId, tierId, priceId, product, price) => {
              setFormData(prev => ({
                ...prev,
                productId,
                tierId,
                priceId,
                selectedProduct: product,
                selectedPrice: price,
                trialDays: product?.trial_days || 0
              }));
              setErrorMessage('');
            }}
          />
        </div>
      );
    case 2:
      return (
        <div>
          <h2 className="step-header">Payment</h2>
          <StripeProvider>
            <PaymentForm
              formData={formData}
              onSubmit={(updates) => {
                setFormData(prev => ({
                  ...prev,
                  ...updates
                }));
              }}
            />
          </StripeProvider>
        </div>
      );
    case 3:
      return (
        <div>
          <h2 className="step-header">Summary</h2>
          <div className="summary-section">
            {/* Account and plan details... */}
          </div>
        </div>
      );
    default:
      return null;
  }
}
```

## UI Components Used

The payment registration page uses several reusable UI components:

- **AuthLayout**: Provides consistent layout and styling for authentication pages
- **HorizontalStepper**: Displays the multi-step process with progress indication
- **FloatLabel**: Enhanced input fields with floating labels for better UX
- **Product**: Component for selecting products and pricing tiers
- **PaymentForm**: Component for collecting payment information
- **StripeProvider**: Context provider for Stripe payment processing

## Integration with Backend

The Payment Registration component interacts with the backend API by sending a POST request to the `/api/auth/sign-up` endpoint with all the collected information:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-up`, {
      email: formData.email,
      password1: formData.password1,
      password2: formData.password2,
      productId: formData.productId,
      tierId: formData.tierId,
      priceId: formData.priceId,
      payment_method_id: formData.payment_method_id,
      discountCode: formData.discountCode,
      trialDays: formData.trialDays
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

## Styling

The component uses styles defined in `Registration.css`, which provides consistent styling for all registration-related components.

## Best Practices

When working with the Payment Registration flow:

1. Always validate each step before proceeding to the next
2. Provide clear error messages for validation failures
3. Keep the user informed about their progress through the multi-step form
4. Ensure payment information is handled securely using the Stripe integration
5. Provide a clear summary before final submission
