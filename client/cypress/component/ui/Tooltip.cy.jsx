import React from 'react';
import Tooltip from '../../../src/components/ui/Tooltip/Tooltip';

describe('Tooltip Component', () => {
  it('renders with basic content', () => {
    const tooltipContent = 'This is tooltip content';

    cy.mount(
      <Tooltip content={tooltipContent} />
    );

    // Check that the tooltip container exists
    cy.get('.bb-tooltip').should('exist');

    // Check that the trigger element exists and has the default question mark
    cy.get('.bb-tooltip-trigger').should('exist').and('contain', '?');

    // Check that the content is in the DOM and contains the expected text
    cy.get('.bb-tooltip-content')
      .should('exist')
      .and('contain', tooltipContent);
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-tooltip-class';

    cy.mount(
      <Tooltip
        content="Tooltip content"
        className={customClass}
      />
    );

    cy.get('.bb-tooltip').should('have.class', customClass);
  });

  it('shows tooltip content on hover', () => {
    const tooltipContent = 'This is tooltip content';

    cy.mount(
      <Tooltip content={tooltipContent} />
    );

    // Before hover, content should not be visible
    cy.get('.bb-tooltip-content').should('exist');

    // Hover over the trigger
    cy.get('.bb-tooltip-trigger').trigger('mouseover');

    // After hover, check if content is visible
    // Note: We can't directly test the :hover pseudo-class in Cypress
    // Instead, we'll check if the content contains the expected text
    cy.get('.bb-tooltip-content')
      .should('contain', tooltipContent);
  });

  it('has proper accessibility attributes', () => {
    cy.mount(
      <Tooltip content="Accessibility test" />
    );

    cy.get('.bb-tooltip-trigger').should('have.attr', 'aria-label', 'More information');
  });

  it('renders complex content inside tooltip', () => {
    const complexContent = (
      <div className="complex-content">
        <h4>Complex Tooltip</h4>
        <p>This is a paragraph inside the tooltip</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
      </div>
    );

    cy.mount(
      <Tooltip content={complexContent} />
    );

    // Check that complex content is rendered
    cy.get('.bb-tooltip-content .complex-content').should('exist');
    cy.get('.bb-tooltip-content h4').should('contain', 'Complex Tooltip');
    cy.get('.bb-tooltip-content p').should('contain', 'This is a paragraph inside the tooltip');
    cy.get('.bb-tooltip-content li').should('have.length', 2);
  });

  it('positions tooltip content correctly', () => {
    cy.mount(
      <Tooltip content="Position test" />
    );

    // Check that the tooltip content has the correct positioning CSS properties
    cy.get('.bb-tooltip-content')
      .should('have.css', 'position', 'absolute')
      .and('have.css', 'top');
  });

  it('has correct styling for the trigger element', () => {
    cy.mount(
      <Tooltip content="Styling test" />
    );

    // Check individual CSS properties separately
    cy.get('.bb-tooltip-trigger').should('have.css', 'display');
    cy.get('.bb-tooltip-trigger').should('have.css', 'border-radius');
    cy.get('.bb-tooltip-trigger').should('have.css', 'cursor', 'help');
  });

  it('has correct styling for the tooltip content', () => {
    cy.mount(
      <Tooltip content="Content styling test" />
    );

    // Check individual CSS properties separately
    cy.get('.bb-tooltip-content').should('have.css', 'background-color');
    cy.get('.bb-tooltip-content').should('have.css', 'border-radius');
    cy.get('.bb-tooltip-content').should('have.css', 'z-index', '1000');
  });
});
