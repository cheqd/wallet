import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import alias from '@rollup/plugin-alias'
import imagePlugin from '@rollup/plugin-image';
import inject from '@rollup/plugin-inject';


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		viteTsconfigPaths(),
		splitVendorChunkPlugin(),
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
			{ find: "~frontend-elements", replacement: "./node_modules/@cheqd/wallet-frontend-elements/dist" },
			{ find: "~bootstrap", replacement: "./node_modules/bootstrap" },
		]
	},
	build: {
		minify: true,
		polyfillModulePreload: true,
	},
	optimizeDeps: {
		include: ['buffer', '@cheqd/**', '@cosmjs/**', '@ledgerhq/**', 'process', '@veramo/**'],
	}
});
