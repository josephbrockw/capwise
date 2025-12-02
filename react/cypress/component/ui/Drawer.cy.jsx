import React from 'react';
import Drawer from '../../../src/components/ui/Drawer/Drawer.jsx';

describe('Drawer Component', () => {
  it('renders in closed state by default', () => {
    cy.mount(
      <Drawer>
        <div className="drawer-test-content">Test Content</div>
      </Drawer>
    );

    // Should have closed class
    cy.get('.drawer').should('have.class', 'closed');
    cy.get('.drawer').should('not.have.class', 'open');

    // Check that the down arrow is shown when closed
    cy.get('.drawer-toggle i').should('have.class', 'pi-chevron-down');

    // Content should be in the DOM but may be hidden by CSS
    cy.get('.drawer-content').should('exist');
    cy.get('.drawer-test-content').should('exist');
  });

  it('renders in open state when defaultOpen is true', () => {
    cy.mount(
      <Drawer defaultOpen={true}>
        <div className="drawer-test-content">Test Content</div>
      </Drawer>
    );

    // Should have open class
    cy.get('.drawer').should('have.class', 'open');
    cy.get('.drawer').should('not.have.class', 'closed');

    // Check that the up arrow is shown when open
    cy.get('.drawer-toggle i').should('have.class', 'pi-chevron-up');

    // Content should be visible
    cy.get('.drawer-content').should('be.visible');
    cy.get('.drawer-test-content').should('be.visible');
  });

  it('toggles between open and closed states when clicked', () => {
    cy.mount(
      <Drawer>
        <div className="drawer-test-content">Test Content</div>
      </Drawer>
    );

    // Initially closed
    cy.get('.drawer').should('have.class', 'closed');
    cy.get('.drawer-toggle i').should('have.class', 'pi-chevron-down');

    // Click to open
    cy.get('.drawer-toggle-container').click();
    cy.get('.drawer').should('have.class', 'open');
    cy.get('.drawer-toggle i').should('have.class', 'pi-chevron-up');

    // Click to close again
    cy.get('.drawer-toggle-container').click();
    cy.get('.drawer').should('have.class', 'closed');
    cy.get('.drawer-toggle i').should('have.class', 'pi-chevron-down');
  });

  it('displays title only when open and title is provided', () => {
    cy.mount(
      <Drawer title="Test Drawer Title">
        <div className="drawer-test-content">Test Content</div>
      </Drawer>
    );

    // Initially closed, title should not be visible
    cy.get('.drawer-header').should('not.exist');
    cy.get('.drawer-title').should('not.exist');

    // Open the drawer
    cy.get('.drawer-toggle-container').click();

    // Title should now be visible
    cy.get('.drawer-header').should('exist');
    cy.get('.drawer-title').should('contain', 'Test Drawer Title');

    // Close the drawer again
    cy.get('.drawer-toggle-container').click();

    // Title should be hidden again
    cy.get('.drawer-header').should('not.exist');
  });

  it('does not show header when no title is provided', () => {
    cy.mount(
      <Drawer defaultOpen={true}>
        <div className="drawer-test-content">Test Content</div>
      </Drawer>
    );

    // Drawer is open but no title provided
    cy.get('.drawer').should('have.class', 'open');
    cy.get('.drawer-header').should('not.exist');
  });

  it('applies custom className', () => {
    cy.mount(
      <Drawer className="custom-drawer-class">
        <div className="drawer-test-content">Test Content</div>
      </Drawer>
    );

    cy.get('.drawer').should('have.class', 'custom-drawer-class');
  });

  it('applies data-cy attribute for testing', () => {
    cy.mount(
      <Drawer dataCy="test-drawer">
        <div className="drawer-test-content">Test Content</div>
      </Drawer>
    );

    cy.get('[data-cy="test-drawer"]').should('exist');
  });

  it('renders complex content correctly', () => {
    cy.mount(
      <Drawer defaultOpen={true}>
        <div className="complex-content">
          <h2>Complex Content Title</h2>
          <p>Paragraph text</p>
          <button className="test-button">Test Button</button>
        </div>
      </Drawer>
    );

    // Check that complex content is rendered correctly
    cy.get('.complex-content h2').should('contain', 'Complex Content Title');
    cy.get('.complex-content p').should('contain', 'Paragraph text');
    cy.get('.complex-content .test-button').should('exist');

    // Verify that the button inside the drawer is clickable
    cy.get('.test-button').click();
  });

  it('maintains state when content changes', () => {
    // Create a component with changing content
    function DrawerWithChangingContent() {
      const [content, setContent] = React.useState('Initial Content');

      return (
        <div>
          <button
            className="change-content-button"
            onClick={() => setContent('Updated Content')}
          >
            Change Content
          </button>
          <Drawer defaultOpen={true}>
            <div className="dynamic-content">{content}</div>
          </Drawer>
        </div>
      );
    }

    cy.mount(<DrawerWithChangingContent />);

    // Check initial state
    cy.get('.drawer').should('have.class', 'open');
    cy.get('.dynamic-content').should('contain', 'Initial Content');

    // Change the content
    cy.get('.change-content-button').click();

    // Drawer should still be open with new content
    cy.get('.drawer').should('have.class', 'open');
    cy.get('.dynamic-content').should('contain', 'Updated Content');
  });
});
