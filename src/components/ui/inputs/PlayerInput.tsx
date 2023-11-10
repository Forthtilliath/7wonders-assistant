import { forwardRef } from 'react';
import { BsPencilFill } from '../../shared/Icons';

type Props = {
  value?: string;
  onChange?: InputChangeEventHandler;
};

export const PlayerInput = forwardRef<HTMLInputElement, Props>(
  function PlayerInput({ ...inputProps }, ref) {
    return (
      <div className="relative mb-3 flex w-full flex-wrap items-stretch border-b-4 border-transparent text-slate-600 focus-within:border-wonders-yellow focus-within:text-wonders-blue-dark">
        <BsPencilFill className="absolute z-10 h-full w-8 items-center justify-center rounded py-3 pl-3 text-center text-base font-normal leading-snug" />
        <input
          ref={ref}
          type="text"
          placeholder="Name"
          className="w-full p-4 pl-10 text-slate-600 placeholder-slate-300 outline-none"
          name="name"
          {...inputProps}
        />
      </div>
    );
  }
);
