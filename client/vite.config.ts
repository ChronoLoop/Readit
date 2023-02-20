/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        checker({
            typescript: true,
            eslint: {
                lintCommand: 'eslint "./src/**/*.{ts,tsx,js,jsx}"',
            },
            overlay: false,
        }),
    ],
    server: {
        proxy: {
            '/api': 'http://localhost:5000',
        },
        port: 3000,
        open: true,
    },
    resolve: {
        alias: [
            {
                find: 'styles',
                replacement: path.resolve(__dirname, 'src/styles'),
            },
        ],
    },
    build: {
        outDir: 'build',
        assetsDir: 'static',
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        mockReset: true,
    },
});
