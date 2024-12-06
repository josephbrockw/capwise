import React, { useState } from 'react';
import axios from 'axios';
import FloatLabel from "../components/ui/FloatLabel/FloatLabel";
import Button from "../components/ui/Button/Button";
import AuthLayout from "../components/layout/AuthLayout/AuthLayout";
import Stepper from "../components/ui/Stepper/Stepper";
import VerticalStepper from "../components/ui/Stepper/VerticalStepper";

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password1: '',
    password2: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Personal Info', 'Product', 'Confirmation'];
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (currentStep < steps.length -1) {
      setCurrentStep(currentStep + 1);
    } else {
        handleSubmit(e);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-up`, formData);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h2>Account Details</h2>
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
                id="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                name="username"
                type="text"
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
            <h2>Choose a Product</h2>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Confirmation</h2>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtext="Already have an account?"
      sublinkText="Login!"
      sublinkUrl="/login"
      message={successMessage}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleContinue}>
        <VerticalStepper steps={steps} currentStep={currentStep}>
          {renderStepContent()}
        </VerticalStepper>
        <Button
            type="submit"
            label={currentStep === steps.length - 1 ? "Submit" : "Next"}
            data-cy={`${currentStep === steps.length - 1 ? "registration-submit-button" : "registration-continue-button"}`}
        />
        {/*<Button label="Register" icon="pi pi-user" type="submit" fullWidth data-cy="registration-submit-button" />*/}
      </form>
    </AuthLayout>
  );
};

export default Register;
