import React from 'react';
import './Stepper.css';

const Stepper = ({ steps, currentStep, children }) => {
  return (
    <div className="stepper-container">
      <div className="stepper-header">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${index === currentStep ? 'active' : ''} ${
              index < currentStep ? 'completed' : ''
            }`}
          >
            <div className="step-indicator">{index + 1}</div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>
      <div className="stepper-content">{children}</div>
    </div>
  );
};

export default Stepper;
