type Props = {
  data: ArrayLike<unknown> | Record<string, unknown>;
};

export function DisplayObject({ data }: Props) {
  return <pre>{JSON.stringify(data, undefined, 2)}</pre>;
}
