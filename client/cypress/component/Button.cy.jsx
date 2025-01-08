import React from 'react';
import Button from '../../src/components/ui/Button/Button';

describe('Button', () => {
    it('should render a button with label', () => {
        cy.mount(<Button label="Click me" />);
        cy.contains('Click me').should('be.visible');
        cy.get('button').should('be.visible');
    });

    it('should render a disabled button', () => {
        cy.mount(<Button label="Click me" disabled />);
        cy.contains('Click me').should('be.visible');
        cy.get('button').should('be.disabled');
        cy.get('button').should('have.attr', 'disabled');
        cy.get('button').should('have.class', 'disabled');
    });

    it('should not trigger onClick when disabled', () => {
        const onClick = cy.stub().as('onClick');
        cy.mount(<Button label="Click me" disabled onClick={onClick} />);
        cy.get('button').click({ force: true });
        cy.get('@onClick').should('not.have.been.called');
    });

    it('triggers onClick when clicked', () => {
        const onClick = cy.stub().as('onClick');
        cy.mount(<Button label="Click me" onClick={onClick} />);
        cy.get('button').click();
        cy.get('@onClick').should('have.been.calledOnce');
    });

    it('should render a full width button', () => {
        cy.mount(<Button label="Full Width" fullWidth />);
        cy.get('button').should('have.class', 'full-width');
    });

    it('should render with an icon', () => {
        cy.mount(<Button label="With Icon" icon="test-icon" />);
        cy.get('button i.icon').should('have.class', 'test-icon');
    });

    it('should apply custom className', () => {
        cy.mount(<Button label="Custom Class" className="custom-test-class" />);
        cy.get('button').should('have.class', 'custom-test-class');
    });

    it('should render as a div when tag is "div"', () => {
        cy.mount(<Button label="Div Button" tag="div" />);
        cy.get('div.custom-button').should('exist');
        cy.get('div.custom-button').should('contain', 'Div Button');
    });

    it('should handle click events when rendered as div', () => {
        const onClick = cy.stub().as('onClick');
        cy.mount(<Button label="Div Button" tag="div" onClick={onClick} />);
        cy.get('div.custom-button').click();
        cy.get('@onClick').should('have.been.calledOnce');
    });

    it('should handle disabled state when rendered as div', () => {
        const onClick = cy.stub().as('onClick');
        cy.mount(<Button label="Div Button" tag="div" disabled onClick={onClick} />);
        cy.get('div.custom-button').should('have.class', 'disabled');
        cy.get('div.custom-button').click({ force: true });
        cy.get('@onClick').should('not.have.been.called');
    });

    it('should render with different button types', () => {
        cy.mount(<Button label="Submit" type="submit" />);
        cy.get('button').should('have.attr', 'type', 'submit');

        cy.mount(<Button label="Reset" type="reset" />);
        cy.get('button').should('have.attr', 'type', 'reset');

        cy.mount(<Button label="Button" type="button" />);
        cy.get('button').should('have.attr', 'type', 'button');
    });
});
