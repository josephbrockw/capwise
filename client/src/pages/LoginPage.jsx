import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FloatLabel from '../components/ui/FloatLabel/FloatLabel';
import Button from '../components/ui/Button/Button';
import AuthLayout from '../components/layout/AuthLayout/AuthLayout';
import { useAuthStore } from '../stores/useAuthStore';

const Login = () => {
  // Initialize form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Get store actions and state
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);
  const clearError = useAuthStore((state) => state.setError);

  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) clearError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      // Error is handled by the store and displayed via AuthLayout
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtext="Don't have an account?"
      sublinkText="Create today!"
      sublinkUrl="/register"
      errorMessage={error}
    >
      <div className="login-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <FloatLabel
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            type="text"
            required
            disabled={loading}
          />
          <FloatLabel
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
            disabled={loading}
          />
          <div className="flex align-items-center justify-content-between mb-6">
            <Link
              to="/password/initiate"
              className="text-primary-color"
              style={{ textDecoration: 'none' }}
              data-cy='reset-password-link'
            >
              Forgot your password?
            </Link>
          </div>
          <Button
            label={loading ? "Signing In..." : "Sign In"}
            icon="pi pi-user"
            fullWidth
            type="submit"
            data-cy="login-submit-button"
            disabled={loading}
          />
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
