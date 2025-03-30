import React, { useState } from 'react';
import Tabs from '../../src/components/ui/Tabs/Tabs';

describe('Tabs Component', () => {
  const sampleTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' },
  ];

  // Create a wrapper component to test Tabs with content
  const TabsWithContent = ({ tabs, defaultActiveTab = 'tab1', className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab);

    return (
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className={className}
      >
        {tabs.map(tab => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            className={`tab-panel ${activeTab === tab.id ? 'visible' : ''}`}
          >
            {tab.id === 'tab1' && 'Content 1'}
            {tab.id === 'tab2' && 'Content 2'}
            {tab.id === 'tab3' && 'Content 3'}
          </div>
        ))}
      </Tabs>
    );
  };

  // Create a wrapper for complex content
  const TabsWithComplexContent = ({ tabs, defaultActiveTab = 'tab1' }) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab);

    return (
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div
          id={`tabpanel-${tabs[0].id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tabs[0].id}`}
          className={`tab-panel ${activeTab === tabs[0].id ? 'visible' : ''}`}
        >
          <div className="complex-content">
            <h2>Title</h2>
            <p>Paragraph</p>
          </div>
        </div>
        <div
          id={`tabpanel-${tabs[1].id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tabs[1].id}`}
          className={`tab-panel ${activeTab === tabs[1].id ? 'visible' : ''}`}
        >
          <div className="complex-content">
            <button>Click me</button>
          </div>
        </div>
      </Tabs>
    );
  };

  beforeEach(() => {
    // Clear hash before each test
    window.location.hash = '';
  });

  it('renders all tabs with correct labels', () => {
    cy.mount(<TabsWithContent tabs={sampleTabs} />);

    cy.get('.tab-item').should('have.length', 3);
    sampleTabs.forEach((tab, index) => {
      cy.get('.tab-item').eq(index).should('contain', tab.label);
    });
  });

  it('shows first tab content by default', () => {
    cy.mount(<TabsWithContent tabs={sampleTabs} />);

    cy.get('.tab-panel.visible')
      .should('have.length', 1)
      .and('contain', 'Content 1');

    cy.get('.tab-item')
      .first()
      .should('have.class', 'active')
      .and('have.attr', 'aria-selected', 'true');
  });

  it('switches content when clicking different tabs', () => {
    cy.mount(<TabsWithContent tabs={sampleTabs} />);

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

  it('maintains proper ARIA attributes', () => {
    cy.mount(<TabsWithContent tabs={sampleTabs} />);

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
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' }
    ];

    cy.mount(<TabsWithComplexContent tabs={complexTabs} />);

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
    cy.mount(<TabsWithContent tabs={sampleTabs} />);

    // Click through all tabs and verify only one panel is visible
    sampleTabs.forEach((_, index) => {
      cy.get('.tab-item').eq(index).click();
      cy.get('.tab-panel.visible').should('have.length', 1);
      cy.get('.tab-panel').not('.visible').should('have.length', 2);
    });
  });

  it('maintains selected tab styles correctly', () => {
    cy.mount(<TabsWithContent tabs={sampleTabs} />);

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

  it('applies custom className to container', () => {
    cy.mount(
      <TabsWithContent
        tabs={sampleTabs}
        className="custom-tabs-class"
      />
    );

    cy.get('.tabs-container').should('have.class', 'custom-tabs-class');
  });

  it('respects initial activeTab prop', () => {
    // Mount with second tab initially active
    cy.mount(<TabsWithContent tabs={sampleTabs} defaultActiveTab="tab2" />);

    // Check that second tab is active
    cy.get('.tab-item').eq(1).should('have.class', 'active');
    cy.get('.tab-panel.visible').should('contain', 'Content 2');
  });

  it('handles basic keyboard accessibility', () => {
    cy.mount(<TabsWithContent tabs={sampleTabs} />);

    // Focus on the first tab
    cy.get('.tab-item').first().focus();
    cy.get('.tab-item').first().should('have.focus');

    // Press Enter to activate the tab (standard accessibility behavior)
    cy.get('.tab-item').first().type('{enter}');
    cy.get('.tab-panel.visible').should('contain', 'Content 1');

    // Click on the second tab
    cy.get('.tab-item').eq(1).click();
    cy.get('.tab-panel.visible').should('contain', 'Content 2');

    // Click on the third tab
    cy.get('.tab-item').eq(2).click();
    cy.get('.tab-panel.visible').should('contain', 'Content 3');
  });

  it('handles empty tabs array gracefully', () => {
    cy.mount(
      <Tabs
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
      >
        <div>No tabs available</div>
      </Tabs>
    );

    // Check that no tabs are rendered
    cy.get('.tab-item').should('not.exist');
    // But the container should still be there
    cy.get('.tabs-container').should('exist');
  });

  it('handles dynamic tab changes', () => {
    // Create a component with dynamic tabs
    const DynamicTabs = () => {
      const [tabs, setTabs] = useState([
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ]);
      const [activeTab, setActiveTab] = useState('tab1');

      const addTab = () => {
        const newTab = { id: `tab${tabs.length + 1}`, label: `Tab ${tabs.length + 1}` };
        setTabs([...tabs, newTab]);
      };

      const removeTab = () => {
        if (tabs.length > 1) {
          const newTabs = tabs.slice(0, -1);
          setTabs(newTabs);
          // If active tab was removed, set active to last tab
          if (!newTabs.find(t => t.id === activeTab)) {
            setActiveTab(newTabs[newTabs.length - 1].id);
          }
        }
      };

      return (
        <div>
          <div className="tab-controls">
            <button onClick={addTab} className="add-tab">Add Tab</button>
            <button onClick={removeTab} className="remove-tab">Remove Tab</button>
          </div>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {tabs.map(tab => (
              <div
                key={tab.id}
                id={`tabpanel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab.id}`}
                className={`tab-panel ${activeTab === tab.id ? 'visible' : ''}`}
              >
                Content for {tab.label}
              </div>
            ))}
          </Tabs>
        </div>
      );
    };

    cy.mount(<DynamicTabs />);

    // Initially should have 2 tabs
    cy.get('.tab-item').should('have.length', 2);

    // Add a tab
    cy.get('.add-tab').click();
    cy.get('.tab-item').should('have.length', 3);
    cy.get('.tab-item').last().should('contain', 'Tab 3');

    // Remove a tab
    cy.get('.remove-tab').click();
    cy.get('.tab-item').should('have.length', 2);
  });
});
