/**
 * Castle Project - Wall Components
 *
 * This file demonstrates advanced building block patterns:
 * - Helper functions for component decomposition
 * - Performance optimization with cacheInlineFunction()
 * - Configuration objects for optional features
 * - Clone pattern for symmetric elements
 * - CSG operations in loops for repeated details
 * - Scale for creating variations from base geometry
 *
 * Components:
 * - WallHeader (helper): Decorative battlement header with zigzag pattern
 * - Wall: Basic wall segment with optional footpath
 * - WallWithGate: Wall with arched gate opening
 *
 * Performance: Wall() cached because it's reused 4+ times in Castle assembly
 */

import { Solid } from '$lib/3d/Solid';
import { cacheInlineFunction } from '$lib/cacheFunction';
import type { ComponentsMap } from '$stores/componentStore';

import { WALL } from './_const';

/**
 * WALL HEADER - Decorative battlement top (helper function)
 *
 * This helper function demonstrates:
 * - Component decomposition (wall broken into header, body, footer)
 * - CSG operations in loops for repeated patterns
 * - Mutable accumulation pattern (header = SUBTRACT(header, ...))
 * - Decorative details via subtraction (zigzag, cylinder groove)
 *
 * Not exported - internal implementation detail of Wall()
 *
 * 💡 Pattern: Helper functions keep main component logic clean
 * ⚠️ Notice: zigzagNeg is mutated in loop (.move() called repeatedly)
 */
const WallHeader = cacheInlineFunction('WallHeader', (length: number) => {
	// Base header strip (horizontal band at top of wall)
	let header = Solid.cube(length, WALL.WIDTH * 2, WALL.WIDTH / 2, 'green').move({
		y: WALL.HEIGHT / 2 + WALL.WIDTH,
		z: WALL.WIDTH * 1.75
	});

	// Create zigzag battlement pattern via repeated subtraction
	// Cutter cube positioned at start of header
	const zigzagNeg = Solid.cube(WALL.ZIGZAG_LENGTH, 3, WALL.WIDTH).move({
		x: -length / 2 + WALL.ZIGZAG_LENGTH, // Start at left edge
		y: WALL.HEIGHT / 2 + WALL.WIDTH * 2,
		z: WALL.WIDTH * 1.75
	});

	// Loop: Subtract cutter, then move it right for next iteration
	// Creates evenly spaced battlements (merlons and crenels)
	for (let index = 0; index < length / WALL.ZIGZAG_LENGTH / 2; index++) {
		header = Solid.SUBTRACT(header, zigzagNeg); // Remove section
		zigzagNeg.move({ x: WALL.ZIGZAG_LENGTH * 2 }); // ⚠️ Mutation: move cutter right
	}

	// Add decorative horizontal groove using cylinder subtraction
	// 🔗 Method chaining: .rotate().move()
	const decor1 = Solid.cylinder(0.5, length)
		.rotate({ z: 90 }) // Rotate to horizontal orientation
		.move({ x: 0, y: WALL.HEIGHT / 2 + WALL.WIDTH / 2, z: WALL.WIDTH * 2.1 });
	header = Solid.SUBTRACT(header, decor1);

	return header;
});

/**
 * WALL - Basic castle wall segment (cached)
 *
 * Performance optimization: cacheInlineFunction()
 * - Castle uses Wall(20) or Wall(100) multiple times
 * - First call computes and caches result
 * - Subsequent calls with same length return cached clone
 * - Critical for castle assembly performance (4+ wall segments)
 *
 * Configuration object pattern:
 * - config?: { includeFootPath?: boolean }
 * - Optional parameter allows variants without code duplication
 * - Towers need footPath for CSG subtraction, standalone walls don't
 *
 * Demonstrates:
 * - Clone pattern for symmetric elements (headerSide2 mirrored from headerSide1)
 * - Scale for variations (footer is scaled header)
 * - Conditional assembly based on config
 * - Helper function composition (WallHeader)
 *
 * 💡 cacheInlineFunction('Wall', ...) requires string name for cache key
 * ⚠️ Returns Solid, not Solid[] (use .clone() when reusing in castle)
 */
