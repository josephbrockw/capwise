// pages/ResetPassword.js
import React, { useState } from 'react';
import FloatLabel from '../components/ui/FloatLabel/FloatLabel';
import Button from '../components/ui/Button/Button';
import AuthLayout from '../components/layout/AuthLayout/AuthLayout';
import axios from 'axios';
import {Link} from "react-router-dom";

const ResetPassword = () => {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ email: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/password/reset`, formData);
      setMessage('If an account with that email exists, a password reset email will be sent.');
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtext="Don't have an account?"
      sublinkText="Create today!"
      sublinkUrl="/register"
      message={message}
    >
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
        <div className="flex align-items-center justify-content-between mb-6">
          <Link to="/login" className="text-primary-color" style={{textDecoration: 'none'}} data-cy='login-link'>
            Sign in
          </Link>
        </div>
        <Button label="Submit" icon="pi pi-user" type="submit" fullWidth data-cy="submit-button"/>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
