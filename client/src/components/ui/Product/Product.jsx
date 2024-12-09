import React, { useEffect, useState } from 'react';
import useProductStore from '../../../stores/useProductStore';
import Card from '../Card/Card';
import './Product.css';
import { capitalize } from '../../../utils/stringMagic';

const Product = ({ onSelect }) => {
  const { products, loading, error, fetchProducts } = useProductStore();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('month');
  const [selectedIds, setSelectedIds] = useState({
    productId: null,
    tierId: null,
    priceId: null
  });

  useEffect(() => {
    fetchProducts();
    console.log(`Products:\n${JSON.stringify(products, null, 2)}`);
  }, [fetchProducts]);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleProductSelect = (productId, tierId, priceId) => {
    console.log(`Selected: Product ID: ${productId}, Tier ID: ${tierId}, Price ID: ${priceId}`);
    setSelectedIds({
      productId,
      tierId,
      priceId
    });
    onSelect?.(productId, tierId, priceId);
  };

  const getBillingCyclePrice = (prices) => {
    const price = prices.find(price => price.billing_cycle.toLowerCase() === selectedBillingCycle.toLowerCase());
    if (!price) {
      console.warn('No price found for billing cycle:', selectedBillingCycle);
      return prices[0];
    }
    return price;
  };

  const getBillingCycleOptions = () => Array.from(
    new Set(
      products.flatMap(
        product => product.tiers.flatMap(
          tier => tier.prices.map(
            price => price.billing_cycle
          )
        )
      )
    )
  );

  return (
    <div className="products-container">
      <div className="billing-selector">
        <select
          value={selectedBillingCycle}
          onChange={(e) => setSelectedBillingCycle(e.target.value)}
          className="billing-select"
          defaultValue="month"
        >
          {getBillingCycleOptions().map((option) => (
            <option key={option} value={option}>
              {capitalize(option)}
            </option>
          ))}
          {/*<option value="month">Monthly Billing</option>*/}
          {/*<option value="year">Annual Billing</option>*/}
        </select>
      </div>

      <div className="product-cards">
        {products.map((product) => (
          <div key={product.id} className="product-tier-container">
            <h3>{product.name}</h3>
            {product.tiers.map((tier) => {
              const price = getBillingCyclePrice(tier.prices);
              const isSelected =
                selectedIds.productId === product.id &&
                selectedIds.tierId === tier.id &&
                selectedIds.priceId === price.id;

              return (
                <Card
                  key={tier.id}
                  className={`product-card ${isSelected ? 'selected' : ''}`}
                  title={tier.name}
                >
                  <div className="product-price">
                    <span className="price-amount">${(price.price / 100).toFixed(2)}</span>
                    <span className="price-cycle">/{selectedBillingCycle}</span>
                  </div>

                  <div className="product-features">
                    {tier.features && Object.entries(tier.features).map(([key, feature]) => (
                      <div key={key} className="feature-item">
                        {feature.included ? (
                          <span className="feature-icon included">✓</span>
                        ) : (
                          <span className="feature-icon not-included">✕</span>
                        )}
                        <span className="feature-text">{feature.display_name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`select-button ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleProductSelect(product.id, tier.id, price.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;
