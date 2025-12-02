import React from 'react';
import { mount } from 'cypress/react';
import Chip from '../../src/components/ui/Chip/Chip';

describe('Chip Component', () => {
  it('renders with label', () => {
    cy.mount(<Chip label="Test Label" />);
    cy.get('.chip').should('exist');
    cy.get('.chip-label').should('contain', 'Test Label');
  });

  it('does not render delete button when onDelete is not provided', () => {
    cy.mount(<Chip label="Test Label" />);
    cy.get('.chip-delete').should('not.exist');
  });

  it('renders delete button when onDelete is provided', () => {
    const onDelete = cy.stub().as('onDelete');
    cy.mount(<Chip label="Test Label" onDelete={onDelete} />);
    cy.get('.chip-delete').should('exist');
    cy.get('.chip-delete').should('have.attr', 'aria-label', 'Remove');
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = cy.stub().as('onDelete');
    cy.mount(<Chip label="Test Label" onDelete={onDelete} />);
    cy.get('.chip-delete').click();
    cy.get('@onDelete').should('have.been.calledOnce');
  });

  it('renders × symbol in delete button', () => {
    cy.mount(<Chip label="Test Label" onDelete={() => {}} />);
    cy.get('.chip-delete').should('contain', '×');
  });

  it('maintains accessibility attributes', () => {
    cy.mount(<Chip label="Test Label" onDelete={() => {}} />);
    cy.get('.chip-delete').should('have.attr', 'aria-label', 'Remove');
  });
});
