import { describe, it, expect } from 'vitest';
import { capitalize } from '../../src/utils/stringMagic';

describe('stringMagic', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle single-letter strings', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should not change already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should preserve other capital letters in the string', () => {
      expect(capitalize('helloWorld')).toBe('HelloWorld');
    });

    it('should handle strings that start with numbers', () => {
      expect(capitalize('123hello')).toBe('123hello');
    });

    it('should handle strings with spaces', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });

    it('should handle strings with special characters', () => {
      expect(capitalize('$hello')).toBe('$hello');
      expect(capitalize('@hello')).toBe('@hello');
    });

    it('should throw an error when input is not a string', () => {
      expect(() => capitalize(null)).toThrow();
      expect(() => capitalize(undefined)).toThrow();
      expect(() => capitalize(123)).toThrow();
      expect(() => capitalize({})).toThrow();
      expect(() => capitalize([])).toThrow();
    });
  });
});
