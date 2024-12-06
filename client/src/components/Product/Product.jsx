import React, { useEffect } from 'react';
import useProductStore from '../../stores/useProductStore';

const Product = () => {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <div>
            {product.tiers.map((tier) => (
              <div key={tier.id}>
                <h3>{tier.name}</h3>
                <div>
                  {tier.prices.map((price) => (
                    <div key={price.id}>
                      {price.billing_cycle}: ${(price.price / 100).toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Product;
