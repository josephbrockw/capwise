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
  dataCy = ''
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

  // Check validation on form data changes after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowError) {
        const validation = validateStep(currentStep);
        setValidationError(validation.isValid ? '' : validation.error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, currentStep, shouldShowError]);

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
    setCurrentStep(prev => prev - 1);
    setValidationError('');
    setShouldShowError(false);
  };

  const handleDisabledClick = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setValidationError(validation.error);
      setShouldShowError(true);
    }
  };

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
          onClick={!validateStep(currentStep).isValid ? handleDisabledClick : (isLastStep ? onSubmit : handleNext)}
          className={!validateStep(currentStep).isValid ? 'button-with-tooltip' : ''}
          disabled={!validateStep(currentStep).isValid}
          data-cy={isLastStep ? `${dataCy}-submit-button` : `${dataCy}-continue-button`}
          type={isLastStep ? 'submit' : 'button'}
        />
      </div>
    </div>
  );
};

export default VerticalStepper;
