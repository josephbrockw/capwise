import React from 'react';
import FloatLabel from '../../src/components/ui/FloatLabel/FloatLabel';

describe('FloatLabel', () => {
  const getDefaultProps = () => ({
    id: 'test-input',
    label: 'Test Label',
    value: '',
    name: 'test',
    onChange: cy.stub().as('onChange'),
  });

  it('should render with default props', () => {
    const defaultProps = getDefaultProps();
    cy.mount(<FloatLabel {...defaultProps} />);
    cy.get('input').should('exist');
    cy.get('label').should('contain', defaultProps.label);
    cy.get('.float-label-container').should('not.have.class', 'floating');
  });

  it('should float label when input has value', () => {
    const defaultProps = getDefaultProps();
    cy.mount(<FloatLabel {...defaultProps} value="test value" />);
    cy.get('.float-label-container').should('have.class', 'floating');
  });

  it('should float label on focus and unfloat on blur when empty', () => {
    const defaultProps = getDefaultProps();
    cy.mount(<FloatLabel {...defaultProps} />);

    // Check initial state
    cy.get('.float-label-container').should('not.have.class', 'floating');

    // Check focus state
    cy.get('input').focus();
    cy.get('.float-label-container').should('have.class', 'floating');

    // Check blur state
    cy.get('input').blur();
    cy.get('.float-label-container').should('not.have.class', 'floating');
  });

  it('should keep label floating after blur if input has value', () => {
    const defaultProps = getDefaultProps();
    cy.mount(<FloatLabel {...defaultProps} value="test value" />);

    cy.get('input').focus();
    cy.get('.float-label-container').should('have.class', 'floating');

    cy.get('input').blur();
    cy.get('.float-label-container').should('have.class', 'floating');
  });

  it('should call onChange when input value changes', () => {
    const defaultProps = getDefaultProps();
    cy.mount(<FloatLabel {...defaultProps} />);

    cy.get('input').type('test value');
    cy.get('@onChange').should('have.been.called');
  });

  it('should pass through additional props to input element', () => {
    const defaultProps = getDefaultProps();
    const additionalProps = {
      'data-cy': 'test-input',
      'aria-label': 'Test Input',
      placeholder: 'Enter test value',
      maxLength: '50'
    };

    cy.mount(<FloatLabel {...defaultProps} {...additionalProps} />);

    cy.get('input')
      .should('have.attr', 'data-cy', 'test-input')
      .and('have.attr', 'aria-label', 'Test Input')
      .and('have.attr', 'placeholder', 'Enter test value')
      .and('have.attr', 'maxLength', '50');
  });

  it('should render with different input types', () => {
    const defaultProps = getDefaultProps();
    cy.mount(<FloatLabel {...defaultProps} type="password" />);
    cy.get('input').should('have.attr', 'type', 'password');

    cy.mount(<FloatLabel {...defaultProps} type="email" />);
    cy.get('input').should('have.attr', 'type', 'email');

    cy.mount(<FloatLabel {...defaultProps} type="number" />);
    cy.get('input').should('have.attr', 'type', 'number');
  });

  it('should handle required attribute', () => {
    const defaultProps = getDefaultProps();
    cy.mount(<FloatLabel {...defaultProps} required={true} />);
    cy.get('input').should('have.attr', 'required');
  });

  it('should handle custom name attribute', () => {
    const defaultProps = getDefaultProps();
    const customName = 'custom-field';
    cy.mount(<FloatLabel {...defaultProps} name={customName} />);
    cy.get('input').should('have.attr', 'name', customName);
  });

  it('should maintain input-label association with id', () => {
    const defaultProps = getDefaultProps();
    const customId = 'custom-id';
    cy.mount(<FloatLabel {...defaultProps} id={customId} />);
    cy.get('input').should('have.attr', 'id', customId);
    cy.get('label').should('have.attr', 'for', customId);
  });

  it('should handle whitespace in value for floating behavior', () => {
    const defaultProps = getDefaultProps();
    // Should not float with only whitespace
    cy.mount(<FloatLabel {...defaultProps} value="   " />);
    cy.get('.float-label-container').should('not.have.class', 'floating');

    // Should float with text containing whitespace
    cy.mount(<FloatLabel {...defaultProps} value="  test  " />);
    cy.get('.float-label-container').should('have.class', 'floating');
  });
});
