import React from 'react';
import SidePanel from '../../../src/components/ui/SidePanel/SidePanel';
import Button from '../../../src/components/ui/Button/Button';

describe('SidePanel Component', () => {
  it('renders with basic props', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <SidePanel
        title="Test Panel"
        onClose={onCloseSpy}
      >
        <div className="test-content">Panel content</div>
      </SidePanel>
    );

    // Check if the panel renders correctly
    cy.get('.side-panel-container').should('exist');
    cy.get('.side-panel').should('exist');
    cy.get('.side-panel').should('have.class', 'right'); // Default position
    cy.get('.side-panel-title').should('contain', 'Test Panel');
    cy.get('.test-content').should('contain', 'Panel content');
  });

  it('closes when the close button is clicked', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <SidePanel
        title="Close Test"
        onClose={onCloseSpy}
      >
        <div>Content</div>
      </SidePanel>
    );

    cy.get('.side-panel-header button').click();
    cy.get('@onCloseSpy').should('have.been.calledOnce');
  });

  it('closes when the overlay is clicked', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');

    cy.mount(
      <SidePanel
        title="Overlay Test"
        onClose={onCloseSpy}
      >
        <div>Content</div>
      </SidePanel>
    );

    cy.get('.side-panel-overlay').click();
    cy.get('@onCloseSpy').should('have.been.calledOnce');
  });

  it('renders in left position', () => {
    cy.mount(
      <SidePanel
        title="Left Panel"
        position="left"
        onClose={() => {}}
      >
        <div>Left positioned content</div>
      </SidePanel>
    );

    cy.get('.side-panel').should('have.class', 'left');
    cy.get('.side-panel').should('not.have.class', 'right');
  });

  it('applies custom className', () => {
    cy.mount(
      <SidePanel
        title="Custom Class"
        className="custom-panel"
        onClose={() => {}}
      >
        <div>Content</div>
      </SidePanel>
    );

    cy.get('.side-panel').should('have.class', 'custom-panel');
  });

  it('renders with header actions', () => {
    cy.mount(
      <SidePanel
        title="With Actions"
        onClose={() => {}}
        headerActions={
          <Button
            icon="pi pi-save"
            className="button-primary"
            aria-label="Save"
          />
        }
      >
        <div>Content with header actions</div>
      </SidePanel>
    );

    // Should have two buttons in the header (custom action + close)
    cy.get('.side-panel-header-actions button').should('have.length', 2);
    cy.get('.side-panel-header-actions button').first().should('have.class', 'button-primary');
    cy.get('.side-panel-header-actions button').first().find('.pi-save').should('exist');
  });

  it('renders with complex content', () => {
    cy.mount(
      <SidePanel
        title="Complex Content"
        onClose={() => {}}
      >
        <div className="complex-content">
          <h2>Section Title</h2>
          <p>Paragraph content</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
          <button>Action Button</button>
        </div>
      </SidePanel>
    );

    cy.get('.complex-content').should('exist');
    cy.get('.complex-content h2').should('contain', 'Section Title');
    cy.get('.complex-content p').should('contain', 'Paragraph content');
    cy.get('.complex-content li').should('have.length', 2);
    cy.get('.complex-content button').should('exist');
  });

  it('passes additional props to container', () => {
    cy.mount(
      <SidePanel
        title="Additional Props"
        onClose={() => {}}
        data-testid="test-panel"
        aria-label="Test panel"
      >
        <div>Content</div>
      </SidePanel>
    );

    cy.get('.side-panel-container').should('have.attr', 'data-testid', 'test-panel');
    cy.get('.side-panel-container').should('have.attr', 'aria-label', 'Test panel');
  });
});
