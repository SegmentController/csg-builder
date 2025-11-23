import { Solid } from '$lib/3d/Solid';
import { cacheFunction, cacheInlineFunction } from '$lib/cacheFunction';
import type { ComponentsMap } from '$stores/componentStore';
import { addToComponentStore } from '$stores/componentStore';

/**
 * L. PERFORMANCE & CACHING
 *
 * This example demonstrates optimization techniques for complex CSG Builder projects.
 *
 * KEY CONCEPTS:
 * - cacheFunction() - Caches named function results
 * - cacheInlineFunction() - Caches arrow/anonymous function results
 * - Cache key generation (function name + serialized arguments)
 * - Result cloning for immutability
 * - When to cache vs when not to cache
 *
 * CACHING UTILITIES:
 * - import { cacheFunction, cacheInlineFunction } from '$lib/cacheFunction'
 * - Both return cached clones (each call gets independent instance)
 * - Cache persists for session (not automatically cleared)
 * - Only works with functions returning Solid instances
 *
 * WHEN TO CACHE:
 * ✅ Component functions called multiple times with same parameters
 * ✅ Expensive CSG operations in reusable parts
 * ✅ Grid/array patterns using same base shape repeatedly
 * ✅ Parametric components reused in different contexts
 *
 * WHEN NOT TO CACHE:
 * ❌ Functions with side effects
 * ❌ One-time components never reused
 * ❌ Very simple/fast operations (overhead not worth it)
 * ❌ Functions with non-serializable parameters (functions, symbols, etc.)
 */

/**
 * Example 1: Basic cacheFunction Usage
 *
 * Cache a named function that creates an expensive component.
 */

// Define the expensive component function (lots of CSG operations)
const createExpensiveBrick = (width: number, height: number, depth: number): Solid => {
	// Complex brick with multiple features (expensive CSG operations)
	const body = Solid.cube(width, height, depth, { color: 'red' });

	// Add holes on sides (expensive subtraction)
	const hole = Solid.cylinder(height * 0.15, width * 1.2, { color: 'red' }).rotate({ z: 90 });
	const bodyWithHoles = Solid.SUBTRACT(
		body,
		hole.move({ y: height * 0.5, z: depth * 0.3 }),
		hole.move({ y: height * 0.5, z: depth * 0.7 })
	);

	// Add decorative grooves (more expensive operations)
	const groove1 = Solid.cube(width * 0.9, height * 0.1, depth * 0.05, { color: 'red' })
		.center({ x: true, y: true })
		.move({ z: -depth * 0.5 });
	const groove2 = Solid.cube(width * 0.9, height * 0.1, depth * 0.05, { color: 'red' })
		.center({ x: true, y: true })
		.move({ z: depth * 0.5 });

	return Solid.SUBTRACT(bodyWithHoles, groove1, groove2);
};

// Wrap with cache - now repeated calls with same params return cached result
const cachedBrick = cacheFunction(createExpensiveBrick);

const basicCaching = (): Solid => {
	// First call: Computes and caches result for (8, 3, 4)
	const brick1 = cachedBrick(8, 3, 4).move({ x: -15 });

	// Second call: Returns cached result instantly! (same parameters)
	const brick2 = cachedBrick(8, 3, 4).move({ x: 0 });

	// Third call: Different parameters - computes and caches new result
	const brick3 = cachedBrick(10, 4, 5).move({ x: 20 });

	return Solid.MERGE([brick1, brick2, brick3]);
};

/**
 * Example 2: cacheInlineFunction Usage
 *
 * Cache arrow functions or when function.name isn't available.
 * Requires explicit name as first parameter.
 */
const inlineCaching = (): Solid => {
	// Cache an arrow function with explicit name
	const cachedColumn = cacheInlineFunction('Column', (height: number, radius: number): Solid => {
		// Complex column with base, shaft, and capital
		const base = Solid.cylinder(radius * 1.5, height * 0.1, { color: 'gray' }).align('bottom');

		const shaft = Solid.cylinder(radius, height * 0.7, { color: 'lightgray' })
			.align('bottom')
			.move({ y: height * 0.1 });

		// Fluted shaft (expensive - multiple subtractions)
		let flutedShaft = shaft;
		for (let index = 0; index < 4; index++) {
			const flute = Solid.cylinder(radius * 0.15, height * 0.72, { color: 'lightgray' })
				.align('bottom')
				.move({ x: radius * 0.8, y: height * 0.09 })
				.rotate({ y: index * 45 });
			flutedShaft = Solid.SUBTRACT(flutedShaft, flute);
		}

		const capital = Solid.cylinder(radius * 1.4, height * 0.2, { color: 'gray' })
			.align('bottom')
			.move({ y: height * 0.8 });

		return Solid.MERGE([base, flutedShaft, capital]);
	});

	// First call: Computes result
	const column1 = cachedColumn(20, 2).move({ x: -15 });

	// Second call: Cached result (same params)
	const column2 = cachedColumn(20, 2).move({ x: 15 });

	return Solid.MERGE([column1, column2]);
};

