import { useLoaderData } from 'react-router-dom';
import { Section } from '@components/layout';
import { ScorePerCategory } from '@components/ui/statistics/ScorePerCategory';
import { GameHistoriesComplete } from '@types';

export default function Statistics() {
  const games = useLoaderData() as GameHistoriesComplete[];

  return (
    <main>
      <Section className="flex flex-col gap-4">
        <ScorePerCategory games={games} />
      </Section>
    </main>
  );
}
