describe('Navigation', () => {
  it('Can navigate to sign up from home', () => {
    cy.visit('/');
    cy.get('a').contains('Sign up').click();
    cy.url().should('contain', '/sign-up');
  });

  it('Can navigate to log in from home', () => {
    cy.visit('/');
    cy.get('a').contains('Log in').click();
    cy.url().should('contain', '/log-in');
  });

  it('Can navigate to home from sign up', () => {
    cy.visit('/sign-up');
    cy.get('a').contains('Home').click();
    cy.url().should('not.contain', '/sign-up');
  });

  it('Can navigate to log in from sign up', () => {
    cy.visit('/sign-up');
    cy.get('a').contains('Log in').click();
    cy.url().should('contain', '/log-in');
  });

  // it('Can navigate to home from log in', () => {
  //   cy.visit('/log-in');
  //   cy.get('a').contains('Home').click();
  //   cy.url().should('not.contain', '/log-in');
  // });

  it('Can navigate to sign up from log in', () => {
    cy.visit('/log-in');
    cy.get('a').contains('Sign up').click();
    cy.url().should('contain', '/sign-up');
  });
})