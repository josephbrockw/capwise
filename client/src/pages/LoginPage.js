import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import inlineLogo from '../assets/images/inlineLogo.png';
import FloatLabel from '../components/FloatLabel/FloatLabel';
import Button from '../components/Button/Button';
import AuthLayout from '../components/layout/AuthLayout/AuthLayout';

import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, formData);
      localStorage.setItem('token', response.data.data.access);
      navigate('/dashboard');
    } catch (error) {
      console.error('There was an error logging in!', error);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtext="Don't have an account?"
      sublinkText="Create today!"
      sublinkUrl="/register"
    >
      <form onSubmit={handleSubmit}>
        <FloatLabel
          id="username"
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          type="text"
          required
        />
        <FloatLabel
          id="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          required
        />
        <div className="flex align-items-center justify-content-between mb-6">
          <Link to="/password/initiate" className="text-blue-500" data-cy='reset-password-link' >
            Forgot your password?
          </Link>
        </div>
        <Button label="Sign In" icon="pi pi-user" fullWidth onClick={handleSubmit} data-cy="login-submit-button" />
      </form>
    </AuthLayout>
  )
};

export default Login;
