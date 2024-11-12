describe('User Registration Flow', () => {
  it('Registers a new user and shows a success message', () => {
    cy.intercept('POST', '/api/auth/sign-up', (req) => {
      expect(req.body).to.deep.equal({
        username: 'nanny',
        email: 'gytha@lancre.gov',
        password1: 'Password123!',
        password2: 'Password123!',
      });
      req.reply({
        statusCode: 201,
        body: {
          data: {
            id: '3e086fe8-35bb-4a1a-9bbb-1d2f9a0e4642',
            username: 'nanny',
            email: 'gytha@lancre.gov',
            first_name: 'Gytha',
            last_name: 'Ogg',
          },
        },
      });
    }).as('registerUser');
    cy.visit('/register');

    // Fill in registration form
    cy.get('input[name="username"]').type('nanny');
    cy.get('input[name="email"]').type('gytha@lancre.gov');
    cy.get('input[name="password1"]').type('Password123!');
    cy.get('input[name="password2"]').type('Password123!');
    cy.get('[data-cy="registration-submit-button"]').click();
    cy.wait('@registerUser');
    // Verify successful registration prompt
    cy.contains('Registration successful! Please check your email to verify your account.').should('be.visible');
  });

  it('Shows error when registering with duplicate email', () => {
  cy.intercept('POST', '/api/auth/sign-up', {
    statusCode: 400,
    body: { error: 'A user with this email already exists.' },
  }).as('registerUser');
  cy.visit('/register');
  cy.get('input[name="username"]').type('nanny');
  cy.get('input[name="email"]').type('gytha@lancre.gov');
  cy.get('input[name="password1"]').type('Password123!');
  cy.get('input[name="password2"]').type('Password123!');
  cy.get('[data-cy="registration-submit-button"]').click();
  cy.wait('@registerUser');
  cy.contains('A user with this email already exists.').should('be.visible');
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
    cy.intercept('POST', '/api/auth/verify', (req) => {
      expect(req.body).to.deep.equal({ token: verificationToken });
      req.reply({
        statusCode: 200,
        body: { message: 'Email verified successfully.' },
      });
    }).as('verifyEmail');
    cy.visit(`/verify?token=${verificationToken}`);
    cy.wait('@verifyEmail');
    // Check if successfully redirected to the login page
    cy.url().should('include', '/login');
  });
});

describe('User Login Flow', () => {
  it('Logs in an existing user successfully', () => {
    cy.intercept('POST', '/api/auth/login', (req) => {
      expect(req.body).to.deep.equal({
        username: 'testuser@example.com',
        password: 'Password123!',
      });
      req.reply({
        statusCode: 200,
        body: {
          data: {
            access: 'mockedAccess',
            refresh: 'mockedRefresh',
            id: '3e086fe8-35bb-4a1a-9bbb-1d2f9a0e4642',
            username: 'nanny',
            first_name: 'Gytha',
            last_name: 'Ogg',
          },
        },
      });
    }).as('loginUser');
    cy.intercept("GET", "/api/users/me", {
      statusCode: 200,
      body: {
        data: {
          id: '3e086fe8-35bb-4a1a-9bbb-1d2f9a0e4642',
          username: 'nanny',
          email: 'gytha@lancre.gov',
          first_name: 'Gytha',
          last_name: 'Ogg',
        }
      },
    }).as('getUser');
    cy.visit('/login');

    // Fill in login form
    cy.get('input[name="username"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('[data-cy="login-submit-button"]').click();
    cy.wait('@loginUser');
    cy.window().then((win) => {
      let token = win.localStorage.getItem('token');
      expect(token).to.equal('mockedAccess');
    });
    // TODO: Check for dashboard redirect
    cy.url().should('include', '/');
    cy.wait('@getUser');
    cy.contains('Welcome to Your Dashboard').should('be.visible');
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
    cy.window().then((win) => {
      let token = win.localStorage.getItem('token');
      expect(token).to.be.null;
    });
  });

  it('Shows error on invalid login credentials', () => {
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 401,
    body: { error: 'Invalid username or password.' },
  }).as('loginUser');
  cy.visit('/login');
  cy.get('input[name="username"]').type('testuser@example.com');
  cy.get('input[name="password"]').type('WrongPassword!');
  cy.get('[data-cy="login-submit-button"]').click();
  cy.wait('@loginUser');
  cy.contains('Invalid username or password.').should('be.visible');
});
});

describe('Password Reset Flow', () => {
  it('Initiates password reset process', () => {
    cy.intercept('POST', '/api/auth/password/reset', (req) => {
      expect(req.body).to.deep.equal({
        email: 'gytha@lancre.gov',
      });
      req.reply({
        statusCode: 200,
        body: {
          message: 'Password reset email sent successfully.'
        },
      });
    }).as('initiateReset');
    cy.visit('/password/initiate');
    cy.get('input[name="email"]').type('gytha@lancre.gov');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@initiateReset');
    cy.contains('If an account with that email exists, a password reset email will be sent.').should('be.visible');
  });

  it('Resets user password successfully with token query param', () => {
    const resetToken = "123456";
    cy.intercept('POST', '/api/auth/password/reset/confirm', (req) =>{
      expect(req.body).to.deep.equal({
        token: resetToken,
        password: 'NewPassword123!',
        password_confirm: 'NewPassword123!',
      });
      req.reply({
        statusCode: 200,
        body: {
          message: 'Password reset successful. Please sign in.'
        },
      });
    }).as('resetPassword');
    cy.visit(`/password/confirm?token=${resetToken}`);
    cy.get('input[name="password"]').type('NewPassword123!');
    cy.get('input[name="password_confirm"]').type('NewPassword123!');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@resetPassword');
    cy.contains('Password reset successful. Please sign in.').should('be.visible');
  });

  it('Resets user password successfully with manual token entry', () => {
    const reset = "123456";
    cy.intercept('POST', '/api/auth/password/reset/confirm', (req) => {
      expect(req.body).to.deep.equal({
        token: reset,
        password: 'NewPassword123!',
        password_confirm: 'NewPassword123!',
      });
      req.reply({
        statusCode: 200,
        body: {
          message: 'Password reset successful. Please sign in.'
        },
      });
    }).as('resetPassword');
    cy.visit('/password/confirm');
    cy.get('[data-cy="otp-container"]').as('otpContainer');
    cy.get('@otpContainer').find('input').should('have.length', 6);
    reset.split('').forEach((digit, index) => {
      cy.get('@otpContainer').find('input').eq(index).type(digit);
    });

    cy.get('input[name="password"]').type('NewPassword123!');
    cy.get('input[name="password_confirm"]').type('NewPassword123!');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@resetPassword');
    cy.contains('Password reset successful. Please sign in.').should('be.visible');
  });

  it('Shows an error message when not successfully resetting password', () => {
    const resetToken = "123456";
    cy.intercept('POST', '/api/auth/password/reset/confirm', {
      statusCode: 400,
      body: {
        error: 'An error occurred. Please try again.'
      },
    }).as('resetPassword');
    cy.visit(`/password/confirm?token=${resetToken}`);
    cy.get('input[name="password"]').type('NewPassword123!');
    cy.get('input[name="password_confirm"]').type('NewPassword123!');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@resetPassword');
    cy.contains('An error occurred. Please try again.').should('be.visible');
  });
});
