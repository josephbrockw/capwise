import React from 'react';
import Counter from '../../../src/components/ui/Forms/Counter/Counter';

describe('Counter Component', () => {
  it('renders with default value', () => {
    cy.mount(<Counter />);

    // Check that counter is rendered
    cy.get('.counter').should('exist');

    // Check that buttons are rendered
    cy.get('.counter-button').should('have.length', 2);

    // Check that value is displayed and defaults to 0
    cy.get('.counter-value').should('contain', '0');

    // Check that decrease button is disabled at min value
    cy.get('.counter-button.counter-decrease').should('be.disabled');

    // Check that increase button is enabled
    cy.get('.counter-button.counter-increase').should('not.be.disabled');
  });

  it('renders with custom value', () => {
    cy.mount(<Counter value={5} />);

    // Check that value is displayed correctly
    cy.get('.counter-value').should('contain', '5');

    // Check that both buttons are enabled
    cy.get('.counter-button.counter-decrease').should('not.be.disabled');
    cy.get('.counter-button.counter-increase').should('not.be.disabled');
  });

  it('renders with custom min and max values', () => {
    cy.mount(<Counter value={5} minValue={2} maxValue={8} />);

    // Check that value is displayed correctly
    cy.get('.counter-value').should('contain', '5');

    // Check that both buttons are enabled
    cy.get('.counter-button.counter-decrease').should('not.be.disabled');
    cy.get('.counter-button.counter-increase').should('not.be.disabled');
  });

  it('disables decrease button at min value', () => {
    cy.mount(<Counter value={2} minValue={2} maxValue={10} />);

    // Check that decrease button is disabled
    cy.get('.counter-button.counter-decrease').should('be.disabled');

    // Check that increase button is enabled
    cy.get('.counter-button.counter-increase').should('not.be.disabled');
  });

  it('disables increase button at max value', () => {
    cy.mount(<Counter value={10} minValue={0} maxValue={10} />);

    // Check that increase button is disabled
    cy.get('.counter-button.counter-increase').should('be.disabled');

    // Check that decrease button is enabled
    cy.get('.counter-button.counter-decrease').should('not.be.disabled');
  });

  it('calls onChange when increase button is clicked', () => {
    const onChangeSpy = cy.spy().as('onChangeSpy');

    cy.mount(<Counter value={5} onChange={onChangeSpy} />);

    // Click the increase button
    cy.get('.counter-button.counter-increase').click();

    // Check that onChange was called with the new value
    cy.get('@onChangeSpy').should('have.been.calledWith', 6);
  });

  it('calls onChange when decrease button is clicked', () => {
    const onChangeSpy = cy.spy().as('onChangeSpy');

    cy.mount(<Counter value={5} onChange={onChangeSpy} />);

    // Click the decrease button
    cy.get('.counter-button.counter-decrease').click();

    // Check that onChange was called with the new value
    cy.get('@onChangeSpy').should('have.been.calledWith', 4);
  });

  it('does not call onChange when disabled', () => {
    const onChangeSpy = cy.spy().as('onChangeSpy');

    cy.mount(<Counter value={5} onChange={onChangeSpy} disabled={true} />);

    // Try to click both buttons
    cy.get('.counter-button.counter-increase').click({ force: true });
    cy.get('.counter-button.counter-decrease').click({ force: true });

    // Check that onChange was not called
    cy.get('@onChangeSpy').should('not.have.been.called');
  });

  it('displays label when provided', () => {
    cy.mount(<Counter value={5} label="Points" />);

    // Check that label is displayed
    cy.get('.counter-label').should('exist');
    cy.get('.counter-label').should('contain', 'Points');
  });

  it('applies custom className', () => {
    cy.mount(<Counter value={5} className="custom-counter" />);

    // Check that custom class is applied
    cy.get('.counter').should('have.class', 'custom-counter');
  });

  it('handles non-numeric values gracefully', () => {
    // Test with string that can be converted to number
    cy.mount(<Counter value="5" />);
    cy.get('.counter-value').should('contain', '5');

    // Test with non-numeric string
    cy.mount(<Counter value="abc" />);
    cy.get('.counter-value').should('contain', '0');

    // Test with null
    cy.mount(<Counter value={null} />);
    cy.get('.counter-value').should('contain', '0');
  });

  it('respects data-cy attribute for testing', () => {
    cy.mount(<Counter value={5} name="score" />);

    // Check that data-cy attribute is applied
    cy.get('[data-cy="counter-score"]').should('exist');
  });
});
