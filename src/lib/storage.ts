export function getPlayers(): Player[] {
  return JSON.parse(localStorage.getItem('players') ?? '[]');
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
