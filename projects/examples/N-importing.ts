/**
 * N. Import Capabilities - Loading External Files
 *
 * This file demonstrates how to import external geometries and SVG paths
 * to create 3D components. Import capabilities allow you to:
 * - Load STL files (binary or ASCII format) as Solid components
 * - Import SVG paths and extrude them into 3D profiles
 * - Use imported geometries in CSG operations (union, subtract, intersect)
 *
 * Key concepts:
 * - Vite import syntax: import file from './path/file.ext?raw'
 * - Solid.fromSTL() - Creates Solid from STL file data
 * - Solid.profilePrismFromSVG() - Extrudes SVG path into 3D solid
 * - All imported Solids work with standard CSG operations
 * - No new dependencies needed - STLLoader and SVGLoader included in Three.js
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

// Import STL file using Vite's import syntax
// The ?raw suffix tells Vite to import the file as a string (ASCII STL)
// For binary STL files, use ?url and fetch the data as ArrayBuffer
import sampleStl from './assets/sample.stl?raw';

/**
 * ============================================================================
 * SECTION 1: STL Import Examples
 * ============================================================================
 */

/**
 * Basic STL Import
 * Loads an ASCII STL file and creates a Solid component
 */
export const importedSTL = (): Solid => {
	// Load STL data and create Solid (automatically normalized)
	return Solid.fromSTL(sampleStl, { color: 'blue' });
};

/**
 * STL with Transformations
 * Import STL and apply transformations (position, rotation, scale)
 */
export const transformedSTL = (): Solid => {
	return Solid.fromSTL(sampleStl, { color: 'green' })
		.scale({ all: 0.5 }) // Scale down to 50%
		.rotate({ y: 45 }) // Rotate 45° around Y-axis
		.move({ y: 10 }); // Move up by 10 units
};

/**
 * ============================================================================
 * SECTION 2: Boolean Operations with Imported STL
 * ============================================================================
 */

/**
 * Subtract STL from Cube
 * Demonstrates using imported geometry in CSG operations
 */
export const subtractSTL = (): Solid => {
	// Create a cube
	const cube = Solid.cube(20, 20, 20, { color: 'red' });

	// Import STL and position it
	const imported = Solid.fromSTL(sampleStl, { color: 'blue' }).move({ x: 5, y: 5, z: 5 });

	// Subtract imported geometry from cube
	return Solid.SUBTRACT(cube, imported);
};

/**
 * Union STL with Primitives
 * Combine imported geometry with basic shapes
 */
export const unionSTL = (): Solid => {
	// Import STL
	const imported = Solid.fromSTL(sampleStl, { color: 'purple' });

	// Create a base platform
	const base = Solid.cube(15, 2, 15, { color: 'purple' }).align('bottom');

	// Combine them
	return Solid.UNION(imported, base);
};

/**
 * Intersect STL with Sphere
 * Extract the overlapping volume between imported geometry and a primitive
 */
export const intersectSTL = (): Solid => {
	const imported = Solid.fromSTL(sampleStl, { color: 'cyan' }).scale({ all: 2 });
	const sphere = Solid.sphere(8, { color: 'cyan' }).move({ x: 5, y: 5, z: 5 });

	return Solid.INTERSECT(imported, sphere);
};

/**
 * ============================================================================
 * SECTION 3: SVG Path Import Examples
 * ============================================================================
 */

/**
 * Simple SVG Rectangle
 * Basic SVG path extrusion from rectangle path
 */
export const svgRectangle = (): Solid => {
	// SVG path data: M = move to, L = line to, Z = close path
	const rectPath = 'M 0 0 L 20 0 L 20 10 L 0 10 Z';

	return Solid.profilePrismFromSVG(rectPath, 5, { color: 'orange' });
};

/**
 * SVG Star Shape
 * More complex SVG path with multiple points
 */
export const svgStar = (): Solid => {
	// 5-pointed star path
	const starPath = 'M 10 0 L 12 8 L 20 8 L 14 13 L 16 21 L 10 16 L 4 21 L 6 13 L 0 8 L 8 8 Z';

	return Solid.profilePrismFromSVG(starPath, 3, { color: 'gold' });
};

/**
 * SVG with Curves (Bezier)
 * Demonstrates SVG paths with curved segments using quadratic bezier (Q)
 */
export const svgCurved = (): Solid => {
	// Wavy path: Q = quadratic bezier (control point, end point)
	// Creates two waves going up and down
	const curvedPath = 'M 0 5 Q 5 0, 10 5 Q 15 10, 20 5 L 20 10 L 0 10 Z';

	return Solid.profilePrismFromSVG(curvedPath, 8, { color: 'pink' });
};

/**
 * SVG Heart Shape
 * Actual heart shape with cubic bezier curves
 */
