import React from 'react';
import { mount } from 'cypress/react';
import AddDiscount from '../../src/components/ui/AddDiscount/AddDiscount';

describe('AddDiscount Component', () => {
  const mockFormData = {
    selectedProduct: {
      trial_days: 7
    }
  };

  beforeEach(() => {
    // Mock the Vite environment variable
    window.import = {
      meta: {
        env: {
          VITE_API_BASE_URL: ''  // Empty string since we're testing in isolation
        }
      }
    };

    // Reset network interception before each test
    cy.intercept('POST', '**/api/purchases/check-discount', {
      statusCode: 200,
      body: {
        data: {
          id: 1,
          code: 'TEST10',
          percentage: 10,
          money: null,
          trial_days: 30,
          product: null
        }
      }
    }).as('checkDiscount');
  });

  afterEach(() => {
    // Clean up the mock
    delete window.import;
  });

  it('renders initial state correctly', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    mount(<AddDiscount onApplyDiscount={onApplyDiscount} formData={mockFormData} />);
    cy.contains('Have a discount code?').should('be.visible');
    cy.get('.discount-form').should('not.exist');
  });

  it('expands form when clicking discount link', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    mount(<AddDiscount onApplyDiscount={onApplyDiscount} formData={mockFormData} />);
    cy.contains('Have a discount code?').click();
    cy.get('.discount-form').should('be.visible');
    cy.get('input[placeholder="Enter discount code"]').should('be.visible');
  });

  it('focuses input when form expands', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    mount(<AddDiscount onApplyDiscount={onApplyDiscount} formData={mockFormData} />);
    cy.contains('Have a discount code?').click();
    cy.get('input[placeholder="Enter discount code"]').should('be.focused');
  });

  it('converts input to uppercase', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    mount(<AddDiscount onApplyDiscount={onApplyDiscount} formData={mockFormData} />);
    cy.contains('Have a discount code?').click();
    cy.get('input[placeholder="Enter discount code"]').type('test10');
    cy.get('input[placeholder="Enter discount code"]').should('have.value', 'TEST10');
  });

  it('successfully applies valid discount code', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    mount(<AddDiscount onApplyDiscount={onApplyDiscount} formData={mockFormData} />);
    cy.contains('Have a discount code?').click();
    cy.get('input[placeholder="Enter discount code"]').type('TEST10');
    cy.get('[data-cy="apply-button"]').click();

    cy.wait('@checkDiscount');

    // Check if the chip is displayed with correct text
    cy.get('.discount-section').contains('TEST10 (10% off)').should('be.visible');

    // Verify callback was called with correct data
    cy.get('@onApplyDiscount').should('have.been.calledWith', {
      discountCode: {
        id: 1,
        code: 'TEST10',
        percentage: 10,
        money: null,
        trial_days: 30,
        product: null
      },
      trialDays: 30
    });
  });

  it('handles error response from API', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    cy.intercept({
      method: 'POST',
      url: '**/api/purchases/check-discount',
      middleware: true,
    }, (req) => {
      req.reply({
        statusCode: 400,
        body: {
          error: 'Invalid discount code'
        }
      });
    }).as('invalidDiscount');

    mount(<AddDiscount onApplyDiscount={onApplyDiscount} formData={mockFormData} />);
    cy.contains('Have a discount code?').click();
    cy.get('input[placeholder="Enter discount code"]').type('INVALID');
    cy.get('.apply-button').click();

    cy.wait('@invalidDiscount');
    cy.contains('Invalid discount code').should('be.visible');
    cy.get('input[placeholder="Enter discount code"]').should('have.value', '');
  });

  it('removes discount when clicking delete on chip', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    mount(
      <AddDiscount
        onApplyDiscount={onApplyDiscount}
        formData={mockFormData}
        initialCode={{
          id: 1,
          code: 'TEST10',
          percentage: 10,
          money: null,
          trial_days: 30,
          product: null
        }}
      />
    );

    // Chip should be visible with discount
    cy.get('.discount-section').contains('TEST10 (10% off)').should('be.visible');

    // Click delete button
    cy.get('.chip-delete').click();

    // Verify chip is removed and link is shown again
    cy.contains('Have a discount code?').should('be.visible');
    cy.get('.discount-section').contains('TEST10').should('not.exist');

    // Verify callback was called with reset values
    cy.get('@onApplyDiscount').should('have.been.calledWith', {
      discountCode: null,
      trialDays: 7
    });
  });

  it('submits on Enter key press', () => {
    const onApplyDiscount = cy.stub().as('onApplyDiscount');
    mount(<AddDiscount onApplyDiscount={onApplyDiscount} formData={mockFormData} />);
    cy.contains('Have a discount code?').click();
    cy.get('input[placeholder="Enter discount code"]').type('TEST10{enter}');

    cy.wait('@checkDiscount');
    cy.get('.discount-section').contains('TEST10 (10% off)').should('be.visible');
  });
});
