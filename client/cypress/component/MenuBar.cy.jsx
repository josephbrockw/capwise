import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MenuBar from '../../src/components/ui/MenuBar/MenuBar';

describe('MenuBar', () => {
  const getDefaultProps = () => ({
    menuItems: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Projects', href: '/projects' },
      { label: 'Settings', href: '/settings' }
    ],
    isMobile: false
  });

  const mountWithRouter = (component) => {
    cy.mount(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render with logo', () => {
    const defaultProps = getDefaultProps();
    mountWithRouter(<MenuBar {...defaultProps} />);

    cy.get('.menu-bar-logo').should('exist');
    cy.get('.menu-bar-logo img').should('have.attr', 'alt', 'Logo');
    cy.get('.menu-bar-logo a').should('have.attr', 'href', '/');
  });

  it('should render all menu items in desktop view', () => {
    const defaultProps = getDefaultProps();
    mountWithRouter(<MenuBar {...defaultProps} />);

    cy.get('.menu-bar-items').should('be.visible');
    defaultProps.menuItems.forEach(item => {
      cy.get(`[data-cy="${item.label.toLowerCase()}-link"]`)
        .should('be.visible')
        .and('have.attr', 'href', item.href)
        .and('contain', item.label);
    });
  });

  it('should render mobile menu dropdown in mobile view', () => {
    const defaultProps = getDefaultProps();
    mountWithRouter(<MenuBar {...defaultProps} isMobile={true} />);

    cy.get('.menu-bar-items').should('not.exist');
    cy.get('.mobile-menu-dropdown').should('exist');
  });

  it('should render logout button in desktop view', () => {
    const defaultProps = getDefaultProps();
    mountWithRouter(<MenuBar {...defaultProps} />);

    cy.get('.menu-bar-items').within(() => {
      cy.get('button').should('exist'); // Assuming LogoutButton renders a button
    });
  });

  it('should handle menu items with special characters', () => {
    const defaultProps = getDefaultProps();
    const specialItems = [
      { label: 'Test & Demo', href: '/test-demo' },
      { label: 'Q&A Section', href: '/qa' },
      { label: 'Support & Help', href: '/support' }
    ];

    mountWithRouter(<MenuBar {...defaultProps} menuItems={specialItems} />);

    specialItems.forEach(item => {
      cy.get(`[data-cy="${item.label.toLowerCase()}-link"]`)
        .should('be.visible')
        .and('have.attr', 'href', item.href)
        .and('contain', item.label);
    });
  });

  it('should handle empty menu items array', () => {
    const defaultProps = getDefaultProps();
    mountWithRouter(<MenuBar {...defaultProps} menuItems={[]} />);

    cy.get('.menu-bar-logo').should('exist'); // Logo should still be visible
    cy.get('.menu-bar-items').should('exist'); // Menu container should exist
    cy.get('.menu-bar-link').should('not.exist'); // No menu items should be rendered
  });

  it('should handle long menu item labels', () => {
    const defaultProps = getDefaultProps();
    const longItems = [
      {
        label: 'Very Long Menu Item Label That Should Still Display Properly',
        href: '/long-item'
      }
    ];

    mountWithRouter(<MenuBar {...defaultProps} menuItems={longItems} />);

    cy.get('.menu-bar-link')
      .should('be.visible')
      .and('contain', longItems[0].label);
  });

  it('should handle menu items with identical labels but different hrefs', () => {
    const defaultProps = getDefaultProps();
    const duplicateItems = [
      { label: 'Settings', href: '/user-settings' },
      { label: 'Settings', href: '/app-settings' }
    ];

    mountWithRouter(<MenuBar {...defaultProps} menuItems={duplicateItems} />);

    cy.get('[data-cy="settings-link"]').should('have.length', 2);
    cy.get('[data-cy="settings-link"]').first().should('have.attr', 'href', '/user-settings');
    cy.get('[data-cy="settings-link"]').last().should('have.attr', 'href', '/app-settings');
  });

  // Test for accessibility
  it('should be keyboard navigable', () => {
    const defaultProps = getDefaultProps();
    mountWithRouter(<MenuBar {...defaultProps} />);

    // Logo should be focusable
    cy.get('.menu-bar-logo a').focus().should('have.focus');

    // Menu items should be focusable
    defaultProps.menuItems.forEach(item => {
      cy.get(`[data-cy="${item.label.toLowerCase()}-link"]`)
        .focus()
        .should('have.focus');
    });
  });
});
