import React from 'react';
import LoadingSpinner from '../../../src/components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    cy.mount(<LoadingSpinner />);

    cy.get('.loading-spinner-container').should('exist');
    cy.get('.loading-spinner-container').should('have.class', 'medium'); // Default size
    cy.get('.spinner-animation').should('exist');
    cy.get('.loading-message').should('not.exist'); // No message by default
  });

  it('renders with a message', () => {
    const message = 'Loading data...';
    cy.mount(<LoadingSpinner message={message} />);

    cy.get('.loading-message').should('exist');
    cy.get('.loading-message').should('contain', message);
  });

  it('applies small size class', () => {
    cy.mount(<LoadingSpinner size="small" />);

    cy.get('.loading-spinner-container').should('have.class', 'small');
    cy.get('.loading-spinner-container').should('not.have.class', 'medium');
    cy.get('.loading-spinner-container').should('not.have.class', 'large');
  });

  it('applies medium size class', () => {
    cy.mount(<LoadingSpinner size="medium" />);

    cy.get('.loading-spinner-container').should('have.class', 'medium');
    cy.get('.loading-spinner-container').should('not.have.class', 'small');
    cy.get('.loading-spinner-container').should('not.have.class', 'large');
  });

  it('applies large size class', () => {
    cy.mount(<LoadingSpinner size="large" />);

    cy.get('.loading-spinner-container').should('have.class', 'large');
    cy.get('.loading-spinner-container').should('not.have.class', 'small');
    cy.get('.loading-spinner-container').should('not.have.class', 'medium');
  });

  it('applies custom className', () => {
    cy.mount(<LoadingSpinner className="custom-spinner" />);

    cy.get('.loading-spinner-container').should('have.class', 'custom-spinner');
  });

  it('combines size and custom className', () => {
    cy.mount(
      <LoadingSpinner
        size="large"
        className="custom-spinner"
      />
    );

    cy.get('.loading-spinner-container').should('have.class', 'large');
    cy.get('.loading-spinner-container').should('have.class', 'custom-spinner');
  });

  it('renders with message and custom size', () => {
    const message = 'Please wait...';
    cy.mount(
      <LoadingSpinner
        message={message}
        size="small"
      />
    );

    cy.get('.loading-spinner-container').should('have.class', 'small');
    cy.get('.loading-message').should('contain', message);
  });
});
