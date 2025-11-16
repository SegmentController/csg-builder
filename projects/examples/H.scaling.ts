import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';
import { addToComponentStore } from '$stores/componentStore';

/**
 * H. SCALING FUNDAMENTALS
 *
 * This example demonstrates the .scale() method for resizing solids.
 *
 * KEY CONCEPTS:
 * - Uniform scaling with { all }
 * - Individual axis scaling with { x, y, z }
 * - Combined scaling (all + individual axes)
 * - Cumulative scaling (chaining .scale() calls)
 * - Scale values are MULTIPLICATIVE (2 = double size, 0.5 = half size)
 *
 * IMPORTANT PATTERNS:
 * 1. .scale() is a MUTATING method (returns `this` for chaining)
 * 2. All scale parameters are OPTIONAL
 * 3. Order matters: `all` is applied first, then individual axes
 * 4. Scaling is CUMULATIVE: .scale({ x: 2 }).scale({ x: 1.5 }) = 3x on X
 *
 * COMMON USE CASES:
 * - Creating aspect ratio variations (stretched/squashed shapes)
 * - Resizing components without recreating geometry
 * - Adjusting proportions after positioning
 * - Creating size variations from a single base component
 */

/**
 * Example 1: Uniform Scaling
 *
 * The { all } parameter scales uniformly on all three axes.
 * This maintains the shape's proportions.
 */
const uniformScaling = (): Solid => {
	// Create a 10x10x10 cube
	const originalCube = Solid.cube(10, 10, 10, 'blue').move({ x: -30 });

	// Double the size uniformly (all axes)
	const doubledCube = Solid.cube(10, 10, 10, 'green')
		.scale({ all: 2 }) // Now 20x20x20
		.move({ x: 0 });

	// Half the size uniformly (all axes)
	const halvedCube = Solid.cube(10, 10, 10, 'red')
		.scale({ all: 0.5 }) // Now 5x5x5
		.move({ x: 30 });

	return Solid.MERGE([originalCube, doubledCube, halvedCube]);
};

/**
 * Example 2: Individual Axis Scaling
 *
 * Scale specific axes independently to change proportions.
 * Perfect for creating stretched cylinders, flattened spheres, etc.
 */
const axisScaling = (): Solid => {
	// Stretch a cylinder horizontally (X-axis)
	const stretchedCylinder = Solid.cylinder(5, 10, { color: 'cyan' })
		.rotate({ z: 90 }) // Rotate to horizontal orientation
		.scale({ x: 2 }) // Stretch along length (now 2x longer)
		.move({ y: 20 });

	// Flatten a sphere vertically (Y-axis)
	const flattenedSphere = Solid.sphere(8, { color: 'orange' })
		.scale({ y: 0.5 }) // Compress height by half
		.move({ y: 0 });

	// Stretch a cube in two directions
	const stretchedCube = Solid.cube(8, 8, 8, 'purple')
		.scale({ x: 1.5, z: 2 }) // 1.5x wider, 2x deeper, same height
		.move({ y: -20 });

	return Solid.MERGE([stretchedCylinder, flattenedSphere, stretchedCube]);
};

/**
 * Example 3: Combined Scaling (all + individual)
 *
 * You can combine { all } with individual axis scaling.
 * IMPORTANT: { all } is applied FIRST, then individual axes.
 */
const combinedScaling = (): Solid => {
	// Start with a 10x10x10 cube
	const cube1 = Solid.cube(10, 10, 10, 'lime')
		.scale({ all: 2 }) // First: 20x20x20
		.move({ x: -30, y: 15 });

	// Scale all by 2, then additionally scale Z by 1.5
	const cube2 = Solid.cube(10, 10, 10, 'yellow')
		.scale({ all: 2, z: 1.5 }) // 20x20x30 (Z is 2 * 1.5 = 3x original)
		.move({ x: 0, y: 15 });

	// Scale all by 0.5, then stretch X by 3
	const cube3 = Solid.cube(10, 10, 10, 'magenta')
		.scale({ all: 0.5, x: 3 }) // 15x5x5 (X is 0.5 * 3 = 1.5x, Y/Z are 0.5x)
		.move({ x: 30, y: 15 });

	// Visual reference: original size cube at bottom
	const reference = Solid.cube(10, 10, 10, 'gray').move({ y: -15 }).center({ x: true, z: true });

	return Solid.MERGE([cube1, cube2, cube3, reference]);
};

