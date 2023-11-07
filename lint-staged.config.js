export default {
  // Type check TypeScript files
  '**/*.(ts|tsx)': () => 'pnpx tsc --noEmit',

  // Lint then format TypeScript and JavaScript files
  '**/*.(ts|tsx|js)': (filenames) => [
    `pnpx eslint --fix ${filenames.join(' ')}`,
    `pnpx prettier --write ${filenames.join(' ')}`,
  ],

  // Format MarkDown and JSON
  '**/*.(md|json)': (filenames) =>
    `pnpx prettier --write ${filenames.join(' ')}`,
};
