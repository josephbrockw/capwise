import React from "react";
import { Link } from "react-router-dom";

function Navigation({ isAuthenticated }) {
  return (
    <nav>
      {isAuthenticated ? (
        <button>Log Out</button>
      ) : (
        <>
          <Link to="/sign-up">Sign Up</Link>
          <Link to="/log-in">Log In</Link>
        </>
      )}
    </nav>
  );
}

export default Navigation;