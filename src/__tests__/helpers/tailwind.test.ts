import { cn } from '@/helpers';

describe('Tailwind methods', () => {
  describe('Method: cn()', () => {
    it('should return a string of concatenated class names when given one or more valid class values', () => {
      expect(cn('px-2', 'text-red-500')).toBe('px-2 text-red-500');
      expect(cn('px-2', 'py-3')).toBe('px-2 py-3');
      expect(cn('bg-green-200', 'text-red-500')).toBe(
        'bg-green-200 text-red-500'
      );
    });

    it('should return an empty string when given no input', () => {
      expect(cn()).toBe('');
    });

    it('should return an empty string when given only falsy inputs', () => {
      expect(cn(null, undefined, false, 0, '')).toBe('');
    });

    it('should merge and reorder classes', () => {
      expect(cn('px-2 py-3 p-4')).toBe('p-4');
      expect(cn('py-3 p-4', 'px-5')).toBe('p-4 px-5');
      expect(cn('px-2 p-4', 'py-6')).toBe('p-4 py-6');
      expect(cn('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]')).toBe(
        'hover:bg-dark-red p-3 bg-[#B91C1C]'
      );
    });

    it('should accept object for conditional classes', () => {
      expect(cn('p-2', { 'text-red-500': true })).toBe('p-2 text-red-500');
      expect(cn('p-2', { 'text-red-500': false })).toBe('p-2');
      expect(
        cn('p-2', { 'text-red-500': true }, { 'text-green-500': false })
      ).toBe('p-2 text-red-500');
    });
  });
});
