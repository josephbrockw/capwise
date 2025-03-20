import React from 'react';
import SelectableCards from '../../../src/components/ui/SelectableCards/SelectableCards';

describe('SelectableCards Component', () => {
  const mockItems = [
    { id: 1, name: 'Item 1', description: 'Description 1' },
    { id: 2, name: 'Item 2', description: 'Description 2' },
    { id: 3, name: 'Item 3', description: 'Description 3' },
    { id: 4, name: 'Item 4', description: 'Description 4' }
  ];

  const renderItem = (item, { isSelected }) => (
    <div className="test-card-content">
      <h4>{item.name}</h4>
      <p>{item.description}</p>
      {isSelected && <span className="test-selected-indicator">Selected</span>}
    </div>
  );

  it('renders all items as cards', () => {
    const onSelectionChange = cy.stub().as('onSelectionChange');

    cy.mount(
      <SelectableCards
        items={mockItems}
        renderItem={renderItem}
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    // Should render all items
    cy.get('.bb-selectable-card').should('have.length', mockItems.length);

    // Each card should contain the correct content
    mockItems.forEach(item => {
      cy.contains('.bb-selectable-card', item.name).should('exist');
      cy.contains('.bb-selectable-card', item.description).should('exist');
    });
  });

  it('renders with title and selection count', () => {
    cy.mount(
      <SelectableCards
        items={mockItems}
        renderItem={renderItem}
        selectedIds={[1, 2]}
        onSelectionChange={() => {}}
        title="Test Title"
        maxSelections={3}
      />
    );

    cy.get('.bb-selectable-cards-title').should('contain', 'Test Title');
    cy.get('.bb-selectable-cards-count').should('contain', 'Selected: 2/3');
  });

  it('shows selected items correctly', () => {
    cy.mount(
      <SelectableCards
        items={mockItems}
        renderItem={renderItem}
        selectedIds={[1, 3]}
        onSelectionChange={() => {}}
      />
    );

    // Cards with IDs 1 and 3 should be selected
    cy.contains('.bb-selectable-card', 'Item 1').should('have.class', 'bb-selectable-card-selected');
    cy.contains('.bb-selectable-card', 'Item 3').should('have.class', 'bb-selectable-card-selected');

    // Cards with IDs 2 and 4 should not be selected
    cy.contains('.bb-selectable-card', 'Item 2').should('not.have.class', 'bb-selectable-card-selected');
    cy.contains('.bb-selectable-card', 'Item 4').should('not.have.class', 'bb-selectable-card-selected');

    // Selected indicators should be present in selected cards
    cy.contains('.bb-selectable-card', 'Item 1').find('.test-selected-indicator').should('exist');
    cy.contains('.bb-selectable-card', 'Item 3').find('.test-selected-indicator').should('exist');
  });

  it('calls onSelectionChange when a card is clicked', () => {
    const onSelectionChange = cy.stub().as('onSelectionChange');

    cy.mount(
      <SelectableCards
        items={mockItems}
        renderItem={renderItem}
        selectedIds={[1]}
        onSelectionChange={onSelectionChange}
      />
    );

    // Click an unselected card (should add to selection)
    cy.contains('.bb-selectable-card', 'Item 2').click();
    cy.get('@onSelectionChange').should('have.been.calledWith', [1, 2]);

    // Reset stub
    cy.get('@onSelectionChange').invoke('resetHistory');

    // Click a selected card (should remove from selection)
    cy.contains('.bb-selectable-card', 'Item 1').click();
    cy.get('@onSelectionChange').should('have.been.calledWith', []);
  });

  it('respects maxSelections limit', () => {
    const onSelectionChange = cy.stub().as('onSelectionChange');

    cy.mount(
      <SelectableCards
        items={mockItems}
        renderItem={renderItem}
        selectedIds={[1, 2]}
        onSelectionChange={onSelectionChange}
        maxSelections={2}
      />
    );

    // Cards that are not selected should be disabled
    cy.contains('.bb-selectable-card', 'Item 3').should('have.class', 'bb-selectable-card-disabled');
    cy.contains('.bb-selectable-card', 'Item 4').should('have.class', 'bb-selectable-card-disabled');

    // Clicking a disabled card should not call onSelectionChange
    cy.contains('.bb-selectable-card', 'Item 3').click();
    cy.get('@onSelectionChange').should('not.have.been.called');

    // Clicking a selected card should still work (removing from selection)
    cy.contains('.bb-selectable-card', 'Item 1').click();
    cy.get('@onSelectionChange').should('have.been.calledWith', [2]);
  });

  it('uses custom idField when provided', () => {
    const customItems = [
      { customId: 'a', name: 'Item A' },
      { customId: 'b', name: 'Item B' },
      { customId: 'c', name: 'Item C' }
    ];

    const onSelectionChange = cy.stub().as('onSelectionChange');

    cy.mount(
      <SelectableCards
        items={customItems}
        renderItem={(item) => <div>{item.name}</div>}
        selectedIds={['a']}
        onSelectionChange={onSelectionChange}
        idField="customId"
      />
    );

    // Item with customId 'a' should be selected
    cy.contains('.bb-selectable-card', 'Item A').should('have.class', 'bb-selectable-card-selected');

    // Click an unselected card
    cy.contains('.bb-selectable-card', 'Item B').click();
    cy.get('@onSelectionChange').should('have.been.calledWith', ['a', 'b']);
  });

  it('applies compact styling when compact prop is true', () => {
    cy.mount(
      <SelectableCards
        items={mockItems}
        renderItem={renderItem}
        selectedIds={[]}
        onSelectionChange={() => {}}
        compact={true}
      />
    );

    cy.get('.bb-selectable-cards-flex').should('have.class', 'bb-selectable-cards-flex-compact');
    cy.get('.bb-selectable-card').first().should('have.class', 'selectable-card-compact');
  });

  it('applies custom className when provided', () => {
    cy.mount(
      <SelectableCards
        items={mockItems}
        renderItem={renderItem}
        selectedIds={[]}
        onSelectionChange={() => {}}
        className="custom-cards-class"
      />
    );

    cy.get('.bb-selectable-cards').should('have.class', 'custom-cards-class');
  });

  it('handles empty items array', () => {
    cy.mount(
      <SelectableCards
        items={[]}
        renderItem={renderItem}
        selectedIds={[]}
        onSelectionChange={() => {}}
        title="Empty Cards"
      />
    );

    cy.get('.bb-selectable-cards-title').should('contain', 'Empty Cards');
    cy.get('.bb-selectable-card').should('not.exist');
  });
});
