import React, { useState } from 'react';
import axios from 'axios';
import FloatLabel from "../../components/ui/FloatLabel/FloatLabel.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import AuthLayout from "../../components/layout/AuthLayout/AuthLayout.jsx";
import VerticalStepper from "../../components/ui/Stepper/VerticalStepper.jsx";
import HorizontalStepper from "@/components/ui/Stepper/HorizontalStepper.jsx";
import Product from "../../components/ui/Product/Product.jsx";
import PaymentForm from "../../components/ui/PaymentForm/PaymentForm.jsx";
import StripeProvider from "../../components/providers/StripeProvider.jsx";
import './Registration.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password1: '',
    password2: '',
    productId: null,
    tierId: null,
    priceId: null,
    paymentMethodId: null,
    selectedProduct: null,
    selectedPrice: null
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [validatePayment, setValidatePayment] = useState(() => async () => ({ isValid: true }));

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

  const validateConfirmation = () => ({ isValid: true });

  const validatePaymentStep = (data) => {
    if (!data.paymentMethodId) {
      return { isValid: false, error: 'Please add your payment details to continue' };
    }
    return { isValid: true };
  };

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

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value.trim();
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [e.target.name]: newValue,
      };
      return newData;
    });
  };

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
        paymentMethodId: formData.paymentMethodId
      });
      if (res.status === 201) {
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        setErrorMessage(''); // Clear any previous errors
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('There was an error registering!', error);
      setErrorMessage(error.response?.data?.error || 'Registration failed. Please try again.');
      setSuccessMessage(''); // Clear any previous success message
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentStep(prev => prev + 1);
  };

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
                  selectedPrice: price
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
                onSubmit={({ paymentMethodId }) => {
                  setFormData(prev => ({
                    ...prev,
                    paymentMethodId
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
          </div>
        );
      default:
        return null;
    }
  }

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
      <form onSubmit={handleSubmit}>
        <HorizontalStepper
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onSubmit={handleSubmit}
          formData={formData}
          dataCy="registration"
        >
          {renderStepContent()}
        </HorizontalStepper>
      </form>
    </AuthLayout>
  );
};

export default Register;