/**
 * Example 3: Cached Components in Grids
 *
 * HUGE performance gain when using cached components in grids.
 * The component is only computed once, then cloned for each grid position.
 */
const cachedInGrids = (): Solid => {
	// Create an expensive decorative tile
	const cachedTile = cacheInlineFunction('DecorativeTile', (size: number): Solid => {
		const base = Solid.cube(size, size, 1, { color: 'blue' });

		// Add decorative pattern (expensive)
		const circle = Solid.cylinder(size * 0.3, 2, { color: 'blue' })
			.center({ x: true, z: true })
			.move({ y: 0.5 });

		const corners: Solid[] = [];
		for (let index = 0; index < 4; index++) {
			const corner = Solid.sphere(size * 0.15, { color: 'blue' })
				.move({ x: size * 0.35, z: size * 0.35 })
				.rotate({ y: index * 90 })
				.center({ x: true, z: true })
				.move({ y: 0.5 });
			corners.push(corner);
		}

		return Solid.SUBTRACT(base, circle, ...corners);
	});

	// Without caching: Each grid position would recompute the tile (very slow!)
	// With caching: Tile computed once, then cloned 25 times (fast!)
	const tile = cachedTile(5); // Only computed once!
	const tileGrid = Solid.GRID_XY(tile, { cols: 5, rows: 5, spacing: [1, 1] });

	return tileGrid.center();
};

/**
 * Example 4: Hierarchical Caching
 *
 * Cache at multiple levels for maximum performance.
 * Cache basic components, then cache assemblies that use them.
 */
const hierarchicalCaching = (): Solid => {
	// Level 1: Cache individual parts
	const cachedWindow = cacheInlineFunction('Window', (width: number, height: number): Solid => {
		const frame = Solid.cube(width, height, 2, { color: 'brown' });
		const glass = Solid.cube(width - 1, height - 1, 1, { color: 'cyan' })
			.center({ x: true, y: true })
			.move({ z: 0.5 });
		const divider = Solid.cube(0.5, height, 2, { color: 'brown' }).center({ x: true, y: true });
		return Solid.MERGE([frame, glass, divider]);
	});

	// Level 2: Cache assemblies that use cached parts
	const cachedWallWithWindows = cacheInlineFunction(
		'WallWithWindows',
		(wallWidth: number, wallHeight: number): Solid => {
			const wall = Solid.cube(wallWidth, wallHeight, 3, { color: 'lightgray' });

			// Use cached windows - each window(6, 8) call returns cached result
			const window1 = cachedWindow(6, 8)
				.move({ x: wallWidth * 0.2, y: wallHeight * 0.5, z: 1.5 })
				.center({ x: true, y: true });
			const window2 = cachedWindow(6, 8)
				.move({ x: wallWidth * 0.5, y: wallHeight * 0.5, z: 1.5 })
				.center({ x: true, y: true });
			const window3 = cachedWindow(6, 8)
				.move({ x: wallWidth * 0.8, y: wallHeight * 0.5, z: 1.5 })
				.center({ x: true, y: true });

			return Solid.MERGE([wall, window1, window2, window3]);
		}
	);

	// Level 3: Use cached assemblies in final composition
	const wall1 = cachedWallWithWindows(40, 20).move({ z: -10 }); // Computed and cached
	const wall2 = cachedWallWithWindows(40, 20).move({ z: 10 }); // Cached result!

	return Solid.MERGE([wall1, wall2]).center({ x: true });
};

/**
 * Example 5: Real-World Optimization Pattern
 *
 * Combines all optimization techniques for a complete structure.
 * This pattern is used in production code like /projects/castle.
 */
