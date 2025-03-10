describe('User Registration Flow', () => {
  beforeEach(() => {
    // Verify test mode is enabled
    cy.log('CYPRESS_TEST_MODE:', Cypress.env('CYPRESS_TEST_MODE'));
  });

  it('Registers a new user and shows a success message', () => {
    cy.intercept('POST', '**/api/auth/sign-up', (req) => {
      expect(req.body).to.deep.equal({
        discountCode: null,
        email: 'gytha@lancre.gov',
        password1: 'Password123!',
        password2: 'Password123!',
        payment_method_id: 'pm_test_123',
        priceId: 1,
        productId: 1,
        tierId: 1,
        trialDays: 7
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
    cy.intercept('GET', '**/api/products', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          data: [
            {
              id: 1,
              name: 'BaseBuild',
              description: 'A template for building SaaS applications.',
              is_active: true,
              trial_days: 7,
              tiers: [
                {
                  id: 1,
                  name: 'Basic',
                  stripe_product_id: 'prod_123',
                  order: 0,
                  prices: [
                    {
                      id: 1,
                      billing_cycle: 'lifetime',
                      price: 9900
                    },
                    {
                      id: 2,
                      billing_cycle: 'year',
                      price: 5000
                    },
                    {
                      id: 3,
                      billing_cycle: 'month',
                      price: 500
                    }
                  ],
                  features: {
                    team_members: {
                      included: false,
                      description: 'Add unlimited team members.',
                      display_name: 'Team Members'
                    },
                    priority_support: {
                      included: false,
                      description: 'Access to 24/7 priority support.',
                      display_name: 'Priority Support'
                    },
                    unlimited_projects: {
                      included: true,
                      description: 'Create unlimited projects.',
                      display_name: 'Unlimited Projects'
                    }
                  }
                },
                {
                  id: 2,
                  name: 'Pro',
                  stripe_product_id: 'prod_456',
                  order: 1,
                  prices: [
                    {
                      id: 4,
                      billing_cycle: 'lifetime',
                      price: 19900
                    },
                    {
                      id: 5,
                      billing_cycle: 'year',
                      price: 8500
                    },
                    {
                      id: 6,
                      billing_cycle: 'month',
                      price: 1000
                    }
                  ],
                  features: {
                    team_members: {
                      included: true,
                      description: 'Add unlimited team members.',
                      display_name: 'Team Members'
                    },
                    priority_support: {
                      included: true,
                      description: 'Access to 24/7 priority support.',
                      display_name: 'Priority Support'
                    },
                    unlimited_projects: {
                      included: true,
                      description: 'Create unlimited projects.',
                      display_name: 'Unlimited Projects'
                    }
                  }
                },
              ]
            },
          ],
        },
      });
    }).as('getProducts');
    cy.visit('/register/payment');

    // Fill in registration form
    cy.get('input[name="email"]').type('gytha@lancre.gov');
    cy.get('input[name="password1"]').type('Password123!');
    cy.get('input[name="password2"]').type('Password123!');
    cy.get('[data-cy="registration-continue-button-0"]').click();
    cy.wait('@getProducts');
    // Should display Monthly plans
    cy.contains('Month').should('be.visible');
    cy.contains('Basic').should('be.visible');
    cy.contains('$5.00/month').should('be.visible');
    cy.contains('Pro').should('be.visible');
    cy.contains('$10.00/month').should('be.visible');
    cy.contains('7 day free trial').should('be.visible');

    // Clicking continue before selecting a plan should show an error
    cy.get('[data-cy="registration-continue-button-1"]').click();
    cy.contains('Please select a product plan to continue').should('be.visible');

    // Toggling billing cycle should bring up new prices
    cy.get('[data-cy="select-header"]').click();
    cy.get('[data-cy="select-dropdown"]').should('be.visible');
    cy.get('[data-cy="select-option-year"]').click();
    // Prices should match yearly plans
    cy.contains('Year').should('be.visible');
    cy.contains('Basic').should('be.visible');
    cy.contains('$50.00/year').should('be.visible');
    cy.contains('Pro').should('be.visible');
    cy.contains('$85.00/year').should('be.visible');

    // Select lifetime plan options
    cy.get('[data-cy="select-header"]').click();
    cy.get('[data-cy="select-option-lifetime"]').click();
    cy.contains('Lifetime').should('be.visible');
    cy.contains('Basic').should('be.visible');
    cy.contains('$99.00/lifetime').should('be.visible');
    cy.contains('Pro').should('be.visible');
    cy.contains('$199.00/lifetime').should('be.visible');

    cy.get('[data-cy="select-1-Basic-lifetime"]').click();

    // Continue to payment step
    cy.get('[data-cy="registration-continue-button-1"]').click();

    // Wait for card element and verify test mode
    cy.window().then((win) => {
      cy.log('Window Cypress:', !!win.Cypress);
      cy.log('Test Mode:', win.Cypress?.env('CYPRESS_TEST_MODE'));
    });

    // Continue to confirmation step
    cy.get('[data-cy="registration-continue-button-2"]').should('be.visible').click();

    cy.contains('Email: gytha@lancre.gov').should('be.visible');
    cy.contains('Plan Details').should('be.visible');
    cy.contains('Product: BaseBuild').should('be.visible');
    cy.contains('Tier: Basic').should('be.visible');
    cy.contains('Price: $99.00/lifetime').should('be.visible');
    cy.contains('Free Trial: 7 days').should('be.visible');
    // Submit registration
    cy.get('[data-cy="registration-submit-button"]').should('be.visible').click();

    // Wait for the registration API call
    cy.wait('@registerUser').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
    });

    // Verify success state
    cy.contains('Registration successful! Please check your email to verify your account.').should('be.visible');
  });

  it('Shows error when registering with duplicate email', () => {
    cy.intercept('POST', '**/api/auth/sign-up', {
      statusCode: 400,
      body: { error: 'A user with this email already exists.' },
    }).as('registerUser');
    cy.visit('/register/payment');
    cy.get('input[name="email"]').type('gytha@lancre.gov');
    cy.get('input[name="password1"]').type('Password123!');
    cy.get('input[name="password2"]').type('Password123!');
    cy.get('[data-cy="registration-continue-button-0"]').click();
    cy.get('[data-cy="select-1-Basic-month"]').click();
    cy.get('[data-cy="registration-continue-button-1"]').click();
    cy.get('[data-cy="registration-continue-button-2"]').click();
    cy.get('[data-cy="registration-submit-button"]').click();
    cy.wait('@registerUser');
    cy.contains('A user with this email already exists.').should('be.visible');
  });

  it('Successfully registers a new user with basic registration', () => {
    cy.intercept('POST', '**/api/auth/sign-up', (req) => {
      expect(req.body).to.deep.equal({
        email: 'agnes@lancre.gov',
        password1: 'Password123!',
        password2: 'Password123!'
      });
      req.reply({
        statusCode: 201,
        body: {
          data: {
            id: '4f086fe8-35bb-4a1a-9bbb-1d2f9a0e4643',
            email: 'agnes@lancre.gov'
          },
        },
      });
    }).as('registerUser');

    cy.visit('/register');
    cy.get('input[name="email"]').type('agnes@lancre.gov');
    cy.get('input[name="password1"]').type('Password123!');
    cy.get('input[name="password2"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerUser').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
    });

    cy.contains('Registration successful! Please check your email to verify your account.').should('be.visible');
    cy.get('form').should('not.exist');
  });

  it('Shows validation errors on basic registration', () => {
    cy.visit('/register');

    // Test password mismatch
    cy.get('input[name="email"]').clear();
    cy.get('input[name="email"]').type('agnes@lancre.gov');
    cy.get('input[name="password1"]').type('Password123!');
    cy.get('input[name="password2"]').type('DifferentPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Passwords do not match').should('be.visible');

    // Test password too short
    cy.get('input[name="password1"]').clear();
    cy.get('input[name="password2"]').clear();
    cy.get('input[name="password1"]').type('short');
    cy.get('input[name="password2"]').type('short');
    cy.get('button[type="submit"]').click();
    cy.contains('Password must be at least 8 characters long').should('be.visible');
  });

  it('Shows error for duplicate email on basic registration', () => {
    cy.intercept('POST', '**/api/auth/sign-up', {
      statusCode: 400,
      body: { error: 'A user with this email already exists.' },
    }).as('registerUser');

    cy.visit('/register');
    cy.get('input[name="email"]').type('agnes@lancre.gov');
    cy.get('input[name="password1"]').type('Password123!');
    cy.get('input[name="password2"]').type('Password123!');
    cy.get('button[type="submit"]').click();

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
    cy.intercept('POST', '**/api/auth/verify', (req) => {
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
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        data: {
          access: 'mockedAccess',
          refresh: 'mockedRefresh',
          id: '3e086fe8-35bb-4a1a-9bbb-1d2f9a0e4642',
          username: 'nanny',
          email: 'gytha@lancre.gov',
          first_name: 'Gytha',
          last_name: 'Ogg',
        }
      }
    }).as('loginUser');

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
    cy.url().should('include', '/');
    cy.contains('Welcome to Your Dashboard').should('be.visible');
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
    cy.window().then((win) => {
      let token = win.localStorage.getItem('token');
      expect(token).to.be.null;
    });
  });

  it('Shows error on invalid login credentials', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        error: 'Invalid username or password.'
      }
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
    cy.intercept('POST', '**/api/auth/password/reset', (req) => {
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
    cy.intercept('POST', '**/api/auth/password/reset/confirm', (req) =>{
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
    cy.intercept('POST', '**/api/auth/password/reset/confirm', (req) => {
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
    cy.intercept('POST', '**/api/auth/password/reset/confirm', {
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

describe('Token Refresh and Session Handling', () => {
  beforeEach(() => {
    // Clear localStorage and reset API client
    cy.clearLocalStorage();

    // Handle uncaught exceptions
    cy.on('uncaught:exception', () => {
      return false;
    });

    // Set up interceptors before any requests
    cy.intercept('GET', 'http://localhost:8009/api/users/me', (req) => {
      // Only return 401 for the first request with the expired token
      if (req.headers.authorization === 'Bearer expired-token') {
        req.reply({
          statusCode: 401,
          body: {
            error: 'Token expired'
          }
        });
      } else if (req.headers.authorization === 'Bearer new-valid-token') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              id: 1,
              username: 'testuser'
            }
          }
        });
      }
    }).as('userRequest');

    cy.intercept('POST', 'http://localhost:8009/api/auth/refresh', (req) => {
      if (req.body.refresh === 'valid-refresh-token') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              access: 'new-valid-token',
              refresh: 'new-refresh-token'
            }
          }
        });
      } else if (req.body.refresh === 'invalid-refresh-token') {
        req.reply({
          statusCode: 401,
          body: {
            error: 'Invalid refresh token'
          }
        });
      }
    }).as('tokenRefresh');
  });

  it('should automatically refresh token on 401 response', () => {
    // Set up initial localStorage state and visit page
    cy.visit('/settings', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'expired-token');
        win.localStorage.setItem('refreshToken', 'valid-refresh-token');
        win.localStorage.removeItem('userData');
      }
    });

    // First request should fail with 401
    cy.wait('@userRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(401);
    });

    // Token refresh request should succeed
    cy.wait('@tokenRefresh').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.data).to.deep.equal({
        access: 'new-valid-token',
        refresh: 'new-refresh-token'
      });
    });

    // Second request should succeed with new token
    cy.wait('@userRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.request.headers.authorization).to.equal('Bearer new-valid-token');
    });

    // Verify localStorage was updated
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.equal('new-valid-token');
      expect(win.localStorage.getItem('refreshToken')).to.equal('new-refresh-token');
    });
  });

  it('should redirect to login when refresh token is invalid', () => {
    // Set up initial localStorage state and visit page
    cy.visit('/settings', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'expired-token');
        win.localStorage.setItem('refreshToken', 'invalid-refresh-token');
        win.localStorage.removeItem('userData');
      }
    });

    // First request should fail with 401
    cy.wait('@userRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(401);
    });

    // Refresh token request should fail
    cy.wait('@tokenRefresh').then((interception) => {
      expect(interception.response.statusCode).to.equal(401);
    });

    // Should be redirected to login
    cy.url().should('include', '/login');

    // Local storage should be cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('refreshToken')).to.be.null;
      expect(win.localStorage.getItem('userData')).to.be.null;
    });
  });

  it('should maintain authentication across page reloads', () => {
    // Set up initial auth state with user data
    cy.window().then((win) => {
      win.localStorage.setItem('userData', JSON.stringify({
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }));
    });

    // Set up successful user data request for any subsequent fetches
    cy.intercept('GET', 'http://localhost:8009/api/users/me', (req) => {
      expect(req.headers.authorization).to.equal('Bearer expired-token');
      req.reply({
        statusCode: 200,
        body: {
          data: {
            id: '123',
            username: 'testuser',
            email: 'test@example.com'
          }
        }
      });
    }).as('getUserData');

    // Visit settings page and verify initial load
    cy.visit('/settings');

    // Reload page and verify auth state is maintained
    cy.reload();

    // Verify auth state
    cy.window().then((win) => {
      const userData = JSON.parse(win.localStorage.getItem('userData'));
      expect(userData).to.deep.equal({
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      });
    });
  });
});
