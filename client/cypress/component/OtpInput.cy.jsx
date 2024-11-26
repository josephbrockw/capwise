import React from 'react';
import OtpInput from '../../src/components/ui/OtpInput/OtpInput';

describe('OtpInput', () => {
  beforeEach(() => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
  });

  it('should render with default length of 6 inputs', () => {
    cy.get('.otp-input').should('have.length', 6);
  });

  it('should render with custom length', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} length={4} />);
    cy.get('.otp-input').should('have.length', 4);
  });

  it('should handle single digit input', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    cy.get('.otp-input').first().type('1');
    cy.get('@onChange').should('have.been.calledWith', { value: '1' });
  });

  it('should move focus to next input after entering a digit', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    cy.get('.otp-input').first().type('1');
    cy.focused().should('have.attr', 'value', '');
    cy.focused().prev().should('have.attr', 'value', '1');
  });

  it('should handle backspace and move focus to previous input', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);

    // Type in first two inputs
    cy.get('.otp-input').first().type('1');
    cy.get('.otp-input').eq(1).type('2');

    // Press backspace to clear second input
    cy.get('.otp-input').eq(1).type('{backspace}');
    cy.get('.otp-input').eq(1).should('have.attr', 'value', '');
    cy.get('@onChange').should('have.been.calledWith', { value: '1' });

    // Press backspace again to move to first input and clear it
    cy.get('.otp-input').eq(1).type('{backspace}');
    cy.get('.otp-input').first().should('be.focused');
    cy.get('.otp-input').first().should('have.attr', 'value', '');
    cy.get('@onChange').should('have.been.calledWith', { value: '' });
  });

  it('should handle paste event', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    const pasteData = '123456';
    cy.get('.otp-input').first().trigger('paste', {
      clipboardData: {
        getData: () => pasteData,
      },
    });

    // Check if all inputs are filled
    cy.get('.otp-input').each((input, index) => {
      cy.wrap(input).should('have.attr', 'value', pasteData[index]);
    });

    // Check if onChange was called with complete value
    cy.get('@onChange').should('have.been.calledWith', { value: pasteData });
  });

  it('should handle paste event with partial data', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    const pasteData = '123';
    cy.get('.otp-input').first().trigger('paste', {
      clipboardData: {
        getData: () => pasteData,
      },
    });

    // Check first three inputs are filled
    cy.get('.otp-input').each((input, index) => {
      if (index < 3) {
        cy.wrap(input).should('have.attr', 'value', pasteData[index]);
      } else {
        cy.wrap(input).should('have.attr', 'value', '');
      }
    });

    // Check if onChange was called with partial value
    cy.get('@onChange').should('have.been.calledWith', { value: pasteData });
  });

  it('should update when value prop changes', () => {
    const onChange = cy.stub().as('onChange');
    const newValue = '123';
    cy.mount(<OtpInput onChange={onChange} value={newValue} />);

    // Check first three inputs have values
    cy.get('.otp-input').each((input, index) => {
      if (index < 3) {
        cy.wrap(input).should('have.attr', 'value', newValue[index]);
      } else {
        cy.wrap(input).should('have.attr', 'value', '');
      }
    });
  });

  it('should mask input when mask prop is true', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} mask={true} />);
    cy.get('.otp-input').first().should('have.attr', 'type', 'password');
  });

  it('should prevent input of multiple characters', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    cy.get('.otp-input').first().type('12');
    cy.get('.otp-input').first().should('have.attr', 'value', '1');
  });

  it('should handle numeric input mode', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    cy.get('.otp-input').first()
      .should('have.attr', 'inputMode', 'numeric')
      .and('have.attr', 'pattern', '[0-9]*');
  });

  it('should set autocomplete for one-time-code', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    cy.get('.otp-input').first()
      .should('have.attr', 'autoComplete', 'one-time-code');
  });

  it('should focus first empty input after partial paste', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    const pasteData = '123';
    cy.get('.otp-input').first().trigger('paste', {
      clipboardData: {
        getData: () => pasteData,
      },
    });

    // Fourth input should be focused (first empty after paste)
    cy.get('.otp-input').eq(3).should('be.focused');
  });

  it('should focus last input after complete paste', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<OtpInput onChange={onChange} />);
    const pasteData = '123456';
    cy.get('.otp-input').first().trigger('paste', {
      clipboardData: {
        getData: () => pasteData,
      },
    });

    // Last input should be focused
    cy.get('.otp-input').last().should('be.focused');
  });
});
