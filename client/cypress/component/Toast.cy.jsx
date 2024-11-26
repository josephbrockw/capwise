import React from 'react';
import Toast from '../../src/components/ui/Toast/Toast';

describe('Toast Component', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      message: 'Test message',
      type: 'normal',
      onClose: cy.stub().as('onClose'),
    };
    cy.clock();
  });

  it('renders with default props', () => {
    cy.mount(<Toast {...defaultProps} />);
    cy.get('.toast').should('exist');
    cy.get('.toast-content').should('contain', defaultProps.message);
    cy.get('.toast').should('have.class', 'toast-normal');
  });

  it('renders different types correctly', () => {
    cy.mount(<Toast {...defaultProps} type="success" />);
    cy.get('.toast').should('have.class', 'toast-success');

    cy.mount(<Toast {...defaultProps} type="error" />);
    cy.get('.toast').should('have.class', 'toast-error');
  });

  it('auto-closes after duration', () => {
    cy.mount(<Toast {...defaultProps} duration={1000} />);
    cy.tick(1000);
    cy.get('@onClose').should('have.been.called');
  });

  it('closes on button click', () => {
    cy.mount(<Toast {...defaultProps} />);
    cy.get('.toast-close').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('disables close button after clicking', () => {
    cy.mount(<Toast {...defaultProps} />);
    cy.get('.toast-close').click();
    cy.get('.toast-close').should('be.disabled');
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('passes through data-cy attributes', () => {
    cy.mount(<Toast {...defaultProps} data-cy="success-message" />);
    cy.get('[data-cy="success-message"]').should('exist');
    cy.get('[data-cy="success-message-close"]').should('exist');
  });

  it('does not auto-close with duration of 0', () => {
    cy.mount(<Toast {...defaultProps} duration={0} />);
    cy.tick(5000);
    cy.get('@onClose').should('not.have.been.called');
  });
});
