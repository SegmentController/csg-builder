/**
 * Castle Project - Top-Level Assembly
 *
 * This file demonstrates production-scale component assembly:
 * - Cross-file component composition (imports from wall.ts and tower.ts)
 * - Extensive clone pattern for component reuse
 * - Complex spatial positioning with .move() and .rotate()
 * - Large-scale UNION operations (12+ components)
 * - Naming conventions for organization (F=front, R=rear, L=left, R=right)
 *
 * Castle Layout (top-down view):
 * ```
 *     cornerFL ──── wallF (gate) ──── cornerFR
 *         │                               │
 *       wallL1                          wallR1
 *         │                               │
 *    connectorL                       connectorR
 *         │                               │
 *       wallL2                          wallR2
 *         │                               │
 *     cornerRL ───── wallR ─────── cornerRR
 * ```
 *
 * Performance: All component functions (Wall, CornerTower, etc.) are cached
 * Result: Fast assembly despite 12+ CSG operations
 *
 * 💡 Clone pattern critical here - each component used multiple times
 * 💡 Hierarchical composition: Primitives → Blocks → Assembly
 */

import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

// Import building blocks from other castle files
import { ConnectorTower, CornerTower } from './tower';
import { Wall, WallWithGate } from './wall';

/**
 * CASTLE - Complete castle assembly
 *
 * Demonstrates:
 * - Component reuse via .clone() (each component cloned for independent transforms)
 * - Systematic positioning (.move() and .rotate() for each piece)
 * - Naming convention: wall[Position][Number], corner[Position][Side]
 *   - Position: F=front, R=rear (back)
 *   - Side: L=left, R=right
 *   - Number: Sequence (1, 2, ...) for multiple segments
 * - Large UNION: All 12 components merged into single Solid
 *
 * Why .clone()?
 * - Wall(100) returns cached instance
 * - .clone() creates independent copy for transforms
 * - Without clone: transforms would affect cached original
 *
 * ⚠️ Must clone before transform to avoid mutating cached components
 */
export const Castle = (): Solid => {
	// ========== FRONT SECTION ==========
	// Front wall with gate (main entrance) - centered at origin
	const wallF = WallWithGate(100).clone();

	// Front-left corner tower
	// 🔗 Clone-move-rotate pattern for positioned instances
	const cornerFL = CornerTower().clone().move({ x: -50 }).rotate({ y: 90 });

	// Front-right corner tower
	const cornerFR = CornerTower().clone().move({ x: 50 }).rotate({ y: 180 });

	// ========== LEFT SIDE SECTION ==========
	// Left wall segment 1 (longer, 150 units)
	const wallL1 = Wall(150).clone().move({ x: -50, z: -75 }).rotate({ y: 90 });

	// Left connector tower (breaks long wall into segments)
	const connectorL = ConnectorTower().clone().move({ x: -50, z: -150 }).rotate({ y: 90 });

	// Left wall segment 2 (shorter, 50 units)
	// Notice: z calculation shows offset from connector
	const wallL2 = Wall(50)
		.clone()
		.move({ x: -50, z: -150 - 25 }) // -150 (connector) - 25 (half wall)
		.rotate({ y: 90 });

	// ========== RIGHT SIDE SECTION ==========
	// Right side has asymmetric layout (different segment lengths)
	// Right wall segment 1 (shorter, 50 units)
	const wallR1 = Wall(50).clone().move({ x: 50, z: -25 }).rotate({ y: 90 });

	// Right connector tower
	const connectorR = ConnectorTower().clone().move({ x: 50, z: -50 }).rotate({ y: 90 });

	// Right wall segment 2 (longer, 150 units)
	const wallR2 = Wall(150)
		.clone()
		.move({ x: 50, z: -50 - 75 }) // -50 (connector) - 75 (half wall)
		.rotate({ y: 90 });

	// ========== REAR SECTION ==========
	// Rear wall (back of castle) - no gate
	const wallR = Wall(100).clone().move({ z: -200 });

	// Rear-left corner tower
	const cornerRL = CornerTower().clone().move({ x: -50, z: -200 }).rotate({ y: 0 });

	// Rear-right corner tower
	const cornerRR = CornerTower().clone().move({ x: 50, z: -200 }).rotate({ y: -90 });

	// ========== FINAL ASSEMBLY ==========
	// Combine all 12 components into single Solid
	// Static UNION method: Solid.UNION(solid1, solid2, ..., solidN)
	// Each component positioned correctly - union creates seamless structure
	//
	// Performance: Thanks to caching in Wall/Tower components,
	// this large UNION executes quickly despite complexity
	return Solid.UNION(
		wallF, // Front wall with gate
		cornerFL, // Front-left corner
		cornerFR, // Front-right corner
		wallL1, // Left wall segment 1
		connectorL, // Left connector tower
		wallL2, // Left wall segment 2
		wallR1, // Right wall segment 1
		connectorR, // Right connector tower
		wallR2, // Right wall segment 2
		wallR, // Rear wall
		cornerRL, // Rear-left corner
		cornerRR // Rear-right corner
	);
};

/**
 * Component registration
 *
 * Complete castle assembly demonstrating:
 * - Multi-file component composition
 * - Hierarchical architecture (3 tiers: primitives → blocks → assembly)
 * - Performance optimization via caching
 * - Production-ready patterns for complex projects
 *
 * 💡 This is the culmination of all castle project patterns
 * 💡 Shows how to build large-scale 3D models from reusable components
 */
export const components: ComponentsMap = {
	'X. Example: Whole Castle': () => Castle()
};
