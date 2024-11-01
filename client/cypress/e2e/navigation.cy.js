describe('Home Page', () => {
  it('Should be able to navigate to registration page', () => {
    cy.visit('/');
    cy.get('[data-cy=registration-button]').click();
    cy.url().should('include', '/register');
  });

  it('Should be able to navigate to login page', () => {
    cy.visit('/');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/login');
  });
});
