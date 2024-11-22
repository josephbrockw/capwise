import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/layout/AuthLayout/AuthLayout';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setMessage('Invalid or missing verification token.');
        return;
      }

      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`, {
          token: token,
        });
        setMessage('Email verified successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Email verification failed', error);
        setMessage('Email verification failed. Please try again later.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    // <p>{message}</p>
    <AuthLayout title={'Verify Email'} message={message} />
  );
};

export default VerifyEmail;
