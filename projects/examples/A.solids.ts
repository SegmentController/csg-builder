/**
 * A. Basic Primitives - Foundation
 *
 * This file demonstrates all basic primitive shapes available in CSG Builder.
 * These are the building blocks for creating complex 3D models.
 *
 * Key concepts:
 * - Static factory methods: Solid.cube(), Solid.cylinder(), etc.
 * - All functions return Solid instances (immutable objects)
 * - Color parameter accepts CSS color strings: 'red', '#ff0000', 'rgb(255,0,0)'
 * - Component registration pattern using ComponentsMap
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

/**
 * Cube primitive - rectangular box
 * Parameters: width (X), height (Y), depth (Z), color
 */
export const cube = (): Solid => {
	return Solid.cube(10, 10, 10, { color: 'red' }); // 10×10×10 red cube
};

/**
 * Cylinder primitive - circular extruded shape
 * Parameters: radius, height, options object with color
 * Note: Height segments and radial segments auto-calculated based on size
 */
export const cylinder = (): Solid => {
	return Solid.cylinder(5, 12, { color: 'blue' }); // Radius 5, height 12
};

/**
 * Sphere primitive - perfectly round 3D shape
 * Parameters: radius, options object with color
 * Note: Sphere segments auto-calculated for smooth appearance
 */
export const sphere = (): Solid => {
	return Solid.sphere(6, { color: 'green' }); // Radius 6
};

/**
 * Cone primitive - circular base tapering to a point
 * Parameters: radius (base), height, options object with color
 * Note: Automatically normalized for clean CSG operations
 */
export const cone = (): Solid => {
	return Solid.cone(6, 12, { color: 'orange' }); // Base radius 6, height 12
};

/**
 * Triangle Prism - 3-sided prism
 * Parameters: radius (circumscribed circle), height, options object with color
 * Note: Shorthand for Solid.prism(3, radius, height, options)
 */
export const trianglePrism = (): Solid => {
	return Solid.trianglePrism(6, 12, { color: 'purple' }); // Radius 6, height 12
};

/**
 * N-gon Prism - polygon extruded shape
 * Parameters: number of sides, radius, height, options object with color
 * Example: 6 sides = hexagon, 8 sides = octagon
 */
export const hexagonalPrism = (): Solid => {
	return Solid.prism(6, 6, 12, { color: 'cyan' }); // 6-sided, radius 6, height 12
};

/**
 * Rounded Box - box with filleted/rounded edges
 * Parameters: width (X), height (Y), depth (Z), options object with color, radius, segments
 * Note: Radius defaults to 10% of smallest dimension. Segments control rounding quality.
 */
export const roundedBox = (): Solid => {
	return Solid.roundedBox(10, 10, 10, { color: 'teal', radius: 2 }); // 10×10×10 with 2-unit radius
};

/**
 * Text - 3D extruded text
 * Parameters: text string, options object with color, size, height (extrusion depth)
 * Note: Uses Helvetiker Regular font. Text is centered on XZ plane and aligned to Y=0
 */
export const textShape = (): Solid => {
	return Solid.text('CSG', { color: 'blue', size: 8, height: 3 }); // "CSG" text
};

/**
 * Text as Cutter - demonstrates using text in CSG subtraction (embossing/engraving)
 * Creates a plate with text cut into it
 */
export const textCutter = (): Solid => {
	const plate = Solid.cube(30, 20, 5, { color: 'gray' }).center().align('bottom');
	const text = Solid.text('HELLO', { size: 4, height: 10, color: 'gray' }).move({ y: 10 });
	return Solid.SUBTRACT(plate, text);
};

/**
 * Component registration map
 * Keys: Component names (appear in UI dropdown)
 * Values: Functions that return Solid instances
 *
 * 💡 This map is passed to addToComponentStore() in index.ts to register all components
 */
export const components: ComponentsMap = {
	'A1. Solids: Cube': cube,
	'A2. Solids: Cylinder': cylinder,
	'A3. Solids: Sphere': sphere,
	'A4. Solids: Cone': cone,
	'A5. Solids: Triangle Prism': trianglePrism,
	'A6. Solids: Hexagonal Prism': hexagonalPrism,
	'A7. Solids: Rounded Box': roundedBox,
	'A8. Solids: Text': textShape,
	'A9. Solids: Text Cutter': textCutter
};
