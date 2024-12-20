import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../Button/Button';
import './PaymentForm.css';

const PaymentForm = ({ onSubmit, formData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(!formData.paymentMethodId);
  const [cardComplete, setCardComplete] = useState(false);

  const handleValidateCard = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      onSubmit({ paymentMethodId: paymentMethod.id });
      setIsEditing(false); // Switch to saved card view after successful validation
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Setup error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }
    }
    onSubmit({ paymentMethodId: null });
    setIsEditing(true);
    setError(null);
  };

  if (!isEditing && formData.paymentMethodId) {
    return (
      <div className="payment-form">
        <h3>Payment Information</h3>
        {formData.selectedProduct?.trial_days > 0 && (
          <div className="trial-notice">
            <p>Your card won't be charged until after your {formData.selectedProduct.trial_days}-day free trial.</p>
          </div>
        )}
        <div className="saved-payment-method">
          <div className="payment-info">
            <span className="card-icon">💳</span>
            <span>Card saved securely</span>
          </div>
          <Button
            type="button"
            onClick={handleReset}
            className="reset-button"
            label="Use Different Card"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form">
      <div className="card-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
          onChange={(e) => {
            setError(e.error ? e.error.message : null);
            setCardComplete(e.complete);
            if (e.complete && !processing && stripe && elements) {
              handleValidateCard();
            }
          }}
        />
      </div>

      {formData.selectedProduct?.trial_days > 0 && (
        <div className="trial-notice">
          <p>Your card won't be charged until after your {formData.selectedProduct.trial_days}-day free trial.</p>
        </div>
      )}

      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}

      {processing && (
        <div className="processing-message">
          Validating card...
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
