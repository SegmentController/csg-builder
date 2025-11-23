/**
 * Path segment type definitions and factory functions for creating custom profiles.
 * Used with `profilePrismFromPath()` and `revolutionSolidFromPath()`.
 */

/**
 * Represents a straight line segment in a path.
 */
export type StraightSegment = {
	type: 'straight';
	length: number;
};

/**
 * Represents a curved arc segment in a path.
 * Positive angle = right turn, negative angle = left turn, zero radius = sharp corner.
 */
export type CurveSegment = {
	type: 'curve';
	radius: number;
	angle: number; // degrees, positive = right turn, negative = left turn
};

/**
 * Union type for all path segment types.
 */
export type PathSegment = StraightSegment | CurveSegment;

/**
 * Creates a straight line segment for use in path-based geometry.
 *
 * @param length - Length of the straight segment
 * @returns StraightSegment object
 *
 * @example
 * import { straight, curve } from '$lib/3d/path-factories';
 * import { Solid } from '$lib/3d/Solid';
 *
 * const shape = Solid.profilePrismFromPath(10, [
 *   straight(20),
 *   curve(5, 90),
 *   straight(10)
 * ]);
 */
export const straight = (length: number): StraightSegment => ({
	type: 'straight',
	length
});

/**
 * Creates a curved arc segment for use in path-based geometry.
 * Positive angle produces a right turn, negative angle produces a left turn.
 * Zero radius creates a sharp corner (no arc, just direction change).
 *
 * @param radius - Radius of the arc (0 for sharp corners)
 * @param angle - Turn angle in degrees (positive = right, negative = left)
 * @returns CurveSegment object
 *
 * @example
 * import { straight, curve } from '$lib/3d/path-factories';
 * import { Solid } from '$lib/3d/Solid';
 *
 * const roundedRect = Solid.profilePrismFromPath(10, [
 *   straight(20),
 *   curve(5, 90),    // Right turn with radius 5
 *   straight(10),
 *   curve(5, 90),
 *   straight(20),
 *   curve(5, 90),
 *   straight(10),
 *   curve(5, 90)
 * ]);
 */
export const curve = (radius: number, angle: number): CurveSegment => ({
	type: 'curve',
	radius,
	angle
});
