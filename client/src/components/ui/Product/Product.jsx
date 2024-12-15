import React, { useEffect, useState } from 'react';
import useProductStore from '../../../stores/useProductStore';
import Card from '../Card/Card';
import CustomSelect from '../CustomSelect/CustomSelect';
import './Product.css';

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
  }, [fetchProducts]);

  useEffect(() => {
  }, [selectedIds, selectedBillingCycle, products]);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleProductSelect = (productId, tierId, priceId) => {
    setSelectedIds(prevIds => {
      const newIds = {
        productId,
        tierId,
        priceId
      };
      console.log('Selected product details:', {
        ids: newIds,
        product: products.find(p => p.id === productId),
        tier: products.find(p => p.id === productId)?.tiers.find(t => t.id === tierId),
        price: products.find(p => p.id === productId)?.tiers.find(t => t.id === tierId)?.prices.find(p => p.id === priceId)
      });
      onSelect?.(productId, tierId, priceId);
      return newIds;
    });
  };

  const handleBillingCycleChange = (e) => {
    setSelectedBillingCycle(e.target.value);
    // Clear selected product when billing cycle changes
    setSelectedIds({
      productId: null,
      tierId: null,
      priceId: null
    });
    // Notify parent component that selection was cleared
    onSelect?.(null, null, null);
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
        <CustomSelect
          value={selectedBillingCycle}
          onChange={handleBillingCycleChange}
          options={getBillingCycleOptions()}
          defaultValue="month"
          className="billing-select"
        />
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
