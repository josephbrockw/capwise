import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';

const Stepper = ({
  steps = [],
  currentStep = 0,
  setCurrentStep = () => {},
  children,
  onSubmit = () => {},
  formData = {},
  dataCy = '',
  disableInvalidButtons = true,
  prefix = '', // 'vertical' or '' (for horizontal)
  fullWidth = false,
  isSubmitting = false,
  submitButtonText = 'Submit'
}) => {
  const isLastStep = currentStep === steps.length - 1;
  const [validationError, setValidationError] = useState('');
  const [shouldShowError, setShouldShowError] = useState(false);

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    if (!step || !step.validate) return { isValid: true };
    return step.validate(formData);
  };

  // Check validation on form data changes
  useEffect(() => {
    // Only check validation if we're already showing an error
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

  const handleClick = (e) => {
    e.preventDefault();
    const validation = validateStep(currentStep);
    if (validation.isValid) {
      if (isLastStep) {
        onSubmit(e);
      } else {
        handleNext(e);
      }
    } else {
      setValidationError(validation.error);
      setShouldShowError(true);
    }
  };

  // Get current validation state for the button
  const currentValidation = validateStep(currentStep);
  const isValid = currentValidation.isValid;

  return (
    <div className={`${prefix}-stepper-container ${fullWidth ? 'full-width' : ''}`}>
      {prefix === 'horizontal' ? (
        <>
          <div className="horizontal-stepper-header">
            <div className="horizontal-steps-wrapper">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                // Calculate which steps should be visible in the sliding window
                let isVisible = false;
                if (steps.length <= 3) {
                  // If 3 or fewer steps, show all
                  isVisible = true;
                } else if (currentStep === 0) {
                  // First step - show first three
                  isVisible = index < 3;
                } else if (currentStep === steps.length - 1) {
                  // Last step - show last three
                  isVisible = index >= steps.length - 3;
                } else {
                  // Middle steps - show previous, current, and next
                  isVisible = Math.abs(index - currentStep) <= 1;
                }

                return (
                  <div
                    key={index}
                    className={`horizontal-step ${isActive ? 'active' : ''} ${
                      isCompleted ? 'completed' : ''
                    } ${isVisible ? 'active-adjacent' : ''} ${
                      index === steps.length - 1 ? 'last-step' : ''
                    }`}
                  >
                    <div className="horizontal-step-indicator">{index + 1}</div>
                    <div className="horizontal-step-label">{step.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`horizontal-step-content ${index === currentStep ? 'visible' : ''}`}
            >
              {index === currentStep && (
                <>
                  {validationError && shouldShowError && (
                    <div className="validation-error" data-cy={`${dataCy}-validation-error`}>
                      {validationError}
                    </div>
                  )}
                  {children}
                </>
              )}
            </div>
          ))}
        </>
      ) : (
        steps.map((step, index) => (
          <div
            key={index}
            className={`${prefix}-step ${index === currentStep ? 'active' : ''} ${
              index < currentStep ? 'completed' : ''
            } ${index === steps.length - 1 ? 'last-step' : ''}`}
          >
            <div className={`${prefix}-step-header`}>
              <div className={`${prefix}-step-indicator`}>{index + 1}</div>
              <div className={`${prefix}-step-label`}>{step.title}</div>
            </div>
            <div className={`${prefix}-step-content ${index === currentStep ? 'visible' : ''}`}>
              {index === currentStep && (
                <>
                  {validationError && shouldShowError && (
                    <div className="validation-error" data-cy={`${dataCy}-validation-error`}>
                      {validationError}
                    </div>
                  )}
                  {children}
                </>
              )}
            </div>
          </div>
        ))
      )}

      <div className={`${prefix}-stepper-actions`}>
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
          label={isLastStep ? submitButtonText : 'Next'}
          onClick={handleClick}
          className={!isValid ? 'button-with-tooltip disabled' : ''}
          data-cy={isLastStep ? `${dataCy}-submit-button` : `${dataCy}-continue-button-${currentStep}`}
          type={isLastStep ? 'submit' : 'button'}
          loading={isSubmitting && isLastStep}
          disabled={isSubmitting && isLastStep}
        />
      </div>
    </div>
  );
};

export default Stepper;
