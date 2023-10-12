export function generateURL(origin: string, args: FormData) {
  const url = new URL(origin);

  Array.from(args).map(([key, values]) =>
    Array.isArray(values)
      ? values.map((value) => url.searchParams.append(key, value))
      : url.searchParams.append(key, values as string)
  );

  return url.toString();
}

export function generateUuidv4() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      (parseInt(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15)) >>
      (parseInt(c) / 4)
    ).toString(16)
  );
}

export function convertToNumber(str: string | null): number | null {
  let n: number | null = null;
  if (str !== null) {
    n = parseInt(str, 10);
  }
  return n;
}
