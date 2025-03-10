import React, { useState } from 'react';
import axios from 'axios';
import FloatLabel from "../../components/ui/FloatLabel/FloatLabel.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import AuthLayout from "../../components/layout/AuthLayout/AuthLayout.jsx";
import './Registration.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password1: '',
    password2: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleChange = (e) => {
    const newValue = e.target.value.trim();
    setFormData(prevData => ({
      ...prevData,
      [e.target.name]: newValue,
    }));
  };

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

export default Register;
