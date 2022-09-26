import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import alias from '@rollup/plugin-alias'
import { fileURLToPath } from 'url';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import imagePlugin from '@rollup/plugin-image';
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser';


function getPolyfillsForEnv() {
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		viteTsconfigPaths(),
		svgrPlugin(),
		alias(),
		imagePlugin(),
		{
			...inject({
				global: [
					require.resolve(
						'node-stdlib-browser/helpers/esbuild/shim'
					),
					'global'
				],
				process: [
					require.resolve(
						'node-stdlib-browser/helpers/esbuild/shim'
					),
					'process'
				],
				Buffer: [
					require.resolve(
						'node-stdlib-browser/helpers/esbuild/shim'
					),
					'Buffer'
				]
			}),
			enforce: 'post'
		}
	],
	server: {
		host: "0.0.0.0",
		port: 3000,
	},
	resolve: {
		alias: [
			{ find: "~frontend-elements", replacement: "./node_modules/@jsdp/frontend-elements/dist" },
			{ find: "~bootstrap", replacement: "./node_modules/bootstrap" },
		]
	},
	build: {
		minify: true,
		polyfillModulePreload: true,
	},
	optimizeDeps: {
		include: ['buffer', 'process'],
	}
});
