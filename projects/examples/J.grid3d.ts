import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';
import { addToComponentStore } from '$stores/componentStore';

/**
 * J. 3D GRID PATTERNS BASICS
 *
 * This example introduces GRID_XYZ for creating volumetric 3D arrays.
 *
 * KEY CONCEPTS:
 * - GRID_X() - 1D array along X-axis (columns)
 * - GRID_XY() - 2D array on XY plane (columns × rows)
 * - GRID_XYZ() - 3D array in space (columns × rows × levels)
 * - Spacing parameter adds gaps between elements
 * - All grid methods return a single merged Solid
 * - Grids are positioned from (0,0,0) by default
 *
 * SYNTAX:
 * - Solid.GRID_X(solid, { cols, spacing? })
 * - Solid.GRID_XY(solid, { cols, rows, spacing? })
 * - Solid.GRID_XYZ(solid, { cols, rows, levels, spacing? })
 *
 * SPACING:
 * - GRID_X: spacing = number (gap between columns)
 * - GRID_XY: spacing = [gapX, gapY] (gaps in X and Y)
 * - GRID_XYZ: spacing = [gapX, gapY, gapZ] (gaps in all three axes)
 * - Without spacing: elements touch each other
 * - Internal calculation: position = index * (dimension + spacing)
 *
 * ALL GRID METHODS ARE STATIC AND IMMUTABLE
 * - They return a new Solid (don't modify the input)
 * - The input solid is cloned for each grid position
 */

/**
 * Example 1: Grid Comparison - 1D, 2D, and 3D
 *
 * See the difference between GRID_X, GRID_XY, and GRID_XYZ.
 */
const gridComparison = (): Solid => {
	const cube = Solid.cube(4, 4, 4, 'red');

	// 1D grid: 5 cubes in a row along X-axis
	const grid1D = Solid.GRID_X(cube, { cols: 5 })
		.center({ x: true }) // Center the row
		.move({ y: 20 });

	// 2D grid: 5×3 cubes on XY plane
	const grid2D = Solid.GRID_XY(cube, { cols: 5, rows: 3 })
		.center({ x: true, y: true }) // Center the grid
		.move({ z: 0 });

	// 3D grid: 3×3×3 cube array (volumetric)
	const grid3D = Solid.GRID_XYZ(cube, { cols: 3, rows: 3, levels: 3 })
		.center() // Center the entire 3D volume
		.move({ y: -20 });

	return Solid.MERGE([grid1D, grid2D, grid3D]);
};

/**
 * Example 2: Spacing in 3D Grids
 *
 * Spacing adds gaps between elements for lattice structures.
 */
const spacingIn3D = (): Solid => {
	const sphere = Solid.sphere(2, { color: 'cyan' });

	// No spacing - spheres touch
	const tight = Solid.GRID_XYZ(sphere, { cols: 3, rows: 3, levels: 3 }).move({ x: -35 });

	// Uniform spacing - 2 units gap in all directions
	const uniformSpacing = Solid.GRID_XYZ(sphere, {
		cols: 3,
		rows: 3,
		levels: 3,
		spacing: [2, 2, 2]
	}).move({ x: -10 });

	// Non-uniform spacing - different gaps per axis
	const nonUniformSpacing = Solid.GRID_XYZ(sphere, {
		cols: 3,
		rows: 3,
		levels: 3,
		spacing: [4, 1, 6] // Wide X, tight Y, very wide Z
	}).move({ x: 20 });

	return Solid.MERGE([tight, uniformSpacing, nonUniformSpacing]);
};

/**
 * Example 3: 3D Lattice Structure
 *
 * Create a structural lattice using cylindrical beams in 3D space.
 */
const latticeStructure = (): Solid => {
	// Vertical posts
	const post = Solid.cylinder(0.8, 20, { color: 'gray' });
	const posts = Solid.GRID_XYZ(post, {
		cols: 4,
		rows: 4,
		levels: 1,
		spacing: [8, 8, 0]
	}).align('bottom');

	// Horizontal beams along X
	const beamX = Solid.cylinder(0.6, 32, { color: 'orange' }).rotate({ z: 90 });
	const beamsX = Solid.GRID_XYZ(beamX, {
		cols: 1,
		rows: 4,
		levels: 3,
		spacing: [0, 8, 8]
	})
		.align('left')
		.move({ y: 4, z: 4 });

	// Horizontal beams along Y (rotated 90°)
	const beamY = Solid.cylinder(0.6, 32, { color: 'yellow' }).rotate({ z: 90 }).rotate({ x: 90 });
	const beamsY = Solid.GRID_XYZ(beamY, {
		cols: 4,
		rows: 1,
		levels: 3,
		spacing: [8, 0, 8]
	})
		.align('front')
		.move({ x: 4, z: 4 });

	return Solid.MERGE([posts, beamsX, beamsY]);
};

/**
 * Example 4: 3D Checkerboard Pattern
 *
 * Demonstrates creating complex volumetric patterns with grids.
 */
