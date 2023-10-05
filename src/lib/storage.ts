const defaultPlayers: Player[] = [
  {
    id: '349a799f-a55d-44b3-1efa-e309e77d67ec',
    name: 'Mike',
    isFavorite: 'true',
    avatar: '/assets/images/logo-mike.png',
  },
  {
    id: 'efbedc67-2ae7-4b4d-0980-ca7d7b858bd2',
    name: 'Forth',
    isFavorite: 'false',
    avatar: '/assets/images/logo-forth.png',
  },
];

export function getPlayers(): Player[] {
  const LS = localStorage.getItem('players');

  return LS ? JSON.parse(LS) : defaultPlayers;
}

export function addPlayer(player: Player) {
  const players = getPlayers();
  players.push(player);

  localStorage.setItem('players', JSON.stringify(players));
}

export function getPlayer(id: Player['id']) {
  const players = getPlayers();

  return players.find((player) => player.id === id) ?? null;
}

export function setPlayer(data: Player) {
  const players = getPlayers();
  const playersSet = players.map((player) => player.id === data.id ? data : player);

  localStorage.setItem('players', JSON.stringify(playersSet));
}

export function removePlayer(id: Player['id']) {
  const players = getPlayers();
  const playersSet = players.filter((player) => player.id !== id);
  
  localStorage.setItem('players', JSON.stringify(playersSet));
}
