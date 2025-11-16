/**
 * C. Alignment & Positioning
 *
 * This file demonstrates positioning and alignment methods for solids.
 * These methods help place objects precisely without manual coordinate calculations.
 *
 * Key concepts:
 * - Instance methods: .align(), .center(), .move(), .at()
 * - 🔗 Method chaining: All methods return `this` for fluent API
 * - ⚠️ at() is absolute (requires all 3 params), move() is relative (optional params)
 * - Alignment methods use bounding box calculations automatically
 *
 * Available alignment edges: 'bottom', 'top', 'left', 'right', 'front', 'back'
 * Coordinate system: X=right, Y=up, Z=toward camera
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * ALIGN - Position solid's edge at origin plane
 * .align('bottom') places the bottom face at Y=0
 *
 * 💡 Instance method (not static): solid.align(edge)
 * 🔗 Chainable: Can combine with .move(), .center(), etc.
 * Use case: Build models from the ground up (bottom), hang from ceiling (top)
 */
export const bottomAligned = (): Solid => {
	return Solid.cube(12, 15, 8, { color: 'orange' }).align('bottom'); // Bottom face at Y=0
};

/**
 * TOP ALIGN - Position solid's top edge at origin
 * .align('top') places the top face at Y=0
 *
 * ⚠️ Notice: This places the TOP at Y=0, so solid extends downward (negative Y)
 */
export const topAligned = (): Solid => {
	return Solid.cylinder(6, 18, { color: 'purple' }).align('top'); // Top face at Y=0
};

/**
 * CENTER - Position solid's center at origin
 * .center() centers on all three axes (X, Y, Z)
 * .center({ x: true, y: true }) centers only on specified axes
 *
 * 💡 Most common for STL exports - ensures centered models for 3D printing
 * 🔗 Can chain: .center().move({ y: 10 }) to center then offset
 */
export const centered = (): Solid => {
	return Solid.sphere(7, { color: 'cyan' }).center(); // Centered at origin (0, 0, 0)
};

/**
 * Additional positioning concepts (not shown in examples above):
 *
 * .move({ x?, y?, z? }) - Relative positioning (adds to current position)
 *   Example: .move({ x: 5 }).move({ x: 3 }) → total movement of 8 units on X
 *   💡 Parameters are optional, only specify axes you want to move
 *
 * .at(x, y, z) - Absolute positioning (sets exact position)
 *   Example: .at(10, 20, 5) → places solid at exactly (10, 20, 5)
 *   ⚠️ All 3 parameters required (not optional like move)
 *   ⚠️ Don't chain multiple .at() calls - only last one takes effect
 *
 * .rotate({ x?, y?, z? }) - Rotation in degrees (relative, cumulative)
 *   Example: .rotate({ x: 90 }) → rotates 90° around X-axis
 *   🔗 Chainable: .rotate({ x: 45 }).rotate({ y: 90 })
 */

export const components: ComponentsMap = {
	'C1. Alignment: Bottom': bottomAligned,
	'C2. Alignment: Top': topAligned,
	'C3. Alignment: Center': centered
};
