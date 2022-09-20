import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import pluginAlias from '@rollup/plugin-alias'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		viteTsconfigPaths(),
		svgrPlugin(),
		pluginAlias(),
	],
	server: {
		host: "0.0.0.0",
		port: 3000,
	},
	resolve: {
		alias: {
			'@frontend-elements': 'frontend-elements/dist/es/index.js',
			'@frontend-elements-scss': "./node_modules/frontend-elements/styles/*",
		}
	}
});

