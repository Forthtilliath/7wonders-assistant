import * as LS from '@/lib/storage';

describe('Player functions', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should add a player to localStorage', () => {
    const player = {
      id: '1',
      name: 'John Doe',
      avatar: 'avatar.jpg',
      isFavorite: 'false',
    };

    cy.wrap(player).then((p) => {
      cy.window().then((win) => {
        LS.addPlayer(p);
        const players = LS.getPlayers();
        expect(players).to.deep.equal([p]);
      });
    });
  });

  it('should get a player from localStorage', () => {
    const player = {
      id: '1',
      name: 'John Doe',
      avatar: 'avatar.jpg',
      isFavorite: 'false',
    };

    cy.wrap(player).then((p) => {
      cy.window().then((win) => {
        LS.addPlayer(p);
        const retrievedPlayer = LS.getPlayer(p.id);
        expect(retrievedPlayer).to.deep.equal(p);
      });
    });
  });

  it('should set a player in localStorage', () => {
    const player = {
      id: '1',
      name: 'John Doe',
      avatar: 'avatar.jpg',
      isFavorite: 'false',
    };

    const updatedPlayer = {
      ...player,
      name: 'Jane Doe',
    };

    cy.wrap(player).then((p) => {
      cy.window().then((win) => {
        LS.addPlayer(p);
        LS.setPlayer(updatedPlayer);
        const players = LS.getPlayers();
        expect(players).to.deep.equal([updatedPlayer]);
      });
    });
  });

  it('should remove a player from localStorage', () => {
    const player1 = {
      id: '1',
      name: 'John Doe',
      avatar: 'avatar.jpg',
      isFavorite: 'false',
    };

    const player2 = {
      id: '2',
      name: 'Jane Doe',
      avatar: 'avatar.jpg',
      isFavorite: 'false',
    };

    cy.wrap([player1, player2]).then((players) => {
      cy.window().then((win) => {
        players.forEach((p) => LS.addPlayer(p));
        LS.removePlayer(player1.id);
        const remainingPlayers = LS.getPlayers();
        expect(remainingPlayers).to.deep.equal([player2]);
      });
    });
  });
});
