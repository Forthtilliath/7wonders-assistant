import { PropsWithChildren } from "react";

export function ColumnLabels({ children }: PropsWithChildren) {
  return (
    <div className="flex w-[100px] min-w-[100px] flex-col justify-center self-start">
      {children}
    </div>
  );
}