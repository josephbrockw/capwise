import React from 'react';
import PropTypes from 'prop-types';

const AuthFormWrapper = ({ message, children }) => {
  return (
    <div className="flex align-items-center justify-content-center">
      {message ? (
        <>
            <img
              src="/path/to/your/inlineLogo.png"
              alt="Logo"
              height={50}
              className="mb-3 mt-3"
            />
            <div className="text-600 font-medium line-height-3">{message}</div>
        </>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

AuthFormWrapper.propTypes = {
  message: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default AuthFormWrapper;
