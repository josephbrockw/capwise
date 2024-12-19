import React from 'react';
import Stepper from './Stepper';
import './VerticalStepper.css';

const VerticalStepper = ({
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
      prefix="vertical"
    >
      {children}
    </Stepper>
  );
};

export default VerticalStepper;
