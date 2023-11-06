import { useLoaderData } from 'react-router-dom';
import { ListPlayers } from '@/components/ui/statistics/ListPlayers';
import { loaderStatistics } from '@/lib/loaders';
import { Section } from '@components/layout';
import { ScorePerCategory } from '@components/ui/statistics/ScorePerCategory';

export default function Statistics() {
  const { games, players } = useLoaderData() as LoaderData<
    typeof loaderStatistics
  >;

  return (
    <main>
      <Section className="flex flex-col gap-4">
        <ScorePerCategory games={games} />
        <ListPlayers players={players} />
      </Section>
    </main>
  );
}
