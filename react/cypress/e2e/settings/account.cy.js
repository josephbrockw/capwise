describe('Account Settings Page', () => {
  const mockUserData = {
    id: '6722e8bd-48db-4bfd-b637-e4516490a6fc',
    username: 'gytha',
    preferred_name: 'Nanny',
    first_name: 'Gytha',
    last_name: 'Ogg',
    email: 'gytha@lancre.gov'
  };

  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();

    // Always set up the intercept for potential API calls
    cy.intercept('GET', '**/api/users/me', {
      statusCode: 200,
      body: {
        data: mockUserData,
        message: '',
        error: '',
        error_code: null
      }
    }).as('getUserData');
  });

  describe('with localStorage data', () => {
    beforeEach(() => {
      // Set up initial state in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-token');
        win.localStorage.setItem('userData', JSON.stringify(mockUserData));
      });

      cy.visit('/settings');
      // No need to wait for API call since data is in localStorage
    });

    it('loads user data from localStorage', () => {
      cy.get('[data-cy="first-name-input"]')
        .should('have.value', mockUserData.first_name);
      cy.get('[data-cy="last-name-input"]')
        .should('have.value', mockUserData.last_name);
      cy.get('[data-cy="preferred-name-input"]')
        .should('have.value', mockUserData.preferred_name);
    });
  });

  describe('without localStorage data', () => {
    beforeEach(() => {
      // Only set token, no user data
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-token');
      });

      cy.visit('/settings');
      cy.wait('@getUserData'); // Wait for API call since no data in localStorage
    });

    it('loads user data from API', () => {
      cy.get('[data-cy="first-name-input"]')
        .should('have.value', mockUserData.first_name);
      cy.get('[data-cy="last-name-input"]')
        .should('have.value', mockUserData.last_name);
      cy.get('[data-cy="preferred-name-input"]')
        .should('have.value', mockUserData.preferred_name);
    });
  });

  describe('user interactions', () => {
    beforeEach(() => {
      // Set up initial state in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-token');
        win.localStorage.setItem('userData', JSON.stringify(mockUserData));
      });
      cy.visit('/settings');
    });

    it('successfully updates user information', () => {
      const updatedData = {
        ...mockUserData,
        preferred_name: 'Mother'
      };

      cy.intercept('PATCH', '**/api/users/me', {
        statusCode: 200,
        body: {
          data: updatedData,
          message: 'User information updated successfully.',
          error: '',
          error_code: null
        }
      }).as('updateUser');

      cy.get('[data-cy="preferred-name-input"]').clear();
      cy.get('[data-cy="preferred-name-input"]').type(updatedData.preferred_name);
      cy.get('[data-cy="save-profile-button"]').click();

      cy.wait('@updateUser').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          preferred_name: updatedData.preferred_name
        });
      });

      cy.get('[data-cy="toast-success"]')
        .should('be.visible')
        .and('contain', 'User information updated successfully');
    });

    it('handles API errors appropriately', () => {
      cy.intercept('PATCH', '**/api/users/me', {
        statusCode: 400,
        body: {
          data: null,
          message: '',
          error: 'Invalid input provided.',
          error_code: 'VALIDATION_ERROR'
        }
      }).as('updateUserError');

      cy.get('[data-cy="first-name-input"]').clear();
      cy.get('[data-cy="first-name-input"]').type('   ');
      cy.get('[data-cy="save-profile-button"]').click();

      cy.wait('@updateUserError');
      cy.get('[data-cy="toast-error"]')
        .should('be.visible')
        .and('contain', 'Invalid input provided');
    });

    it('disables save button when no changes are made', () => {
      cy.get('[data-cy="save-profile-button"]')
        .should('be.disabled');

      cy.get('[data-cy="preferred-name-input"]').clear();
      cy.get('[data-cy="preferred-name-input"]').type('New Name');
      cy.get('[data-cy="save-profile-button"]')
        .should('not.be.disabled');

      cy.get('[data-cy="preferred-name-input"]').clear();
      cy.get('[data-cy="preferred-name-input"]').type(mockUserData.preferred_name);
      cy.get('[data-cy="save-profile-button"]')
        .should('be.disabled');
    });

    it('handles network errors gracefully', () => {
      cy.intercept('PATCH', '**/api/users/me', {
        forceNetworkError: true
      }).as('networkError');

      cy.get('[data-cy="preferred-name-input"]').clear();
      cy.get('[data-cy="preferred-name-input"]').type('New Name');
      cy.get('[data-cy="save-profile-button"]').click();

      // Wait for the network error and verify the error toast
      cy.wait('@networkError');
      cy.get('[data-cy="toast-error"]')
        .should('be.visible')
        .and('contain', 'Network error');
    });

    it('reverts unsaved changes on page reload', () => {
      cy.get('[data-cy="preferred-name-input"]').clear();
      cy.get('[data-cy="preferred-name-input"]').type('Unsaved Name');

      // Reload and verify original data is displayed
      cy.reload();
      cy.get('[data-cy="preferred-name-input"]')
        .should('have.value', mockUserData.preferred_name);
    });
  });
});
