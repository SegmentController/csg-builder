/**
 * E. Complex Composition - Multi-Component Patterns
 *
 * This file demonstrates advanced techniques for building complex models:
 * - Configuration constants for parametric designs
 * - Grid arrays (GRID_XY) for repeating patterns
 * - Clone and reuse pattern for efficient solid duplication
 * - Negative solids (.setNegative()) for use with MERGE operations
 * - MERGE operation that respects negative flags
 * - Component decomposition (breaking complex objects into functions)
 * - Multi-solid returns (arrays of solids for complex assemblies)
 *
 * Key concepts:
 * - Static grid method: Solid.GRID_XY(solid, { cols, rows })
 * - Instance method: .clone() creates independent copy
 * - Negative solids: .setNegative() marks for subtraction in MERGE
 * - Static MERGE: Solid.MERGE([array]) processes positive/negative solids in order
 * - ⚠️ CRITICAL: First solid in MERGE cannot be negative (throws error)
 * - Spread operator: ...array to unpack multi-solid components
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

// Configuration constants - makes design parametric and easy to modify
const BRICK_WIDTH = 3;
const BRICK_HEIGHT = 1;
const BRICK_DEPTH = 2;
const BRICK_GAP_WIDTH = 0.2;
const BRICK_GAP_DEPTH = 0.2;

/**
 * BRICK ITEM - Complex brick pattern with gaps and relief details
 *
 * This demonstrates:
 * - Parametric design using configuration constants
 * - .clone() method for reusing base solids efficiently
 * - 🔗 Method chaining: .clone().move() creates independent positioned copies
 * - UNION with multiple solids at once
 *
 * 💡 Clone pattern: Create base shape once, then clone and position multiple times
 * ⚠️ Without .clone(), moving a solid would affect all references to it
 */
const brickItem = (): Solid => {
	// Base brick geometry (background)
	let result = Solid.cube(
		2 * BRICK_WIDTH + 2 * BRICK_GAP_WIDTH,
		2 * BRICK_HEIGHT + 2 * BRICK_GAP_WIDTH,
		BRICK_DEPTH - BRICK_GAP_DEPTH,
		'red'
	);

	// Calculate row positions for brick relief pattern
	const ROW_A_Y = BRICK_HEIGHT / 2 + BRICK_GAP_WIDTH;
	const ROW_B_Y = -BRICK_HEIGHT / 2;

	// Base shapes for relief details - created once, cloned multiple times
	const full = Solid.cube(BRICK_WIDTH, BRICK_HEIGHT, BRICK_GAP_DEPTH).move({
		z: BRICK_DEPTH / 2
	});
	const half = Solid.cube(BRICK_WIDTH / 2, BRICK_HEIGHT, BRICK_GAP_DEPTH).move({
		z: BRICK_DEPTH / 2
	});

	// Clone and position - each .clone() creates independent copy
	// 🔗 Notice: .clone().move() pattern repeated for each brick
	const a1 = full.clone().move({
		x: -BRICK_WIDTH / 2,
		y: ROW_A_Y
	});
	const a2 = full.clone().move({
		x: BRICK_WIDTH / 2 + BRICK_GAP_WIDTH,
		y: ROW_A_Y
	});

	const b1 = half.clone().move({
		x: -BRICK_WIDTH / 2 - BRICK_WIDTH / 4 - BRICK_GAP_WIDTH,
		y: ROW_B_Y
	});
	const b2 = full.clone().move({
		x: 0,
		y: ROW_B_Y
	});
	const b3 = half.clone().move({
		x: BRICK_WIDTH / 2 + BRICK_WIDTH / 4 + BRICK_GAP_WIDTH,
		y: ROW_B_Y
	});

	// UNION accepts multiple solids - combines all relief details with base
	result = Solid.UNION(result, a1, a2, b1, b2, b3);

	return result;
};

