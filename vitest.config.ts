import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			$components: path.resolve(__dirname, './src/components'),
			$lib: path.resolve(__dirname, './src/lib'),
			$stores: path.resolve(__dirname, './src/stores'),
			$types: path.resolve(__dirname, './src/types'),
			$projects: path.resolve(__dirname, './projects')
		}
	},
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/lib/**/*.ts', 'src/stores/**/*.ts'],
			exclude: ['**/*.test.ts', '**/*.spec.ts', '**/types/**', '**/*.d.ts'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		},
		include: ['tests/**/*.test.ts'],
		exclude: ['tests/test.ts'] // Exclude Playwright E2E test
	}
});
