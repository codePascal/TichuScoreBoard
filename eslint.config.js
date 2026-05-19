const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const jsdocPlugin = require('eslint-plugin-jsdoc');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // ── TypeScript rules (all TS/TSX files) ───────────────────────────────────
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ── JSDoc policy (src only, tests and story fixtures are exempt) ───────────
  //
  // Non-exported module-level functions (naming convention: _prefixed):
  //   must have at minimum a one-line description.
  //
  // Exported functions:
  //   full JSDoc — description + @param (for non-destructured parameters)
  //   + @returns.
  //
  // React component props are destructured inline; they are documented with
  // @param props.xxx as a convention but not machine-enforced (checkDestructured:
  // false) to avoid boilerplate for simple presentation components.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.stories.tsx',
      'src/stories/**',
    ],
    plugins: { jsdoc: jsdocPlugin },
    rules: {
      // Every module-level function declaration must be preceded by a JSDoc block.
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: false,
            ClassDeclaration: false,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      // The JSDoc block must contain a non-empty description (enforces the one-liner policy).
      'jsdoc/require-description': 'error',
      // Exported functions: @param required for every non-destructured parameter.
      // `contexts` overrides the default set so only exported declarations are checked.
      // React component props are destructured inline; `checkDestructuredRoots: false`
      // avoids requiring a separate `@param props` entry for each component.
      'jsdoc/require-param': [
        'error',
        {
          contexts: [
            'ExportDefaultDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > FunctionDeclaration',
          ],
          checkDestructured: false,
          checkDestructuredRoots: false,
        },
      ],
      'jsdoc/require-param-description': [
        'error',
        {
          contexts: [
            'ExportDefaultDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > FunctionDeclaration',
          ],
        },
      ],
      // Exported functions: @returns required when the function has a return value.
      'jsdoc/require-returns': ['error', { publicOnly: true }],
    },
  },

  // ── Ignores ────────────────────────────────────────────────────────────────
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**'],
  },
];
