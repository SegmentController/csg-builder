#!/usr/bin/env node
/* eslint-disable no-console */

// Import projects to trigger component registration
// This must happen before we try to access components
import '../projects';

import { writeFileSync } from 'node:fs';

import { Command } from 'commander';

import { Mesh } from '../src/lib/3d/Mesh';
import { generateBinaryStlFromVertices } from '../src/lib/3d/stl';
import { getComponentStoreValue } from '../src/stores/componentStore';

const program = new Command();

program
	.name('csg-export')
	.description('Export CSG Builder components to STL format')
	.version('1.0.0');

// List command
program
	.command('list')
	.alias('--list')
	.description('List all available components')
	.action(() => {
		const components = getComponentStoreValue();

		if (components.length === 0) {
			console.log('No components found.');
			return;
		}

		console.log(`Available components (${components.length}):\n`);
		for (const component of components) {
			console.log(`  - ${component.name}`);
		}
	});

// Export command (default)
program
	.argument('[component-name]', 'Component name to export')
	.option('-o, --output <file>', 'Output file path (default: stdout)')
	.option('-l, --list', 'List all available components')
	.action((componentName: string | undefined, options: { output?: string; list?: boolean }) => {
		// Handle --list flag
		if (options.list) {
			const components = getComponentStoreValue();

			if (components.length === 0) {
				console.log('No components found.');
				return;
			}

			console.log(`Available components (${components.length}):\n`);
			for (const component of components) {
				console.log(`  - ${component.name}`);
			}
			return;
		}

		// Require component name for export
		if (!componentName) {
			console.error('Error: Component name is required for export.');
			console.error('Usage: npm run export <component-name> [-o <file>]');
			console.error('       npm run export --list');
			process.exit(1);
		}

		try {
			const components = getComponentStoreValue();
			const component = components.find((c) => c.name === componentName);

			if (!component) {
				console.error(`Error: Component "${componentName}" not found.`);
				console.error('\nAvailable components:');
				for (const c of components) {
					console.error(`  - ${c.name}`);
				}
				process.exit(1);
			}

			// Execute component to get Solid or Mesh
			const result = component.receiveData();

			// Convert Mesh to Solid if needed
			const solid = result instanceof Mesh ? result.toSolid() : result;

			// Extract vertices
			const vertices = solid.getVertices();

			// Generate STL binary
			const stlData = generateBinaryStlFromVertices(vertices);

			// Output to file or stdout
			if (options.output) {
				writeFileSync(options.output, stlData);
				console.error(`Exported "${componentName}" to ${options.output}`);
				console.error(
					`  Triangles: ${vertices.length / 9}, Size: ${Math.round(stlData.length / 1024)} KB`
				);
			} else {
				// Write binary data to stdout
				process.stdout.write(stlData);
			}
		} catch (error) {
			console.error('Error during export:');
			console.error(error);
			process.exit(1);
		}
	});

program.parse(process.argv);
