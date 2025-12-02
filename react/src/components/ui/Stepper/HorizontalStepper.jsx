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
  fullWidth = false,
  isSubmitting = false,
  submitButtonText = 'Submit'
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
      prefix="horizontal"
      fullWidth={fullWidth}
      isSubmitting={isSubmitting}
      submitButtonText={submitButtonText}
    >
      {children}
    </Stepper>
  );
};

export default HorizontalStepper;
