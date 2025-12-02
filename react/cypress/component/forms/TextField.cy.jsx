import React from 'react';
import TextField from '../../../src/components/ui/Forms/TextField/TextField';

describe('TextField Component', () => {
  const defaultProps = {
    id: 'test-field',
    name: 'test-field',
    label: 'Test Field',
    onChange: () => {}
  };

  it('should render with label and placeholder', () => {
    cy.mount(<TextField {...defaultProps} value="" placeholder="Enter text here" />);

    cy.get('.text-field-label').should('contain', 'Test Field');
    cy.get('.text-field-input').should('have.attr', 'placeholder', 'Enter text here');
  });

  it('should render with initial value', () => {
    const initialValue = 'Initial text';
    cy.mount(<TextField {...defaultProps} value={initialValue} />);

    cy.get('.text-field-input').should('have.value', initialValue);
  });

  it('should update value when typing', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<TextField {...defaultProps} value="" onChange={onChange} />);

    const newValue = 'New text value';
    cy.get('.text-field-input').type(newValue);

    // Check if onChange was called with the correct parameters
    cy.get('@onChange').should('have.been.called');
    cy.get('.text-field-input').should('have.value', newValue);
  });

  it('should show required indicator when required is true', () => {
    cy.mount(<TextField {...defaultProps} value="" required={true} />);

    cy.get('.text-field-required').should('be.visible');
    cy.get('.text-field-required').should('contain', '*');
  });

  it('should show error message when error is provided', () => {
    const errorMessage = 'This field is required';
    cy.mount(<TextField {...defaultProps} value="" error={errorMessage} />);

    cy.get('.text-field-error-message').should('be.visible');
    cy.get('.text-field-error-message').should('contain', errorMessage);
    cy.get('.text-field-input').should('have.class', 'text-field-error');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<TextField {...defaultProps} value="" disabled={true} />);

    cy.get('.text-field-input').should('be.disabled');
    cy.get('.text-field-input').should('have.css', 'background-color');
  });

  it('should render as textarea when multiline is true', () => {
    cy.mount(<TextField {...defaultProps} value="" multiline={true} rows={5} />);

    cy.get('textarea.text-field-input').should('exist');
    cy.get('textarea.text-field-input').should('have.attr', 'rows', '5');
  });

  it('should apply custom className to input', () => {
    const customClass = 'custom-text-field';
    cy.mount(<TextField {...defaultProps} value="" className={customClass} />);

    cy.get('.text-field-input').should('have.class', customClass);
  });

  it('should apply custom style to input', () => {
    const customStyle = { color: 'red', fontSize: '18px' };
    cy.mount(<TextField {...defaultProps} value="" style={customStyle} />);

    cy.get('.text-field-input').should('have.css', 'color', 'rgb(255, 0, 0)');
    cy.get('.text-field-input').should('have.css', 'font-size', '18px');
  });

  it('should handle debounced onChange', () => {
    const clock = cy.clock();
    const onChange = cy.stub().as('onChange');

    cy.mount(
      <TextField
        {...defaultProps}
        onChange={onChange}
        value=""
        debounceTime={300}
      />
    );

    // Type text
    cy.get('.text-field-input').type('Debounced text');

    // onChange should not be called immediately with the full text
    cy.get('@onChange').should('not.have.been.calledWith',
      Cypress.sinon.match.hasNested('target.value', 'Debounced text')
    );

    // Advance clock by debounce time
    cy.tick(300);

    // Now onChange should be called with the full text
    cy.get('@onChange').should('have.been.calledWith',
      Cypress.sinon.match.hasNested('target.value', 'Debounced text')
    );
  });

  it('should update internal value when prop value changes', () => {
    // Create a wrapper component to control the value prop
    function TestWrapper() {
      const [value, setValue] = React.useState('Initial');

      React.useEffect(() => {
        // Change the value after a timeout
        setTimeout(() => setValue('Updated'), 100);
      }, []);

      return (
        <TextField
          {...defaultProps}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }

    cy.mount(<TestWrapper />);

    // Initially should have the initial value
    cy.get('.text-field-input').should('have.value', 'Initial');

    // After the timeout, should update to the new value
    cy.get('.text-field-input').should('have.value', 'Updated');
  });
});
