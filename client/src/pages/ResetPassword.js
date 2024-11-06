import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import inlineLogo from "../assets/images/inlineLogo.png";
import FloatLabel from '../components/FloatLabel/FloatLabel';

import axios from 'axios';

const ResetPassword = () => {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
  });
  // State to track resize updates (optional, if resize handling is needed)
  const [isResizing, setIsResizing] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Debounce resize event handling (if needed for custom logic)
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsResizing(false);
      }, 100); // Adjust debounce duration as necessary
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/password/reset`,
        formData
      );
      setMessage('If an account with that email exists, a password reset email will be sent.');
    } catch (error) {
      console.error('There was an error attempting to reset your password.', error);
    }
  };

  return (
    <div>
      <div className="flex align-items-center justify-content-center">
          {message  ? (
            <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
              <div className="text-center mb-5">
                <img src={inlineLogo} alt="hyper" height={50} className="mb-3 mt-3"/>
                <div className="text-600 font-medium line-height-3">{message}</div>
                <Link to="/login" style={{textDecoration: 'none'}} data-cy="login-link">
                  <span className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Sign in</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
              <div className="text-center mb-5">
                <img src={inlineLogo} alt="hyper" height={50} className="mb-3 mt-3"/>
                <div className="text-900 text-3xl font-medium mb-3">Reset Password</div>
                <span className="text-600 font-medium line-height-3">Don't have an account?</span>
                <Link to="/register" style={{textDecoration: 'none'}} data-cy="registration-link">
                  <span className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create today!</span>
                </Link>
              </div>
              <div>
                <FloatLabel id="email" label="Email" value={formData.email} onChange={handleChange} name="email" type="email" required />

                <div className="flex align-items-center justify-content-between mb-6">
                  <Link to="/login" style={{textDecoration: 'none'}} data-cy="login-link">
                    <span
                      className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Sign in</span>
                  </Link>
                </div>

                <Button label="Submit" icon="pi pi-user" className="w-full" onClick={handleSubmit}
                        data-cy="submit-button"/>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ResetPassword;
