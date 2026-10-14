import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

const stagedWarnings = {
	'no-unused-vars': 'off',
	'no-unreachable': 'warn',
	'no-constant-condition': 'warn',
	'no-useless-assignment': 'warn',
	'@typescript-eslint/no-unused-vars': [
		'warn',
		{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
	],
	'@typescript-eslint/no-explicit-any': 'warn',
	'@typescript-eslint/no-unused-expressions': 'warn',
	'svelte/require-each-key': 'warn',
	'svelte/no-navigation-without-resolve': 'warn',
	'svelte/prefer-writable-derived': 'warn',
	'svelte/no-useless-mustaches': 'warn'
};

export default ts.config(
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'dist/**',
			'coverage/**',
			'node_modules/**',
			'docs/audit/**',
			'repo/**',
			'src/lib/db/role/**'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: stagedWarnings
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'warn'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			...stagedWarnings
		}
	}
);
