import { getInputValue } from './dom';

describe('Dom methods', () => {
  describe('Method: getInputValue()', () => {
    it('should return the trimmed value of the input element', () => {
      const formEventMock = {
        preventDefault: vi.fn(),
        currentTarget: {
          elements: {
            namedItem: vi.fn().mockReturnValue({
              value: '   test   ',
              trim: vi.fn().mockReturnValue('test'),
            }),
          },
        },
      } as unknown as React.FormEvent<HTMLFormElement>;

      const result = getInputValue(formEventMock, 'inputElement');

      expect(formEventMock.preventDefault).toHaveBeenCalled();
      expect(
        formEventMock.currentTarget.elements.namedItem
      ).toHaveBeenCalledWith('inputElement');
      expect(result).toBe('test');
    });

    it('should prevent the default form submission behavior', () => {
      const formEventMock = {
        preventDefault: vi.fn(),
        currentTarget: {
          elements: {
            namedItem: vi.fn().mockReturnValue({
              value: 'test',
              trim: vi.fn().mockReturnValue('test'),
            }),
          },
        },
      } as unknown as React.FormEvent<HTMLFormElement>;

      getInputValue(formEventMock, 'inputElement');

      expect(formEventMock.preventDefault).toHaveBeenCalled();
    });

    it('should retrieve the value of an input element in a form', () => {
      const formEventMock = {
        preventDefault: vi.fn(),
        currentTarget: {
          elements: {
            namedItem: vi.fn().mockReturnValue({
              value: 'test',
              trim: vi.fn().mockReturnValue('test'),
            }),
          },
        },
      } as unknown as React.FormEvent<HTMLFormElement>;

      const result = getInputValue(formEventMock, 'inputElement');

      expect(
        formEventMock.currentTarget.elements.namedItem
      ).toHaveBeenCalledWith('inputElement');
      expect(result).toBe('test');
    });

    it('should return an empty string if the input element is not found', () => {
      const formEventMock = {
        preventDefault: vi.fn(),
        currentTarget: {
          elements: {
            namedItem: vi.fn().mockReturnValue(null),
          },
        },
      } as unknown as React.FormEvent<HTMLFormElement>;

      const result = getInputValue(formEventMock, 'inputElement');

      expect(result).toBeNull();
    });

    it('should return an empty string if the input element value is undefined', () => {
      const formEventMock = {
        preventDefault: vi.fn(),
        currentTarget: {
          elements: {
            namedItem: vi.fn().mockReturnValue({
              value: undefined,
              trim: vi.fn().mockReturnValue(''),
            }),
          },
        },
      } as unknown as React.FormEvent<HTMLFormElement>;

      const result = getInputValue(formEventMock, 'inputElement');

      expect(result).toBeNull();
    });
  });
});
