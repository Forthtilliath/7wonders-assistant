import { BrowserRouter } from 'react-router-dom';
import ListPlayers from '@/pages/players/ListPlayers';
import NewPlayer from '@/pages/players/NewPlayer';
import { act, fireEvent, render, screen } from '@/tests/tests-utils';
import { describe } from 'vitest';
import { LS } from '@lib';
import { LS_KEY } from '@constants';
import { getPlayers } from '../utils';

/**
 * - [x] Vérifier que l'affichage initial correspond au localStorage
 * - [x] Vérifier que l'affichage initial affiche le bouton pour ajouter
 * - [-] Ajouter un nouveau joueur
 *    - [x] Vérifier le nom
 *    - [x] Ajouter un joueur favorite
 *    - [x] Ajouter un joueur non favorite
 *    - [x] Ajouter un joueur archivé
 *    - [x] Ajouter un joueur non archivé
 *    - [-] Vérifier que si on annule, l'ajout n'est pas validé
 * - [ ] Modifier un joueur
 *    - [ ] Modifier le nom
 *    - [ ] Modifier favorite
 *    - [ ] Modifier archivé
 *  - [ ] Supprimer un joueur
 */

describe('default render', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <ListPlayers />
      </BrowserRouter>
    );
  });

  it('should display players from localStorage', async () => {
    const players = getPlayers();

    players.forEach((player) => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });

  it('should display link to add a new player', async () => {
    expect(screen.getByText('Add a player')).toBeInTheDocument();
  });
});

describe('add a new player', () => {
  beforeEach(() => {
    localStorage.removeItem(LS_KEY.players);
    render(
      <BrowserRouter>
        <NewPlayer />
      </BrowserRouter>
    );
  });

  it('should display an error if name is empty', () => {
    //
  });

  it('should add a player with a string as id', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test' },
    });
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);
    expect(typeof lastPlayerStorage?.id).toBe('string');
  });

  it('should add a player with the name Forth_Test_1', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test_1' },
    });
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_1');
  });

  it('should add a player with the name Forth_Test_2 and isFavorite to "true"', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test_2' },
    });
    fireEvent.click(screen.getByLabelText('Toggle Favorite'));
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_2');
    expect(lastPlayerStorage?.isFavorite).toBe('true');
  });

  it('should add a player with the name Forth_Test_3 and isFavorite to "false"', () => {
    act(() => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Forth_Test_3' },
      });
      fireEvent.click(screen.getByLabelText('Toggle Favorite'));
      fireEvent.click(screen.getByLabelText('Toggle Favorite'));
      fireEvent.click(screen.getByLabelText('Save the Player'));
    });

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_3');
    expect(lastPlayerStorage?.isFavorite).toBe('false');
  });

  it('should add a player with the name Forth_Test_4 and isArchived to "true"', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test_4' },
    });
    fireEvent.click(screen.getByLabelText('Toggle Archive'));
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_4');
    expect(lastPlayerStorage?.isArchived).toBe('true');
  });

  it('should add a player with the name Forth_Test_5 and isArchived to "false"', () => {
    act(() => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Forth_Test_5' },
      });
      fireEvent.click(screen.getByLabelText('Toggle Archive'));
      fireEvent.click(screen.getByLabelText('Toggle Archive'));
      fireEvent.click(screen.getByLabelText('Save the Player'));
    });

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_5');
    expect(lastPlayerStorage?.isArchived).toBe('false');
  });
});

describe('set a player', () => {
  beforeEach(() => {
    localStorage.removeItem(LS_KEY.players);
    render(
      <BrowserRouter>
        <NewPlayer />
      </BrowserRouter>
    );
  });

  it('should display an error if name is empty', () => {
    //
  });

  it('should find the player in the storage', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test' },
    });
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);
    expect(typeof lastPlayerStorage?.id).toBe('string');
  });

  it('should set the player with the name Forth_Test_1_renamed', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test_1' },
    });
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_1');
  });

  it('should add a player with the name Forth_Test_2 and isFavorite to "true"', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test_2' },
    });
    fireEvent.click(screen.getByLabelText('Toggle Favorite'));
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_2');
    expect(lastPlayerStorage?.isFavorite).toBe('true');
  });

  it('should add a player with the name Forth_Test_3 and isFavorite to "false"', () => {
    act(() => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Forth_Test_3' },
      });
      fireEvent.click(screen.getByLabelText('Toggle Favorite'));
      fireEvent.click(screen.getByLabelText('Toggle Favorite'));
      fireEvent.click(screen.getByLabelText('Save the Player'));
    });

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_3');
    expect(lastPlayerStorage?.isFavorite).toBe('false');
  });

  it('should add a player with the name Forth_Test_4 and isArchived to "true"', () => {
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Forth_Test_4' },
    });
    fireEvent.click(screen.getByLabelText('Toggle Archive'));
    fireEvent.click(screen.getByLabelText('Save the Player'));

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_4');
    expect(lastPlayerStorage?.isArchived).toBe('true');
  });

  it('should add a player with the name Forth_Test_5 and isArchived to "false"', () => {
    act(() => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Forth_Test_5' },
      });
      fireEvent.click(screen.getByLabelText('Toggle Archive'));
      fireEvent.click(screen.getByLabelText('Toggle Archive'));
      fireEvent.click(screen.getByLabelText('Save the Player'));
    });

    const playersStorage = getPlayers();
    const lastPlayerStorage = playersStorage.at(-1);

    expect(playersStorage).toHaveLength(LS.defaultPlayers.length + 1);

    expect(lastPlayerStorage?.name).toBe('Forth_Test_5');
    expect(lastPlayerStorage?.isArchived).toBe('false');
  });
});
