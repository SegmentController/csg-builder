/**
 * Castle Project - Tower Components
 *
 * This file demonstrates advanced component integration patterns:
 * - Cross-file component dependencies (imports Wall from wall.ts)
 * - Boolean subtraction for component integration (towers subtract walls)
 * - Octagonal geometry for architectural detail
 * - Hollow structures via nested subtraction (battlements, roof)
 * - Repeated CSG operations in loops (window pattern)
 * - Parametric variants (CornerTower vs ConnectorTower)
 *
 * Components:
 * - Tower (helper): Base octagonal tower with windows and hollow roof
 * - CornerTower: L-shaped wall integration (two perpendicular walls)
 * - ConnectorTower: Straight wall integration (two parallel walls)
 *
 * Architecture: Towers subtract walls to create connection points
 * Why: Ensures perfect alignment and manifold geometry at connections
 */

import { Solid } from '$lib/3d/Solid';
import { cacheInlineFunction } from '$lib/cacheFunction';
import type { ComponentsMap } from '$stores/componentStore';

import { TOWER, WALL } from './_const';
import { Wall } from './wall'; // Cross-file dependency

/**
 * TOWER - Base octagonal tower structure (helper function)
 *
 * Demonstrates:
 * - Octagonal prisms (8-sided) with rotation for flat-edge alignment
 * - Tapered levels (footer, tower, top) with increasing radii
 * - Hollow battlement top via nested prism subtraction
 * - Repeated window pattern using CSG in loop
 * - Hollow cone roof via cone subtraction
 *
 * Not exported - internal building block for CornerTower and ConnectorTower
 *
 * 💡 Why 8 sides? Approximates circular tower while keeping polygon count low
 * 💡 22.5° rotation aligns flat edge to front (360°/8/2 = 22.5°)
 */
const Tower = cacheInlineFunction('Tower', (radius: number): Solid => {
	// Main tower body (octagonal prism)
	// 🔗 Method chaining: .align().rotate()
	const tower = Solid.prism(8, radius, WALL.HEIGHT, { color: 'red' })
		.align('bottom') // Position base at Y=0
		.rotate({ y: 22.5 }); // Align flat edge to front

	// Tower base (wider footer for stability)
	const footer = Solid.prism(8, radius + 2, WALL.WIDTH * 2)
		.align('bottom')
		.rotate({ y: 22.5 }); // Match tower rotation

	// Battlement top (hollow crown-like structure)
	const top = Solid.prism(8, radius + 4, WALL.HEIGHT / 2)
		.align('bottom')
		.move({ y: WALL.HEIGHT }) // Position at tower top
		.rotate({ y: 22.5 });

	// Inner void for hollow battlement (slightly smaller than top)
	const topInner = Solid.prism(8, radius + 3, WALL.HEIGHT / 2 + 1)
		.align('bottom')
		.move({ y: WALL.HEIGHT + 0.5 }) // Offset slightly up
		.rotate({ y: 22.5 });

	// Combine solid parts, then subtract inner void to create hollow top
	let result = Solid.UNION(tower, footer, top);
	result = Solid.SUBTRACT(result, topInner); // Creates hollow battlement

	// Create decorative windows in battlement via loop subtraction
	// Window positioned high on battlement
	const window = Solid.cube(radius * 4, WALL.WIDTH * 2, WALL.WIDTH)
		.align('bottom')
		.move({ y: WALL.HEIGHT * 1.5 - WALL.WIDTH * 2 }); // High on battlement

	// Loop: Subtract window 4 times, rotating 45° each iteration
	// Creates 4 evenly spaced windows around tower (45° × 4 = 180°, half rotation)
	for (let step = 0; step < 4; step++) {
		result = Solid.SUBTRACT(result, window); // Cut window opening
		window.rotate({ y: 45 }); // ⚠️ Mutation: rotate window for next position
	}

	// Create hollow cone roof (like a wizard hat)
	// Outer cone (visible roof surface)
	let cone = Solid.cone(radius + 4 + 2, WALL.HEIGHT / 2, { segments: 8 })
		.rotate({ y: 22.5 }) // Match octagonal alignment
		.align('bottom');

	// Inner cone (void for hollow interior)
	const coneInner = Solid.cone(radius + 4, WALL.HEIGHT / 2 + 2, { segments: 8 })
		.rotate({ y: 22.5 })
		.align('bottom');

	// Subtract inner from outer, then position at tower top
	// 🔗 Chaining: SUBTRACT returns new Solid, immediately .move()
	cone = Solid.SUBTRACT(cone, coneInner).move({ y: WALL.HEIGHT + WALL.HEIGHT / 2 });

	// Add cone roof to tower
	result = Solid.UNION(result, cone);

	return result.align('bottom');
});

