module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      'prettier/prettier': 'error',
    },
  };
  