import { Section } from '@components/layout';
import { ButtonNewPlayer, CardPlayer } from '@components/cards';
import { usePlayers } from '@hooks';

export default function ListPlayers() {
  const [players] = usePlayers();

  const sortedPlayed = [...players].sort((a, b) => {
    if (a.isArchived === b.isArchived) {
      return a.name.localeCompare(b.name);
    }
    return a.isArchived ? 1 : -1;
  });

  return (
    <main>
      <Section>
        <div className="mx-auto grid max-w-[800px] grid-cols-3 gap-2">
          {sortedPlayed.map((player) => (
            <CardPlayer
              key={player.idPlayer}
              {...player}
              href={`/players/edit/${player.idPlayer}`}
              showFavorite
            />
          ))}

          <ButtonNewPlayer />
        </div>
      </Section>
    </main>
  );
}
