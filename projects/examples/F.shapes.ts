/**
 * F. Custom Profile Prisms - 2D to 3D Extrusion
 *
 * This file demonstrates creating custom 3D shapes by extruding 2D profiles.
 * Three methods available with different complexity levels:
 *
 * 1. profilePrismFromPoints() - Simplest: Array of [x, y] coordinate pairs
 * 2. profilePrism() - Most flexible: Full Three.js Shape API (curves, arcs, beziers)
 * 3. profilePrismFromPath() - Path-based: Segments with straight() and curve() helpers
 *
 * Key concepts:
 * - All methods extrude 2D profile along Z-axis
 * - Profiles auto-close back to start point
 * - Works with all CSG operations (UNION, SUBTRACT, etc.)
 * - Can apply alignment and positioning methods
 * - Geometry automatically normalized for clean CSG operations
 */

import { curve, Solid, straight } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * ARROW - Using profilePrismFromPoints (simplest method)
 *
 * Method 1: Array of [x, y] coordinate pairs
 * - Simplest syntax for polygonal shapes
 * - Automatically closes path back to first point
 * - Great for angular shapes (arrows, polygons, letters)
 *
 * Parameters: (height, points, color)
 * 🔗 Chainable: Can use .align(), .center(), etc. on result
 */
export const arrow = (): Solid => {
	// Arrow shape using profilePrismFromPoints
	return Solid.profilePrismFromPoints(
		4,
		[
			[0, 5], // Left middle (arrow tail start)
			[10, 5], // Arrow shaft top
			[10, 8], // Arrow head top
			[15, 4], // Arrow point
			[10, 0], // Arrow head bottom
			[10, 3], // Arrow shaft bottom
			[0, 3] // Left bottom (arrow tail end)
			// Auto-closes back to [0, 5]
		],
		'orange'
	)
		.align('bottom')
		.center({ x: true, z: true });
};

/**
 * STAR - Using profilePrism with Shape API (most flexible)
 *
 * Method 2: Callback function with Three.js Shape API
 * - Full access to Shape methods: lineTo, bezierCurveTo, quadraticCurveTo, arc, etc.
 * - Most powerful for complex curves and programmatic shapes
 * - Great for mathematical shapes, stars, gears, organic forms
 *
 * Parameters: (height, callback, color)
 * Callback receives Shape object with drawing methods
 * 💡 Use .moveTo() to set starting point, then .lineTo(), .arc(), etc.
 */
export const star = (): Solid => {
	// 5-pointed star using profilePrism with Shape API
	// Demonstrates complex custom profiles
	return Solid.profilePrism(
		3,
		(shape) => {
			const outerRadius = 10;
			const innerRadius = 4;
			const points = 5;

			// Start at first outer point
			shape.moveTo(outerRadius * Math.cos(0), outerRadius * Math.sin(0));

			// Draw star by alternating between outer and inner points
			for (let index = 1; index <= points * 2; index++) {
				const angle = (index * Math.PI) / points;
				const radius = index % 2 === 0 ? outerRadius : innerRadius;
				shape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
			}
		},
		'gold'
	)
		.align('bottom')
		.center({ x: true, z: true });
};

/**
 * L-PROFILE WITH HOLES - Custom profile + CSG operations
 *
 * This demonstrates:
 * - Custom profile shapes work seamlessly with CSG operations
 * - profilePrism() result is a true Solid, not special geometry
 * - Can SUBTRACT, UNION, etc. just like primitive shapes
 *
 * 💡 Use case: Mechanical parts, brackets, architectural elements
 * 💡 Custom profiles are first-class solids in the CSG system
 */
export const lProfileWithHoles = (): Solid => {
	// Create L-shaped profile using Shape API
	const lProfile = Solid.profilePrism(
		4, // Extrude height
		(shape) => {
			// Draw L-shape outline
			shape.moveTo(0, 0);
			shape.lineTo(10, 0); // Bottom horizontal
			shape.lineTo(10, 3); // Right vertical (short)
			shape.lineTo(3, 3); // Top horizontal (short)
			shape.lineTo(3, 10); // Left vertical (tall)
			shape.lineTo(0, 10); // Top horizontal (tall)
			shape.lineTo(0, 0); // Close back to start
		},
		'gray'
	);

	// Add cylindrical holes using CSG subtraction
	// ⚠️ Using .at() for absolute positioning (all 3 params required)
	const hole1 = Solid.cylinder(1, 5, { color: 'gray' }).at(2, 7, 2);
	const hole2 = Solid.cylinder(1, 5, { color: 'gray' }).at(7, 1.5, 2);

	// CSG operations work on custom profiles just like primitives
	return Solid.SUBTRACT(lProfile, hole1, hole2);
};

/**
 * RACE TRACK - Using profilePrismFromPath (path-based method)
 *
 * Method 3: Path segments with straight() and curve() helpers
 * - Great for shapes with mix of straight lines and smooth curves
 * - Path starts at origin (0, 0) facing right (+X direction)
 * - Each segment starts from endpoint of previous segment
 * - Automatically closes back to origin
 *
 * Segment types:
 * - straight(length) - Straight line segment
 * - curve(radius, angle) - Curved segment
 *   - radius: 0 = sharp corner, >0 = smooth curve
 *   - angle: positive = right turn, negative = left turn
 *
 * Parameters: (height, segments, color)
 * Import helpers: import { straight, curve } from '$lib/3d/Solid'
 */
export const raceTrack = (): Solid => {
	return Solid.profilePrismFromPath(
		2, // Extrude height
		[
			straight(20), // Straightaway (length 20)
			curve(5, 180), // Semicircle turn (radius 5, 180° right turn)
			straight(20), // Back straightaway
			curve(5, 180) // Return semicircle (auto-closes to origin)
		],
		'green'
	);
};

/**
 * Method comparison summary:
 *
 * profilePrismFromPoints() - Best for: Simple polygons, angular shapes
 *   Example: Arrow, trapezoid, letters
 *
 * profilePrism() - Best for: Complex curves, programmatic/mathematical shapes
 *   Example: Star, gear, spiral, parametric designs
 *
 * profilePrismFromPath() - Best for: Mixed straight/curved paths, roads, tracks
 *   Example: Race track, rounded rectangle, paths with controlled corners
 */

export const components: ComponentsMap = {
	'F. Shapes: Arrow': arrow,
	'F. Shapes: Star': star,
	'F. Shapes: L Profile With Holes': lProfileWithHoles,
	'F. Shapes: Race Track': raceTrack
};
