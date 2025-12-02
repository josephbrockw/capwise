import React from 'react';
import SimpleSelect from '../../../src/components/ui/Forms/Select/SimpleSelect';

describe('SimpleSelect Component', () => {
  const mockOptions = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' },
    { id: 4, name: 'Different Option' }
  ];

  const defaultProps = {
    id: 'test-select',
    name: 'test-select',
    label: 'Test Select',
    options: mockOptions,
    onChange: () => {}
  };

  it('should render with label and placeholder', () => {
    cy.mount(<SimpleSelect {...defaultProps} value="" />);

    cy.get('.simple-select-label').should('contain', 'Test Select');
    cy.get('.simple-select-value').should('contain', 'Select an option');
  });

  it('should render with a custom placeholder', () => {
    cy.mount(
      <SimpleSelect
        {...defaultProps}
        value=""
        placeholder="Choose something"
      />
    );

    cy.get('.simple-select-value').should('contain', 'Choose something');
  });

  it('should show selected option when value is provided', () => {
    cy.mount(<SimpleSelect {...defaultProps} value={2} />);

    cy.get('.simple-select-value').should('contain', 'Option 2');
  });

  it('should open dropdown when clicked', () => {
    cy.mount(<SimpleSelect {...defaultProps} value="" />);

    // Dropdown should not be visible initially
    cy.get('.simple-select-dropdown').should('not.exist');

    // Click to open dropdown
    cy.get('.simple-select-control').click();

    // Dropdown should now be visible
    cy.get('.simple-select-dropdown').should('be.visible');

    // All options should be visible
    cy.get('.simple-select-option').should('have.length', mockOptions.length);
    mockOptions.forEach(option => {
      cy.get('.simple-select-option').contains(option.name).should('be.visible');
    });
  });

  it('should call onChange when an option is selected', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<SimpleSelect {...defaultProps} value="" onChange={onChange} />);

    // Open dropdown
    cy.get('.simple-select-control').click();

    // Select an option
    cy.get('.simple-select-option').contains('Option 2').click();

    // Check if onChange was called with the correct parameters
    cy.get('@onChange').should('have.been.calledOnce');
    cy.get('@onChange').should('have.been.calledWith', {
      target: {
        name: 'test-select',
        value: 2
      }
    });

    // Dropdown should be closed after selection
    cy.get('.simple-select-dropdown').should('not.exist');
  });

  it('should close dropdown when clicking the control again', () => {
    cy.mount(<SimpleSelect {...defaultProps} value="" />);

    // Open dropdown
    cy.get('.simple-select-control').click();
    cy.get('.simple-select-dropdown').should('be.visible');

    // Click the control again to close
    cy.get('.simple-select-control').click();

    // Dropdown should be closed
    cy.get('.simple-select-dropdown').should('not.exist');
  });

  it('should show required indicator when required is true', () => {
    cy.mount(<SimpleSelect {...defaultProps} value="" required={true} />);

    cy.get('.simple-select-required').should('be.visible');
    cy.get('.simple-select-required').should('contain', '*');
  });

  it('should show error message when error is provided', () => {
    const errorMessage = 'This field is required';
    cy.mount(<SimpleSelect {...defaultProps} value="" error={errorMessage} />);

    cy.get('.simple-select-error').should('be.visible');
    cy.get('.simple-select-error').should('contain', errorMessage);
    cy.get('.simple-select-control').should('have.class', 'error');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<SimpleSelect {...defaultProps} value="" disabled={true} />);

    cy.get('.simple-select-control').should('have.class', 'disabled');

    // Click should not open dropdown when disabled
    cy.get('.simple-select-control').click();
    cy.get('.simple-select-dropdown').should('not.exist');
  });

  it('should work with custom option keys', () => {
    const customOptions = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' }
    ];

    cy.mount(
      <SimpleSelect
        {...defaultProps}
        options={customOptions}
        optionLabelKey="label"
        optionValueKey="value"
        value="b"
      />
    );

    cy.get('.simple-select-value').should('contain', 'Option B');

    // Open dropdown
    cy.get('.simple-select-control').click();

    // All options should be visible with custom labels
    cy.get('.simple-select-option').should('have.length', customOptions.length);
    customOptions.forEach(option => {
      cy.get('.simple-select-option').contains(option.label).should('be.visible');
    });

    // Selected option should have 'selected' class
    cy.get('.simple-select-option').contains('Option B').should('have.class', 'selected');
  });

  it('should show "No options available" when options array is empty', () => {
    cy.mount(
      <SimpleSelect
        {...defaultProps}
        options={[]}
        value=""
      />
    );

    // Open dropdown
    cy.get('.simple-select-control').click();

    cy.get('.simple-select-empty').should('contain', 'No options available');
  });

  it('should handle debounced onChange', () => {
    const clock = cy.clock();
    const onChange = cy.stub().as('onChange');

    cy.mount(
      <SimpleSelect
        {...defaultProps}
        onChange={onChange}
        value=""
        debounceTime={300}
      />
    );

    // Open dropdown
    cy.get('.simple-select-control').click();

    // Select an option
    cy.get('.simple-select-option').contains('Option 2').click();

    // onChange should not be called immediately
    cy.get('@onChange').should('not.have.been.called');

    // Advance clock by debounce time
    cy.tick(300);

    // Now onChange should be called
    cy.get('@onChange').should('have.been.calledOnce');
    cy.get('@onChange').should('have.been.calledWith', {
      target: {
        name: 'test-select',
        value: 2
      }
    });
  });
});
