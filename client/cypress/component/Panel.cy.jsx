import Panel from '../../src/components/ui/Panel/Panel';

describe('Panel Component', () => {
  it('renders with header and content', () => {
    cy.mount(
      <Panel header="Test Panel">
        <p>Test content</p>
      </Panel>
    );

    cy.get('.bb-panel-title').should('contain', 'Test Panel');
    cy.get('.bb-panel-content').should('contain', 'Test content');
  });

  it('applies custom className', () => {
    cy.mount(
      <Panel header="Test Panel" className="custom-class">
        <p>Test content</p>
      </Panel>
    );

    cy.get('.bb-panel').should('have.class', 'custom-class');
  });

  it('starts expanded by default', () => {
    cy.mount(
      <Panel header="Test Panel">
        <p>Test content</p>
      </Panel>
    );

    cy.get('.bb-panel-content').should('not.have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('not.have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('have.attr', 'aria-label', 'Collapse panel');
  });

  it('starts collapsed when defaultCollapsed is true', () => {
    cy.mount(
      <Panel header="Test Panel" defaultCollapsed={true}>
        <p>Test content</p>
      </Panel>
    );

    cy.get('.bb-panel-content').should('have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('have.attr', 'aria-label', 'Expand panel');
  });

  it('toggles collapse state when header is clicked', () => {
    cy.mount(
      <Panel header="Test Panel">
        <p>Test content</p>
      </Panel>
    );

    // Initial state - expanded
    cy.get('.bb-panel-content').should('not.have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('have.attr', 'aria-label', 'Collapse panel');

    // Click to collapse
    cy.get('.bb-panel-header').click();
    cy.get('.bb-panel-content').should('have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('have.attr', 'aria-label', 'Expand panel');

    // Click to expand
    cy.get('.bb-panel-header').click();
    cy.get('.bb-panel-content').should('not.have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('not.have.class', 'collapsed');
    cy.get('.bb-panel-toggle').should('have.attr', 'aria-label', 'Collapse panel');
  });

  it('spreads additional props to root element', () => {
    cy.mount(
      <Panel header="Test Panel" data-testid="test-panel">
        <p>Test content</p>
      </Panel>
    );

    cy.get('.bb-panel').should('have.attr', 'data-testid', 'test-panel');
  });
});
