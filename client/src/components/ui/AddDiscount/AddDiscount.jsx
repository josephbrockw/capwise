import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Button from '../Button/Button';
import Chip from '../Chip/Chip';
import './AddDiscount.css';

const AddDiscount = ({ onApplyDiscount, initialCode, formData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState(initialCode?.code || null);
  const [discountData, setDiscountData] = useState(initialCode || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialCode !== undefined) {
      setAppliedCode(initialCode?.code || null);
      setDiscountData(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const code = discountCode.trim().toUpperCase();
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/purchases/check-discount`, {
        code
      });

      const data = response.data.data;
      setAppliedCode(code);
      setDiscountData(data);
      setIsExpanded(false);
      onApplyDiscount({
        discountCode: data,
        trialDays: data.trial_days
      });
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
    setDiscountData(null);
    onApplyDiscount({
      discountCode: null,
      trialDays: formData.selectedProduct?.trial_days ?? 0
    });
  };

  if (appliedCode && discountData) {
    return (
      <div className="discount-section">
        <Chip
          label={`${discountData.code} (${discountData.percentage ? `${discountData.percentage}% off` : `$${discountData.money/100} off`})`}
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
            ref={inputRef}
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
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
            style={{ textTransform: 'uppercase' }}
          />
          <Button
            tag={'div'}
            onClick={handleApplyDiscount}
            label={isLoading ? 'Applying...' : 'Apply'}
            disabled={isLoading || !discountCode.trim()}
            className="apply-button"
            data-cy="apply-button"
            preventFormSubmit={true}
          />
          {error && <div className="discount-error">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default AddDiscount;
