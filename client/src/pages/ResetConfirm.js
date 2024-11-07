import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InputOtp } from 'primereact/inputotp';
import { useSearchParams } from 'react-router-dom';
import inlineLogo from '../assets/images/inlineLogo.png';
import Button from '../components/Button/Button';
import FloatLabel from '../components/FloatLabel/FloatLabel';
import AuthLayout from '../components/layout/AuthLayout/AuthLayout';

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
    <AuthLayout
      title="Confirm Password Reset"
      subtext="Don't have an account?"
      sublinkText="Create today!"
      sublinkUrl="/register"
      message={message}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex justify-content-center flex-wrap mb-3" data-cy="otp-container">
          <InputOtp value={formData.token} onChange={handleOtpChange} length={6} mask/>
        </div>
        <FloatLabel id="password" label="Password" value={formData.password} onChange={handleChange} name="password"
                    type="password" required/>
        <FloatLabel id="password_confirm" label="Password Confirm" value={formData.password_confirm}
                    onChange={handleChange} name="password_confirm" type="password" required/>
        <div className="flex align-items-center justify-content-between mb-6">
          <Link to="/login" className="text-blue-500" style={{textDecoration: 'none'}} data-cy='login-link'>
            Sign in
          </Link>
        </div>
        <Button label="Submit" icon="pi pi-user" fullWidth data-cy="submit-button"/>
      </form>
    </AuthLayout>
  );
  // return (
  //   <div>
  //     <div className="flex align-items-center justify-content-center">
  //         {message  ? (
  //           <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
  //             <div className="text-center mb-5">
  //               <img src={inlineLogo} alt="hyper" height={50} className="mb-3 mt-3"/>
  //               <div className="text-900 text-3xl font-medium mb-3">Password Reset Confirm</div>
  //               <div className="text-600 font-medium line-height-3">{message}</div>
  //               <Link to="/login" style={{textDecoration: 'none'}} data-cy="login-link">
  //                 <span className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Sign in</span>
  //               </Link>
  //             </div>
  //           </div>
  //         ) : (
  //           <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
  //             <div className="text-center mb-5">
  //               <img src={inlineLogo} alt="hyper" height={50} className="mb-3 mt-3"/>
  //               <div className="text-900 text-3xl font-medium mb-3">Confirm Password Reset</div>
  //               <span className="text-600 font-medium line-height-3">Don't have an account?</span>
  //               <Link to="/register" style={{textDecoration: 'none'}} data-cy="registration-link">
  //                 <span className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create today!</span>
  //               </Link>
  //             </div>
  //             <div>
  //               <div className="flex justify-content-center flex-wrap mb-3" data-cy="otp-container" >
  //                 <InputOtp value={formData.token} onChange={handleOtpChange} length={6} mask/>
  //               </div>
  //
  //               <FloatLabel id="password" label="Password" value={formData.password} onChange={handleChange} name="password" type="password" required />
  //               <FloatLabel id="password_confirm" label="Password Confirm" value={formData.password_confirm} onChange={handleChange} name="password_confirm" type="password" required />
  //
  //               <div className="flex align-items-center justify-content-between mb-6">
  //                 <Link to="/login" style={{textDecoration: 'none'}} data-cy="login-link">
  //                   <span
  //                     className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Sign in</span>
  //                 </Link>
  //               </div>
  //
  //               <Button label="Submit" icon="pi pi-user" fullWidth onClick={handleSubmit} data-cy="submit-button" />
  //             </div>
  //           </div>
  //         )}
  //     </div>
  //   </div>
  // );
};

export default ResetConfirm;
