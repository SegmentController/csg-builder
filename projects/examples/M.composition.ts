import { Solid } from '$lib/3d/Solid';
import { cacheInlineFunction } from '$lib/cacheFunction';
import type { ComponentsMap } from '$stores/componentStore';
import { addToComponentStore } from '$stores/componentStore';

/**
 * M. COMPLEX MULTI-CONCEPT COMPOSITION
 *
 * This expert-level example combines all advanced concepts from H-L into complete structures.
 *
 * CONCEPTS INTEGRATED:
 * - Scaling (Example H) - Size variations and aspect ratios
 * - Complex transforms (Example I) - Transform chains and positioning
 * - 3D grids (Example J) - Volumetric patterns with GRID_XYZ
 * - Advanced patterns (Example K) - Programmatic generation and getBounds
 * - Optimization (Example L) - Caching and performance patterns
 *
 * PRODUCTION PATTERNS:
 * - Hierarchical component structure (primitives → blocks → assemblies)
 * - Cross-component dependencies
 * - Configuration-driven design
 * - Performance-optimized composition
 * - Real-world architectural modeling
 *
 * This example bridges from tutorial code to production code (like /projects/castle).
 */

/**
 * Example 1: Geometric Sculpture with Transforms
 *
 * Artistic composition using scaling, rotation, and 3D grids.
 */
const geometricSculpture = (): Solid => {
	// Create base element with transform chain
	const createTwistedElement = (angle: number, scaleY: number): Solid => {
		return Solid.cube(4, 8, 4, { color: 'purple' })
			.center() // Center for symmetric rotation
			.scale({ y: scaleY }) // Vary height
			.rotate({ y: angle }) // Twist
			.move({ y: 20 }); // Lift up
	};

	// Create spiral pattern with programmatic rotation and scaling
	const spiralElements: Solid[] = [];
	const steps = 12;
	for (let index = 0; index < steps; index++) {
		const angle = (index * 360) / steps; // Full rotation
		const scaleY = 0.5 + (index / steps) * 1.5; // Grow from 0.5x to 2x
		const radius = 15;

		const element = createTwistedElement(angle, scaleY).move({
			x: Math.cos((angle * Math.PI) / 180) * radius,
			z: Math.sin((angle * Math.PI) / 180) * radius,
			y: index * 3 // Rise as it spirals
		});

		spiralElements.push(element);
	}

	// Add center column
	const column = Solid.cylinder(3, 40, { color: 'gold' })
		.align('bottom')
		.center({ x: true, z: true });

	// Add base platform
	const base = Solid.cylinder(20, 2, { color: 'gray' })
		.align('bottom')
		.center({ x: true, z: true });

	return Solid.MERGE([base, column, ...spiralElements]);
};

/**
 * Example 2: Modular Stadium Seating
 *
 * Production-quality tiered structure with configuration and optimization.
 */
const modularStadium = (): Solid => {
	// Configuration
	const stadiumConfig = {
		sections: 6, // Six seating sections (hexagonal arrangement)
		tiersPerSection: 6,
		seatsPerRow: 20,
		seatWidth: 1.8,
		tierHeight: 2.5,
		tierDepth: 3
	};

	// Cached seat component
	const cachedSeat = cacheInlineFunction('StadiumSeat', (): Solid => {
		const base = Solid.cube(1.5, 0.8, 1.8, { color: 'blue' });
		const back = Solid.cube(1.5, 1.2, 0.3, { color: 'blue' })
			.align('bottom')
			.move({ y: 0.3, z: -1.8 / 2 + 0.15 });
		return Solid.MERGE([base, back]).align('bottom');
	});

	// Create a single section with multiple tiers
	const createSection = (sectionIndex: number): Solid => {
		const tiers: Solid[] = [];

		for (let tier = 0; tier < stadiumConfig.tiersPerSection; tier++) {
			// Create row of seats using GRID_X
			const seat = cachedSeat(); // Cached!
			const seatRow = Solid.GRID_X(seat, {
				cols: stadiumConfig.seatsPerRow,
				spacing: 0.3
			});

			// Position tier with rise and run
			const tierSolid = seatRow
				.align('bottom')
				.move({
					y: tier * stadiumConfig.tierHeight,
					z: -35 - tier * stadiumConfig.tierDepth
				})
				.center({ x: true });

			tiers.push(tierSolid);
		}

		// Add section divider/aisle
		const aislePlatform = Solid.cube(
			stadiumConfig.seatsPerRow * stadiumConfig.seatWidth,
			0.5,
			stadiumConfig.tiersPerSection * stadiumConfig.tierDepth + 5,
			{ color: 'gray' }
		)
			.align('bottom')
			.move({ y: -1 })
			.center({ x: true, z: true });

		return (
			Solid.MERGE([...tiers, aislePlatform])
				//.center({ x: true, y: true, z: true })
				.rotate({ y: sectionIndex * 60 })
		); // Then rotate around center (360/6 = 60° for hexagon)
	};

	// Create six sections around a central field (hexagonal arrangement)
	const sections: Solid[] = [];
	for (let index = 0; index < stadiumConfig.sections; index++) {
		sections.push(createSection(index));
	}

	return Solid.MERGE(sections).center({ x: true, z: true });
};

/**
 * PRODUCTION PATTERNS DEMONSTRATED:
 *
 * 1. CONFIGURATION-DRIVEN DESIGN:
 *    - Use config objects for parameters
 *    - Easy to modify and scale
 *    - Single source of truth for dimensions
 *
 * 2. CODE ORGANIZATION:
 *    - Separate concerns (config, primitives, assembly)
 *    - Named cached functions for clarity
 *    - Consistent patterns across components
 *
 * NEXT STEPS:
 *
 * To continue learning, study /projects/castle:
 * - Multi-file structure (wall.ts, tower.ts, castle.ts)
 * - Shared configuration (_const.ts)
 * - Cross-file component dependencies
 * - Advanced CSG techniques
 * - Production-scale complexity
 *
 * The patterns in this example (M) are the bridge between
 * tutorial code (A-L) and production code (castle).
 */

// Register all examples for the UI dropdown
export const components: ComponentsMap = {
	'M1: Geometric Sculpture': geometricSculpture,
	'M2: Modular Stadium': modularStadium
};

addToComponentStore(components);
