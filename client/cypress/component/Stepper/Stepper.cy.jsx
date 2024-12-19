import React from 'react';
import Stepper from '../../../src/components/ui/Stepper/Stepper';

describe('Stepper.cy.jsx', () => {
  const mockSteps = [
    {
      title: 'Step 1',
      validate: (formData) => ({ isValid: formData.step1Valid !== false })
    },
    {
      title: 'Step 2',
      validate: (formData) => ({ isValid: formData.step2Valid !== false })
    },
    {
      title: 'Step 3',
      validate: () => ({ isValid: true })
    }
  ];

  beforeEach(() => {
    cy.window().then((win) => {
      win.setCurrentStep = undefined;
      win.onSubmit = undefined;
    });
  });

  it('renders with default props', () => {
    cy.mount(
      <Stepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    cy.get('[data-cy="test-stepper-continue-button-0"]').should('exist');
  });

  it('handles step navigation correctly', () => {
    const setCurrentStep = cy.spy().as('setCurrentStep');
    cy.mount(
      <Stepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={setCurrentStep}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{ step1Valid: true }}
        dataCy="test-stepper"
      />
    );

    // Click next button
    cy.get('[data-cy="test-stepper-continue-button-0"]').click();
    cy.get('@setCurrentStep').should(spy => {
      expect(spy).to.have.been.called;
      // Get the function that was passed to setCurrentStep
      const updateFn = spy.getCall(0).args[0];
      // Call it with the current step (0) to verify it returns 1
      expect(updateFn(0)).to.equal(1);
    });
  });

  it('prevents navigation on validation failure', () => {
    cy.mount(
      <Stepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{ step1Valid: false }}
        dataCy="test-stepper"
      />
    );

    // Click next button with force since it's disabled
    cy.get('[data-cy="test-stepper-continue-button-0"]').click({ force: true });
    cy.get('@setCurrentStep').should('not.have.been.called');
  });

  it('calls onSubmit on last step', () => {
    cy.mount(
      <Stepper
        steps={mockSteps}
        currentStep={2}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    cy.get('[data-cy="test-stepper-submit"]').click();
    cy.get('@onSubmit').should('have.been.called');
  });

  it('disables buttons when disableInvalidButtons is true', () => {
    cy.mount(
      <Stepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{ step1Valid: false }}
        disableInvalidButtons={true}
        dataCy="test-stepper"
      />
    );

    cy.get('[data-cy="test-stepper-continue-button-0"]').should('be.disabled');
  });

  it('allows back navigation even with validation errors', () => {
    const setCurrentStep = cy.spy().as('setCurrentStep');
    cy.mount(
      <Stepper
        steps={mockSteps}
        currentStep={1}
        setCurrentStep={setCurrentStep}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{ step2Valid: false }}
        dataCy="test-stepper"
      />
    );

    cy.get('[data-cy="test-stepper-back-button-1"]').click();
    cy.get('@setCurrentStep').should(spy => {
      expect(spy).to.have.been.called;
      // Get the function that was passed to setCurrentStep
      const updateFn = spy.getCall(0).args[0];
      // Call it with the current step (1) to verify it returns 0
      expect(updateFn(1)).to.equal(0);
    });
  });
});
