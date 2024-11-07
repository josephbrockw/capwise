// components/AuthLayout/AuthLayout.js
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import inlineLogo from '../../../assets/images/inlineLogo.png';

const AuthLayout = ({ title, subtext, sublinkText, sublinkUrl, message, children }) => {
  return (
    <div className="flex align-items-center justify-content-center">
      <div className="w-full lg:w-6" style={{maxWidth: '450px'}}>
        <div className="text-center mb-5">
          <img src={inlineLogo} alt="hyper" height={50} className="mb-3 mt-3" />
          {message ? (
            <div className="text-600 font-medium line-height-3">{message}</div>
          ) : (
            <>
              <div className="text-900 text-3xl font-medium mb-3">{title}</div>
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
        </div>

        {/* Render form or message */}
        {!message && <div>{children}</div>}

        {message && (
          <div className="text-center mt-4">
            <Link
              to="/login"
              style={{ textDecoration: 'none' }}
              className="text-primary-color font-medium"
              data-cy="login-link"
            >
              Sign in
            </Link>
          </div>
        )}
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
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
