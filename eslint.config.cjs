const tsPlugin = require('@typescript-eslint/eslint-plugin');
const astroPlugin = require('eslint-plugin-astro');

module.exports = [
    {
        ignores: ['node_modules/**', 'dist/**', 'public/**', 'pnpm-lock.yaml', 'package-lock.json'],
    },
    {
        files: ['**/*.{js,ts,jsx,tsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
            'no-console': ['warn', {allow: ['warn', 'error']}],
        },
    },
    {
        files: ['**/*.astro'],
        processor: 'astro/astro',
        plugins: {
            astro: astroPlugin,
        },
        languageOptions: {
            parser: 'espree',
            ecmaVersion: 2021,
            sourceType: 'module',
        },
        rules: {},
    },
];
