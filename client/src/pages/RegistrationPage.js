import React, { useState } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/sign-up`, formData);
      if (res.status === 201) {
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
      } else {
        setSuccessMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('There was an error registering!', error);
    }
  };

  if (successMessage) {
    return <div>{successMessage}</div>;
  }

  return (
    <div>
      <div className="flex align-items-center justify-content-center">
        <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
          <div className="text-center mb-5">
            <img src="/demo/images/blocks/logos/hyper.svg" alt="hyper" height={50} className="mb-3"/>
            <div className="text-900 text-3xl font-medium mb-3">Welcome Back</div>
            <span className="text-600 font-medium line-height-3">Already have an account?</span>
            <Link to="/login" style={{textDecoration: 'none'}} data-cy="login-link">
              <span className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Login!</span>
            </Link>
          </div>

          <div>
            <label htmlFor="email" className="block text-900 font-medium mb-2">Email</label>
            <InputText id="email" type="email" name="email" placeholder="Email" className="w-full mb-3"
                       onChange={handleChange} required/>

            <label htmlFor="username" className="block text-900 font-medium mb-2">Username</label>
            <InputText id="username" type="text" name="username" placeholder="Username" className="w-full mb-3"
                       onChange={handleChange} required/>

            <label htmlFor="password1" className="block text-900 font-medium mb-2">Password</label>
            <InputText id="password1" name="password1" type="password" placeholder="Password" className="w-full mb-3"
                       onChange={handleChange} required/>

            <label htmlFor="password2" className="block text-900 font-medium mb-2">Password</label>
            <InputText id="password2" name="password2" type="password" placeholder="Confirm Password" className="w-full mb-3"
                       onChange={handleChange} required/>

            <Button label="Register" icon="pi pi-user" className="w-full" onClick={handleSubmit}
                    data-cy="registration-submit-button"/>
          </div>
        </div>
      </div>
    </div>
  )
    ;
};

export default Register;
