/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-node-protocol */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [svelte()],
	build: {
		target: 'esnext',
		sourcemap: false,
		minify: true,
		cssMinify: true,
		copyPublicDir: true,
		emptyOutDir: true,
		outDir: 'docs',
		chunkSizeWarningLimit: 1500,
		assetsInlineLimit: 0
	},
	base: process.env.NODE_ENV === 'production' ? '/csg-builder' : '',
	resolve: {
		alias: {
			$components: path.resolve(__dirname, './src/components'),
			$lib: path.resolve(__dirname, './src/lib'),
			$stores: path.resolve(__dirname, './src/stores'),
			$types: path.resolve(__dirname, './src/types'),
			$projects: path.resolve(__dirname, './projects')
		}
	}
});
