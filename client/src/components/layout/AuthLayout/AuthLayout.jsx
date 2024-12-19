// components/AuthLayout/AuthLayout.js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import inlineLogo from '../../../assets/images/inlineLogo.png';
import './AuthLayout.css';

const AuthLayout = ({
  title,
  subtext = '',
  sublinkText = '',
  sublinkUrl = '',
  message = '',
  errorMessage = '',
  children
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="auth-layout flex align-items-center justify-content-center">
      <div className="w-full" style={{ margin: '1rem 2rem' }}>
        <div className="text-center header">
          <img src={inlineLogo} alt="hyper" height={50} className="logo" />

          {/* Success Message */}
          {message && (
            <div className="text-success font-medium line-height-3">{message}</div>
          )}

          {/* Default Title and Subtext */}
          {!message && (
            <>
              <div className="page-title">{title}</div>
              {subtext && (
                <span className="text-600 font-medium line-height-3">
                  {subtext}
                  {sublinkUrl && (
                    <Link
                      to={sublinkUrl}
                      style={{ textDecoration: 'none' }}
                      className="ml-2 text-primary-color"
                      data-cy={`${sublinkUrl.replace('/', '')}-link`}
                    >
                      {sublinkText}
                    </Link>
                  )}
                </span>
              )}
            </>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="text-error font-medium line-height-3 mt-4">{errorMessage}</div>
          )}
        </div>

        {/* Render form */}
        <div>{children}</div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtext: PropTypes.string,
  sublinkText: PropTypes.string,
  sublinkUrl: PropTypes.string,
  message: PropTypes.string,
  errorMessage: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
