const spfxProfile = require('@microsoft/eslint-config-spfx/lib/flat-profiles/default');

module.exports = [
  ...spfxProfile,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
      }
    }
  },
  {
    files: ['src/webparts/**/*.ts', 'src/webparts/**/*.tsx'],
    rules: {
      'eqeqeq': 'off',
      'accessor-pairs': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    }
  }
];
