import { mount } from 'cypress/react18';
import './commands.js';

Cypress.Commands.add('mount', mount);

// Example usage in tests:
// cy.mount(<MyComponent />);
