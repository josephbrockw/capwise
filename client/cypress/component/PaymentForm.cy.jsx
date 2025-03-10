import React from 'react';
import { mount } from 'cypress/react';
import PaymentForm from '../../src/components/ui/PaymentForm/PaymentForm';
import { Elements } from '@stripe/react-stripe-js';

// Mock the Stripe hooks directly in the component
const mockUseStripe = () => ({
  createPaymentMethod: () => Promise.resolve({ paymentMethod: { id: 'pm_123' } })
});

const mockUseElements = () => ({
  getElement: () => ({
    mount: () => {},
    unmount: () => {},
    destroy: () => {},
    update: () => {},
    on: () => {},
    off: () => {},
    clear: () => {}
  })
});

// Mock the CardElement component
const MockCardElement = ({ onChange }) => {
  return (
    <div className="stripe-element">Mock Card Element</div>
  );
};

// Create a wrapper component with mocked Stripe context and ref
const TestPaymentForm = React.forwardRef((props, ref) => {
  const formRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    setError: (error) => {
      if (formRef.current) {
        formRef.current.setError(error);
      }
    },
    setProcessing: (processing) => {
      if (formRef.current) {
        formRef.current.setProcessing(processing);
      }
    }
  }));

  return (
    <Elements stripe={null}>
      <PaymentForm
        {...props}
        ref={formRef}
        CardElement={MockCardElement}
      />
    </Elements>
  );
});

describe('PaymentForm Component', () => {
  const mockFormData = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    selectedProduct: {
      trial_days: 7
    },
    trialDays: 7
  };

  it('renders payment form in edit mode when no payment method exists', () => {
    const onSubmit = cy.stub().as('onSubmit');
    mount(<TestPaymentForm onSubmit={onSubmit} formData={mockFormData} />);

    cy.get('.card-element-container').should('exist');
    cy.get('.trial-notice').should('contain', '7-day free trial');
  });

  it('renders saved card view when payment method exists', () => {
    const onSubmit = cy.stub().as('onSubmit');
    const formDataWithPayment = {
      ...mockFormData,
      payment_method_id: 'pm_123'
    };

    mount(<TestPaymentForm onSubmit={onSubmit} formData={formDataWithPayment} />);

    cy.get('.saved-payment-method').should('exist');
    cy.get('.payment-info').should('contain', 'Card saved securely');
    cy.get('.reset-button').should('exist');
  });

  it('handles "Use Different Card" click correctly', () => {
    const onSubmit = cy.stub().as('onSubmit');
    const formDataWithPayment = {
      ...mockFormData,
      payment_method_id: 'pm_123'
    };

    mount(<TestPaymentForm onSubmit={onSubmit} formData={formDataWithPayment} />);

    // Click the reset button
    cy.get('.reset-button').click();

    // First, verify onSubmit was called once
    cy.get('@onSubmit').should('be.calledOnce');

    // Then, examine the arguments in detail
    cy.get('@onSubmit').then(stub => {
      const actualArgs = stub.firstCall.args[0];
      const expectedArgs = {
        ...formDataWithPayment,
        payment_method_id: null
      };

      // Find all keys in both objects
      const allKeys = new Set([...Object.keys(expectedArgs), ...Object.keys(actualArgs)]);

      // Compare each key
      allKeys.forEach(key => {
        const expectedValue = expectedArgs[key];
        const actualValue = actualArgs[key];
      });

      // Now do the assertion
      expect(actualArgs).to.deep.equal(expectedArgs);
    });

    cy.get('.card-element-container').should('exist');
  });

  it('shows trial notice when trial days exist', () => {
    const onSubmit = cy.stub().as('onSubmit');
    const formDataWithTrial = {
      ...mockFormData,
      trialDays: 14
    };

    mount(<TestPaymentForm onSubmit={onSubmit} formData={formDataWithTrial} />);

    cy.get('.trial-notice').should('contain', '14-day free trial');
  });

  it('handles discount application', () => {
    const onSubmit = cy.stub().as('onSubmit');
    const discountData = {
      code: 'TEST10',
      percentage: 10,
      trial_days: 30
    };

    // Mock the axios post request
    cy.intercept({
      method: 'POST',
      url: '**/api/purchases/check-discount'
    }, {
      statusCode: 200,
      body: {
        data: discountData
      }
    }).as('checkDiscount');

    mount(
      <TestPaymentForm
        onSubmit={onSubmit}
        formData={mockFormData}
      />
    );

    // Click to expand discount section
    cy.get('.discount-section .discount-link').click();

    // Type discount code
    cy.get('.discount-section input').type('TEST10');

    // Press Enter to submit
    cy.get('.discount-section input').type('{enter}');

    // Wait for the API call
    cy.wait('@checkDiscount');

    // Verify the call
    cy.get('@onSubmit').should('be.calledOnce');
    cy.get('@onSubmit').should('be.calledWith', {
      ...mockFormData,
      discountCode: discountData,
      trialDays: discountData.trial_days
    });

    // Verify the discount chip is shown
    cy.get('.discount-section .chip').should('contain', 'TEST10 (10% off)');
  });

  it('handles card validation states', () => {
    const onSubmit = cy.stub().as('onSubmit');
    const formRef = React.createRef();

    // Mount with ref
    mount(<TestPaymentForm ref={formRef} onSubmit={onSubmit} formData={mockFormData} />);

    // Test error state
    cy.get('.card-element-container').should('exist').then(() => {
      formRef.current.setError('Invalid card number');
    });

    // Verify error message appears
    cy.get('[data-cy="payment-error"]').should('contain', 'Invalid card number');

    // Test processing state
    cy.get('.card-element-container').then(() => {
      formRef.current.setProcessing(true);
    });

    // Verify processing message appears
    cy.get('.processing-message').should('contain', 'Validating card...');
  });
});
