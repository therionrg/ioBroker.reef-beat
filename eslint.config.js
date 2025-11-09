// @ts-check
const path = require("path");
const globals = require("globals");

// Import core packages and their recommended configurations using require()
const tsEslintPlugin = require("@typescript-eslint/eslint-plugin");
const tsEslintParser = require("@typescript-eslint/parser");
// Access recommended rules via the plugin object
const tsEslintRecommended = tsEslintPlugin.configs.recommended;
const prettierConfig = require("eslint-config-prettier");
const pluginPrettier = require("eslint-plugin-prettier");

/**
 * Merged Configuration for ioBroker adapter based on old .eslintrc.js and new flat config standards,
 * using CommonJS syntax (require/module.exports) to resolve editor errors.
 * @type {import('eslint').Linter.FlatConfig[]}
 */
module.exports = [
	// 1. Ignores: Files that ESLint should skip
	{
		ignores: [
			"**/build/",
			"**/dist/",
			"**/node_modules/",
			// Note: *.test.ts is now handled by an override object (Section 4)
		],
	},

	// 2. Base Configuration for all JS/TS files
	{
		files: ["**/*.{js,ts}"],
		languageOptions: {
			ecmaVersion: "latest", // Allows modern ECMAScript features (from old config)
			sourceType: "module",
			globals: {
				...globals.node,
				...globals.es2021,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
	},

	// 3. TypeScript Configuration (Includes @typescript-eslint/recommended and custom rules)
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsEslintParser,
			parserOptions: {
				project: path.join(__dirname, "./tsconfig.json"), // Path to your tsconfig
				tsconfigRootDir: __dirname,
			},
		},
		plugins: {
			"@typescript-eslint": tsEslintPlugin,
			prettier: pluginPrettier, // Used to run Prettier as a rule
		},
		rules: {
			// --- START: Rules from "plugin:@typescript-eslint/recommended" ---
			...tsEslintRecommended.rules,

			// --- START: Custom/Overridden Rules (Translated from old config) ---

			// Overrides from old config
			"@typescript-eslint/no-parameter-properties": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-object-literal-type-assertion": "off",
			"@typescript-eslint/interface-name-prefix": "off",
			"@typescript-eslint/no-non-null-assertion": "off",

			// Detailed rule updates
			"@typescript-eslint/no-use-before-define": [
				"error",
				{
					functions: false,
					typedefs: false,
					classes: false,
				},
			],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					ignoreRestSiblings: true,
					argsIgnorePattern: "^_", // Ensures ioBroker adapter `_` parameter is ignored
				},
			],
			"@typescript-eslint/explicit-function-return-type": [
				"warn",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
				},
			],

			// Standard JS rules
			"no-var": "error",
			"prefer-const": "error",
			"no-trailing-spaces": "error",

			// --- START: Rules that conflict with Prettier (MUST be turned off) ---
			indent: "off",
			quotes: "off",
			semi: "off",

			// --- END: Rules that conflict with Prettier ---

			// Activate the prettier check as an ESLint rule
			"prettier/prettier": "error",
		},
	},

	// 4. Test File Overrides
	{
		files: ["*.test.ts"],
		rules: {
			// Override specific rule for test files as requested in the old config
			"@typescript-eslint/explicit-function-return-type": "off",
		},
	},

	// 5. Prettier Config (MUST be the last item to turn off conflicting ESLint rules)
	// This replaces 'plugin:prettier/recommended' functionality
	prettierConfig,
];
