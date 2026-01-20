module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],

  overrides: [
    // Node files
    {
      files: ['packages/scraper/src/node/**/*.ts'],
      parserOptions: {
        project: './tsconfig.node.json',
        tsconfigRootDir: __dirname,
      },
      env: {
        node: true,
      },
    },

    // Browser files
    {
      files: ['packages/scraper/src/browser/**/*.ts'],
      parserOptions: {
        project: './tsconfig.browser.json',
        tsconfigRootDir: __dirname,
      },
      env: {
        browser: true,
      },
    },

    // Shared files (no DOM, no Node)
    {
      files: ['packages/scraper/src/shared/**/*.ts'],
      parserOptions: {
        project: './tsconfig.shared.json',
        tsconfigRootDir: __dirname,
      },
    },

    // Web files
    {
      files: ['packages/web/src/**/*.ts'],
      parserOptions: {
        project: './tsconfig.web.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
