import { Pie } from 'react-chartjs-2';
import { TypedChartComponent } from 'react-chartjs-2/dist/types';
import 'chart.js/auto';
import { Scores } from '@types';
import { capitalize } from '@helpers';
import { CATEG } from '@constants';

type Props = {
  scores: Scores;
  extensions: string[];
};

type PieParameters = Parameters<TypedChartComponent<'pie'>>['0'];

export function PieScorePlayer({ scores, extensions }: Props) {
  const [labels, data, backgroundColor, borderColor] = Object.entries(
    scores
  ).reduce(
    (acc, [key, score]) => {
      if (CATEG[key as Category].isExtension && !extensions.includes(key)) {
        return acc;
      }

      acc[0].push(key);
      acc[1].push(score);
      acc[2].push(CATEG[key as Category].bgColor);
      acc[3].push(CATEG[key as Category].borderColor);
      return acc;
    },
    [[], [], [], []] as [string[], number[], string[], string[]]
  );

  const pieData: PieParameters['data'] = {
    labels: labels.map(capitalize),
    datasets: [
      {
        label: 'Points',
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const pieOptions: PieParameters['options'] = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return <Pie data={pieData} options={pieOptions} />;
}
