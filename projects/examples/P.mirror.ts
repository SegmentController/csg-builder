/**
 * P. Mirror Operations - Reflection and Symmetry
 *
 * This file demonstrates the MIRROR method for creating reflections and symmetric objects.
 * MIRROR creates a reflected copy across a specified axis plane (X, Y, or Z).
 *
 * Key concepts:
 * - MIRROR returns only the reflected copy (not combined with original)
 * - Use UNION to combine original + mirror for symmetry
 * - Can chain mirrors for full 3D symmetry
 * - Works with all primitives, CSG operations, and negative solids
 *
 * Axis behavior:
 * - 'X': Mirrors across YZ plane (flips X coordinates)
 * - 'Y': Mirrors across XZ plane (flips Y coordinates)
 * - 'Z': Mirrors across XY plane (flips Z coordinates)
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * Simple Mirror - Basic reflection
 *
 * Demonstrates the simplest mirror usage:
 * Create an asymmetric shape and mirror it
 */
export const simpleMirror = (): Solid => {
	// Create asymmetric shape
	const shape = Solid.cube(10, 5, 3, { color: 'blue' }).move({ x: 8 });

	// Create mirrored copy
	const mirrored = Solid.MIRROR(shape, 'X');

	// Show both original and mirror
	return Solid.UNION(shape, mirrored);
};

/**
 * Bilateral Symmetry - Left/Right mirror
 *
 * Creates a symmetric object from one half
 * Common in mechanical parts, architectural elements, and organic forms
 */
export const bilateralSymmetry = (): Solid => {
	// Design one half of a decorative bracket
	const half = Solid.cube(15, 25, 5, { color: 'brown' }).move({ x: 7.5 }).align('bottom');

	// Add a curved cutout (using cylinder as cutter)
	const cutout = Solid.cylinder(8, 10, { color: 'brown' }).rotate({ x: 90 }).move({ x: 15, y: 12 });
	const halfWithCutout = Solid.SUBTRACT(half, cutout);

	// Create full symmetric bracket
	return Solid.UNION(halfWithCutout, Solid.MIRROR(halfWithCutout, 'X'));
};

/**
 * Quadrant Symmetry - 2-axis mirror
 *
 * Mirrors across two axes to create four-way symmetry
 * Useful for table legs, cross patterns, decorative elements
 */
export const quadrantSymmetry = (): Solid => {
	// Create one quarter of a decorative cross
	const quarter = Solid.cube(15, 5, 3, { color: 'red' }).move({ x: 7.5 }).align('bottom');

	// Mirror across X to get half
	const half = Solid.UNION(quarter, Solid.MIRROR(quarter, 'X'));

	return Solid.UNION(quarter, half);
};

/**
 * Octant Symmetry - Full 3D symmetry
 *
 * Mirrors across all three axes
 * Creates perfectly symmetric 3D objects from one octant
 */
export const octantSymmetry = (): Solid => {
	// Design one eighth of a decorative sphere
	const octant = Solid.sphere(12, { color: 'purple' }).move({ x: 5, y: 5, z: 5 });

	// Add detail: subtract a small sphere from corner
	const detail = Solid.sphere(3, { color: 'purple' }).move({ x: 10, y: 10, z: 10 });
	const octantWithDetail = Solid.SUBTRACT(octant, detail);

	// Mirror across X
	const halfX = Solid.UNION(octantWithDetail, Solid.MIRROR(octantWithDetail, 'X'));

	// Mirror across Y
	const halfY = Solid.UNION(halfX, Solid.MIRROR(halfX, 'Y'));

	// Mirror across Z for full 3D symmetry
	return Solid.UNION(halfY, Solid.MIRROR(halfY, 'Z'));
};

/**
 * Symmetric Gear - Mirrored teeth pattern
 *
 * Creates a gear with symmetric teeth using mirror
 * Demonstrates combining MIRROR with circular arrays
 */
export const symmetricGear = (): Solid => {
	// Center disk
	const disk = Solid.cylinder(15, 8, { color: 'gray' }).align('bottom');

	// Create one tooth shape (asymmetric profile)
	const tooth = Solid.cube(4, 12, 2, { color: 'gray' })
		.center({ x: true, z: true })
		.align('bottom')
		.move({ x: 16, y: 8 });

	// Create symmetric tooth pair
	const toothPair = Solid.UNION(tooth, Solid.MIRROR(tooth, 'Z'));

	// Arrange pairs in circle
	const teeth = Solid.ARRAY_CIRCULAR(toothPair, {
		count: 12,
		radius: 1,
		rotateElements: true
	});

	return Solid.UNION(disk, teeth);
};

/**
 * Mirrored Holes - Symmetric mounting pattern
 *
 * Creates symmetrically placed holes using negative solids
 * Demonstrates MIRROR with negative flag preservation
 */
export const mirroredHoles = (): Solid => {
	// Base plate
	const plate = Solid.cube(40, 30, 5, { color: 'blue' }).center().align('bottom');

	// Create hole pattern on one side (negative)
	const hole = Solid.cylinder(2, 10, { color: 'blue' }).move({ x: 12, z: 8 }).setNegative();

	// Mirror to create symmetric hole pattern
	const mirroredHole = Solid.MIRROR(hole, 'X');

	// Combine with base
	return Solid.MERGE([plate, hole, mirroredHole]);
};

/**
 * Architectural Arch - Symmetric structure
 *
 * Creates an archway using mirrored columns and cap
 * Demonstrates practical architectural use of symmetry
 */
export const archway = (): Solid => {
	// Create one pillar (half of arch)
	const pillar = Solid.cube(5, 30, 8, { color: 'brown' }).move({ x: 15 }).align('bottom');

	// Create arch cap (one half)
	const capHalf = Solid.cylinder(15, 8, { color: 'brown', angle: 180 })
		.rotate({ x: 90, z: 90 })
		.move({ x: 7.5, y: 30, z: 4 });

	// Combine half arch elements
	const half = Solid.UNION(pillar, capHalf);

	// Mirror to create full arch
	return Solid.UNION(half, Solid.MIRROR(half, 'X'));
};

/**
 * Component registration map
 * Keys: Component names (appear in UI dropdown)
 * Values: Functions that return Solid instances
 */
export const components: ComponentsMap = {
	'P1. Mirror: Simple Mirror': simpleMirror,
	'P2. Mirror: Bilateral Symmetry': bilateralSymmetry,
	'P3. Mirror: Quadrant Symmetry (2-axis)': quadrantSymmetry,
	'P4. Mirror: Octant Symmetry (3-axis)': octantSymmetry,
	'P5. Mirror: Symmetric Gear': symmetricGear,
	'P6. Mirror: Mirrored Holes': mirroredHoles,
	'P7. Mirror: Archway': archway
};
