/**
 * Retrieves the value of an input element in a form.
 * @param e - The form event object.
 * @param elementName - The name of the input element.
 * @returns The trimmed value of the input element.
 */
export function getInputValue(
  e: React.FormEvent<HTMLFormElement>,
  elementName: string
): string {
  e.preventDefault();

  const inputElement = e.currentTarget.elements.namedItem(
    elementName
  ) as HTMLInputElement;

  return inputElement.value.trim();
}
