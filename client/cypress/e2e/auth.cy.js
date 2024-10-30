describe('User Registration Flow', () => {
  it('Registers a new user and shows a success message', () => {
    cy.intercept('POST', '/api/auth/sign-up', {
      statusCode: 201,
      body: {
        data: {
          id: '3e086fe8-35bb-4a1a-9bbb-1d2f9a0e4642',
          username: 'nanny',
          email: 'gytha@lancre.gov',
          first_name: 'Gytha',
          last_name: 'Ogg',
        }
      },
    }).as('registerUser');
    cy.visit('/register');

    // Fill in registration form
    cy.get('input[name="username"]').type('nanny');
    cy.get('input[name="email"]').type('gytha@lancre.gov');
    cy.get('input[name="password1"]').type('Password123!');
    cy.get('input[name="password2"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@registerUser');
    // Verify successful registration prompt
    cy.contains('Registration successful! Please check your email to verify your account.').should('be.visible');
  });
});

describe('Email Verification', () => {
  it('Verifying user email without token should show an error message', () => {
    cy.visit('/verify');
    // Check for error message
    cy.contains('Invalid or missing verification token.').should('be.visible');
  });

  it('Verifies user email using the verification token', () => {
    // Mock visiting verification link with token
    const verificationToken = 'testtoken123';
    cy.intercept('POST', `/api/auth/verify`, {
      statusCode: 200,
      body: { message: 'Email verified successfully.' },
    }).as('verifyEmail');
    cy.visit(`/verify?token=${verificationToken}`);
    cy.wait('@verifyEmail');
    // Check if successfully redirected to the login page
    cy.url().should('include', '/login');
  });
});

describe('User Login Flow', () => {
  it('Logs in an existing user successfully', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        access: 'mockedAccess',
        refresh: 'mockedRefresh',
        id: '3e086fe8-35bb-4a1a-9bbb-1d2f9a0e4642',
        username: 'nanny',
        first_name: 'Gytha',
        last_name: 'Ogg',
      },
    }).as('loginUser');
    cy.visit('/login');

    // Fill in login form
    cy.get('input[name="username"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginUser');
    // TODO: Check for dashboard redirect
    // cy.url().should('include', '/dashboard');
    // cy.contains('Welcome to your dashboard').should('be.visible');
  });
});
