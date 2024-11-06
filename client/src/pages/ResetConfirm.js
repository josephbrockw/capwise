import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputOtp } from 'primereact/inputotp';
import { Password } from 'primereact/password';
import { FloatLabel } from 'primereact/floatlabel';
import { useSearchParams } from 'react-router-dom';
import inlineLogo from '../assets/images/inlineLogo.png';

import axios from 'axios';

const ResetConfirm = () => {
  const [message, setMessage] = useState('');

  // Get the token from the URL if it exists
  const [searchParams] = useSearchParams();
  const paramToken = searchParams.get('token');
  const [formData, setFormData] = useState({
    token: paramToken || null,
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
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/password/reset/confirm`, formData);
    if (response.status === 200) {
      setMessage(response.data.message || 'Password reset successful. Please sign in.');
    } else {
      setMessage(response.data.error || 'An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('There was an error attempting to reset your password.', error);
    setMessage(error.response?.data?.error || 'An error occurred. Please try again.');
  }
};


  return (
    <div>
      <div className="flex align-items-center justify-content-center">
          {message  ? (
            <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
              <div className="text-center mb-5">
                <img src={inlineLogo} alt="hyper" height={50} className="mb-3 mt-3"/>
                <div className="text-900 text-3xl font-medium mb-3">Password Reset Confirm</div>
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
                <div className="text-900 text-3xl font-medium mb-3">Confirm Password Reset</div>
                <span className="text-600 font-medium line-height-3">Don't have an account?</span>
                <Link to="/register" style={{textDecoration: 'none'}} data-cy="registration-link">
                  <span className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create today!</span>
                </Link>
              </div>
              <div>
                <div className="flex justify-content-center flex-wrap mb-3" data-cy="otp-container" >
                  <InputOtp value={formData.token} onChange={handleOtpChange} length={6} mask/>
                </div>
                <FloatLabel className="mb-2">
                  <Password id="password" name="password" onChange={handleChange} feedback={false} tabIndex={1} className="w-full" inputClassName="w-full" />
                  <label htmlFor="password">Password</label>
                </FloatLabel>

                <FloatLabel className="mb-2">
                  <Password id="password_confirm" name="password_confirm" onChange={handleChange} feedback={false} tabIndex={1} className="w-full" inputClassName="w-full" />
                  <label htmlFor="password_confirm">Confirm Password</label>
                </FloatLabel>

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

export default ResetConfirm;
