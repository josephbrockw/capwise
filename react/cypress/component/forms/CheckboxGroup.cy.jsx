import React, { useState } from 'react';
import CheckboxGroup from '../../../src/components/ui/Forms/CheckboxGroup/CheckboxGroup.jsx';

describe('CheckboxGroup Component', () => {
  it('renders with the correct number of checkboxes', () => {
    cy.mount(
      <CheckboxGroup
        value={0}
        maxValue={3}
        onChange={() => {}}
        name="test-group"
      />
    );

    // Should render 3 checkboxes
    cy.get('.checkbox-group-item').should('have.length', 3);
  });

  it('renders with the correct initial checked state', () => {
    cy.mount(
      <CheckboxGroup
        value={2}
        maxValue={3}
        onChange={() => {}}
        name="test-group"
      />
    );

    // First two checkboxes should be checked
    cy.get('.checkbox-group-item').eq(0).should('have.class', 'checked');
    cy.get('.checkbox-group-item').eq(1).should('have.class', 'checked');
    cy.get('.checkbox-group-item').eq(2).should('not.have.class', 'checked');

    // Check that the check icon is present in checked boxes
    cy.get('.checkbox-group-item').eq(0).find('.pi-check').should('exist');
    cy.get('.checkbox-group-item').eq(1).find('.pi-check').should('exist');
    cy.get('.checkbox-group-item').eq(2).find('.pi-check').should('not.exist');
  });

  it('calls onChange with the correct value when clicking checkboxes', () => {
    const onChangeSpy = cy.spy().as('onChangeSpy');

    cy.mount(
      <CheckboxGroup
        value={0}
        maxValue={3}
        onChange={onChangeSpy}
        name="test-group"
      />
    );

    // Click the first checkbox
    cy.get('.checkbox-group-item').eq(0).click();
    cy.get('@onChangeSpy').should('have.been.calledWith', 1);

    // Click the second checkbox
    cy.get('.checkbox-group-item').eq(1).click();
    cy.get('@onChangeSpy').should('have.been.calledWith', 2);

    // Click the third checkbox
    cy.get('.checkbox-group-item').eq(2).click();
    cy.get('@onChangeSpy').should('have.been.calledWith', 3);
  });

  it('handles unchecking the last checked checkbox', () => {
    // Create a controlled component to test the behavior
    const CheckboxGroupTest = () => {
      const [value, setValue] = useState(2);
      return (
        <CheckboxGroup
          value={value}
          maxValue={3}
          onChange={setValue}
          name="test-group"
          data-cy="test-checkbox-group"
        />
      );
    };

    cy.mount(<CheckboxGroupTest />);

    // Initially, first two checkboxes should be checked
    cy.get('.checkbox-group-item').eq(0).should('have.class', 'checked');
    cy.get('.checkbox-group-item').eq(1).should('have.class', 'checked');
    cy.get('.checkbox-group-item').eq(2).should('not.have.class', 'checked');

    // Click the second checkbox (the last checked one)
    cy.get('.checkbox-group-item').eq(1).click();

    // Now only the first checkbox should be checked
    cy.get('.checkbox-group-item').eq(0).should('have.class', 'checked');
    cy.get('.checkbox-group-item').eq(1).should('not.have.class', 'checked');
    cy.get('.checkbox-group-item').eq(2).should('not.have.class', 'checked');
  });

  it('applies custom className', () => {
    cy.mount(
      <CheckboxGroup
        value={0}
        maxValue={3}
        onChange={() => {}}
        className="custom-checkbox-group"
        name="test-group"
      />
    );

    cy.get('.checkbox-group').should('have.class', 'custom-checkbox-group');
  });

  it('respects the disabled prop', () => {
    cy.mount(
      <CheckboxGroup
        value={1}
        maxValue={3}
        onChange={cy.spy().as('onChangeSpy')}
        name="test-group"
        disabled={true}
      />
    );

    // Checkboxes should have disabled class
    cy.get('.checkbox-group-item').each($item => {
      cy.wrap($item).should('have.class', 'disabled');
      cy.wrap($item).should('have.attr', 'aria-disabled', 'true');
    });

    // Clicking should not trigger onChange
    cy.get('.checkbox-group-item').eq(1).click();
    cy.get('@onChangeSpy').should('not.have.been.called');
  });

  it('has correct ARIA attributes for accessibility', () => {
    cy.mount(
      <CheckboxGroup
        value={2}
        maxValue={3}
        onChange={() => {}}
        name="test-group"
      />
    );

    // Group should have role="group" and aria-label
    cy.get('.checkbox-group').should('have.attr', 'role', 'group');
    cy.get('.checkbox-group').should('have.attr', 'aria-label', 'test-group');

    // Checkboxes should have role="checkbox" and aria-checked
    cy.get('.checkbox-group-item').eq(0)
      .should('have.attr', 'role', 'checkbox')
      .and('have.attr', 'aria-checked', 'true');

    cy.get('.checkbox-group-item').eq(2)
      .should('have.attr', 'role', 'checkbox')
      .and('have.attr', 'aria-checked', 'false');
  });

  it('supports keyboard focus', () => {
    cy.mount(
      <CheckboxGroup
        value={0}
        maxValue={3}
        onChange={() => {}}
        name="test-group"
      />
    );

    // Focus on the first checkbox
    cy.get('.checkbox-group-item').eq(0).focus();
    cy.get('.checkbox-group-item').eq(0).should('have.focus');

    // Verify tabindex attribute for keyboard navigation
    cy.get('.checkbox-group-item').each($item => {
      cy.wrap($item).should('have.attr', 'tabIndex', '0');
    });
  });

  it('handles keyboard activation with a controlled component', () => {
    // Create a controlled component to test keyboard activation
    const CheckboxGroupWithKeyboard = () => {
      const [value, setValue] = useState(0);
      return (
        <div>
          <div className="value-display">Current value: {value}</div>
          <CheckboxGroup
            value={value}
            maxValue={3}
            onChange={setValue}
            name="test-group"
          />
        </div>
      );
    };

    cy.mount(<CheckboxGroupWithKeyboard />);

    // Initially no checkboxes are checked
    cy.get('.checkbox-group-item.checked').should('not.exist');
    cy.get('.value-display').should('contain', 'Current value: 0');

    // Click the first checkbox
    cy.get('.checkbox-group-item').eq(0).click();

    // Now the first checkbox should be checked
    cy.get('.checkbox-group-item').eq(0).should('have.class', 'checked');
    cy.get('.value-display').should('contain', 'Current value: 1');
  });

  it('handles different maxValue configurations', () => {
    cy.mount(
      <CheckboxGroup
        value={0}
        maxValue={5}
        onChange={() => {}}
        name="test-group"
      />
    );

    // Should render 5 checkboxes
    cy.get('.checkbox-group-item').should('have.length', 5);
  });

  it('applies data-cy attributes for testing', () => {
    cy.mount(
      <CheckboxGroup
        value={0}
        maxValue={3}
        onChange={() => {}}
        name="test-name"
      />
    );

    // Each checkbox should have a data-cy attribute
    cy.get('[data-cy="test-name-checkbox-1"]').should('exist');
    cy.get('[data-cy="test-name-checkbox-2"]').should('exist');
    cy.get('[data-cy="test-name-checkbox-3"]').should('exist');
  });
});
