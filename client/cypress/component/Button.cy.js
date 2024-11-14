import React from 'react';
import Button from '../../src/components/Button/Button';

describe('Button Component', () => {
  it('renders the button with the correct label', () => {
    cy.mount(<Button label="Click Me" />);
    cy.get('button').should('contain', 'Click Me');
  });

  it('calls the onClick handler when clicked', () => {
    const onClick = cy.stub();
    cy.mount(<Button label="Click Me" onClick={onClick} />);
    cy.get('button').click();
    expect(onClick).to.have.been.calledOnce;
  });

  it('disables the button when `disabled` prop is true', () => {
    cy.mount(<Button label="Click Me" disabled />);
    cy.get('button').should('be.disabled');
  });
});
