/**
 * X. Circular Arrays - Polar Patterns
 *
 * This file demonstrates the ARRAY_CIRCULAR method for creating circular/radial patterns.
 * Elements are arranged in a circle in the XZ plane (horizontal, around Y-axis).
 *
 * Key concepts:
 * - Circular arrays distribute copies evenly around a circle
 * - By default, elements rotate to face outward (like gear teeth)
 * - Supports partial circles using startAngle/endAngle
 * - Common use cases: gears, bolt holes, spokes, decorative patterns
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * Basic Circular Array - Simple decorative pattern
 *
 * Demonstrates the simplest usage: spheres arranged in a circle
 * Using rotateElements: false since spheres look the same from any angle
 */
export const basicCircle = (): Solid => {
	const sphere = Solid.sphere(2, { color: 'blue' });

	return Solid.ARRAY_CIRCULAR(sphere, {
		count: 12,
		radius: 15,
		rotateElements: false // Spheres don't need rotation
	});
};

/**
 * Gear Teeth Pattern - Classic mechanical design
 *
 * Creates a gear-like pattern with teeth facing outward
 * Default rotateElements: true makes teeth face radially
 */
export const gearTeeth = (): Solid => {
	// Create center disk first
	const disk = Solid.cylinder(15, 10, { color: 'gray' }).align('bottom');

	// Create a tooth shape - must extend in +X direction to face outward when rotated
	// Width (X) should be larger than depth (Z) so tooth points radially
	const tooth = Solid.cube(3, 10, 2, { color: 'gray' })
		.center({ x: true, z: true })
		.align('bottom')
		.rotate({ y: 180 })
		.move({ y: -5 }); // Position on top of disk

	// Arrange teeth in circle (rotates outward by default, positions at radius)
	const teeth = Solid.ARRAY_CIRCULAR(tooth, {
		count: 24,
		radius: 15 // Distance from center to teeth
	});

	return Solid.UNION(disk, teeth);
};

/**
 * Bolt Hole Pattern - Circular mounting holes
 *
 * Creates a flange with evenly spaced bolt holes
 * Demonstrates using negative solids in circular arrays
 */
export const boltHoles = (): Solid => {
	// Create base plate/flange
	const plate = Solid.cylinder(30, 5, { color: 'blue' }).align('bottom');

	// Create hole pattern (negative solids)
	const hole = Solid.cylinder(2, 10, { color: 'blue' }).setNegative();

	const holePattern = Solid.ARRAY_CIRCULAR(hole, {
		count: 8,
		radius: 20,
		rotateElements: false // Holes don't need rotation
	});

	// Center hole
	const centerHole = Solid.cylinder(5, 10, { color: 'blue' }).setNegative();

	return Solid.MERGE([plate, holePattern, centerHole]);
};

/**
 * Wheel with Spokes - Radial structural pattern
 *
 * Creates a wheel with spokes radiating from center
 * Demonstrates using radius: 0 to rotate from center
 */
export const wheelSpokes = (): Solid => {
	// Create a spoke
	const spoke = Solid.cube(1, 20, 2, { color: 'silver' })
		.center({ x: true, z: true })
		.align('bottom');

	// Arrange spokes (rotates from center)
	const spokes = Solid.ARRAY_CIRCULAR(spoke, {
		count: 12,
		radius: 0 // No radial offset, just rotation
	});

	// Add rim
	const rim = Solid.cylinder(12, 3, { color: 'black' }).align('bottom').move({ y: 8.5 });

	// Add hub
	const hub = Solid.cylinder(3, 4, { color: 'silver' }).align('bottom');

	return Solid.UNION(spokes, rim, hub);
};

/**
 * Half Circle Pattern - Partial arc (amphitheater seating)
 *
 * Demonstrates using startAngle/endAngle for partial circles
 * Useful for semicircular or arc patterns
 */
