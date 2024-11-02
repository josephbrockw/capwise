import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';

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
    console.log(formData);
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
    <div>
      <div className="flex align-items-center justify-content-center">
        <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
          <div className="text-center mb-5">
            <img src="/demo/images/blocks/logos/hyper.svg" alt="hyper" height={50} className="mb-3"/>
            <div className="text-900 text-3xl font-medium mb-3">Welcome Back</div>
            <span className="text-600 font-medium line-height-3">Don't have an account?</span>
            <Link to="/register" style={{ textDecoration: 'none' }} data-cy="registration-link">
              <span className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create today!</span>
            </Link>
          </div>

          <div>
            <label htmlFor="email" className="block text-900 font-medium mb-2">Username</label>
            <InputText id="username" type="text" name="username" placeholder="Username" className="w-full mb-3" onChange={handleChange} required/>

            <label htmlFor="password" className="block text-900 font-medium mb-2">Password</label>
            <InputText id="password" name="password" type="password" placeholder="Password" className="w-full mb-3" onChange={handleChange} required/>

            <div className="flex align-items-center justify-content-between mb-6">
              <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Forgot your password?</a>
            </div>

            <Button label="Sign In" icon="pi pi-user" className="w-full" onClick={handleSubmit} data-cy="login-submit-button" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
