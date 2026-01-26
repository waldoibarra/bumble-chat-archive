import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // ⛔ Global ignores (must come first)
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },

  /* =========================
     BASE TYPESCRIPT CONFIG
     ========================= */
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      /* =========================
         CONSTANT CASING RULES
         ========================= */

      // Exported constants → SCREAMING_SNAKE_CASE
      '@typescript-eslint/naming-convention': [
        'error',

        // 1️⃣ Exported constants → SCREAMING_SNAKE_CASE
        {
          selector: 'variable',
          modifiers: ['const', 'exported'],
          format: ['UPPER_CASE'],
        },

        // 2️⃣ Non-exported constants → camelCase
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },

        // 3️⃣ All other variables (let / var / params, etc.)
        {
          selector: 'variableLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },

        // 4️⃣ Functions
        {
          selector: 'function',
          format: ['camelCase'],
        },

        // 5️⃣ Types, interfaces, enums, classes
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
    },
  },

  /* =========================
     NODE FILES
     ========================= */
  {
    files: ['packages/scraper/src/node/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'packages/scraper/tsconfig.node.json'),
        tsconfigRootDir: __dirname,
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
  },

  /* =========================
     BROWSER FILES
     ========================= */
  {
    files: ['packages/scraper/src/browser/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'packages/scraper/tsconfig.browser.json'),
        tsconfigRootDir: __dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
  },

  /* =========================
     SHARED FILES
     ========================= */
  {
    files: ['packages/scraper/src/shared/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'packages/scraper/tsconfig.shared.json'),
        tsconfigRootDir: __dirname,
      },
    },
  },

  /* =========================
     WEB (Lit)
     ========================= */
  {
    files: ['packages/web/src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'packages/web/tsconfig.web.json'),
        tsconfigRootDir: __dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        customElements: 'readonly',
      },
    },
  },
];
