import { describe, expect, it } from 'vitest';
import type { Player } from '@types';
import { LS } from '@lib';
import { LS_KEY } from '@constants';

const player: Player = {
  id: '1',
  name: 'John Doe',
  avatar: 'avatar.jpg',
  isFavorite: 'false',
  isArchived: 'false',
};
describe('Test players localStorage', () => {
  beforeEach(() => {
    localStorage.removeItem(LS_KEY.players);
    LS.addPlayer(player);
  });

  it('should add a player to localStorage', () => {
    const players = LS.getPlayers();
    expect(players).toEqual([...LS.defaultPlayers, player]);
  });

  it('should get a player from localStorage', () => {
    const foundPlayer = LS.getPlayer(player.id);
    expect(foundPlayer).toEqual(player);
  });

  it('should set a player in localStorage', () => {
    const updatedPlayer = {
      ...player,
      name: 'Jane Doe',
    };
    LS.setPlayer(updatedPlayer);

    const players = LS.getPlayers();
    expect(players).toEqual([...LS.defaultPlayers, updatedPlayer]);
  });

  it('should remove a player from localStorage', () => {
    LS.removePlayer(player.id);

    const remainingPlayers = LS.getPlayers();
    expect(remainingPlayers).toEqual([...LS.defaultPlayers]);
  });
});
