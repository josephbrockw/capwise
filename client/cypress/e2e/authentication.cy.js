describe('Authentication', () => {
  it('Can log in', () => {
    cy.visit('/log-in');
    cy.get('input[name="username"]').type('nanny');
    cy.get('input[name="password"]').type('testpass123', { log: false });
    cy.get('button').contains('Submit').click();
    cy.url().should('contain', '/dashboard');
  });

  it('Can sign up', () => {
    cy.visit('/sign-up');
    cy.get('input[name="username"]').type('nanny');
    cy.get('input[name="email"]').type('gogg@lancre.gov');
    cy.get('input[name="firstName"]').type('Gytha');
    cy.get('input[name="lastName"]').type('Ogg');
    cy.get('input[name="password"]').type('testpass123', { log: false });
    cy.get('input[name="confirmPassword"]').type('testpass123', { log: false });
    cy.get('button').contains('Submit').click();
    cy.url().should('contain', '/dashboard');
  });
});