export const halfCircle = (): Solid => {
	// Create a seat
	const seat = Solid.cube(2, 1, 2, { color: 'red' }).align('bottom');

	// Arrange in half circle (0° to 180°)
	const seating = Solid.ARRAY_CIRCULAR(seat, {
		count: 15,
		radius: 25,
		startAngle: 0,
		endAngle: 180 // Half circle
	});

	// Add stage
	const stage = Solid.cube(30, 1, 12, { color: 'brown' }).center().align('bottom').move({ z: -20 });

	return Solid.UNION(seating, stage);
};

/**
 * Clock Face - 12 hour markers
 *
 * Creates clock hour markers using exact angles
 * Demonstrates precise angular positioning
 */
export const clockFace = (): Solid => {
	// Hour marker - center it for proper rotation
	const hourMarker = Solid.cube(1, 3, 1, { color: 'black' })
		.center({ x: true, z: true })
		.align('bottom');

	const hourMarkers = Solid.ARRAY_CIRCULAR(hourMarker, {
		count: 12,
		radius: 18 // Distance from center to markers
	});

	// Clock face
	const face = Solid.cylinder(20, 2, { color: 'white' }).align('bottom');

	// Center dot
	const center = Solid.cylinder(1.5, 3, { color: 'black' }).align('bottom');

	return Solid.UNION(face, hourMarkers, center);
};

/**
 * Decorative Rosette - Multiple circular layers
 *
 * Combines multiple circular arrays at different radii
 * Creates ornamental/architectural decoration pattern
 */
export const rosette = (): Solid => {
	// Inner ring - small spheres
	const innerOrb = Solid.sphere(1.5, { color: 'gold' });
	const innerRing = Solid.ARRAY_CIRCULAR(innerOrb, {
		count: 8,
		radius: 8,
		rotateElements: false
	});

	// Middle ring - larger spheres
	const middleOrb = Solid.sphere(2, { color: 'gold' });
	const middleRing = Solid.ARRAY_CIRCULAR(middleOrb, {
		count: 12,
		radius: 15,
		rotateElements: false
	});

	// Outer ring - decorative elements
	const outerElement = Solid.cube(2, 4, 2, { color: 'gold' })
		.center({ x: true, z: true })
		.align('bottom');
	const outerRing = Solid.ARRAY_CIRCULAR(outerElement, {
		count: 16,
		radius: 20 // Distance from center
	});

	// Center piece
	const center = Solid.sphere(5, { color: 'gold' });

	return Solid.UNION(innerRing, middleRing, outerRing, center);
};

/**
 * Ventilation Grille - Arc of radial slots
 *
 * Creates ventilation slots in an arc pattern
 * Demonstrates partial circle with negative solids
 */
export const ventGrille = (): Solid => {
	// Base panel
	const panel = Solid.cube(40, 30, 2, { color: 'gray' }).center().align('bottom');

	// Ventilation slot (negative) - center for proper rotation
	const slot = Solid.cube(1, 10, 0.5, { color: 'gray' })
		.setNegative()
		.center({ x: true, z: true })
		.align('bottom');

	// Create arc pattern (90° arc)
	const slotPattern = Solid.ARRAY_CIRCULAR(slot, {
		count: 9,
		radius: 12, // Distance from center
		startAngle: -45,
		endAngle: 45 // 90° total arc
	});

	return Solid.MERGE([panel, slotPattern]);
};

/**
 * Component registration map
 * Keys: Component names (appear in UI dropdown)
 * Values: Functions that return Solid instances
 */
export const components: ComponentsMap = {
	'O1. Circular: Basic Circle': basicCircle,
	'O2. Circular: Gear Teeth': gearTeeth,
	'O3. Circular: Bolt Holes': boltHoles,
	'O4. Circular: Wheel Spokes': wheelSpokes,
	'O5. Circular: Half Circle (Amphitheater)': halfCircle,
	'O6. Circular: Clock Face': clockFace,
	'O7. Circular: Rosette (Layers)': rosette,
	'O8. Circular: Ventilation Grille': ventGrille
};
