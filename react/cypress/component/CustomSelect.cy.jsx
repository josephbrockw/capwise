import React from 'react';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect.jsx';

describe('CustomSelect', () => {
  const options = ['option1', 'option2', 'option3'];

  beforeEach(() => {
    // Any setup that needs to happen before each test
  });

  it('renders with default value', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<CustomSelect options={options} onChange={onChange} defaultValue="option1" />);
    cy.get('[data-cy="select-header"]').should('contain', 'Option1');
  });

  it('opens dropdown on click', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<CustomSelect options={options} onChange={onChange} defaultValue="option1" />);
    cy.get('[data-cy="select-header"]').click();
    cy.get('[data-cy="select-dropdown"]').should('have.class', 'visible');
    cy.get('[data-cy="select-option-option1"]').should('be.visible');
    cy.get('[data-cy="select-option-option2"]').should('be.visible');
    cy.get('[data-cy="select-option-option3"]').should('be.visible');
  });

  it('closes dropdown when clicking outside', () => {
    const onChange = cy.stub().as('onChange');

    // Create a div outside the component before mounting
    cy.get('body').then($body => {
      const $div = Cypress.$('<div id="outside" style="position: fixed; top: 0; right: 0;">Click outside</div>');
      $body.append($div);
    });

    cy.mount(<CustomSelect options={options} onChange={onChange} defaultValue="option1" />);

    // Open the dropdown
    cy.get('[data-cy="select-header"]').click();
    cy.get('[data-cy="select-dropdown"]').should('have.class', 'visible');

    // Click the outside element
    cy.get('#outside').click({ force: true });

    // Verify dropdown is closed
    cy.get('[data-cy="select-dropdown"]').should('not.have.class', 'visible');
  });

  it('selects an option when clicked', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<CustomSelect options={options} onChange={onChange} defaultValue="option1" />);
    cy.get('[data-cy="select-header"]').click();
    cy.get('[data-cy="select-option-option2"]').click();
    cy.get('[data-cy="select-header"]').should('contain', 'Option2');
    cy.get('@onChange').should('have.been.calledWith', { target: { value: 'option2' } });
  });

  it('handles keyboard navigation', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<CustomSelect options={options} onChange={onChange} defaultValue="option1" />);

    // Test Enter key
    cy.get('[data-cy="select-header"]').focus().type('{enter}');
    cy.get('[data-cy="select-dropdown"]').should('have.class', 'visible');

    // Test closing with Enter key
    cy.get('[data-cy="select-header"]').type('{enter}');
    cy.get('[data-cy="select-dropdown"]').should('not.have.class', 'visible');

    // Test Space key
    cy.get('[data-cy="select-header"]').type(' ');
    cy.get('[data-cy="select-dropdown"]').should('have.class', 'visible');
  });

  it('capitalizes options correctly', () => {
    const onChange = cy.stub().as('onChange');
    const mixedCaseOptions = ['camelCase', 'UPPERCASE', 'lowercase'];
    cy.mount(<CustomSelect options={mixedCaseOptions} onChange={onChange} defaultValue="camelCase" />);

    // First letter should be capitalized, rest should remain unchanged
    cy.get('[data-cy="select-header"]').should('contain', 'CamelCase');
    cy.get('[data-cy="select-header"]').click();

    // Check each option's capitalization
    cy.get('[data-cy="select-option-UPPERCASE"]').should('contain', 'UPPERCASE');
    cy.get('[data-cy="select-option-lowercase"]').should('contain', 'Lowercase');
  });

  it('applies custom className', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<CustomSelect options={options} onChange={onChange} className="custom-class" defaultValue="option1" />);
    cy.get('.custom-select').should('have.class', 'custom-class');
  });

  it('updates when value prop changes', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<CustomSelect options={options} onChange={onChange} value="option1" />);
    cy.get('[data-cy="select-header"]').should('contain', 'Option1');

    cy.mount(<CustomSelect options={options} onChange={onChange} value="option2" />);
    cy.get('[data-cy="select-header"]').should('contain', 'Option2');
  });
});
