describe('Landing Page', () => {
  it('Should be able to navigate to registration page', () => {
    cy.visit('/landing');
    cy.get('[data-cy=registration-button]').click();
    cy.url().should('include', '/register');
  });

  it('Should be able to navigate to login page', () => {
    cy.visit('/landing');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/login');
  });
});

describe('Login Page', () => {
  it('Should be able to navigate to registration page', () => {
    cy.visit('/login');
    cy.get('[data-cy=register-link]').click();
    cy.url().should('include', '/register');
  });

  it('Should be able to navigate to reset password page', () => {
    cy.visit('/login');
    cy.get('[data-cy=reset-password-link]').click();
    cy.url().should('include', '/password/initiate');
  });

  it('Should redirect to dashboard if authenticated', () => {
    cy.setLocalStorageForDashboard();
    cy.visit('/login');
    cy.url().should('include', '/dashboard');
  });
});

describe('Registration Page', () => {
  it('Should be able to navigate to login page', () => {
    cy.visit('/register');
    cy.get('[data-cy=login-link]').click();
    cy.url().should('include', '/login');
  });

  it('Should redirect to dashboard if authenticated', () => {
    cy.setLocalStorageForDashboard();
    cy.visit('/register');
    cy.url().should('include', '/dashboard');
  });
});

describe('Reset Password Page', () => {
  it('Should be able to navigate to login page', () => {
    cy.visit('/password/initiate');
    cy.get('[data-cy=login-link]').click();
    cy.url().should('include', '/login');
  });

  it('Should be able to navigate to registration page', () => {
    cy.visit('/password/initiate');
    cy.get('[data-cy=register-link]').click();
    cy.url().should('include', '/register');
  });

  it('Should redirect to dashboard if authenticated', () => {
    cy.setLocalStorageForDashboard();
    cy.visit('/password/initiate');
    cy.url().should('include', '/dashboard');
  });
});

describe('Reset Confirm Page', () => {
  it('Should be able to navigate to login page', () => {
    cy.visit('/password/confirm');
    cy.get('[data-cy=login-link]').click();
    cy.url().should('include', '/login');
  });

  it('Should be able to navigate to registration page', () => {
    cy.visit('/password/confirm');
    cy.get('[data-cy=register-link]').click();
    cy.url().should('include', '/register');
  });

  it('Should redirect to dashboard if authenticated', () => {
    cy.setLocalStorageForDashboard();
    cy.visit('/password/confirm');
    cy.url().should('include', '/dashboard');
  });
});