export const Wall = cacheInlineFunction(
	'Wall',
	(length: number, config?: { includeFootPath?: boolean }): Solid => {
		// Main wall body (vertical plane)
		const wall = Solid.cube(length, WALL.HEIGHT, WALL.WIDTH, 'green');

		// Top horizontal band (walkway on top of wall)
		const header = Solid.cube(length, WALL.WIDTH, WALL.WIDTH * 4, 'green').move({
			y: WALL.HEIGHT / 2 - WALL.WIDTH / 2
		});

		// Bottom horizontal band (foundation) - created via clone + scale
		// 💡 Clone pattern: Start from header, modify for footer
		// 🔗 Method chaining: .clone().move().scale()
		const footer = header
			.clone() // Independent copy of header
			.move({ y: -WALL.HEIGHT + WALL.WIDTH }) // Position at bottom
			.scale({ z: 0.5 }); // Make thinner (half depth)

		// Decorative battlements on both sides (front and back)
		const headerSide1 = WallHeader(length);
		// 💡 Symmetric mirroring: Rotate 180° to create opposite side
		const headerSide2 = headerSide1.clone().rotate({ y: 180 });

		// Combine all wall elements
		let result = Solid.UNION(wall, header, footer, headerSide1, headerSide2);

		// Optional footpath for tower integration
		// Towers subtract walls, need footpath to create proper connection
		if (config?.includeFootPath) {
			const footPath = Solid.cube(length, WALL.WIDTH * 2, WALL.WIDTH * 4)
				.align('bottom') // Position at Y=0
				.move({ y: WALL.HEIGHT / 2 }); // Then move to wall center height
			result = Solid.UNION(result, footPath);
		}

		// Align bottom of wall to Y=0 for consistent positioning
		return result.align('bottom');
	}
);

/**
 * WALL WITH GATE - Wall with arched gate opening (cached)
 *
 * Demonstrates advanced CSG techniques:
 * - Component reuse: Starts with Wall(length) as base
 * - Boolean carving: UNION then SUBTRACT to create recessed arch
 * - Scale mutation for creating inset/offset geometry
 * - Compound shapes: Rectangle + cylinder = arched opening
 *
 * Technique: "Boolean Carving Pattern"
 * 1. Create gate shape (cube + cylinder for arch)
 * 2. UNION gate with wall (adds volume, prepares for recess)
 * 3. Scale gate slightly smaller (0.8x width, 0.95x height, 2x depth)
 * 4. SUBTRACT scaled gate (removes interior, leaves frame)
 * Result: Recessed arched gate with thick frame
 *
 * 💡 Alternative: Could use SUBTRACT only, but UNION+scale creates better frame
 * 💡 Also cached for performance (used in castle assembly)
 */
export const WallWithGate = cacheInlineFunction('WallWithGate', (length: number): Solid => {
	// Start with basic wall as foundation
	let wall = Wall(length);

	// Create arched gate opening shape
	// Step 1: Rectangular lower portion of gate
	let cubeInner = Solid.cube(
		WALL.GATE_WIDTH, // Gate width from constants
		WALL.HEIGHT - WALL.GATE_WIDTH / 2, // Height to arch start
		WALL.WIDTH * 4 // Extra depth to ensure clean cut
	).align('bottom'); // Position at ground level

	// Step 2: Semicircular arch top of gate
	// 🔗 Multiple rotations: z: 90 (lay horizontal), y: 90 (orient forward)
	const circleInner = Solid.cylinder(WALL.GATE_WIDTH / 2, WALL.WIDTH * 4)
		.move({ y: WALL.HEIGHT - WALL.GATE_WIDTH / 2 }) // Position at top of rectangle
		.rotate({ z: 90, y: 90 }); // Orient cylinder as horizontal arch

	// Step 3: Combine rectangle + arch = complete gate shape
	cubeInner = Solid.UNION(cubeInner, circleInner);

	// Boolean carving technique:
	// First: UNION adds gate shape to wall (creates bulge)
	wall = Solid.UNION(wall, cubeInner);

	// Then: Scale gate smaller and SUBTRACT (removes interior, leaves frame)
	// ⚠️ Mutation: cubeInner is scaled in place
	cubeInner.scale({ x: 0.8, y: 0.95, z: 2 }); // Slightly smaller, deeper
	wall = Solid.SUBTRACT(wall, cubeInner); // Creates recessed opening with frame

	return wall;
});

/**
 * Component registration
 *
 * 💡 Naming convention: 'X. Example:' prefix groups castle components in UI
 * 💡 Arrow functions provide parameters: () => Wall(100)
 * 💡 These are also used by tower.ts and castle.ts as building blocks
 */
export const components: ComponentsMap = {
	'X. Example: Wall 100': () => Wall(100),
	'X. Example: Wall with gate 100': () => WallWithGate(100)
};
