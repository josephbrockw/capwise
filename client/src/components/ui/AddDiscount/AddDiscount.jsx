import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Button from '../Button/Button';
import Chip from '../Chip/Chip';
import './AddDiscount.css';

const AddDiscount = ({ onApplyDiscount, initialCode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState(initialCode || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialCode !== undefined) {
      setAppliedCode(initialCode);
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

      const discountData = response.data.data;
      setAppliedCode(code);
      setIsExpanded(false);
      onApplyDiscount({
        discountCode: discountData.code,
        trialDays: discountData.trial_days,
        percentage: discountData.percentage,
        money: discountData.money
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
