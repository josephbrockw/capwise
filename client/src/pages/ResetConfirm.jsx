import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button/Button';
import FloatLabel from '../components/ui/FloatLabel/FloatLabel';
import OtpInput from '../components/ui/OtpInput/OtpInput';
import AuthLayout from '../components/layout/AuthLayout/AuthLayout';

import axios from 'axios';

const ResetConfirm = () => {
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get the token from the URL if it exists
  const [searchParams] = useSearchParams();
  const paramToken = searchParams.get('token');
  const [formData, setFormData] = useState({
    token: paramToken || '',
    password: '',
    password_confirm: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOtpChange = (e) => {
    setFormData({
      ...formData,
      token: e.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/password/reset/confirm`, formData);
      if (response.status === 200) {
        setMessage(response.data.message || 'Password reset successful. Please sign in.');
      } else {
        setErrorMessage(response.data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('There was an error attempting to reset your password.', error);
      setErrorMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Confirm Password Reset"
      subtext="Don't have an account?"
      sublinkText="Create today!"
      sublinkUrl="/register"
      message={message}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3" data-cy="otp-container">
          <OtpInput
            value={formData.token || ''}
            onChange={handleOtpChange}
            length={6}
            mask
          />
        </div>
        <FloatLabel
          id="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          name="password"
          type="password"
          required
        />
        <FloatLabel
          id="password_confirm"
          label="Password Confirm"
          value={formData.password_confirm}
          onChange={handleChange}
          name="password_confirm"
          type="password"
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

export default ResetConfirm;
