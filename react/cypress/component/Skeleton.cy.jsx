import { Skeleton, CardSkeleton, ChartPanelSkeleton } from '../../src/components/ui/Skeleton/Skeleton';

describe('Skeleton Components', () => {
  describe('Base Skeleton Component', () => {
    it('renders with default props', () => {
      cy.mount(<Skeleton />);
      cy.get('.bb-skeleton')
        .should('exist')
        .and('have.class', 'bb-skeleton-rect');
    });

    it('applies variant class correctly', () => {
      const variants = ['rect', 'text', 'title', 'button', 'chart'];
      variants.forEach(variant => {
        cy.mount(<Skeleton variant={variant} />);
        cy.get('.bb-skeleton')
          .should('have.class', `bb-skeleton-${variant}`);
      });
    });

    it('applies custom className', () => {
      cy.mount(<Skeleton className="custom-class" />);
      cy.get('.bb-skeleton')
        .should('have.class', 'custom-class');
    });

    it('spreads additional props to root element', () => {
      cy.mount(
        <Skeleton
          data-testid="test-skeleton"
          style={{ width: '200px' }}
        />
      );
      cy.get('.bb-skeleton')
        .should('have.attr', 'data-testid', 'test-skeleton')
        .and('have.attr', 'style')
        .and('include', 'width: 200px');
    });
  });

  describe('CardSkeleton Component', () => {
    it('renders all skeleton elements', () => {
      cy.mount(<CardSkeleton />);

      cy.get('.bb-skeleton-card').should('exist');
      cy.get('.bb-skeleton-title').should('exist');
      cy.get('.bb-skeleton-text').should('have.length', 2);
      cy.get('.bb-skeleton-button').should('exist');
    });

    it('applies correct styles to elements', () => {
      cy.mount(<CardSkeleton />);

      cy.get('.bb-skeleton-title')
        .should('have.attr', 'style')
        .and('include', 'width: 60%')
        .and('include', 'margin-bottom: 1rem');

      cy.get('.bb-skeleton-text').first()
        .should('have.attr', 'style')
        .and('include', 'width: 100%');

      cy.get('.bb-skeleton-button')
        .should('have.attr', 'style')
        .and('include', 'width: 120px');
    });

    it('applies custom className to root element', () => {
      cy.mount(<CardSkeleton className="custom-card" />);
      cy.get('.bb-skeleton-card')
        .should('have.class', 'custom-card');
    });

    it('spreads additional props to root element', () => {
      cy.mount(<CardSkeleton data-testid="test-card" />);
      cy.get('.bb-skeleton-card')
        .should('have.attr', 'data-testid', 'test-card');
    });
  });

  describe('ChartPanelSkeleton Component', () => {
    it('renders all skeleton elements', () => {
      cy.mount(<ChartPanelSkeleton />);

      cy.get('.bb-skeleton-panel').should('exist');
      cy.get('.bb-skeleton-title').should('exist');
      cy.get('.bb-skeleton-chart').should('exist');
    });

    it('applies correct styles to elements', () => {
      cy.mount(<ChartPanelSkeleton />);

      cy.get('.bb-skeleton-title')
        .should('have.attr', 'style')
        .and('include', 'width: 40%')
        .and('include', 'margin-bottom: 1rem');

      cy.get('.bb-skeleton-chart')
        .should('have.attr', 'style')
        .and('include', 'width: 100%')
        .and('include', 'height: 300px');
    });

    it('applies custom className to root element', () => {
      cy.mount(<ChartPanelSkeleton className="custom-panel" />);
      cy.get('.bb-skeleton-panel')
        .should('have.class', 'custom-panel');
    });

    it('spreads additional props to root element', () => {
      cy.mount(<ChartPanelSkeleton data-testid="test-panel" />);
      cy.get('.bb-skeleton-panel')
        .should('have.attr', 'data-testid', 'test-panel');
    });
  });
});
