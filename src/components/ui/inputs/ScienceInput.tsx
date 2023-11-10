import { ComponentPropsWithoutRef } from 'react';

type Props = ComponentPropsWithoutRef<'input'> & {
  img: string;
};

export function ScienceInput({ img, ...inputProps }: Props) {
  return (
    <div className="mb-4 flex gap-4">
      <img src={img} alt={inputProps.name} className="w-16" />
      <input
        type="number"
        className="border-wonders-dark w-full rounded border-2 bg-slate-900 p-3 text-center"
        defaultValue={0}
        inputMode="numeric"
        {...inputProps}
      />
    </div>
  );
}
