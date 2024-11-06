import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import ResetConfirm from './pages/ResetConfirm';

const AppRoutes = () => {
  const isAuthenticated = () => {
    return Boolean(localStorage.getItem('token'));
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  }
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password/initiate" element={<ResetPassword />} />
        <Route path="/password/confirm" element={<ResetConfirm />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
