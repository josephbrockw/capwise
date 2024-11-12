import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardHome from './pages/Dashboard/DashboardHome';
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
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
  }
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password/initiate" element={<ResetPassword />} />
        <Route path="/password/confirm" element={<ResetConfirm />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route index element={<DashboardHome />} />
        </Route>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
