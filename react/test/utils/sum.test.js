import { describe, it, expect } from 'vitest';
import { sum } from '../../src/utils/sum.js';

describe('sum', () => {
    it('should return the sum of two numbers', () => {
        expect(sum(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
        expect(sum(-2, 3)).toBe(1);
    });
});
