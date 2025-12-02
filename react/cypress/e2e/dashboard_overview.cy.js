describe('Dashboard Sidebar', () => {
  beforeEach(() => {
    cy.setLocalStorageForDashboard();
    cy.visit('/'); // Replace with the correct route
  });

  it('shows the sidebar on desktop by default', () => {
    cy.viewport(1280, 720); // Desktop resolution
    cy.get('.sidebar-container').should('be.visible');
  });

  it('hides the sidebar by default on mobile', () => {
    cy.viewport(375, 667); // Mobile resolution
    cy.get('.sidebar-container').should('not.be.visible');
  });

  it('toggles the sidebar on mobile when menu icon is clicked', () => {
    cy.viewport(375, 667);
    cy.get('.sidebar-toggle').click();
    cy.get('.sidebar-container').should('be.visible');
    cy.get('.sidebar-close').click();
    cy.get('.sidebar-container').should('not.be.visible');
  });
});

describe('Dashboard MenuBar', () => {
  beforeEach(() => {
    cy.setLocalStorageForDashboard();
    cy.visit('/');
  });

  it('shows menu items directly on desktop', () => {
    cy.viewport(1280, 720);
    cy.get('.menu-bar-items').should('be.visible');
    cy.get('.mobile-menu-icon').should('not.exist');
  });

  it('shows user icon on mobile and opens dropdown menu', () => {
    cy.viewport(375, 667);
    cy.get('.mobile-menu-icon').should('be.visible').click();
    cy.get('.mobile-menu-dropdown-menu').should('be.visible');
  });

  it('closes the dropdown menu when clicking outside', () => {
    cy.viewport(375, 667);
    cy.get('.mobile-menu-icon').click();
    cy.get('.mobile-menu-dropdown-menu').should('be.visible');
    cy.get('body').click(0, 0); // Click outside
    cy.get('.mobile-menu-dropdown-menu').should('not.be.visible');
  });
});
