import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../Button/Button';
import AddDiscount from '../AddDiscount/AddDiscount';
import './PaymentForm.css';

const PaymentForm = forwardRef(({ onSubmit, formData }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(!formData.payment_method_id);
  const [trialDays, setTrialDays] = useState(
    formData.trialDays ?? formData.selectedProduct?.trial_days ?? 0
  );

  // Check if we're in Cypress test mode
  const isTestMode = typeof window !== 'undefined' && window.Cypress?.env('CYPRESS_TEST_MODE');

  useEffect(() => {
    if (isTestMode) {
      console.log('PaymentForm initialized in test mode');
      // Auto-validate in test mode
      handleValidateCard();
    }
  }, [isTestMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    setError,
    setProcessing
  }));

  useEffect(() => {
    setTrialDays(formData.trialDays ?? formData.selectedProduct?.trial_days ?? 0);
    formData = {
      ...formData,
      trialDays: trialDays
    }
  }, [formData.trialDays, formData.selectedProduct?.trial_days]);

  const handleValidateCard = async () => {
    console.log('handleValidateCard called, isTestMode:', isTestMode);

    if (isTestMode) {
      console.log('Using test card');
      onSubmit({ payment_method_id: 'pm_test_123' });
      setIsEditing(false);
      setProcessing(false);
      return;
    }

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

      onSubmit({ payment_method_id: paymentMethod.id });
      setIsEditing(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Setup error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDiscount = (discountData) => {
    if (discountData) {
      onSubmit({
        ...formData,
        discountCode: discountData.discountCode,
        trialDays: discountData.trialDays
      });
    }
  };

  const handleReset = () => {
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }
    }
    onSubmit({
      ...formData,
      payment_method_id: null
    });
    setIsEditing(true);
    setError(null);
  };

  if (!isEditing && formData.payment_method_id) {
    return (
      <div className="payment-form">
        {trialDays > 0 && (
          <div className="trial-notice">
            <p>Your card won't be charged until after your {trialDays}-day free trial.</p>
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
        <AddDiscount
          onApplyDiscount={handleDiscount}
          initialCode={formData.discountCode}
          formData={formData}
        />
      </div>
    );
  }

  return (
    <div className="payment-form">
      <div className="card-element-container" data-cy="card-element">
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
            if (!isTestMode && e.complete && !processing && stripe) {
              handleValidateCard();
            }
          }}
          data-cy="card-element"
        />
      </div>

      {trialDays > 0 && (
        <div className="trial-notice">
          <p>Your card won't be charged until after your {trialDays}-day free trial.</p>
        </div>
      )}

      <AddDiscount
        onApplyDiscount={handleDiscount}
        initialCode={formData.discountCode}
        formData={formData}
      />

      {error && (
        <div className="payment-error" data-cy="payment-error">
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
});

export default PaymentForm;
