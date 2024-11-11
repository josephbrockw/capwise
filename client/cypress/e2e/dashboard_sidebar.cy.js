describe('Dashboard Sidebar', () => {
  beforeEach(() => {
    cy.visit('/dashboard'); // Replace with the correct route
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
