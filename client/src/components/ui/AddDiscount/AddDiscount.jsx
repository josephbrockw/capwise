import React, { useState } from 'react';
import axios from 'axios';
import Button from '../Button/Button';
import Chip from '../Chip/Chip';
import './AddDiscount.css';

const AddDiscount = ({ onApplyDiscount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/purchases/check-discount`, {
        code: discountCode.trim()
      });

      setAppliedCode(discountCode);
      setIsExpanded(false);
      onApplyDiscount(response.data);
    } catch (err) {
      console.error('Discount code error:', err);
      setError(err.response?.data?.error || 'Failed to apply discount code');
      setDiscountCode(''); // Clear the invalid code
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedCode(null);
    setDiscountCode('');
    onApplyDiscount(null);
  };

  if (appliedCode) {
    return (
      <div className="discount-section">
        <Chip
          label={`Discount applied: ${appliedCode}`}
          onDelete={handleRemoveDiscount}
        />
      </div>
    );
  }

  return (
    <div className="discount-section">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="discount-link"
        >
          Have a discount code?
        </button>
      ) : (
        <div className="discount-form">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!isLoading && discountCode.trim()) {
                  handleApplyDiscount();
                }
              }
            }}
            placeholder="Enter discount code"
            className="discount-input"
            disabled={isLoading}
          />
          {console.log('AddDiscount Button props:', {
            tag: 'div',
            label: isLoading ? 'Applying...' : 'Apply',
            disabled: isLoading || !discountCode.trim()
          })}
          <Button
            tag={'div'}
            onClick={handleApplyDiscount}
            label={isLoading ? 'Applying...' : 'Apply'}
            disabled={isLoading || !discountCode.trim()}
            className="apply-button"
            preventFormSubmit={true}
          />
          {error && <div className="discount-error">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default AddDiscount;
