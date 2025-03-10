import React from 'react';
import Product from '@/components/ui/Product/Product.jsx';

// Mock product data
const mockProducts = [
  {
    id: 'prod_1',
    name: 'Basic',
    trial_days: 14,  // Add trial days
    tiers: [
      {
        id: 'tier_1',
        name: 'Starter',
        features: {
          feature1: {
            display_name: 'Feature 1',
            included: true
          },
          feature2: {
            display_name: 'Feature 2',
            included: false
          }
        },
        prices: [
          {
            id: 'price_1',
            price: 1000, // $10.00
            billing_cycle: 'month'
          },
          {
            id: 'price_2',
            price: 10000, // $100.00
            billing_cycle: 'year'
          }
        ]
      }
    ]
  },
  {
    id: 'prod_2',
    name: 'Pro',
    trial_days: 0,  // No trial for Pro
    tiers: [
      {
        id: 'tier_2',
        name: 'Professional',
        features: {
          feature1: {
            display_name: 'Feature 1',
            included: true
          },
          feature2: {
            display_name: 'Feature 2',
            included: true
          }
        },
        prices: [
          {
            id: 'price_3',
            price: 2000, // $20.00
            billing_cycle: 'month'
          },
          {
            id: 'price_4',
            price: 20000, // $200.00
            billing_cycle: 'year'
          }
        ]
      }
    ]
  }
];

describe('Product Component', () => {
  const createMockStore = (overrides = {}) => {
    const fetchProducts = cy.stub().as('fetchProducts');
    return () => ({
      products: mockProducts,
      loading: false,
      error: null,
      fetchProducts,
      ...overrides
    });
  };

  it('renders loading state', () => {
    const mockStore = createMockStore({ loading: true, products: [] });
    cy.mount(<Product onSelect={cy.stub().as('onSelect')} store={mockStore} />);
    cy.contains('Loading products...').should('be.visible');
  });

  it('renders error state', () => {
    const mockStore = createMockStore({
      loading: false,
      products: [],
      error: 'Failed to load products'
    });
    cy.mount(<Product onSelect={cy.stub().as('onSelect')} store={mockStore} />);
    cy.contains('Error: Failed to load products').should('be.visible');
  });

  it('renders products with correct initial state', () => {
    const onSelect = cy.stub().as('onSelect');
    cy.mount(<Product onSelect={onSelect} store={createMockStore()} />);

    // Check if products are rendered
    cy.contains('Basic').should('be.visible');
    cy.contains('Pro').should('be.visible');

    // Check if features are rendered
    cy.contains('Feature 1').should('be.visible');
    cy.contains('Feature 2').should('be.visible');

    // Check if prices are rendered correctly for monthly billing
    cy.contains('$10.00').should('be.visible');
    cy.contains('$20.00').should('be.visible');

    // Verify billing cycle selector
    cy.get('.billing-select').should('contain', 'Month');
  });

  it('handles product selection', () => {
    const onSelect = cy.stub().as('onSelect');
    cy.mount(<Product onSelect={onSelect} store={createMockStore()} />);

    // Select the Basic plan
    cy.get('[data-cy="select-prod_1-Starter-month"]').click();
    cy.get('@onSelect').should('have.been.calledWith', 'prod_1', 'tier_1', 'price_1');

    // Verify selection state
    cy.get('[data-cy="select-prod_1-Starter-month"]').should('contain', 'Selected');
  });

  it('handles billing cycle changes', () => {
    const onSelect = cy.stub().as('onSelect');
    cy.mount(<Product onSelect={onSelect} store={createMockStore()} />);

    // Select monthly plan first
    cy.get('[data-cy="select-prod_1-Starter-month"]').click();
    cy.get('@onSelect').should('have.been.calledWith', 'prod_1', 'tier_1', 'price_1');

    // Change billing cycle to yearly
    cy.get('.billing-select [data-cy="select-header"]').click();
    cy.get('[data-cy="select-option-year"]').click();

    // Verify prices updated
    cy.contains('$100.00').should('be.visible');
    cy.contains('$200.00').should('be.visible');

    // Verify selection was cleared
    cy.get('@onSelect').should('have.been.calledWith', null, null, null);
  });

  it('displays correct features with icons', () => {
    cy.mount(<Product onSelect={cy.stub()} store={createMockStore()} />);

    // Check included feature
    cy.get('.feature-icon.included').should('contain', '✓');
    cy.get('.feature-text').contains('Feature 1');

    // Check not included feature
    cy.get('.feature-icon.not-included').should('contain', '✕');
    cy.get('.feature-text').contains('Feature 2');
  });

  it('displays trial days when available', () => {
    cy.mount(<Product onSelect={cy.stub()} store={createMockStore()} />);

    // Check Basic plan with trial days
    cy.contains('Basic').parent().within(() => {
      cy.contains('14 day free trial').should('be.visible');
    });

    // Check Pro plan without trial days
    cy.contains('Pro').parent().within(() => {
      cy.contains('free trial').should('not.exist');
    });
  });

  it('uses correct data-cy attributes for selection', () => {
    const onSelect = cy.stub().as('onSelect');
    cy.mount(<Product onSelect={onSelect} store={createMockStore()} />);

    // Verify data-cy attributes are present
    cy.get('[data-cy="select-prod_1-Starter-month"]').should('exist');
    cy.get('[data-cy="select-prod_2-Professional-month"]').should('exist');

    // Test selection with data-cy attribute
    cy.get('[data-cy="select-prod_1-Starter-month"]').click();
    cy.get('@onSelect').should('have.been.calledWith', 'prod_1', 'tier_1', 'price_1');

    // Change billing cycle and verify data-cy updates
    cy.get('.billing-select [data-cy="select-header"]').click();
    cy.get('[data-cy="select-option-year"]').click();
    cy.get('[data-cy="select-prod_1-Starter-year"]').should('exist');
  });

  it('fetches products on mount', () => {
    cy.mount(<Product onSelect={cy.stub()} store={createMockStore()} />);
    cy.get('@fetchProducts').should('have.been.called');
  });

  it('handles missing price for billing cycle', () => {
    // Create a product with missing price for a billing cycle
    const productsWithMissingPrice = [{
      ...mockProducts[0],
      tiers: [{
        ...mockProducts[0].tiers[0],
        prices: [
          {
            id: 'price_1',
            price: 1000,
            billing_cycle: 'month'
          },
          {
            id: 'price_2',
            price: 10000,  // Price not set for year
            billing_cycle: 'year'
          }
        ]
      }]
    }];

    const mockStore = createMockStore({ products: productsWithMissingPrice });
    cy.mount(<Product onSelect={cy.stub()} store={mockStore} />);

    // Change to yearly billing
    cy.get('.billing-select [data-cy="select-header"]').click();
    cy.get('[data-cy="select-option-year"]').click();

    // Should fall back to first available price
    cy.contains('$100.00').should('be.visible');
  });
});
