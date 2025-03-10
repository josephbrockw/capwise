/**
 * Calculate the discounted price based on the original price and discount
 * @param {number} originalPrice - The original price in cents
 * @param {Object} discount - The discount object containing percentage or money
 * @returns {number} The discounted price in cents
 */
export const calculateDiscountedPrice = (originalPrice, discount) => {
  if (!discount) return originalPrice;

  if (discount.percentage) {
    return originalPrice * (1 - discount.percentage / 100);
  }

  if (discount.money) {
    return Math.max(0, originalPrice - discount.money);
  }

  return originalPrice;
};

/**
 * Format a price in cents to a display string with 2 decimal places
 * @param {number} priceInCents - The price in cents
 * @returns {string} The formatted price string
 */
export const formatPrice = (priceInCents) => {
  return (priceInCents / 100).toFixed(2);
};
