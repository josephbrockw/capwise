import React from 'react';
import HorizontalStepper from '../../../src/components/ui/Stepper/HorizontalStepper';

describe('HorizontalStepper.cy.jsx', () => {
  const mockSteps = [
    { title: 'Step 1', validate: () => ({ isValid: true }) },
    { title: 'Step 2', validate: () => ({ isValid: true }) },
    { title: 'Step 3', validate: () => ({ isValid: true }) },
    { title: 'Step 4', validate: () => ({ isValid: true }) },
  ];

  beforeEach(() => {
    // Reset any previous stubs/spies
    cy.window().then((win) => {
      win.setCurrentStep = undefined;
      win.onSubmit = undefined;
    });
  });

  it('renders all steps when there are 3 or fewer steps', () => {
    const threeSteps = mockSteps.slice(0, 3);
    cy.mount(
      <HorizontalStepper
        steps={threeSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    threeSteps.forEach((step, index) => {
      cy.get('.horizontal-step').eq(index).should('have.class', 'active-adjacent');
    });
  });

  it('shows first three steps when on first step with more than 3 steps', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    // First three steps should be visible
    cy.get('.horizontal-step').eq(0).should('have.class', 'active-adjacent');
    cy.get('.horizontal-step').eq(1).should('have.class', 'active-adjacent');
    cy.get('.horizontal-step').eq(2).should('have.class', 'active-adjacent');
    // Fourth step should not be visible
    cy.get('.horizontal-step').eq(3).should('not.have.class', 'active-adjacent');
  });

  it('shows last three steps when on last step with more than 3 steps', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={3}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    // First step should not be visible
    cy.get('.horizontal-step').eq(0).should('not.have.class', 'active-adjacent');
    // Last three steps should be visible
    cy.get('.horizontal-step').eq(1).should('have.class', 'active-adjacent');
    cy.get('.horizontal-step').eq(2).should('have.class', 'active-adjacent');
    cy.get('.horizontal-step').eq(3).should('have.class', 'active-adjacent');
  });

  it('shows previous, current, and next step when on middle step', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={1}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    cy.get('.horizontal-step').eq(0).should('have.class', 'active-adjacent');
    cy.get('.horizontal-step').eq(1).should('have.class', 'active-adjacent');
    cy.get('.horizontal-step').eq(2).should('have.class', 'active-adjacent');
    cy.get('.horizontal-step').eq(3).should('not.have.class', 'active-adjacent');
  });

  it('handles validation before moving to next step', () => {
    const steps = [
      {
        title: 'Step 1',
        validate: () => ({ isValid: false, error: 'Validation error' })
      },
      { title: 'Step 2' },
    ];

    cy.mount(
      <HorizontalStepper
        steps={steps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    cy.contains('Next').click();
    cy.contains('Validation error').should('be.visible');
    cy.get('@setCurrentStep').should('not.have.been.called');
  });

  it('calls onSubmit when clicking submit on last step with valid data', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={mockSteps.length - 1}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    cy.contains('Submit').click();
    cy.get('@onSubmit').should('have.been.called');
  });

  it('disables next button when disableInvalidButtons is true and step is invalid', () => {
    const steps = [
      {
        title: 'Step 1',
        validate: () => ({ isValid: false, error: 'Validation error' })
      },
      { title: 'Step 2' },
    ];

    cy.mount(
      <HorizontalStepper
        steps={steps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
        disableInvalidButtons={true}
      />
    );

    cy.contains('Next').should('have.class', 'disabled');
  });

  it('renders children content', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      >
        <div data-cy="child-content">Step Content</div>
      </HorizontalStepper>
    );

    cy.get('[data-cy="child-content"]').should('be.visible');
    cy.contains('Step Content').should('be.visible');
  });

  it('applies full-width styling when fullWidth prop is true', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
        fullWidth={true}
      />
    );

    cy.get('.horizontal-stepper-container').should('have.class', 'full-width');
  });

  it('does not apply full-width styling when fullWidth prop is false', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
        fullWidth={false}
      />
    );

    cy.get('.horizontal-stepper-container').should('not.have.class', 'full-width');
  });

  it('does not apply full-width styling when fullWidth prop is omitted', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={0}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
      />
    );

    cy.get('.horizontal-stepper-container').should('not.have.class', 'full-width');
  });

  it('shows disabled state when isSubmitting is true', () => {
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={mockSteps.length - 1}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
        isSubmitting={true}
      />
    );

    cy.get('[data-cy="test-stepper-submit-button"]').should('have.attr', 'disabled');
    cy.get('[data-cy="test-stepper-submit-button"]').should('have.class', 'disabled');
  });

  it('uses custom submit button text when provided', () => {
    const customText = 'Save Character';
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={mockSteps.length - 1}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
        submitButtonText={customText}
      />
    );

    cy.get('[data-cy="test-stepper-submit-button"]').should('contain', customText);
  });

  it('combines isSubmitting and submitButtonText props correctly', () => {
    const customText = 'Create Character';
    cy.mount(
      <HorizontalStepper
        steps={mockSteps}
        currentStep={mockSteps.length - 1}
        setCurrentStep={cy.spy().as('setCurrentStep')}
        onSubmit={cy.spy().as('onSubmit')}
        formData={{}}
        dataCy="test-stepper"
        isSubmitting={true}
        submitButtonText={customText}
      />
    );

    cy.get('[data-cy="test-stepper-submit-button"]').should('contain', customText);
    cy.get('[data-cy="test-stepper-submit-button"]').should('have.attr', 'disabled');
    cy.get('[data-cy="test-stepper-submit-button"]').should('have.class', 'disabled');
  });
});