const checkerboard3D = (): Solid => {
	// Create two cube types (light and dark)
	const lightCube = Solid.cube(5, 5, 5, 'white');
	const darkCube = Solid.cube(5, 5, 5, 'black');

	// Strategy: Create alternating layers
	// Layer 1 (bottom): Start with light cube
	const layer1 = Solid.MERGE([
		// Light cubes at even positions
		Solid.GRID_XY(lightCube, { cols: 3, rows: 3 }).move({ x: 0, y: 0, z: 0 }),
		// Dark cubes fill gaps
		Solid.GRID_XY(darkCube, { cols: 2, rows: 2 }).move({ x: 5, y: 5, z: 0 })
	]);

	// Layer 2 (middle): Start with dark cube (inverted pattern)
	const layer2 = Solid.MERGE([
		Solid.GRID_XY(darkCube, { cols: 3, rows: 3 }).move({ x: 0, y: 0, z: 5 }),
		Solid.GRID_XY(lightCube, { cols: 2, rows: 2 }).move({ x: 5, y: 5, z: 5 })
	]);

	// Layer 3 (top): Same as layer 1
	const layer3 = Solid.MERGE([
		Solid.GRID_XY(lightCube, { cols: 3, rows: 3 }).move({ x: 0, y: 0, z: 10 }),
		Solid.GRID_XY(darkCube, { cols: 2, rows: 2 }).move({ x: 5, y: 5, z: 10 })
	]);

	return Solid.MERGE([layer1, layer2, layer3]).center();
};

/**
 * Example 5: Practical 3D Array - Storage Shelf
 *
 * Real-world example: A multi-level storage shelf unit.
 */
const storageShelf = (): Solid => {
	// Vertical supports (corner posts)
	const post = Solid.cube(2, 40, 2, 'brown');
	const posts = Solid.GRID_XYZ(post, {
		cols: 2,
		rows: 1,
		levels: 2,
		spacing: [26, 0, 16]
	})
		.align('bottom')
		.align('left')
		.align('front');

	// Horizontal shelves
	const shelf = Solid.cube(30, 1.5, 20, 'lightgray');
	const shelves = Solid.GRID_X(shelf, { cols: 1 }) // Single column (just one shelf width-wise)
		.move({ z: 0 })
		.align('bottom')
		.align('left')
		.align('front');

	// Stack shelves at different heights
	const shelfLevel1 = shelves.move({ y: 0 });
	const shelfLevel2 = shelves.move({ y: 12 });
	const shelfLevel3 = shelves.move({ y: 24 });
	const shelfLevel4 = shelves.move({ y: 36 });

	// Add items on shelves (books represented as small cubes)
	const book = Solid.cube(2, 6, 3, 'red');
	const booksShelf2 = Solid.GRID_XY(book, { cols: 8, rows: 2, spacing: [1, 0] })
		.align('bottom')
		.move({ x: 3, y: 13.5, z: 4 });

	const booksShelf3 = Solid.GRID_XY(book, { cols: 6, rows: 3, spacing: [1.5, 0] })
		.align('bottom')
		.move({ x: 5, y: 25.5, z: 3 });

	return Solid.MERGE([
		posts,
		shelfLevel1,
		shelfLevel2,
		shelfLevel3,
		shelfLevel4,
		booksShelf2,
		booksShelf3
	]);
};

/**
 * COMMON PATTERNS:
 *
 * 1. CENTERING GRIDS:
 *    - Grids start at origin by default
 *    - Use .center() to center the entire array
 *    - Use .center({ x: true }) to center only horizontally
 *
 * 2. SPACING CALCULATIONS:
 *    - Total width = (cols - 1) * spacing + (cols * element_width)
 *    - Plan spacing based on desired total dimensions
 *    - Zero spacing = elements touch
 *
 * 3. MIXED PRIMITIVES:
 *    - Each grid uses ONE primitive type
 *    - Combine multiple grids for variety
 *    - Use MERGE to compose different grid arrays
 *
 * 4. PERFORMANCE:
 *    - Large grids (10×10×10 = 1000 elements) can be slow
 *    - Consider caching (see example L)
 *    - Test with small grids first, then scale up
 *
 * COMMON MISTAKES:
 *
 * 1. Forgetting spacing is optional:
 *    - Default is no spacing (elements touch)
 *    - Specify spacing array explicitly for gaps
 *
 * 2. Wrong spacing array length:
 *    - GRID_XYZ needs [x, y, z] (3 values)
 *    - GRID_XY needs [x, y] (2 values)
 *    - GRID_X needs just a number
 *
 * 3. Not centering after grid creation:
 *    - Grids start at (0,0,0)
 *    - Use .center() or .move() to position
 *
 * 4. Modifying the input solid:
 *    - Grid methods clone the input solid
 *    - Safe to reuse same solid in multiple grids
 */

// Register all examples for the UI dropdown
export const components: ComponentsMap = {
	'J1: Grid Comparison (1D/2D/3D)': gridComparison,
	'J2: Spacing in 3D Grids': spacingIn3D,
	'J3: 3D Lattice Structure': latticeStructure,
	'J4: 3D Checkerboard Pattern': checkerboard3D,
	'J5: Storage Shelf (Practical)': storageShelf
};

addToComponentStore(components);