export const svgHeart = (): Solid => {
	// Proper heart shape using cubic bezier curves
	// Two humps at top, point at bottom
	const heartPath =
		'M 10 6 Q 10 4, 8 3 Q 6 2, 5 4 Q 4 6, 5 8 L 10 14 L 15 8 Q 16 6, 15 4 Q 14 2, 12 3 Q 10 4, 10 6 Z';

	return Solid.profilePrismFromSVG(heartPath, 2, { color: 'red' }).scale({ all: 0.8 });
};

/**
 * ============================================================================
 * SECTION 4: Boolean Operations with SVG Imports
 * ============================================================================
 */

/**
 * SVG Profile as Cutter
 * Use imported SVG path to cut holes in primitives
 */
export const svgCutter = (): Solid => {
	// Create a thick plate
	const plate = Solid.cube(30, 20, 5, { color: 'gray' });

	// Import star shape as a cutter
	const starPath = 'M 5 0 L 6 4 L 10 4 L 7 6 L 8 10 L 5 8 L 2 10 L 3 6 L 0 4 L 4 4 Z';
	const starCutter = Solid.profilePrismFromSVG(starPath, 10, { color: 'gray' }).move({
		x: -5,
		y: 0,
		z: 0
	});

	return Solid.SUBTRACT(plate, starCutter);
};

/**
 * Multiple SVG Shapes Combined
 * Combine multiple imported SVG profiles
 */
export const multipleSVG = (): Solid => {
	// Use simple rectangle shapes instead of complex arcs
	const rect1 = 'M 0 0 L 10 0 L 10 10 L 0 10 Z';
	const rect2 = 'M 0 0 L 10 0 L 10 10 L 0 10 Z';

	const shape1 = Solid.profilePrismFromSVG(rect1, 8, { color: 'teal' }).move({ x: -5 });
	const shape2 = Solid.profilePrismFromSVG(rect2, 8, { color: 'teal' }).move({ x: 5 });

	return Solid.UNION(shape1, shape2);
};

/**
 * ============================================================================
 * SECTION 5: Advanced Import Combinations
 * ============================================================================
 */

/**
 * STL + SVG Combination
 * Combine imported STL with SVG profile extrusion
 */
export const stlPlusSVG = (): Solid => {
	// Import STL as base
	const base = Solid.fromSTL(sampleStl, { color: 'brown' }).align('bottom');

	// Create SVG profile as decoration
	const decorPath = 'M 0 0 L 5 0 L 5 5 L 0 5 Z';
	const decoration = Solid.profilePrismFromSVG(decorPath, 2, { color: 'brown' }).move({
		x: 2,
		y: 8,
		z: 2
	});

	return Solid.UNION(base, decoration);
};

/**
 * Parametric SVG Import
 * Generate SVG paths programmatically and extrude them
 */
export const parametricSVG = (sides: number = 6): Solid => {
	// Generate a regular polygon SVG path
	const radius = 8;
	const angleStep = (2 * Math.PI) / sides;

	let path = 'M ';
	for (let index = 0; index < sides; index++) {
		const x = radius + radius * Math.cos(index * angleStep);
		const y = radius + radius * Math.sin(index * angleStep);
		path += `${index === 0 ? '' : 'L '}${x.toFixed(2)} ${y.toFixed(2)} `;
	}
	path += 'Z';

	return Solid.profilePrismFromSVG(path, 6, { color: 'lime' });
};

/**
 * Import with Grid Pattern
 * Create grid array from imported geometry
 */
export const importedGrid = (): Solid => {
	// Import small STL
	const imported = Solid.fromSTL(sampleStl, { color: 'violet' }).scale({ all: 0.3 });

	// Create 3×3 grid
	return Solid.GRID_XY(imported, { cols: 3, rows: 3, spacing: [5, 5] });
};

/**
 * ============================================================================
 * Component Registration
 * ============================================================================
 */

/**
 * Component registration map
 * All import examples organized by section
 *
 * 💡 These components demonstrate:
 * - Loading external STL files
 * - Importing SVG paths for 3D extrusion
 * - Boolean operations with imported geometries
 * - Combining imports with primitives
 * - Advanced compositions with multiple import types
 */
export const components: ComponentsMap = {
	// STL Import Examples
	'N1. Import: STL Basic': importedSTL,
	'N2. Import: STL Transformed': transformedSTL,

	// Boolean Operations with STL
	'N3. Import: Subtract STL': subtractSTL,
	'N4. Import: Union STL': unionSTL,
	'N5. Import: Intersect STL': intersectSTL,

	// SVG Path Import Examples
	'N6. Import: SVG Rectangle': svgRectangle,
	'N7. Import: SVG Star': svgStar,
	'N8. Import: SVG Curved': svgCurved,
	'N9. Import: SVG Heart': svgHeart,

	// Boolean Operations with SVG
	'NA. Import: SVG Cutter': svgCutter,
	'NB. Import: Multiple SVG': multipleSVG,

	// Advanced Combinations
	'NC. Import: STL + SVG': stlPlusSVG,
	'ND. Import: Parametric SVG': () => parametricSVG(6),
	'NE. Import: Grid from STL': importedGrid
};
