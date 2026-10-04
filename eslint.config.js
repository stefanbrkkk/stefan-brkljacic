import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'test-results/**', 'playwright-report/**', '.superpowers/**'] },
  js.configs.recommended,
  { files: ['scripts/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['tests/**/*.js'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['tools/**/*.js', '*.config.js'], languageOptions: { globals: globals.node } },
  { rules: { 'no-unused-vars': ['error', { caughtErrors:'none', argsIgnorePattern:'^_' }] } },
];
