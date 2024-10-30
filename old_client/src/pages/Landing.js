import React from "react";
import { Link } from "react-router-dom";
import HeroSection from "../components/landing/HeroSection";

function Landing(props) {
  return (
    <>
      <div>
        <h1>Landing</h1>
        <Link to="/sign-up">Sign up</Link>
        <Link to="/log-in">Log in</Link>
      </div>
      <HeroSection />
    </>
  );
}

export default Landing;
