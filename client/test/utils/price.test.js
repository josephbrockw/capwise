import { describe, it, expect } from 'vitest';
import { calculateDiscountedPrice, formatPrice } from '../../src/utils/price';

describe('price utils', () => {
  describe('calculateDiscountedPrice', () => {
    it('returns original price when no discount is provided', () => {
      expect(calculateDiscountedPrice(1000, null)).toBe(1000);
    });

    it('calculates percentage discount correctly', () => {
      const discount = { percentage: 10 };
      // 1000 cents with 10% off should be 900 cents
      expect(calculateDiscountedPrice(1000, discount)).toBe(900);
    });

    it('calculates fixed amount discount correctly', () => {
      const discount = { money: 500 };
      // 1000 cents with $5 off should be 500 cents
      expect(calculateDiscountedPrice(1000, discount)).toBe(500);
    });

    it('prevents negative prices when fixed discount is larger than price', () => {
      const discount = { money: 1500 };
      // 1000 cents with $15 off should floor at 0
      expect(calculateDiscountedPrice(1000, discount)).toBe(0);
    });

    it('handles 100% discount correctly', () => {
      const discount = { percentage: 100 };
      expect(calculateDiscountedPrice(1000, discount)).toBe(0);
    });

    it('handles 0% discount correctly', () => {
      const discount = { percentage: 0 };
      expect(calculateDiscountedPrice(1000, discount)).toBe(1000);
    });

    it('handles $0 fixed discount correctly', () => {
      const discount = { money: 0 };
      expect(calculateDiscountedPrice(1000, discount)).toBe(1000);
    });
  });

  describe('formatPrice', () => {
    it('formats whole numbers correctly', () => {
      expect(formatPrice(1000)).toBe('10.00');
    });

    it('formats numbers with existing decimals correctly', () => {
      expect(formatPrice(1050)).toBe('10.50');
    });

    it('formats zero correctly', () => {
      expect(formatPrice(0)).toBe('0.00');
    });

    it('handles small amounts correctly', () => {
      expect(formatPrice(1)).toBe('0.01');
    });

    it('handles large amounts correctly', () => {
      expect(formatPrice(100000)).toBe('1000.00');
    });
  });
});
