import React from 'react';
import Stepper from './Stepper';
import './HorizontalStepper.css';

const HorizontalStepper = ({
  steps = [],
  currentStep = 0,
  setCurrentStep = () => {},
  children,
  onSubmit = () => {},
  formData = {},
  dataCy = '',
  disableInvalidButtons = true,
}) => {
  return (
    <Stepper
      steps={steps}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      onSubmit={onSubmit}
      formData={formData}
      dataCy={dataCy}
      disableInvalidButtons={disableInvalidButtons}
      prefix=""
    >
      {children}
    </Stepper>
  );
};

export default HorizontalStepper;
