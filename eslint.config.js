// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // CLAUDE.md: sem `any` e sem `// @ts-ignore`.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' }],
      // Token e dados sensíveis não vão para o console.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]);
