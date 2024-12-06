import React from 'react';
import './VerticalStepper.css';

const VerticalStepper = ({ steps, currentStep, children }) => {
  return (
    <div className="vertical-stepper-container">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`vertical-step ${index === currentStep ? 'active' : ''} ${
            index < currentStep ? 'completed' : ''
          }`}
        >
          <div className="vertical-step-header">
            <div className="vertical-step-indicator">{index + 1}</div>
            <div className="vertical-step-label">{step}</div>
          </div>
          <div className={`vertical-step-content ${index === currentStep ? 'visible' : ''}`}>
            {children}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerticalStepper;
