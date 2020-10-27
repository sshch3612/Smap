import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import css from 'rollup-plugin-css-only';
import pkg from './package.json';
import image from '@rollup/plugin-image';

const plugins = [
	resolve(), // so Rollup can find `ms`
	commonjs(), // so Rollup can convert `ms` to an ES module
	json(),
	image(),
	css({ output: pkg.css })
];
export default [
	// browser-friendly UMD build
	{
		input: 'src/main.js',
		output: {
			name: 'Smap',
			file: pkg.browser,
			format: 'umd'
		},
		plugins
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/main.js',
		external: ['ms'],
		plugins,
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];