/**
 * CORNER TOWER - Tower for castle corners with L-shaped wall integration (cached)
 *
 * Demonstrates cross-component integration pattern:
 * - Uses Tower(radius) helper with CORNER_RADIUS constant
 * - Subtracts TWO perpendicular walls to create L-shaped connection points
 * - Walls positioned with includeFootPath for proper tower integration
 * - CSG subtraction ensures perfect alignment and manifold geometry
 *
 * Why subtract walls?
 * - Creates recessed slots for walls to connect into tower
 * - Ensures no geometry conflicts when assembling castle
 * - footPath parameter creates proper connection surface
 *
 * 💡 Cached for performance (used 4 times in castle - one per corner)
 * 💡 Cross-file dependency: imports Wall() from wall.ts
 */
export const CornerTower = cacheInlineFunction('CornetTower', (): Solid => {
	// Start with larger corner tower (more defensive/prominent)
	let tower = Tower(TOWER.CORNER_RADIUS);

	// First wall slot (aligned left, positioned at tower edge)
	// includeFootPath: true ensures proper CSG connection surface
	const wall = Wall(20, { includeFootPath: true })
		.align('left') // Align left edge to origin
		.move({ x: TOWER.CORNER_RADIUS - 2 }); // Position at tower edge
	tower = Solid.SUBTRACT(tower, wall); // Cut slot for wall connection

	// Second wall slot (perpendicular to first - creates L-shape)
	// Rotated 90° to create corner connection
	const wall2 = Wall(20, { includeFootPath: true })
		.align('right') // Align right edge to origin
		.rotate({ y: 90 }) // Rotate perpendicular
		.move({ z: TOWER.CORNER_RADIUS - 2 }); // Position at tower edge
	tower = Solid.SUBTRACT(tower, wall2); // Cut second slot

	return tower;
});

/**
 * CONNECTOR TOWER - Tower for connecting straight wall segments (cached)
 *
 * Similar to CornerTower but subtracts TWO PARALLEL walls (not perpendicular)
 * Creates straight-through connection for wall segments
 *
 * Differences from CornerTower:
 * - Uses CONNECTOR_RADIUS (smaller, less prominent)
 * - Walls aligned opposite (left and right on same axis)
 * - No rotation - walls are parallel, not perpendicular
 * - Creates straight pass-through, not L-shaped corner
 *
 * Use case: Connects two wall segments in a straight line
 * Example: Long castle wall broken into segments with towers between
 *
 * 💡 Smaller radius (6 vs 8) makes connector towers less obtrusive
 * 💡 Also cached for performance
 */
export const ConnectorTower = cacheInlineFunction('ConnectorTower', (): Solid => {
	// Start with smaller connector tower (less prominent than corners)
	let tower = Tower(TOWER.CONNECTOR_RADIUS);

	// First wall slot (left side)
	const wall = Wall(20, { includeFootPath: true })
		.align('left')
		.move({ x: TOWER.CONNECTOR_RADIUS - 2 });
	tower = Solid.SUBTRACT(tower, wall);

	// Second wall slot (opposite side - parallel to first, not perpendicular)
	// Notice: No rotation, aligned opposite (right vs left)
	const wall2 = Wall(20, { includeFootPath: true })
		.align('right')
		.move({ x: -TOWER.CONNECTOR_RADIUS + 2 }); // Opposite X position
	tower = Solid.SUBTRACT(tower, wall2);

	return tower;
});

/**
 * Component registration
 *
 * 💡 Tower components used as building blocks in castle.ts
 * 💡 Exported both for UI display and cross-file import
 */
export const components: ComponentsMap = {
	'X. Example: Corner Tower 10': () => CornerTower(),
	'X. Example: Connector Tower 10': () => ConnectorTower()
};
