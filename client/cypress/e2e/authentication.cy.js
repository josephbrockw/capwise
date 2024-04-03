const logIn = () => {
  const { username, password } = Cypress.env('credentials');

  cy.intercept('POST', 'login', {
    statusCode: 200,
    body: {
      'access': 'ACCESS_TOKEN',
      'refresh': 'REFRESH'
    }
  }).as('login');

  cy.visit('/log-in');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password, { log: false });
  cy.get('button').contains('Submit').click();
  cy.wait('@login');
}

describe('Authentication', () => {
  it('Can log in', () => {
    const {username, password} = Cypress.env('credentials');

    logIn();
    cy.url().should('contain', '/dashboard');
    cy.get('button').contains('Log Out');
  });

  it('Shows error message on failed log in', () => {
    const { username, password } = Cypress.env('credentials');
    cy.intercept('POST', 'login', {
      statusCode: 400,
      body: {
        __all__: [
          'Please enter a correct username and password. ' +
          'Note that both fields may be case-sensitive.'
        ]
      }
    }).as('logIn');
    cy.visit('/log-in');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type('wrongpassword', { log: false });
    cy.get('button').contains('Submit').click();
    cy.wait('@logIn');
    cy.get('div.alert').contains(
      'Please enter a correct username and password. ' +
      'Note that both fields may be case-sensitive.'
    );
    cy.url().should('contain', '/log-in');
  });

  it('Cannot visit sign-up or log-in if authenticated', () => {
    logIn();

    cy.url().should('contain', '/dashboard');
    cy.get('button').contains('Log Out');
    // Authenticated user should be redirected to dashboard if they
    // try to visit log-in page
    cy.visit('/log-in');
    cy.url().should('contain', '/dashboard');

    // Authenticated users should be redirected to dashboard if they
    // try to visit sign-up page
    cy.visit('/sign-up');
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