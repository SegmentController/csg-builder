/**
 * B. CSG Operations - Boolean Operations
 *
 * This file demonstrates Constructive Solid Geometry (CSG) boolean operations.
 * CSG allows combining, subtracting, and intersecting 3D shapes to create complex geometries.
 *
 * Key concepts:
 * - Static methods: Solid.UNION(), Solid.SUBTRACT(), Solid.INTERSECT()
 * - Immutability: Operations return NEW Solid instances (originals unchanged)
 * - Method chaining: Transform solids before CSG operations (🔗 .rotate().move())
 * - All operations work with any primitive or previously combined solid
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * UNION - Combines two or more solids into one
 * Result: All volume from both solids (additive operation)
 *
 * 💡 Static method: Solid.UNION(solid1, solid2, ...)
 * ⚠️ Returns NEW Solid - original solids remain unchanged (immutable)
 */
export const union = (): Solid => {
	const cube1 = Solid.cube(10, 10, 10, { color: 'blue' });
	const cube2 = Solid.cube(10, 10, 10, { color: 'blue' }).move({ x: 5, y: 5, z: -5 }); // 🔗 Chained move

	return Solid.UNION(cube1, cube2); // Overlapping cubes merged
};

/**
 * SUBTRACT - Removes one solid from another
 * Result: First solid with second solid's volume removed (subtractive operation)
 *
 * 💡 Static method: Solid.SUBTRACT(base, cutter1, cutter2, ...)
 * ⚠️ Parameter order matters: SUBTRACT(A, B) ≠ SUBTRACT(B, A)
 * 🔗 Notice: .rotate() chained before CSG operation to position the hole
 */
export const subtract = (): Solid => {
	const base = Solid.cube(15, 15, 15, { color: 'red' }); // Starting shape
	const hole = Solid.cylinder(4, 20, { color: 'red' }).rotate({ x: 90 }); // Rotated 90° around X-axis

	return Solid.SUBTRACT(base, hole); // Cube with cylindrical hole through it
};

/**
 * INTERSECT - Keeps only the overlapping volume of solids
 * Result: Only the region where all solids overlap (intersection)
 *
 * 💡 Static method: Solid.INTERSECT(solid1, solid2, ...)
 * 💡 Useful for creating complex shapes from simple primitive intersections
 */
export const intersect = (): Solid => {
	const sphere1 = Solid.sphere(8, { color: 'green' }); // Larger sphere at origin
	const sphere2 = Solid.sphere(4, { color: 'green' }).move({ x: 6 }); // Smaller sphere offset

	return Solid.INTERSECT(sphere1, sphere2); // Only the overlapping lens-shaped volume
};

export const components: ComponentsMap = {
	'B1. Operations: Union': union,
	'B2. Operations: Subtract': subtract,
	'B3. Operations: Intersect': intersect
};
