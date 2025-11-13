/**
 * G. Revolution Solids - Rotational Symmetry (Lathe Geometry)
 *
 * This file demonstrates creating rotationally symmetric 3D objects by rotating
 * a 2D profile around the Y-axis (like a pottery lathe or woodturning).
 *
 * Perfect for: Chess pieces, vases, bottles, goblets, candlesticks, columns, bowls
 *
 * Key concepts:
 * - Profile rotates around Y-axis (vertical axis)
 * - Coordinate system: X = radius from center, Y = height
 * - Start profile close to Y-axis (X ≈ 0) for proper revolution
 * - Supports full (360°) or partial revolution with angle parameter
 * - Radial segments auto-calculated (8-48 segments based on angle)
 * - Geometry automatically normalized for clean CSG operations
 *
 * Available methods:
 * - revolutionSolidFromPoints() - Array of [x, y] pairs (simplest)
 * - revolutionSolid() - Callback with Shape API (most flexible)
 * - revolutionSolidFromPath() - Path segments with straight() and curve()
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * CHESS PAWN - Full revolution (360°)
 *
 * Using revolutionSolidFromPoints() - simplest method
 * Parameters: (points, options)
 * - points: Array of [x, y] coordinate pairs
 * - options: { color?, angle? }
 *
 * Coordinate system for revolution:
 * - X-axis: Radius from center (distance from Y-axis)
 * - Y-axis: Height (vertical position)
 * - Profile rotates around Y-axis
 *
 * 💡 Start and end at X=0 (center axis) for closed solid
 * 💡 X values represent radius - same X on opposite sides creates cylinder
 */
export const chessPawn = (): Solid => {
	return Solid.revolutionSolidFromPoints(
		[
			[0, 0], // Bottom center (x = radius, y = height)
			[2, 0], // Bottom edge (radius 2 at height 0)
			[1.5, 1], // Narrow stem (radius 1.5 at height 1)
			[1.5, 4], // Stem continues (constant radius = cylinder)
			[3, 6], // Body bulge (wider at radius 3)
			[1.5, 8], // Neck narrows
			[2.5, 10], // Head widens
			[0, 10] // Top center (back to axis)
		],
		{ color: 'white' }
	);
};

/**
 * QUARTER CHESS PAWN - Partial revolution (90°)
 *
 * Same profile as full pawn, but with angle parameter set to 90°
 * Creates a quarter-section (pie slice) of the full shape
 *
 * angle parameter:
 * - Controls rotation angle in degrees (default: 360)
 * - angle: 90 creates quarter section
 * - angle: 180 creates half section
 * - angle: 270 creates three-quarter section
 * - Can use constants: Solid.DEG_90, DEG_180, DEG_270, DEG_360
 *
 * 💡 Use cases: Cut-away views, architectural sections, decorative elements
 * 💡 Partial revolutions are closed solids (not hollow or open-edged)
 * 💡 Great for visualizing internal structure or creating asymmetric variants
 */
export const quarterChessPawn = (): Solid => {
	return Solid.revolutionSolidFromPoints(
		[
			[0, 0], // Bottom center (x = radius, y = height)
			[2, 0], // Bottom edge
			[1.5, 1], // Narrow stem
			[1.5, 4], // Stem height
			[3, 6], // Body bulge
			[1.5, 8], // Neck
			[2.5, 10], // Head
			[0, 10] // Top center
		],
		{ angle: 90, color: 'purple' } // 90° partial revolution
	);
};

/**
 * Additional revolution solid examples (not implemented here):
 *
 * Vase:
 *   revolutionSolidFromPoints([
 *     [0, 0], [5, 0], [3, 5], [6, 10], [5, 15], [0, 15]
 *   ], { color: 'blue' })
 *
 * Goblet with curves:
 *   revolutionSolid((shape) => {
 *     shape.moveTo(0, 0);
 *     shape.lineTo(1, 0);
 *     shape.lineTo(1, 5);
 *     shape.quadraticCurveTo(5, 7, 6, 10);
 *     shape.lineTo(0, 10);
 *   }, { color: 'gold' })
 *
 * Bottle with path segments:
 *   revolutionSolidFromPath([
 *     straight(5),      // Base radius
 *     curve(2, 90),     // Rounded corner
 *     straight(8),      // Body height
 *     curve(3, -90),    // Curve inward for neck
 *     straight(5)       // Neck height
 *   ], { color: 'green' })
 */

export const components: ComponentsMap = {
	'G. ShapeRevolution: Chess Pawn': chessPawn,
	'G. ShapeRevolution: Quarter Pawn': quarterChessPawn
};
