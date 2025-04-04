import React from 'react';
import EmptyState from '../../../src/components/ui/EmptyState';

describe('EmptyState Component', () => {
  it('renders with title and message', () => {
    cy.mount(
      <EmptyState
        title="No Data Available"
        message="There are no items to display at this time."
      />
    );

    cy.get('.empty-state').should('exist');
    cy.get('.empty-state-title').should('contain', 'No Data Available');
    cy.get('.empty-state-message').should('contain', 'There are no items to display at this time.');
    cy.get('.empty-state-icon').should('have.class', 'pi pi-info-circle'); // Default icon
  });

  it('renders with custom icon', () => {
    cy.mount(
      <EmptyState
        title="No Results"
        message="Your search did not match any results."
        icon="pi pi-search"
      />
    );

    cy.get('.empty-state-icon').should('have.class', 'pi pi-search');
  });

  it('renders without icon when icon prop is empty', () => {
    cy.mount(
      <EmptyState
        title="No Results"
        message="Your search did not match any results."
        icon=""
      />
    );

    cy.get('.empty-state-icon').should('not.exist');
  });

  it('renders with action button and triggers callback when clicked', () => {
    const actionSpy = cy.spy().as('actionSpy');

    cy.mount(
      <EmptyState
        title="No Items"
        message="You don't have any items yet."
        actionLabel="Add Item"
        onAction={actionSpy}
      />
    );

    cy.get('.empty-state-action').should('exist');
    cy.get('.empty-state-action').should('contain', 'Add Item');
    cy.get('.empty-state-action').click();
    cy.get('@actionSpy').should('have.been.calledOnce');
  });

  it('does not render action button when only actionLabel is provided', () => {
    cy.mount(
      <EmptyState
        title="No Items"
        message="You don't have any items yet."
        actionLabel="Add Item"
      />
    );

    cy.get('.empty-state-action').should('not.exist');
  });

  it('does not render action button when only onAction is provided', () => {
    const actionSpy = cy.spy().as('actionSpy');

    cy.mount(
      <EmptyState
        title="No Items"
        message="You don't have any items yet."
        onAction={actionSpy}
      />
    );

    cy.get('.empty-state-action').should('not.exist');
  });

  it('applies custom className', () => {
    cy.mount(
      <EmptyState
        title="Custom Styling"
        message="This has custom styling."
        className="custom-empty-state"
      />
    );

    cy.get('.empty-state').should('have.class', 'custom-empty-state');
  });

  it('renders with only title', () => {
    cy.mount(
      <EmptyState title="Only Title" />
    );

    cy.get('.empty-state-title').should('contain', 'Only Title');
    cy.get('.empty-state-message').should('not.exist');
  });

  it('renders with only message', () => {
    cy.mount(
      <EmptyState message="Only message is displayed." />
    );

    cy.get('.empty-state-title').should('not.exist');
    cy.get('.empty-state-message').should('contain', 'Only message is displayed.');
  });

  it('renders with minimal props', () => {
    cy.mount(<EmptyState />);

    cy.get('.empty-state').should('exist');
    cy.get('.empty-state-icon').should('exist');
    cy.get('.empty-state-title').should('not.exist');
    cy.get('.empty-state-message').should('not.exist');
    cy.get('.empty-state-action').should('not.exist');
  });
});
