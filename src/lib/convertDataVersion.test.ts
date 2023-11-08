import { convertDataVersion } from './convertDataVersion';
import { Data } from './zodSchemas';

it('test', () => expect(1).toBe(1));

describe('Method: convertDataVersion()', () => {
  it('should successfully convert the data to the latest schema version when given a valid input data object', () => {
    const dataIn = {
      settings: {
        version: '0.3.0',
        extensions: [],
        language: 'en',
      },
      players: [],
      history: [],
    } satisfies Data['0.3.0'];

    const result = convertDataVersion(dataIn);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(dataIn);
    }
  });

  it('should convert the data from version 0.1.0 to version 0.2.0 and then to the latest schema version when given a data object with version 0.1.0', () => {
    const dataIn = {
      settings: {
        version: '0.1.0',
        extensions: [],
        language: 'en',
      },
      players: [
        {
          idPlayer: 1,
          name: 'Player 1',
          avatar: '/assets/images/1.webp',
          isArchived: false,
          isFavorite: false,
        },
        {
          idPlayer: 2,
          name: 'Player 2',
          avatar: '/assets/images/2.webp',
          isArchived: false,
          isFavorite: false,
        },
      ],
      history: [],
    } satisfies Data['0.1.0'];

    const result = convertDataVersion(dataIn);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.settings.version).toBe('0.3.0');
      expect(result.data.players[0].isDeleted).toBe(false);
      expect(result.data.players[1].isDeleted).toBe(false);
    }
  });

  it('should convert the data from version 0.2.0 to version 0.3.0 and then to the latest schema version when given a data object with version 0.2.0', () => {
    const dataIn = {
      settings: {
        version: '0.2.0',
        extensions: [],
        language: 'en',
      },
      players: [
        {
          idPlayer: 1,
          name: 'Player 1',
          avatar: '/assets/images/1.webp',
          isArchived: false,
          isFavorite: false,
        },
        {
          idPlayer: 2,
          name: 'Player 2',
          avatar: '/assets/images/2.webp',
          isArchived: false,
          isFavorite: false,
        },
      ],
      history: [],
    } satisfies Data['0.2.0'];

    const result = convertDataVersion(dataIn);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.settings.version).toBe('0.3.0');
      expect(result.data.players[0].isDeleted).toBe(false);
      expect(result.data.players[1].isDeleted).toBe(false);
    }
  });

  it('should return a failure result when given an invalid input data object', () => {
    const dataIn = {
      settings: {
        version: '0.3.0',
        extensions: [],
        language: 'en',
      },
      players: [
        {
          idPlayer: 1,
          name: 'Player 1',
          avatar: '', // Error here
          isArchived: false,
          isFavorite: false,
          isDeleted: false,
        },
        {
          idPlayer: 2,
          name: 'Player 2',
          avatar: '/assets/images/2.webp',
          isArchived: false,
          isFavorite: false,
          isDeleted: false,
        },
      ],
      history: [],
    } satisfies Data['0.3.0'];

    const result = convertDataVersion(dataIn);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should return a failure result when given a data object with an unsupported version', () => {
    const dataIn = {
      settings: {
        version: '0.4.0', // Error here
        extensions: [],
        language: 'en',
      },
      players: [
        {
          idPlayer: 1,
          name: 'Player 1',
          avatar: '/assets/images/1.webp',
          isArchived: false,
          isFavorite: false,
          isDeleted: false,
        },
        {
          idPlayer: 2,
          name: 'Player 2',
          avatar: '/assets/images/2.webp',
          isArchived: false,
          isFavorite: false,
          isDeleted: false,
        },
      ],
      history: [],
    } as unknown as Data['0.3.0'];

    const result = convertDataVersion(dataIn);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should return a failure result when given a data object with missing required fields', () => {
    const dataIn = {
      // Missing 'settings' field
      players: [
        {
          idPlayer: 1,
          name: 'Player 1',
          avatar: '/assets/images/1.webp',
          isArchived: false,
          isFavorite: false,
          isDeleted: false,
        },
        {
          idPlayer: 2,
          name: 'Player 2',
          avatar: '/assets/images/2.webp',
          isArchived: false,
          isFavorite: false,
          isDeleted: false,
        },
      ],
      history: [],
    } as unknown as Data['0.3.0'];

    const result = convertDataVersion(dataIn);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});
