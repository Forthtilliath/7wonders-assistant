import { ComponentPropsWithRef, forwardRef, useEffect, useState } from 'react';
import { cn } from '@helpers';

type Props = ComponentPropsWithRef<'input'> & {
  min?: number;
  max?: number;
  value?: number;
  setValue?: (newScore: number) => void;
};

/**
 * TODO Invert score & value
 */
export const ScoreInput = forwardRef<HTMLInputElement, Props>(
  function ScoreInput(
    {
      className,
      disabled,
      min = -Infinity,
      max = Infinity,
      value = 0,
      setValue = () => {},
      ...inputProps
    },
    ref
  ) {
    const [score, setScore] = useState(value);

    const handleChange: InputChangeEventHandler = (e) => {
      setScore(e.currentTarget.valueAsNumber);
    };

    const decrement = () => {
      setScore((v) => v - 1);
    };

    const increment = () => {
      setScore((v) => v + 1);
    };

    useEffect(() => {
      setValue(score);
    }, [score, setValue]);

    return (
      <div className="group relative h-[50px]">
        <input
          ref={ref}
          type="number"
          className={cn(
            'w-full rounded bg-slate-900 p-3 text-center outline-none ring-1 ring-slate-400 transition-shadow duration-100 disabled:ring-slate-700 group-focus:ring-2 group-focus:ring-slate-50',
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            className
          )}
          inputMode="numeric"
          disabled={disabled}
          {...inputProps}
          value={score}
          onChange={handleChange}
        />
        <button
          className="absolute left-0 top-0 h-[calc(100%_-_2px)] w-7 overflow-hidden rounded-s bg-slate-500 text-slate-950 disabled:bg-slate-700 group-focus-within:bg-slate-50"
          disabled={disabled || score === min}
          type="button"
          onClick={decrement}>
          -
        </button>
        <button
          className="absolute right-0 top-0 h-[calc(100%_-_2px)] w-7 overflow-hidden rounded-e bg-slate-500 text-slate-950 disabled:bg-slate-700 group-focus-within:bg-slate-50"
          disabled={disabled || score === max}
          type="button"
          onClick={increment}>
          +
        </button>
      </div>
    );
  }
);
