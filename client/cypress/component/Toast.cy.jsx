import Toast from '../../src/components/ui/Toast/Toast';

describe('Toast Component', () => {
  it('renders with default props', () => {
    cy.mount(<Toast message="Test message" data-cy="test-toast" />);

    cy.get('[data-cy="test-toast"]')
      .should('exist')
      .and('have.class', 'toast')
      .and('have.class', 'toast-normal');

    cy.get('.toast-message')
      .should('have.text', 'Test message');
  });

  it('renders different types correctly', () => {
    const types = ['success', 'error', 'normal'];

    types.forEach(type => {
      cy.mount(
        <Toast
          message={`${type} message`}
          type={type}
          data-cy={`${type}-toast`}
        />
      );

      cy.get(`[data-cy="${type}-toast"]`)
        .should('have.class', `toast-${type}`);
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = cy.stub().as('onClose');

    cy.mount(
      <Toast
        message="Test message"
        onClose={onClose}
        data-cy="close-test-toast"
      />
    );

    cy.get('[data-cy="close-test-toast-close"]').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('auto-dismisses after specified duration', () => {
    const onClose = cy.stub().as('onClose');
    const duration = 500; // Short duration for testing

    cy.mount(
      <Toast
        message="Test message"
        duration={duration}
        onClose={onClose}
        data-cy="auto-dismiss-toast"
      />
    );

    // Wait for slightly longer than the duration
    cy.wait(duration + 100);
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('does not auto-dismiss if duration is 0', () => {
    const onClose = cy.stub().as('onClose');

    cy.mount(
      <Toast
        message="Test message"
        duration={0}
        onClose={onClose}
        data-cy="no-dismiss-toast"
      />
    );

    // Wait for some time
    cy.wait(1000);
    cy.get('@onClose').should('not.have.been.called');
  });

  it('applies custom className correctly', () => {
    cy.mount(
      <Toast
        message="Test message"
        className="custom-class"
        data-cy="custom-class-toast"
      />
    );

    cy.get('[data-cy="custom-class-toast"]')
      .should('have.class', 'custom-class');
  });

  it('has proper accessibility attributes', () => {
    const onClose = cy.stub();

    cy.mount(
      <Toast
        message="Test message"
        onClose={onClose}
        data-cy="accessibility-toast"
      />
    );

    cy.get('[data-cy="accessibility-toast"]')
      .should('have.attr', 'role', 'alert');

    cy.get('[data-cy="accessibility-toast-close"]')
      .should('have.attr', 'aria-label', 'Close message');
  });

  it('handles long messages properly', () => {
    const longMessage = 'This is a very long message that should still be displayed properly without breaking the layout of the toast component and should maintain readability';

    cy.mount(
      <Toast
        message={longMessage}
        data-cy="long-message-toast"
      />
    );

    cy.get('[data-cy="long-message-toast"]')
      .should('exist')
      .and('be.visible');

    cy.get('.toast-message')
      .should('have.text', longMessage);
  });

  it('maintains close button functionality with long messages', () => {
    const longMessage = 'This is a very long message that should still be displayed properly without breaking the layout of the toast component and should maintain readability';
    const onClose = cy.stub().as('onClose');

    cy.mount(
      <Toast
        message={longMessage}
        onClose={onClose}
        data-cy="long-message-close-toast"
      />
    );

    cy.get('[data-cy="long-message-close-toast-close"]')
      .should('be.visible')
      .click();

    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('handles multiple rapid close attempts', () => {
    const onClose = cy.stub().as('onClose');

    cy.mount(
      <Toast
        message="Test message"
        onClose={onClose}
        data-cy="multi-close-toast"
      />
    );

    // Attempt rapid clicks with a small delay
    cy.get('[data-cy="multi-close-toast-close"]').as('closeButton')
      .click();

    // Verify first click worked and button is disabled
    cy.get('@onClose').should('have.been.calledOnce');
    cy.get('@closeButton').should('be.disabled');

    // Try to click again with force (this shouldn't trigger onClose)
    cy.get('@closeButton')
      .click({ force: true })
      .click({ force: true });

    // Verify onClose was still only called once
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('cleans up timer on unmount', () => {
    const onClose = cy.stub().as('onClose');

    // Mount with short duration
    cy.mount(
      <Toast
        message="Test message"
        duration={500}
        onClose={onClose}
        data-cy="unmount-toast"
      />
    );

    // Unmount immediately
    cy.mount(null);

    // Wait longer than duration
    cy.wait(1000);

    // onClose should not have been called after unmount
    cy.get('@onClose').should('not.have.been.called');
  });
});
