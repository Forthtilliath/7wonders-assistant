export function formatDate(timestamp: number, locale?: string) {
  const date = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
}
