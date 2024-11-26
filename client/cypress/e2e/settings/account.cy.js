describe('Account Settings Page', () => {
  const mockUserData = {
    id: '6722e8bd-48db-4bfd-b637-e4516490a6fc',
    username: 'joe',
    preferred_name: 'Joseph',
    first_name: 'Joe',
    last_name: 'Wilkinson',
    email: 'me@thejoewilkinson.com'
  };

  beforeEach(() => {
    // Mock initial user data in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('userData', JSON.stringify(mockUserData));
    });

    // Intercept GET request for user data
    cy.intercept(
      {
        method: 'GET',
        url: '**/api/users/me',
        headers: {
          Authorization: 'Bearer mock-token'
        }
      },
      {
        statusCode: 200,
        body: {
          data: mockUserData,
          message: '',
          error: '',
          error_code: null
        }
      }
    ).as('getUserData');

    // Visit the settings page
    cy.visit('/settings');
  });

  it('loads and displays user data correctly', () => {
    cy.get('[data-cy="first-name-input"]')
      .should('have.value', mockUserData.first_name);
    cy.get('[data-cy="last-name-input"]')
      .should('have.value', mockUserData.last_name);
    cy.get('[data-cy="preferred-name-input"]')
      .should('have.value', mockUserData.preferred_name);
  });

  it('successfully updates user information', () => {
    const updatedData = {
      ...mockUserData,
      preferred_name: 'Joey'
    };

    // Intercept the PATCH request
    cy.intercept(
      {
        method: 'PATCH',
        url: '**/api/users/me',
        headers: {
          Authorization: 'Bearer mock-token'
        }
      },
      {
        statusCode: 200,
        body: {
          data: updatedData,
          message: 'User information updated successfully.',
          error: '',
          error_code: null
        }
      }
    ).as('updateUser');

    // Update preferred name
    cy.get('[data-cy="preferred-name-input"]').as('prefNameInput');
    cy.get('@prefNameInput').clear();
    cy.get('@prefNameInput').type(updatedData.preferred_name);

    // Submit form
    cy.get('[data-cy="save-profile-button"]').click();

    // Wait for the request and verify
    cy.wait('@updateUser').then((interception) => {
      expect(interception.request.body).to.have.property('preferred_name', updatedData.preferred_name);
    });

    // Check success toast
    cy.get('[data-cy="success-message"]')
      .should('be.visible')
      .and('contain', 'User information updated successfully');

    // Verify local storage was updated
    cy.window().then((win) => {
      const storedData = JSON.parse(win.localStorage.getItem('userData'));
      expect(storedData.preferred_name).to.equal(updatedData.preferred_name);
    });
  });

  it('handles API errors appropriately', () => {
    // Intercept the PATCH request with an error response
    cy.intercept(
      {
        method: 'PATCH',
        url: '**/api/users/me',
        headers: {
          Authorization: 'Bearer mock-token'
        }
      },
      {
        statusCode: 400,
        body: {
          data: {},
          message: '',
          error: 'Invalid input provided.',
          error_code: null
        }
      }
    ).as('updateUserError');

    // Make an invalid update
    cy.get('[data-cy="first-name-input"]').as('firstNameInput');
    cy.get('@firstNameInput').clear();
    cy.get('@firstNameInput').type('   '); // Empty or whitespace name

    // Submit form
    cy.get('[data-cy="save-profile-button"]').click();

    // Wait for the request
    cy.wait('@updateUserError');

    // Check error toast
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid input provided');

    // Verify local storage wasn't updated
    cy.window().then((win) => {
      const storedData = JSON.parse(win.localStorage.getItem('userData'));
      expect(storedData).to.deep.equal(mockUserData);
    });
  });

  it('disables save button when no changes are made', () => {
    cy.get('[data-cy="save-profile-button"]')
      .should('be.disabled');

    // Make a change
    cy.get('[data-cy="preferred-name-input"]').as('prefNameInput');
    cy.get('@prefNameInput').clear();
    cy.get('@prefNameInput').type('New Name');

    // Button should be enabled
    cy.get('[data-cy="save-profile-button"]')
      .should('not.be.disabled');

    // Revert the change
    cy.get('@prefNameInput').clear();
    cy.get('@prefNameInput').type(mockUserData.preferred_name);

    // Button should be disabled again
    cy.get('[data-cy="save-profile-button"]')
      .should('be.disabled');
  });

  it('handles network errors gracefully', () => {
    // Intercept the PATCH request with a network error
    cy.intercept(
      {
        method: 'PATCH',
        url: '**/api/users/me',
        headers: {
          Authorization: 'Bearer mock-token'
        }
      },
      {
        forceNetworkError: true
      }
    ).as('networkError');

    // Make a change and submit
    cy.get('[data-cy="preferred-name-input"]').as('prefNameInput');
    cy.get('@prefNameInput').clear();
    cy.get('@prefNameInput').type('New Name');

    cy.get('[data-cy="save-profile-button"]').click();

    // Check error toast
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'An error occurred');

    // Verify local storage wasn't updated
    cy.window().then((win) => {
      const storedData = JSON.parse(win.localStorage.getItem('userData'));
      expect(storedData).to.deep.equal(mockUserData);
    });
  });

  it('reverts unsaved changes on page reload', () => {
    const newName = 'Joey';

    // Make a change
    cy.get('[data-cy="preferred-name-input"]').as('prefNameInput');
    cy.get('@prefNameInput').clear();
    cy.get('@prefNameInput').type(newName);

    // Verify change is there before reload
    cy.get('[data-cy="preferred-name-input"]')
      .should('have.value', newName);

    // Reload the page
    cy.reload();

    // Verify the value reverts to what's in localStorage
    cy.get('[data-cy="preferred-name-input"]')
      .should('have.value', mockUserData.preferred_name);
  });
});
