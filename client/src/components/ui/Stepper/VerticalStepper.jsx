import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import './VerticalStepper.css';

const VerticalStepper = ({
  steps,
  currentStep,
  setCurrentStep,
  children,
  onSubmit,
  formData,
  dataCy = '',
  disableInvalidButtons = true // Add this prop for test compatibility
}) => {
  const isLastStep = currentStep === steps.length - 1;
  const [validationError, setValidationError] = useState('');
  const [shouldShowError, setShouldShowError] = useState(false);

  const validateStep = (stepIndex) => {
    // Get all steps up to and including the current step
    const stepsToValidate = steps.slice(0, stepIndex + 1);

    // Validate each step
    for (const step of stepsToValidate) {
      const result = step.validate(formData);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };

  // Check validation on form data changes
  useEffect(() => {
    // If there's no validation error or we're not showing errors, skip the check
    if (!shouldShowError) return;

    const validation = validateStep(currentStep);
    setValidationError(validation.isValid ? '' : validation.error);
  }, [formData, currentStep]);

  const handleNext = (e) => {
    e.preventDefault();
    const validation = validateStep(currentStep);
    if (validation.isValid) {
      setCurrentStep(prev => prev + 1);
      setValidationError('');
      setShouldShowError(false);
    } else {
      setValidationError(validation.error);
      setShouldShowError(true);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setCurrentStep(prev => prev - 1);
    setValidationError('');
    setShouldShowError(false);
  };

  const handleDisabledClick = (e) => {
    e.preventDefault();
    const validation = validateStep(currentStep);
    setValidationError(validation.error);
    setShouldShowError(true);
  };

  // Get current validation state for the button
  const currentValidation = validateStep(currentStep);
  const isValid = currentValidation.isValid;

  return (
    <div className="vertical-stepper-container">
      {validationError && shouldShowError && (
        <div className="validation-error" data-cy={`${dataCy}-validation-error`}>
          {validationError}
        </div>
      )}
      {steps.map((step, index) => (
        <div
          key={index}
          className={`vertical-step ${index === currentStep ? 'active' : ''} ${
            index < currentStep ? 'completed' : ''
          }`}
        >
          <div className="vertical-step-header">
            <div className="vertical-step-indicator">{index + 1}</div>
            <div className="vertical-step-label">{step.title}</div>
          </div>
          <div className={`vertical-step-content ${index === currentStep ? 'visible' : ''}`}>
            {index === currentStep && (
              <>
                {children}
              </>
            )}
          </div>
        </div>
      ))}

      <div className="vertical-stepper-actions">
        {currentStep > 0 && (
          <Button
            label="Back"
            onClick={handleBack}
            className="p-button-secondary"
            data-cy={`${dataCy}-back-button`}
            type="button"
          />
        )}
        <Button
          label={isLastStep ? 'Submit' : 'Next'}
          onClick={isValid ? (isLastStep ? onSubmit : handleNext) : handleDisabledClick}
          className={!isValid ? 'button-with-tooltip' : ''}
          disabled={disableInvalidButtons && !isValid}  // Only disable if prop is true
          data-cy={isLastStep ? `${dataCy}-submit-button` : `${dataCy}-continue-button-${currentStep}`}
          type={isLastStep ? 'submit' : 'button'}
        />
      </div>
    </div>
  );
};

export default VerticalStepper;