const realWorldOptimization = (): Solid => {
	// 1. Cache expensive primitives
	const cachedOrnament = cacheInlineFunction('Ornament', (): Solid => {
		const sphere = Solid.sphere(2, { color: 'gold' });
		const cone = Solid.cone(1.5, 3, { color: 'gold' }).align('bottom').move({ y: 2 });
		return Solid.MERGE([sphere, cone]);
	});

	// 2. Cache building blocks
	const cachedPost = cacheInlineFunction('Post', (height: number): Solid => {
		const post = Solid.cube(2, height, 2, { color: 'brown' }).align('bottom');
		const ornament = cachedOrnament().move({ y: height }).center({ x: true, z: true }); // Reuses cached ornament
		return Solid.MERGE([post, ornament]);
	});

	// 3. Cache assemblies
	const cachedRailing = cacheInlineFunction('Railing', (length: number): Solid => {
		const posts = Solid.GRID_X(cachedPost(8), { cols: 5, spacing: length / 4 - 2 }).align('left');
		const rail = Solid.cube(length, 1, 1, { color: 'brown' })
			.align('bottom')
			.move({ y: 6, z: 0.5 });
		return Solid.MERGE([posts, rail]);
	});

	// 4. Compose final structure using all cached components
	const railing1 = cachedRailing(30).move({ x: -15, z: -8 }); // Computed
	const railing2 = cachedRailing(30).move({ x: -15, z: 8 }); // Cached!

	const platform = Solid.cube(60, 1, 18, { color: 'gray' })
		.align('bottom')
		.center({ x: true, z: true });

	return Solid.MERGE([platform, railing1, railing2]);
};

/**
 * PERFORMANCE BEST PRACTICES:
 *
 * 1. CACHE STRATEGY:
 *    - Cache from bottom-up (primitives → building blocks → assemblies)
 *    - Cache functions called multiple times with same params
 *    - Don't cache one-time use functions
 *
 * 2. PARAMETER SERIALIZATION:
 *    - Keep parameters simple (numbers, strings, booleans)
 *    - Avoid objects/arrays as parameters (serialization issues)
 *    - Cache key = functionName + JSON.stringify(args)
 *
 * 3. MEMORY CONSIDERATIONS:
 *    - Each cached result stores a clone in memory
 *    - Large grids with many unique parameter sets use more memory
 *    - Cache persists for session (not cleared automatically)
 *
 * 4. TRANSFORM BEFORE CSG:
 *    - Transforms (.move, .rotate, .scale) are cheap
 *    - CSG operations (SUBTRACT, UNION) are expensive
 *    - Transform primitives before boolean operations
 *
 * 5. GRID OPTIMIZATION:
 *    - Use cached components as grid elements
 *    - Avoid CSG operations inside grid loops
 *    - Pattern: Create element with CSG, cache it, then grid it
 *
 * DEBUGGING CACHE:
 *
 * 1. CACHE MISSES:
 *    - Check parameter values are identical (8 ≠ 8.0 in some cases)
 *    - Verify function name is correct (for cacheInlineFunction)
 *    - Parameters must be serializable (functions/symbols fail)
 *
 * 2. UNEXPECTED RESULTS:
 *    - Remember: Returns CLONES, not references
 *    - Each call gets independent solid (transforms don't affect cache)
 *    - Modifying returned solid doesn't affect cached version
 *
 * 3. PERFORMANCE NOT IMPROVING:
 *    - Check if function is actually called multiple times
 *    - Verify parameters are the same between calls
 *    - Ensure caching overhead isn't greater than computation
 *
 * WHEN NOT TO CACHE:
 *
 * 1. Simple operations:
 *    - const cube = () => Solid.cube(10, 10, 10, { color: 'red' })
 *    - Creating a cube is faster than cache lookup
 *
 * 2. Unique parameters every call:
 *    - If each call has different params, cache never hits
 *    - Cache overhead makes it slower
 *
 * 3. Functions with side effects:
 *    - Logging, mutation, randomness
 *    - Cache assumes pure functions
 *
 * 4. Non-serializable parameters:
 *    - Functions, symbols, circular references
 *    - JSON.stringify will fail or produce unexpected keys
 */

// Register all examples for the UI dropdown
export const components: ComponentsMap = {
	'L1: Basic cacheFunction': basicCaching,
	'L2: cacheInlineFunction': inlineCaching,
	'L3: Cached Components in Grids': cachedInGrids,
	'L4: Hierarchical Caching': hierarchicalCaching,
	'L5: Real-World Optimization': realWorldOptimization
};

addToComponentStore(components);
