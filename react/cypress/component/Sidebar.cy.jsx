import Sidebar from '../../src/components/ui/Sidebar/Sidebar';

describe('Sidebar Component', () => {
  const sampleItems = ['Item 1', 'Item 2', 'Item 3'];

  it('renders with items', () => {
    cy.mount(<Sidebar items={sampleItems} />);

    cy.get('.sidebar-list').should('exist');
    cy.get('.sidebar-item').should('have.length', 3);
    sampleItems.forEach((item, index) => {
      cy.get('.sidebar-item').eq(index).should('contain', item);
    });
  });

  it('is visible by default', () => {
    cy.mount(<Sidebar items={sampleItems} />);
    cy.get('.sidebar-container').should('have.class', 'visible');
  });

  it('can be hidden with isVisible prop', () => {
    cy.mount(<Sidebar items={sampleItems} isVisible={false} />);
    cy.get('.sidebar-container').should('not.have.class', 'visible');
  });

  it('shows close button in mobile mode', () => {
    cy.mount(<Sidebar items={sampleItems} isMobile={true} />);
    cy.get('.sidebar-close').should('exist');
    cy.get('.sidebar-container').should('have.class', 'mobile');
  });

  it('hides close button in desktop mode', () => {
    cy.mount(<Sidebar items={sampleItems} isMobile={false} />);
    cy.get('.sidebar-close').should('not.exist');
    cy.get('.sidebar-container').should('not.have.class', 'mobile');
  });

  it('calls onClose when close button is clicked in mobile mode', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(
      <Sidebar
        items={sampleItems}
        isMobile={true}
        onClose={onClose}
      />
    );

    cy.get('.sidebar-close').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('handles empty items array', () => {
    cy.mount(<Sidebar items={[]} />);
    cy.get('.sidebar-list').should('exist');
    cy.get('.sidebar-item').should('have.length', 0);
  });

  it('renders items with correct order', () => {
    const orderedItems = ['First', 'Second', 'Third'];
    cy.mount(<Sidebar items={orderedItems} />);

    cy.get('.sidebar-item').each(($el, index) => {
      cy.wrap($el).should('contain', orderedItems[index]);
    });
  });

  it('toggles visibility when isVisible prop changes', () => {
    // Using cy.mount with different props to simulate prop changes
    cy.mount(<Sidebar items={sampleItems} isVisible={true} />);
    cy.get('.sidebar-container').should('have.class', 'visible');

    cy.mount(<Sidebar items={sampleItems} isVisible={false} />);
    cy.get('.sidebar-container').should('not.have.class', 'visible');
  });

  it('applies mobile styles correctly', () => {
    cy.mount(<Sidebar items={sampleItems} isMobile={true} />);

    // Check for mobile-specific styles and structure
    cy.get('.sidebar-container')
      .should('have.class', 'mobile')
      .and('have.class', 'visible');

    cy.get('.sidebar-close').should('exist');
  });
});
