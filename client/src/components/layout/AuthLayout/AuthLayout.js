// components/AuthLayout/AuthLayout.js
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import inlineLogo from '../../../assets/images/inlineLogo.png';
import './AuthLayout.css'; // Optional for additional shared styling

const AuthLayout = ({ title, subtext, sublinkText, sublinkUrl, children }) => {
  const dataCyLink = sublinkUrl ? `${sublinkUrl.replace('/', '')}-link` : null;

  return (
    <div className="flex align-items-center justify-content-center">
      <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
        <div className="text-center mb-5">
          <img src={inlineLogo} alt="hyper" height={50} className="mb-3 mt-3" />
          <div className="text-900 text-3xl font-medium mb-3">{title}</div>
          {subtext && (
            <span className="text-600 font-medium line-height-3">
              {subtext}
              {sublinkUrl && (
                <Link
                  to={sublinkUrl}
                  style={{ textDecoration: 'none' }}
                  className="ml-2 text-blue-500"
                  data-cy={dataCyLink}
                >
                  {sublinkText}
                </Link>
              )}
            </span>
          )}
        </div>
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
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
