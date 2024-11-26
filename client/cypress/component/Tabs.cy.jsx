import Tabs from '../../src/components/ui/Tabs/Tabs';

describe('Tabs Component', () => {
  const sampleTabs = [
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
    { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
  ];

  beforeEach(() => {
    // Clear hash before each test
    window.location.hash = '';
  });

  it('renders all tabs with correct labels', () => {
    cy.mount(<Tabs tabs={sampleTabs} />);

    cy.get('.tab-item').should('have.length', 3);
    sampleTabs.forEach((tab, index) => {
      cy.get('.tab-item').eq(index).should('contain', tab.label);
    });
  });

  it('shows first tab content by default', () => {
    cy.mount(<Tabs tabs={sampleTabs} />);

    cy.get('.tab-panel.visible')
      .should('have.length', 1)
      .and('contain', 'Content 1');

    cy.get('.tab-item')
      .first()
      .should('have.class', 'active')
      .and('have.attr', 'aria-selected', 'true');
  });

  it('switches content when clicking different tabs', () => {
    cy.mount(<Tabs tabs={sampleTabs} />);

    // Click second tab
    cy.get('.tab-item').eq(1).click();
    cy.get('.tab-panel.visible')
      .should('have.length', 1)
      .and('contain', 'Content 2');
    cy.get('.tab-item')
      .eq(1)
      .should('have.class', 'active')
      .and('have.attr', 'aria-selected', 'true');

    // Click third tab
    cy.get('.tab-item').eq(2).click();
    cy.get('.tab-panel.visible')
      .should('have.length', 1)
      .and('contain', 'Content 3');
    cy.get('.tab-item')
      .eq(2)
      .should('have.class', 'active')
      .and('have.attr', 'aria-selected', 'true');
  });

  it('updates URL hash when switching tabs', () => {
    cy.mount(<Tabs tabs={sampleTabs} />);

    cy.get('.tab-item').eq(1).click();
    cy.hash().should('eq', '#tab2');

    cy.get('.tab-item').eq(2).click();
    cy.hash().should('eq', '#tab3');
  });

  it('maintains proper ARIA attributes', () => {
    cy.mount(<Tabs tabs={sampleTabs} />);

    // Check tablist role
    cy.get('.tabs-header').should('have.attr', 'role', 'tablist');

    // Check tab roles and attributes
    cy.get('.tab-item').each(($tab, index) => {
      cy.wrap($tab)
        .should('have.attr', 'role', 'tab')
        .and('have.attr', 'aria-controls', `tabpanel-${sampleTabs[index].id}`);
    });

    // Check tabpanel roles and attributes
    cy.get('.tab-panel').each(($panel, index) => {
      cy.wrap($panel)
        .should('have.attr', 'role', 'tabpanel')
        .and('have.attr', 'id', `tabpanel-${sampleTabs[index].id}`)
        .and('have.attr', 'aria-labelledby', `tab-${sampleTabs[index].id}`);
    });
  });

  it('handles complex content in tabs', () => {
    const complexTabs = [
      {
        id: 'tab1',
        label: 'Tab 1',
        content: <div className="complex-content"><h2>Title</h2><p>Paragraph</p></div>
      },
      {
        id: 'tab2',
        label: 'Tab 2',
        content: <div className="complex-content"><button>Click me</button></div>
      }
    ];

    cy.mount(<Tabs tabs={complexTabs} />);

    // Check first tab content
    cy.get('.tab-panel.visible .complex-content')
      .should('exist')
      .within(() => {
        cy.get('h2').should('contain', 'Title');
        cy.get('p').should('contain', 'Paragraph');
      });

    // Switch to second tab and check content
    cy.get('.tab-item').eq(1).click();
    cy.get('.tab-panel.visible .complex-content button')
      .should('exist')
      .and('contain', 'Click me');
  });

  it('only shows one tab panel at a time', () => {
    cy.mount(<Tabs tabs={sampleTabs} />);

    // Click through all tabs and verify only one panel is visible
    sampleTabs.forEach((_, index) => {
      cy.get('.tab-item').eq(index).click();
      cy.get('.tab-panel.visible').should('have.length', 1);
      cy.get('.tab-panel').not('.visible').should('have.length', 2);
    });
  });

  it('maintains selected tab styles correctly', () => {
    cy.mount(<Tabs tabs={sampleTabs} />);

    // Click through all tabs and verify styles
    sampleTabs.forEach((_, index) => {
      cy.get('.tab-item').eq(index).click();

      // Verify only one tab has active class
      cy.get('.tab-item.active').should('have.length', 1);

      // Verify correct tab is active
      cy.get('.tab-item')
        .eq(index)
        .should('have.class', 'active')
        .and('have.attr', 'aria-selected', 'true');

      // Verify other tabs are not active
      cy.get('.tab-item')
        .not('.active')
        .should('have.attr', 'aria-selected', 'false');
    });
  });
});
