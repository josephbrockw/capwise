import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MobileMenuDropdown from '../../src/components/ui/MobileMenuDropdown/MobileMenuDropdown';

describe('MobileMenuDropdown', () => {
  const getDefaultProps = () => ({
    menuItems: [
      {
        label: 'Account',
        items: [
          { label: 'Profile', href: '/profile' },
          { label: 'Settings', href: '/settings' }
        ]
      },
      {
        label: 'Projects',
        href: '/projects'
      },
      {
        label: 'Help',
        items: [
          { label: 'Documentation', href: '/docs' },
          { label: 'Support', href: '/support' }
        ]
      }
    ]
  });

  beforeEach(() => {
    const defaultProps = getDefaultProps();
    cy.mount(
      <BrowserRouter>
        <MobileMenuDropdown {...defaultProps} />
      </BrowserRouter>
    );

    // Reset any click outside handlers
    cy.get('body').trigger('mousedown', { force: true });
  });

  it('should render dropdown button with icon', () => {
    cy.get('.mobile-menu-icon')
      .should('exist')
      .and('have.attr', 'aria-label', 'User menu')
      .and('have.attr', 'aria-expanded', 'false');

    cy.get('.pi-user').should('exist');
  });

  it('should toggle dropdown menu on button click', () => {
    // Initial state
    cy.get('.mobile-menu-dropdown-menu').should('have.class', 'hidden');

    // Open menu
    cy.get('.mobile-menu-icon').click();
    cy.get('.mobile-menu-dropdown-menu')
      .should('have.class', 'visible')
      .and('not.have.class', 'hidden');
    cy.get('.mobile-menu-icon').should('have.attr', 'aria-expanded', 'true');

    // Close menu
    cy.get('.mobile-menu-icon').click();
    cy.get('.mobile-menu-dropdown-menu')
      .should('have.class', 'hidden')
      .and('not.have.class', 'visible');
    cy.get('.mobile-menu-icon').should('have.attr', 'aria-expanded', 'false');
  });

  it('should render all menu items', () => {
    cy.get('.mobile-menu-icon').click();

    getDefaultProps().menuItems.forEach(item => {
      cy.get('.dropdown-menu-item').contains(item.label).should('be.visible');
    });
  });

  it('should toggle submenu on parent item click', () => {
    cy.get('.mobile-menu-icon').click();

    // Check first menu item with submenu
    const accountMenu = getDefaultProps().menuItems[0];
    cy.contains('.dropdown-menu-item', accountMenu.label).as('accountMenuItem');

    // Initial state
    cy.get('@accountMenuItem')
      .parent()
      .find('.submenu')
      .should('have.class', 'hidden');

    // Open submenu
    cy.get('@accountMenuItem').click();
    cy.get('@accountMenuItem')
      .should('have.class', 'active')
      .and('have.attr', 'aria-expanded', 'true');
    cy.get('@accountMenuItem')
      .parent()
      .find('.submenu')
      .should('have.class', 'visible');

    // Close submenu
    cy.get('@accountMenuItem').click();
    cy.get('@accountMenuItem')
      .should('not.have.class', 'active')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('@accountMenuItem')
      .parent()
      .find('.submenu')
      .should('have.class', 'hidden');
  });

  it('should render submenu items with correct links', () => {
    cy.get('.mobile-menu-icon').click();

    // Open Account submenu
    cy.contains('.dropdown-menu-item', 'Account').click();

    // Check submenu items
    getDefaultProps().menuItems[0].items.forEach(subItem => {
      cy.get(`[data-cy="${subItem.label.toLowerCase()}-link"]`)
        .should('be.visible')
        .and('have.attr', 'href', subItem.href)
        .and('contain', subItem.label);
    });
  });

  it('should close dropdown when clicking outside', () => {
    // Open dropdown
    cy.get('.mobile-menu-icon').click();
    cy.get('.mobile-menu-dropdown-menu').should('have.class', 'visible');

    // Click outside
    cy.get('body').trigger('mousedown', { force: true });
    cy.get('.mobile-menu-dropdown-menu').should('have.class', 'hidden');
  });

  it('should close dropdown when clicking a non-parent menu item', () => {
    cy.get('.mobile-menu-icon').click();

    // Click a menu item without submenu
    cy.contains('.dropdown-menu-item', 'Projects').click();
    cy.get('.mobile-menu-dropdown-menu').should('have.class', 'hidden');
  });

  it('should handle submenu icon rotation', () => {
    cy.get('.mobile-menu-icon').click();

    // Check initial state
    cy.contains('.dropdown-menu-item', 'Account')
      .find('.submenu-icon')
      .should('have.class', 'pi-angle-down');

    // Check opened state
    cy.contains('.dropdown-menu-item', 'Account').click();
    cy.contains('.dropdown-menu-item', 'Account')
      .find('.submenu-icon')
      .should('have.class', 'pi-angle-up');

    // Check closed state
    cy.contains('.dropdown-menu-item', 'Account').click();
    cy.contains('.dropdown-menu-item', 'Account')
      .find('.submenu-icon')
      .should('have.class', 'pi-angle-down');
  });

  it('should close other submenus when opening a new one', () => {
    cy.get('.mobile-menu-icon').click();

    // Open first submenu
    cy.contains('.dropdown-menu-item', 'Account').click();
    cy.contains('.dropdown-menu-item', 'Account')
      .parent()
      .find('.submenu')
      .should('have.class', 'visible');

    // Open second submenu
    cy.contains('.dropdown-menu-item', 'Help').click();

    // First submenu should be closed
    cy.contains('.dropdown-menu-item', 'Account')
      .parent()
      .find('.submenu')
      .should('have.class', 'hidden');

    // Second submenu should be open
    cy.contains('.dropdown-menu-item', 'Help')
      .parent()
      .find('.submenu')
      .should('have.class', 'visible');
  });
});