/**
 * Example 4: Cumulative Scaling
 *
 * Multiple .scale() calls accumulate (multiply together).
 * This is useful for progressive transformations.
 */
const cumulativeScaling = (): Solid => {
	// Each .scale() call multiplies with previous scales
	const cone = Solid.cone(5, 15, { color: 'teal' })
		.scale({ all: 2 }) // 2x on all axes
		.scale({ y: 0.5 }) // Then compress height: Y becomes 2 * 0.5 = 1x (back to original)
		.scale({ x: 1.5, z: 1.5 }) // Then stretch base: X/Z become 2 * 1.5 = 3x
		.move({ x: -20 });
	// Result: 3x wider base (X/Z), original height (Y)

	// Demonstrate with explicit values
	const sphere = Solid.sphere(5, { color: 'pink' })
		.scale({ x: 2 }) // X = 2x
		.scale({ x: 1.5 }) // X = 2 * 1.5 = 3x total
		.scale({ y: 0.8, z: 0.8 }) // Y/Z = 0.8x
		.move({ x: 20 });
	// Result: 3x width, 0.8x height and depth

	return Solid.MERGE([cone, sphere]);
};

/**
 * Example 5: Practical Application - Aspect Ratio Adjustments
 *
 * Scaling is commonly used to adjust proportions after component creation.
 * Here we create size variations of a window component.
 */
const aspectRatioAdjustments = (): Solid => {
	// Base window component (always create at standard size)
	const createWindow = (): Solid => {
		const frame = Solid.cube(10, 15, 2, 'brown');
		const glass = Solid.cube(8, 13, 1, 'cyan').move({ y: 0, z: 0.5 }).center({ x: true, y: true });
		const divider = Solid.cube(0.5, 15, 2, 'brown').center({ x: true, y: true });
		return Solid.MERGE([frame, glass, divider]);
	};

	// Wide window - stretch horizontally
	const wideWindow = createWindow()
		.scale({ x: 1.8 }) // 1.8x wider, same height
		.move({ x: -30 });

	// Tall window - stretch vertically
	const tallWindow = createWindow()
		.scale({ y: 1.5 }) // 1.5x taller, same width
		.move({ x: 0 });

	// Small window - uniform shrink
	const smallWindow = createWindow()
		.scale({ all: 0.6 }) // 0.6x smaller proportionally
		.move({ x: 30 });

	return Solid.MERGE([wideWindow, tallWindow, smallWindow]);
};

/**
 * COMMON PITFALLS:
 *
 * 1. NEGATIVE SCALE VALUES:
 *    - Negative values will flip geometry (mirror)
 *    - Generally avoid unless intentionally mirroring
 *    - Example: .scale({ x: -1 }) mirrors across YZ plane
 *
 * 2. ZERO SCALE VALUES:
 *    - .scale({ x: 0 }) will collapse geometry to zero width
 *    - Creates degenerate geometry (avoid)
 *    - Can cause CSG operations to fail
 *
 * 3. SCALE ORDER CONFUSION:
 *    - Remember: { all } applies first, then individual axes
 *    - .scale({ all: 2, x: 0.5 }) results in 1x on X (2 * 0.5)
 *
 * 4. EXTREME SCALING:
 *    - Very large or very small values can cause precision issues
 *    - Stick to reasonable ranges (0.1 to 10 typically)
 *
 * 5. SCALING AFTER CSG:
 *    - Scaling after CSG operations can cause artifacts
 *    - Best practice: scale primitives BEFORE boolean operations
 *    - Example of what to avoid:
 *      const result = Solid.SUBTRACT(big, small).scale({ all: 2 }); // Can cause issues
 *    - Better approach:
 *      const big = Solid.cube(20, 20, 20, 'red').scale({ all: 2 });
 *      const small = Solid.cube(10, 10, 10, 'red').scale({ all: 2 });
 *      const result = Solid.SUBTRACT(big, small);
 */

// Register all examples for the UI dropdown
export const components: ComponentsMap = {
	'H1: Uniform Scaling': uniformScaling,
	'H2: Individual Axis Scaling': axisScaling,
	'H3: Combined Scaling': combinedScaling,
	'H4: Cumulative Scaling': cumulativeScaling,
	'H5: Aspect Ratio Adjustments': aspectRatioAdjustments
};

addToComponentStore(components);
