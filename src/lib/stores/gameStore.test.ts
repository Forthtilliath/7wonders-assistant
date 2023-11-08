import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { Player } from '@types';
import { useGameStore } from '@lib';

const defaultScoresValue = {
  military: 0,
  treasury: 0,
  wonders: 0,
  civilians: 0,
  scientifics: 0,
  commercials: 0,
  guilds: 0,
  armada: 0,
  leaders: 0,
  cities: 0,
};

describe('Store: pageAnimationStore', () => {
  it('should have a default value', () => {
    const { result } = renderHook(() => useGameStore());

    expect(result.current.extensions).toStrictEqual([]);
    expect(result.current.players).toStrictEqual([]);
    expect(result.current.scores).toStrictEqual({});

    expectTypeOf(result.current.setExtensions).toBeFunction();
    expectTypeOf(result.current.setPlayers).toBeFunction();
    expectTypeOf(result.current.setScore).toBeFunction();
    expectTypeOf(result.current.resetGame).toBeFunction();
  });

  describe('setState()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());
      act(() => {
        result.current.resetGame();
      });
    });

    it("should set the extensions to ['armada']", () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setExtensions(['armada']);
      });

      expect(result.current.extensions).toStrictEqual(['armada']);
      expect(result.current.players).toStrictEqual([]);
      expect(result.current.scores).toStrictEqual({});
    });

    it("should set the extensions to ['edifice']", () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setExtensions(['edifice']);
      });

      expect(result.current.extensions).toStrictEqual(['edifice']);
      expect(result.current.players).toStrictEqual([]);
      expect(result.current.scores).toStrictEqual({});
    });

    it('should set the players to [player1, player2]', () => {
      const { result } = renderHook(() => useGameStore());

      const player1: Player = {
        idPlayer: 1,
        avatar: '/assets/images/player1.webp',
        name: 'Player1',
        isArchived: false,
        isDeleted: false,
        isFavorite: false,
      };

      const player2: Player = {
        idPlayer: 2,
        avatar: '/assets/images/player2.webp',
        name: 'Player1',
        isArchived: false,
        isDeleted: false,
        isFavorite: false,
      };

      act(() => {
        result.current.setPlayers([player1, player2]);
      });

      expect(result.current.extensions).toStrictEqual([]);
      expect(result.current.players).toStrictEqual([player1, player2]);
      expect(result.current.scores).toStrictEqual({});
    });

    it('should set the players to [player1, player2, player3]', () => {
      const { result } = renderHook(() => useGameStore());

      const player1: Player = {
        idPlayer: 1,
        avatar: '/assets/images/player1.webp',
        name: 'Player1',
        isArchived: false,
        isDeleted: false,
        isFavorite: false,
      };

      const player2: Player = {
        idPlayer: 2,
        avatar: '/assets/images/player2.webp',
        name: 'Player1',
        isArchived: true,
        isDeleted: false,
        isFavorite: false,
      };

      const player3: Player = {
        idPlayer: 3,
        avatar: '/assets/images/player3.webp',
        name: 'Player1',
        isArchived: false,
        isDeleted: false,
        isFavorite: true,
      };

      act(() => {
        result.current.setPlayers([player1, player2, player3]);
      });

      expect(result.current.extensions).toStrictEqual([]);
      expect(result.current.players).toStrictEqual([player1, player2, player3]);
      expect(result.current.scores).toStrictEqual({});
    });

    it('should set the civilians score of playerId 1 to 15', () => {
      const { result } = renderHook(() => useGameStore());

      const playerId = 1;
      const scoreLabel = 'civilians';
      const scoreValue = 15;

      act(() => {
        result.current.setScore(scoreLabel, playerId, scoreValue);
      });

      expect(result.current.extensions).toStrictEqual([]);
      expect(result.current.players).toStrictEqual([]);
      expect(result.current.scores).toStrictEqual({
        [playerId]: {
          ...defaultScoresValue,
          [scoreLabel]: scoreValue,
        },
      });
    });

    it('should set the military score of playerId 2 to -5', () => {
      const { result } = renderHook(() => useGameStore());

      const playerId = 2;
      const scoreLabel = 'military';
      const scoreValue = -5;

      act(() => {
        result.current.setScore(scoreLabel, playerId, scoreValue);
      });

      expect(result.current.extensions).toStrictEqual([]);
      expect(result.current.players).toStrictEqual([]);
      expect(result.current.scores).toStrictEqual({
        [playerId]: {
          ...defaultScoresValue,
          [scoreLabel]: scoreValue,
        },
      });
    });

    it('should set the multiple scores of playerId 3', () => {
      const { result } = renderHook(() => useGameStore());

      const playerId = 3;
      const scores: { label: Category; value: number }[] = [
        {
          label: 'military',
          value: -6,
        },
        {
          label: 'scientifics',
          value: 36,
        },
        {
          label: 'wonders',
          value: 15,
        },
      ];

      act(() => {
        scores.forEach(({ label, value }) => {
          result.current.setScore(label, playerId, value);
        });
      });

      expect(result.current.extensions).toStrictEqual([]);
      expect(result.current.players).toStrictEqual([]);
      expect(result.current.scores).toStrictEqual({
        [playerId]: {
          ...defaultScoresValue,
          military: -6,
          scientifics: 36,
          wonders: 15,
        },
      });
    });
  });
});