/**
 * BRICK WALL - Grid array of brick items
 *
 * Static grid method: Solid.GRID_XY(solid, { cols, rows })
 * Creates a 2D array of solids on the XY plane
 *
 * 💡 Grid methods return a single merged Solid (all bricks unioned together)
 * Parameters: cols = number of columns (X-axis), rows = number of rows (Y-axis)
 * 💡 Can also specify spacing: { cols: 5, rows: 3, spacing: [1, 0.5] }
 */
export const brickWall = (cx: number, cy: number): Solid =>
	Solid.GRID_XY(brickItem(), { cols: cx, rows: cy });

/**
 * WINDOW - Multi-solid component with negative hole
 *
 * This demonstrates advanced patterns:
 * - Returning array of solids (Solid[]) instead of single Solid
 * - Negative solids using .setNegative() for use with MERGE
 * - Order matters: negative solid positioned between positive elements
 *
 * How negative solids work:
 * - .setNegative() marks a solid for subtraction when used in MERGE
 * - MERGE processes array in order: [base, positive, NEGATIVE, positive]
 * - Result: ((base + positive) - NEGATIVE) + positive
 *
 * ⚠️ setNegative() only affects MERGE operations, not direct SUBTRACT
 */
export const window = (width: number, height: number, depth: number): Solid[] => {
	const frame = Solid.cube(width, height, depth, 'brown');
	const BORDER = 2;

	// Step 1: Create hollow frame (internal operation, frame - opening)
	const opening = Solid.cube(width - BORDER * 2, height - BORDER * 2, depth * 4, 'gray');
	const hollowFrame = Solid.SUBTRACT(frame, opening);

	// Step 2: Create negative hole that will cut through walls when window is placed
	// 💡 .setNegative() marks this solid for subtraction in MERGE operation
	const externalHole = Solid.cube(
		width - BORDER * 2,
		height - BORDER * 2,
		depth * 4,
		'gray'
	).setNegative();

	// Step 3: Create bars that will be added AFTER the negative hole
	const verticalBar = Solid.cube(BORDER, height, depth - 1, 'brown').move({ z: -0.5 });
	const horizontalBar = Solid.cube(width, BORDER, depth - 1, 'brown').move({ z: -0.5 });

	// ⚠️ CRITICAL ORDER: [hollowFrame (positive), externalHole (NEGATIVE), bars (positive)]
	// MERGE will process: (frame - externalHole) + bars
	// This ensures bars are added AFTER the hole is cut, so they don't get removed
	return [hollowFrame, externalHole, verticalBar, horizontalBar];
};

/**
 * BRICK WALL WITH WINDOW - Complete composition using MERGE
 *
 * This demonstrates:
 * - Component reuse: brickWall() and window() combined
 * - Spread operator (...array) to unpack window's multiple solids
 * - MERGE operation with mixed positive/negative solids
 *
 * Static MERGE method: Solid.MERGE([array of solids])
 * - Processes solids in array order
 * - Respects negative flags from .setNegative()
 * - ⚠️ First solid cannot be negative (throws error)
 *
 * Flow: wall (positive) + hollowFrame (positive) - externalHole (NEGATIVE) + bars (positive)
 * Result: Wall with window cut into it, frame and bars visible
 */
export const brickWallWithWindow = (): Solid => {
	const wall = brickWall(5, 7).center(); // Create and center wall

	const win = window(10, 14, 3); // Returns array: [frame, -hole, bar, bar]
	// Spread operator unpacks array: MERGE([wall, frame, -hole, bar, bar])
	return Solid.MERGE([wall, ...win]);
};

/**
 * Component registration
 *
 * 💡 Notice different patterns:
 * - Direct function reference: brickItem (no parameters)
 * - Arrow function wrapper: () => brickWall(2, 2) (provides parameters)
 * - Multi-solid return: window() returns Solid[] (array shown in UI)
 */
export const components: ComponentsMap = {
	'E1. Wall: Brick Item': brickItem,
	'E2. Wall: Brick Wall': () => brickWall(2, 2),
	'E3. Wall: Window': () => window(15, 30, 3),
	'E4. Wall: Brick Wall with Window': () => brickWallWithWindow()
};
