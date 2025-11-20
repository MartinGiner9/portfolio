module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:astro/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        extraFileExtensions: ['.astro'],
    },
    plugins: ['@typescript-eslint', 'astro'],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
        'no-console': ['warn', {allow: ['warn', 'error']}],
    },
    overrides: [
        {
            files: ['*.astro'],
            parser: 'astro-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
                extraFileExtensions: ['.astro'],
            },
            rules: {},
        },
    ],
};

