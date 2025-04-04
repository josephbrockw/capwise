import React from 'react';
import ConfirmationModal from '../../../src/components/ui/ConfirmationModal';

describe('ConfirmationModal Component', () => {
  it('renders when visible is true', () => {
    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    cy.get('.modal-overlay').should('exist');
    cy.get('.modal-overlay').should('have.class', 'visible');
    cy.get('.confirmation-modal').should('exist');
    cy.get('.modal-title').should('contain', 'Confirm Action');
    cy.get('.confirmation-modal-content p').should('contain', 'Are you sure you want to proceed?');
  });

  it('does not render when visible is false', () => {
    cy.mount(
      <ConfirmationModal
        visible={false}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    cy.get('.modal-overlay').should('not.exist');
  });

  it('renders default button labels', () => {
    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    cy.get('.modal-footer button').eq(0).should('contain', 'Cancel');
    cy.get('.modal-footer button').eq(1).should('contain', 'Confirm');
  });

  it('renders custom button labels', () => {
    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    cy.get('.modal-footer button').eq(0).should('contain', 'Keep');
    cy.get('.modal-footer button').eq(1).should('contain', 'Delete');
  });

  it('applies default confirm button class', () => {
    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    cy.get('.modal-footer button').eq(1).should('have.class', 'button-danger');
  });

  it('applies custom confirm button class', () => {
    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        confirmButtonClass="button-primary"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    cy.get('.modal-footer button').eq(1).should('have.class', 'button-primary');
    cy.get('.modal-footer button').eq(1).should('not.have.class', 'button-danger');
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirmSpy = cy.spy().as('onConfirmSpy');

    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={onConfirmSpy}
        onCancel={() => {}}
      />
    );

    cy.get('.modal-footer button').eq(1).click();
    cy.get('@onConfirmSpy').should('have.been.calledOnce');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancelSpy = cy.spy().as('onCancelSpy');

    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={onCancelSpy}
      />
    );

    cy.get('.modal-footer button').eq(0).click();
    cy.get('@onCancelSpy').should('have.been.calledOnce');
  });

  it('calls onCancel when close button is clicked', () => {
    const onCancelSpy = cy.spy().as('onCancelSpy');

    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={onCancelSpy}
      />
    );

    cy.get('.modal-close-button').click();
    cy.get('@onCancelSpy').should('have.been.calledOnce');
  });

  it('disables buttons when isLoading is true', () => {
    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
        isLoading={true}
      />
    );

    cy.get('.modal-footer button').eq(0).should('be.disabled');
    cy.get('.modal-footer button').eq(1).should('be.disabled');
  });

  it('shows loading state on confirm button when isLoading is true', () => {
    cy.mount(
      <ConfirmationModal
        visible={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
        isLoading={true}
      />
    );

    // Assuming the Button component shows a loading indicator when loading prop is true
    cy.get('.modal-footer button').eq(1).should('have.attr', 'disabled');
    // Check for loading indicator - this might need adjustment based on how your Button component shows loading state
    // For example, it might add a specific class or show a spinner element
  });
});
