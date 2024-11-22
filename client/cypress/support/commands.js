// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[name=email]').type(email)
  cy.get('input[name=password]').type(password)
  cy.get('button[type=submit]').click()
})

Cypress.Commands.add('setLocalStorageForDashboard', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'mock-token');
    win.localStorage.setItem('userData',
      JSON.stringify({
        id: '4c7a58fe-006b-49c6-a6d1-97bad7bcb8df',
        email: 'gytha@lancre.gov',
        username: 'gytha',
        first_name: 'Gytha',
        last_name: 'Ogg'
      })
    );
  });
});
