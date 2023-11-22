import { ScoreInput } from './ScoreInput';

type Props = React.ComponentProps<typeof ScoreInput> & {
  img: string;
  name: string;
};

export function ScienceInput({ img, ...inputProps }: Props) {
  return (
    <div className="mb-4 flex gap-4">
      <img src={img} alt={inputProps.name} className="w-16" />
      <ScoreInput {...inputProps} min={0} />
    </div>
  );
}
