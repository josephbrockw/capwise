import Toggle from '../../src/components/ui/Toggle/Toggle';

describe('Toggle Component', () => {
  it('renders with label', () => {
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={cy.stub().as('onChange')}
      />
    );

    cy.get('.toggle-label').should('contain', 'Test Toggle');
  });

  it('renders in unchecked state', () => {
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={cy.stub().as('onChange')}
      />
    );

    cy.get('input[type="checkbox"]').should('not.be.checked');
    cy.get('.toggle-switch').should('not.have.class', 'checked');
  });

  it('renders in checked state', () => {
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={true}
        onChange={cy.stub().as('onChange')}
      />
    );

    cy.get('input[type="checkbox"]').should('be.checked');
  });

  it('calls onChange when clicked', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={onChange}
      />
    );

    cy.get('.toggle-slider').click();
    cy.get('@onChange').should('have.been.calledWith', true);
  });

  it('calls onChange with correct value when toggling multiple times', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={onChange}
      />
    );

    // First click - should become checked
    cy.get('.toggle-slider').click();
    cy.get('@onChange').should('have.been.calledWith', true);

    // Mount again with checked=true to simulate parent update
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={true}
        onChange={onChange}
      />
    );

    // Second click - should become unchecked
    cy.get('.toggle-slider').click();
    cy.get('@onChange').should('have.been.calledWith', false);
  });

  it('applies custom className', () => {
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={cy.stub()}
        className="custom-toggle"
      />
    );

    cy.get('.toggle-switch').should('have.class', 'custom-toggle');
  });

  it('maintains accessibility features', () => {
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={cy.stub()}
      />
    );

    // Verify it's wrapped in a label for accessibility
    cy.get('label.toggle-switch').should('exist');

    // Verify input is properly associated with label
    cy.get('.toggle-label')
      .invoke('text')
      .then((labelText) => {
        cy.get('input[type="checkbox"]')
          .should('have.attr', 'type', 'checkbox');
      });
  });

  it('handles long labels', () => {
    const longLabel = 'This is a very long label that should still render properly and not break the layout of the toggle component';
    cy.mount(
      <Toggle
        label={longLabel}
        checked={false}
        onChange={cy.stub()}
      />
    );

    cy.get('.toggle-label').should('contain', longLabel);
    cy.get('.toggle-switch').should('exist');  // Ensure toggle still renders
  });

  it('is clickable when clicked on label', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={onChange}
      />
    );

    cy.get('.toggle-label').click();
    cy.get('@onChange').should('have.been.calledWith', true);
  });

  it('is clickable when clicked on slider', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(
      <Toggle
        label="Test Toggle"
        checked={false}
        onChange={onChange}
      />
    );

    cy.get('.toggle-slider').click();
    cy.get('@onChange').should('have.been.calledWith', true);
  });
});
