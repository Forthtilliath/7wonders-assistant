export function removeLandingZero(value: number, defaultValue = '0'): string {
  return value.toString().replace(/^0+/, '') || defaultValue;
}
