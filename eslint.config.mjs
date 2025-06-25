// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends([
    'next/core-web-vitals',
    'next',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:prettier/recommended' // ✅ Enables Prettier + disables ESLint stylistic conflicts
  ]),
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default eslintConfig;
