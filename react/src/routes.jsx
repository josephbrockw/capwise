// routes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardHome from './pages/Dashboard/DashboardHome';
import RegistrationPage from './pages/Registration/RegistrationPage.jsx';
import PaymentRegistrationPage from './pages/Registration/PaymentRegistrationPage.jsx';
import LoginPage from './pages/LoginPage';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import ResetConfirm from './pages/ResetConfirm';
import Settings from './pages/Dashboard/Settings/Settings';

const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'));
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/register/payment" element={<PaymentRegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password/initiate" element={<ResetPassword />} />
        <Route path="/password/confirm" element={<ResetConfirm />} />
        <Route path="/verify" element={<VerifyEmail />} />

        {/* Private Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="settings" element={<Settings />} />
                {/* Add more nested dashboard routes here */}
              </Routes>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
