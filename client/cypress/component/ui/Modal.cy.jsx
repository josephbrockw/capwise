import React from 'react';
import Modal from '../../../src/components/ui/Modal';
import Button from '../../../src/components/ui/Button/Button';

describe('Modal Component', () => {
  it('renders when visible is true', () => {
    cy.mount(
      <Modal
        title="Test Modal"
        visible={true}
        onClose={() => {}}
      >
        <div className="test-content">Modal content</div>
      </Modal>
    );

    cy.get('.modal-overlay').should('exist');
    cy.get('.modal-overlay').should('have.class', 'visible');
    cy.get('.modal-container').should('exist');
    cy.get('.modal-title').should('contain', 'Test Modal');
    cy.get('.test-content').should('contain', 'Modal content');
  });

  it('does not render when visible is false', () => {
    cy.mount(
      <Modal
        title="Test Modal"
        visible={false}
        onClose={() => {}}
      >
        <div>Modal content</div>
      </Modal>
    );

    cy.get('.modal-overlay').should('not.exist');
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <Modal
        title="Close Test"
        visible={true}
        onClose={onCloseSpy}
      >
        <div>Content</div>
      </Modal>
    );

    cy.get('.modal-close-button').click();
    cy.get('@onCloseSpy').should('have.been.calledOnce');
  });

  it('calls onClose when overlay is clicked and dismissable is true', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <Modal
        title="Dismissable Test"
        visible={true}
        onClose={onCloseSpy}
        dismissable={true}
      >
        <div>Content</div>
      </Modal>
    );

    // Click the overlay (not the modal content)
    cy.get('.modal-overlay').click('top');
    cy.get('@onCloseSpy').should('have.been.calledOnce');
  });

  it('does not call onClose when overlay is clicked and dismissable is false', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <Modal
        title="Non-Dismissable Test"
        visible={true}
        onClose={onCloseSpy}
        dismissable={false}
      >
        <div>Content</div>
      </Modal>
    );

    // Click the overlay (not the modal content)
    cy.get('.modal-overlay').click('top');
    cy.get('@onCloseSpy').should('not.have.been.called');
  });

  it('calls onClose when Escape key is pressed and dismissable is true', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <Modal
        title="Escape Key Test"
        visible={true}
        onClose={onCloseSpy}
        dismissable={true}
      >
        <div>Content</div>
      </Modal>
    );

    cy.get('body').type('{esc}');
    cy.get('@onCloseSpy').should('have.been.calledOnce');
  });

  it('does not call onClose when Escape key is pressed and dismissable is false', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <Modal
        title="Escape Key Disabled Test"
        visible={true}
        onClose={onCloseSpy}
        dismissable={false}
      >
        <div>Content</div>
      </Modal>
    );

    cy.get('body').type('{esc}');
    cy.get('@onCloseSpy').should('not.have.been.called');
  });

  it('renders with custom footer', () => {
    cy.mount(
      <Modal
        title="Footer Test"
        visible={true}
        onClose={() => {}}
        footer={
          <div className="test-footer">
            <Button label="Cancel" className="button-text" />
            <Button label="Submit" className="button-primary" />
          </div>
        }
      >
        <div>Content with footer</div>
      </Modal>
    );

    cy.get('.modal-footer').should('exist');
    cy.get('.test-footer').should('exist');
    cy.get('.test-footer .button-text').should('contain', 'Cancel');
    cy.get('.test-footer .button-primary').should('contain', 'Submit');
  });

  it('does not render footer when not provided', () => {
    cy.mount(
      <Modal
        title="No Footer Test"
        visible={true}
        onClose={() => {}}
      >
        <div>Content without footer</div>
      </Modal>
    );

    cy.get('.modal-footer').should('not.exist');
  });

  it('applies custom className', () => {
    cy.mount(
      <Modal
        title="Custom Class"
        visible={true}
        onClose={() => {}}
        className="custom-modal"
      >
        <div>Content</div>
      </Modal>
    );

    cy.get('.modal-container').should('have.class', 'custom-modal');
  });

  it('renders without title', () => {
    cy.mount(
      <Modal
        visible={true}
        onClose={() => {}}
      >
        <div>Content without title</div>
      </Modal>
    );

    cy.get('.modal-header').should('exist'); // Header still exists for close button
    cy.get('.modal-title').should('not.exist');
  });
});
