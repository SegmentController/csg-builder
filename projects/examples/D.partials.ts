/**
 * D. Partial Geometries - Angle Parameters
 *
 * This file demonstrates partial geometries created using the angle parameter.
 * Circular primitives (cylinder, sphere, cone, prism) support angle < 360° to create
 * pie slices, hemispheres, wedges, and other sectioned shapes.
 *
 * Key concepts:
 * - Options object syntax: { color: 'blue', angle: 90 }
 * - Angle in degrees: 0-360 (default 360 = full circle)
 * - Angle constants: Solid.DEG_90, DEG_180, DEG_270, DEG_360
 * - Internal implementation: Uses CSG subtraction to create closed, manifold shapes
 * - ⚠️ Only works with circular primitives (cylinder, sphere, cone, prism)
 *
 * How it works: Creates full 360° shape, then subtracts a wedge to create the partial geometry.
 * Result is always a closed, solid shape (not hollow or open-edged).
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * PARTIAL CYLINDER - Quarter cylinder (90° pie slice)
 * angle: 90 creates a 90° section of the cylinder
 *
 * 💡 Use case: Architectural corners, pipe elbows, rounded edges
 * 💡 Can also use: angle: Solid.DEG_90 (predefined constant)
 */
export const cylinderPartial = (): Solid => {
	return Solid.cylinder(8, 10, { color: 'blue', angle: 90 }); // Quarter cylinder
};

/**
 * PARTIAL SPHERE - Hemisphere (180° half sphere)
 * angle: 180 creates exactly half of the sphere
 *
 * 💡 Use case: Domes, bowl shapes, rounded caps
 * Result: Closed solid with flat circular base (not hollow)
 */
export const spherePartial = (): Solid => {
	return Solid.sphere(8, { color: 'green', angle: 180 }); // Hemisphere
};

/**
 * PARTIAL CONE - Three-quarter cone (270° wedge)
 * angle: 270 creates a cone with a 90° wedge removed
 *
 * 💡 Use case: Funnel sections, decorative elements, cut-away views
 * 💡 Notice: Larger angle values (270°) create shapes with smaller sections removed
 */
export const conePartial = (): Solid => {
	return Solid.cone(8, 12, { color: 'red', angle: 270 }); // Three-quarter cone
};

/**
 * Additional partial geometry notes:
 *
 * - Prism primitives also support angle parameter:
 *   Solid.prism(6, 8, 10, { color: 'purple', angle: 180 })
 *   Solid.trianglePrism(8, 10, { color: 'cyan', angle: 90 })
 *
 * - Angle constants available:
 *   Solid.DEG_45 = 45    // Eighth of circle
 *   Solid.DEG_90 = 90    // Quarter circle
 *   Solid.DEG_180 = 180  // Half circle
 *   Solid.DEG_270 = 270  // Three-quarters
 *   Solid.DEG_360 = 360  // Full circle (default)
 *
 * - Performance: angle >= 360 skips CSG operations (optimized)
 * - Partial geometries are true CSG solids - can be used in UNION, SUBTRACT, etc.
 */

export const components: ComponentsMap = {
	'D1. Partials: Cylinder 90°': cylinderPartial,
	'D2. Partials: Sphere 180°': spherePartial,
	'D3. Partials: Cone 270°': conePartial
};
