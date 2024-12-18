import React, { useState } from 'react';
import VerticalStepper from './VerticalStepper';

describe('VerticalStepper Component', () => {
  const mockSteps = [
    {
      title: 'Step 1',
      validate: (data) => ({
        isValid: data?.step1?.length > 0,
        error: 'Step 1 is required'
      })
    },
    {
      title: 'Step 2',
      validate: (data) => ({
        isValid: data?.step2?.length > 0,
        error: 'Step 2 is required'
      })
    },
    {
      title: 'Step 3',
      validate: (data) => ({
        isValid: data?.step3?.length > 0,
        error: 'Step 3 is required'
      })
    }
  ];

  const TestWrapper = ({ initialStep = 0, initialData = {}, disableInvalidButtons = true }) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [formData, setFormData] = useState(initialData);

    const handleInputChange = (step, value) => {
      setFormData(prev => ({
        ...prev,
        [step]: value
      }));
    };

    return (
      <VerticalStepper
        steps={mockSteps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSubmit={cy.stub().as('onSubmit')}
        formData={formData}
        dataCy="test-stepper"
        disableInvalidButtons={disableInvalidButtons}
      >
        <input
          type="text"
          value={formData[`step${currentStep + 1}`] || ''}
          onChange={(e) => handleInputChange(`step${currentStep + 1}`, e.target.value)}
          data-cy={`step${currentStep + 1}-input`}
        />
      </VerticalStepper>
    );
  };

  it('renders initial step correctly', () => {
    cy.mount(<TestWrapper />);

    // Check step indicators
    cy.get('.vertical-step').should('have.length', 3);
    cy.get('.vertical-step.active').should('have.length', 1);
    cy.get('.vertical-step-indicator').first().should('contain', '1');

    // Check step labels
    cy.get('.vertical-step-label').should('be.visible')
      .and('contain', 'Step 1')
      .and('contain', 'Step 2')
      .and('contain', 'Step 3');

    // Check input and buttons
    cy.get('[data-cy="step1-input"]').should('be.visible');
    cy.get('[data-cy="test-stepper-continue-button-0"]').should('be.visible').and('be.disabled');
    cy.get('[data-cy="test-stepper-back-button"]').should('not.exist');
  });

  it('shows validation error on empty input', () => {
    cy.mount(<TestWrapper disableInvalidButtons={false} />);

    // Try to proceed without input
    cy.get('[data-cy="test-stepper-continue-button-0"]').click();

    // Check for validation error
    cy.get('[data-cy="test-stepper-validation-error"]')
      .should('be.visible')
      .and('contain', 'Step 1 is required');
  });

  it('handles step navigation correctly', () => {
    cy.mount(<TestWrapper />);

    // Fill and submit step 1
    cy.get('[data-cy="step1-input"]').type('Step 1 data');
    cy.get('[data-cy="test-stepper-continue-button-0"]').click();

    // Verify step 2 is active
    cy.get('.vertical-step').eq(1).should('have.class', 'active');
    cy.get('[data-cy="step2-input"]').should('be.visible');
    cy.get('[data-cy="test-stepper-back-button"]').should('be.visible');

    // Go back to step 1
    cy.get('[data-cy="test-stepper-back-button"]').click();
    cy.get('.vertical-step').eq(0).should('have.class', 'active');
  });

  it('preserves form data between steps', () => {
    cy.mount(<TestWrapper />);

    // Fill step 1
    cy.get('[data-cy="step1-input"]').type('Step 1 data');
    cy.get('[data-cy="test-stepper-continue-button-0"]').click();

    // Fill step 2
    cy.get('[data-cy="step2-input"]').type('Step 2 data');

    // Go back to step 1
    cy.get('[data-cy="test-stepper-back-button"]').click();

    // Verify step 1 data is preserved
    cy.get('[data-cy="step1-input"]').should('have.value', 'Step 1 data');

    // Go forward and verify step 2 data is preserved
    cy.get('[data-cy="test-stepper-continue-button-0"]').click();
    cy.get('[data-cy="step2-input"]').should('have.value', 'Step 2 data');
  });

  it('shows submit button on last step', () => {
    const initialData = {
      step1: 'Step 1 data',
      step2: 'Step 2 data'
    };
    cy.mount(<TestWrapper initialStep={2} initialData={initialData} />);

    // Fill last step
    cy.get('[data-cy="step3-input"]').type('Step 3 data');

    // Verify submit button is shown
    cy.get('[data-cy="test-stepper-submit-button"]')
      .should('be.visible')
      .and('not.be.disabled')
      .and('contain', 'Submit');
  });

  it('calls onSubmit with complete form data', () => {
    const initialData = {
      step1: 'Step 1 data',
      step2: 'Step 2 data'
    };
    cy.mount(<TestWrapper initialStep={2} initialData={initialData} />);

    // Fill and submit last step
    cy.get('[data-cy="step3-input"]').type('Step 3 data');
    cy.get('[data-cy="test-stepper-submit-button"]').click();

    // Verify onSubmit was called
    cy.get('@onSubmit').should('have.been.called');
  });

  it('validates all previous steps before allowing next', () => {
    cy.mount(<TestWrapper initialStep={1} disableInvalidButtons={false} />);

    // Try to fill step 2 without step 1
    cy.get('[data-cy="step2-input"]').type('Step 2 data');
    cy.get('[data-cy="test-stepper-continue-button-1"]').click();

    // Should show validation error for step 1
    cy.get('[data-cy="test-stepper-validation-error"]').should('contain', 'Step 1 is required');
  });

  it('updates validation error on input change', () => {
    cy.mount(<TestWrapper disableInvalidButtons={false} />);

    // Click next to show error
    cy.get('[data-cy="test-stepper-continue-button-0"]').click();
    cy.get('[data-cy="test-stepper-validation-error"]').should('be.visible');

    // Type valid input and verify error disappears
    cy.get('[data-cy="step1-input"]').type('Step 1 data');
    cy.get('[data-cy="test-stepper-validation-error"]').should('not.exist');
  });
});
