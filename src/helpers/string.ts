export function generateURL(origin: string, args: FormData) {
  const url = new URL(origin);

  Array.from(args).map(([key, values]) =>
    Array.isArray(values)
      ? values.map((value) => url.searchParams.append(key, value))
      : url.searchParams.append(key, values as string)
  );

  return url.toString();
}