import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import alias from '@rollup/plugin-alias'
import { fileURLToPath } from 'url';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';
import imagePlugin from '@rollup/plugin-image';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteTsconfigPaths(),
        svgrPlugin(),
        alias(),
        imagePlugin(),
    ],
    server: {
        host: "0.0.0.0",
        port: 3000,
    },
    resolve: {
        alias: [
            { find: "~frontend-elements", replacement: "./node_modules/frontend-elements-v2/styles" },
        ]
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                })
            ]
        }
    }
});

