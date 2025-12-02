import React from 'react';
import Card from '../../src/components/ui/Card/Card';

describe('Card', () => {
    it('should render a basic card without title', () => {
        const content = 'Card content';
        cy.mount(
            <Card>
                {content}
            </Card>
        );
        cy.get('.bb-card').should('exist');
        cy.get('.bb-card-content').should('exist').and('contain', content);
        cy.get('.bb-card-title').should('not.exist');
    });

    it('should render a card with title', () => {
        const title = 'Card Title';
        const content = 'Card content';
        cy.mount(
            <Card title={title}>
                {content}
            </Card>
        );
        cy.get('.bb-card').should('exist');
        cy.get('.bb-card-title').should('exist').and('contain', title);
        cy.get('.bb-card-content').should('exist').and('contain', content);
    });

    it('should apply custom className', () => {
        const customClass = 'custom-card-class';
        cy.mount(
            <Card className={customClass}>
                Content
            </Card>
        );
        cy.get('.bb-card').should('have.class', customClass);
    });

    it('should pass through additional props', () => {
        const dataTestId = 'test-card';
        cy.mount(
            <Card data-testid={dataTestId}>
                Content
            </Card>
        );
        cy.get('.bb-card').should('have.attr', 'data-testid', dataTestId);
    });

    it('should render complex children content', () => {
        cy.mount(
            <Card title="Complex Card">
                <div className="custom-content">
                    <h3>Heading</h3>
                    <p>Paragraph</p>
                    <button>Button</button>
                </div>
            </Card>
        );
        cy.get('.bb-card-content .custom-content').should('exist');
        cy.get('.custom-content h3').should('contain', 'Heading');
        cy.get('.custom-content p').should('contain', 'Paragraph');
        cy.get('.custom-content button').should('exist');
    });
});
