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
 * Example 1: Parametric Building Component
 *
 * A complete building section using all techniques.
 */
const parametricBuilding = (): Solid => {
	// Configuration object (production pattern)
	const config = {
		floors: 4,
		windowsPerFloor: 5,
		floorHeight: 12,
		buildingWidth: 50,
		buildingDepth: 30
	};

	// Level 1: Cached primitive components
	const cachedWindow = cacheInlineFunction(
		'BuildingWindow',
		(width: number, height: number): Solid => {
			const frame = Solid.cube(width, height, 1.5, 'brown');
			const glass = Solid.cube(width - 0.8, height - 0.8, 0.8, 'cyan')
				.center({ x: true, y: true })
				.move({ z: 0.4 });
			const dividerH = Solid.cube(width, 0.3, 1.5, 'brown').center({ x: true, y: true });
			const dividerV = Solid.cube(0.3, height, 1.5, 'brown').center({ x: true, y: true });
			return Solid.MERGE([frame, glass, dividerH, dividerV]);
		}
	);

	// Level 2: Cached building blocks using primitives
	const cachedFloor = cacheInlineFunction(
		'BuildingFloor',
		(width: number, height: number, depth: number, windowCount: number): Solid => {
			// Floor slab
			const floor = Solid.cube(width, 1, depth, 'gray').align('bottom');

			// Walls
			const frontWall = Solid.cube(width, height, 2, 'lightgray')
				.align('bottom')
				.move({ y: 1, z: -depth / 2 + 1 });

			const backWall = Solid.cube(width, height, 2, 'lightgray')
				.align('bottom')
				.move({ y: 1, z: depth / 2 - 1 });

			const leftWall = Solid.cube(2, height, depth - 4, 'lightgray')
				.align('bottom')
				.move({ x: -width / 2 + 1, y: 1 });

			const rightWall = Solid.cube(2, height, depth - 4, 'lightgray')
				.align('bottom')
				.move({ x: width / 2 - 1, y: 1 });

			// Windows on front wall (using cached window component)
			const windows: Solid[] = [];
			const windowWidth = 4;
			const windowHeight = 6;
			const spacing = (width - windowCount * windowWidth) / (windowCount + 1);

			for (let index = 0; index < windowCount; index++) {
				const window = cachedWindow(windowWidth, windowHeight) // Cached call!
					.move({
						x: -width / 2 + spacing + index * (windowWidth + spacing) + windowWidth / 2,
						y: height / 2 + 1,
						z: -depth / 2 + 2
					});
				windows.push(window);
			}

			return Solid.MERGE([floor, frontWall, backWall, leftWall, rightWall, ...windows]).center({
				x: true,
				z: true
			});
		}
	);

	// Level 3: Assemble complete building using cached floors
	const floors: Solid[] = [];
	for (let index = 0; index < config.floors; index++) {
		// Use cached floor - only computed once per unique parameter set!
		const floor = cachedFloor(
			config.buildingWidth,
			config.floorHeight,
			config.buildingDepth,
			config.windowsPerFloor
		).move({
			y: index * config.floorHeight
		});
		floors.push(floor);
	}

	// Add roof
	const roof = Solid.prism(4, config.buildingWidth * 0.6, config.buildingDepth, { color: 'red' })
		.rotate({ x: 90 })
		.align('bottom')
		.move({ y: config.floors * config.floorHeight })
		.center({ x: true, z: true });

	return Solid.MERGE([...floors, roof]);
};

/**
 * Example 2: Geometric Sculpture with Transforms
 *
 * Artistic composition using scaling, rotation, and 3D grids.
 */
const geometricSculpture = (): Solid => {
	// Create base element with transform chain
	const createTwistedElement = (angle: number, scaleY: number): Solid => {
		return Solid.cube(4, 8, 4, 'purple')
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
 * Example 3: Lattice Structure with CSG
 *
 * Complex 3D grid pattern with hollow sections and CSG operations.
 */
const complexLattice = (): Solid => {
	// Cached beam component
	const cachedBeam = cacheInlineFunction(
		'LatticeBeam',
		(length: number, thickness: number): Solid => {
			const beam = Solid.cylinder(thickness, length, { color: 'silver' }).rotate({ z: 90 });

			// Add decorative ends
			const end = Solid.sphere(thickness * 1.2, { color: 'gold' });
			const end1 = end.move({ x: -length / 2 });
			const end2 = end.move({ x: length / 2 });

			return Solid.MERGE([beam, end1, end2]);
		}
	);

	// Create 3D lattice frame
	const beamLength = 15;
	const beamThickness = 0.8;
	const spacing = 15;

	// X-direction beams
	const beamsX: Solid[] = [];
	for (let y = 0; y < 4; y++) {
		for (let z = 0; z < 4; z++) {
			const beam = cachedBeam(beamLength, beamThickness).move({
				x: 0,
				y: y * spacing,
				z: z * spacing
			});
			beamsX.push(beam);
		}
	}

	// Y-direction beams
	const beamsY: Solid[] = [];
	for (let x = 0; x < 4; x++) {
		for (let z = 0; z < 4; z++) {
			const beam = cachedBeam(beamLength, beamThickness)
				.rotate({ z: -90 })
				.move({
					x: x * spacing,
					y: 0,
					z: z * spacing
				});
			beamsY.push(beam);
		}
	}

	// Z-direction beams
	const beamsZ: Solid[] = [];
	for (let x = 0; x < 4; x++) {
		for (let y = 0; y < 4; y++) {
			const beam = cachedBeam(beamLength, beamThickness)
				.rotate({ y: 90 })
				.move({
					x: x * spacing,
					y: y * spacing,
					z: 0
				});
			beamsZ.push(beam);
		}
	}

	// Merge all beams
	const lattice = Solid.MERGE([...beamsX, ...beamsY, ...beamsZ]);

	// Create a hollow sphere to carve out center
	const outerSphere = Solid.sphere(25, { color: 'silver' });
	const innerSphere = Solid.sphere(20, { color: 'silver' });
	const hollowSphere = Solid.SUBTRACT(outerSphere, innerSphere);

	// Intersect lattice with hollow sphere (keep only parts inside sphere shell)
	return Solid.INTERSECT(lattice, hollowSphere).center();
};

/**
 * Example 4: Modular Stadium Seating
 *
 * Production-quality tiered structure with configuration and optimization.
 */
const modularStadium = (): Solid => {
	// Configuration
	const stadiumConfig = {
		sections: 3, // Three seating sections
		tiersPerSection: 6,
		seatsPerRow: 20,
		seatWidth: 1.8,
		tierHeight: 2.5,
		tierDepth: 3
	};

	// Cached seat component
	const cachedSeat = cacheInlineFunction('StadiumSeat', (): Solid => {
		const base = Solid.cube(1.5, 0.8, 1.8, 'blue');
		const back = Solid.cube(1.5, 1.2, 0.3, 'blue')
			.align('bottom')
			.move({ y: 0.8, z: -1.8 / 2 + 0.15 });
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
					z: tier * stadiumConfig.tierDepth
				})
				.center({ x: true });

			tiers.push(tierSolid);
		}

		// Add section divider/aisle
		const aislePlatform = Solid.cube(
			stadiumConfig.seatsPerRow * stadiumConfig.seatWidth,
			0.5,
			stadiumConfig.tiersPerSection * stadiumConfig.tierDepth + 5,
			'gray'
		)
			.align('bottom')
			.move({ y: -1 })
			.center({ x: true, z: true });

		return Solid.MERGE([...tiers, aislePlatform]).rotate({ y: sectionIndex * 120 });
	};

	// Create three sections around a central field
	const sections: Solid[] = [];
	for (let index = 0; index < stadiumConfig.sections; index++) {
		sections.push(createSection(index));
	}

	// Central field
	const field = Solid.cylinder(30, 0.5, { color: 'green' }).align('bottom').move({ y: -2 });

	return Solid.MERGE([field, ...sections]).center({ x: true, z: true });
};

/**
 * Example 5: Complete Building Complex
 *
 * Expert-level composition: Multiple buildings with shared infrastructure.
 * Demonstrates all H-L concepts in a single production-quality model.
 */
const buildingComplex = (): Solid => {
	// Shared configuration
	const complexConfig = {
		towerHeight: 60,
		towerWidth: 20,
		bridgeHeight: 40,
		bridgeLength: 30
	};

	// Cached components (Level 1: Primitives)
	const cachedWindowSmall = cacheInlineFunction('SmallWindow', (): Solid => {
		const frame = Solid.cube(3, 4, 1, 'brown');
		const glass = Solid.cube(2.5, 3.5, 0.5, 'cyan').center({ x: true, y: true }).move({ z: 0.5 });
		return Solid.MERGE([frame, glass]);
	});

	// Level 2: Building blocks
	const cachedTower = cacheInlineFunction('Tower', (height: number, width: number): Solid => {
		// Tower body
		const body = Solid.cube(width, height, width, 'lightgray').align('bottom');

		// Add windows in 3D grid pattern
		const window = cachedWindowSmall();
		const windowsPerFloor = 4;
		const floors = Math.floor(height / 10);

		const windows: Solid[] = [];
		for (let floor = 0; floor < floors; floor++) {
			for (let index = 0; index < windowsPerFloor; index++) {
				const windowInstance = window.move({
					x: -width / 2 + (index + 1) * (width / (windowsPerFloor + 1)),
					y: floor * 10 + 6,
					z: width / 2 + 0.5
				});
				windows.push(windowInstance);
			}
		}

		// Roof
		const roof = Solid.prism(4, width * 0.7, width * 0.9, { color: 'red' })
			.rotate({ x: 90 })
			.align('bottom')
			.move({ y: height })
			.center({ x: true, z: true });

		return Solid.MERGE([body, ...windows, roof]).center({ x: true, z: true });
	});

	// Level 3: Assemble complex
	const tower1 = cachedTower(complexConfig.towerHeight, complexConfig.towerWidth).move({
		x: -complexConfig.bridgeLength / 2
	});

	const tower2 = cachedTower(complexConfig.towerHeight, complexConfig.towerWidth).move({
		x: complexConfig.bridgeLength / 2
	});

	// Connecting bridge
	const bridge = Solid.cube(complexConfig.bridgeLength, 5, 15, 'gray')
		.align('bottom')
		.move({ y: complexConfig.bridgeHeight })
		.center({ x: true, z: true });

	// Support columns for bridge
	const columnHeight = complexConfig.bridgeHeight;
	const column = Solid.cylinder(1.5, columnHeight, { color: 'gray' }).align('bottom');
	const columns = Solid.GRID_XY(column, {
		cols: 2,
		rows: 3,
		spacing: [complexConfig.bridgeLength - 3, 6]
	}).center({ x: true, z: true });

	// Ground platform
	const platform = Solid.cube(complexConfig.bridgeLength + 40, 2, 40, 'brown')
		.align('bottom')
		.move({ y: -1 })
		.center({ x: true, z: true });

	return Solid.MERGE([platform, tower1, tower2, bridge, columns]);
};

/**
 * PRODUCTION PATTERNS DEMONSTRATED:
 *
 * 1. HIERARCHICAL ARCHITECTURE:
 *    - Level 1: Cached primitive components (windows, doors)
 *    - Level 2: Cached building blocks (floors, walls)
 *    - Level 3: Final assemblies (buildings, structures)
 *
 * 2. CONFIGURATION-DRIVEN DESIGN:
 *    - Use config objects for parameters
 *    - Easy to modify and scale
 *    - Single source of truth for dimensions
 *
 * 3. PERFORMANCE OPTIMIZATION:
 *    - Cache at every level (primitives, blocks, assemblies)
 *    - Transform before CSG (cheap operations first)
 *    - Reuse cached components extensively
 *
 * 4. CODE ORGANIZATION:
 *    - Separate concerns (config, primitives, assembly)
 *    - Named cached functions for clarity
 *    - Consistent patterns across components
 *
 * 5. TRANSFORM WORKFLOW:
 *    - Scale → Center → Rotate → Move
 *    - Align for ground-up construction
 *    - Use .getBounds() for dynamic spacing
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
	'M1: Parametric Building': parametricBuilding,
	'M2: Geometric Sculpture': geometricSculpture,
	'M3: Complex Lattice': complexLattice,
	'M4: Modular Stadium': modularStadium,
	'M5: Building Complex': buildingComplex
};

addToComponentStore(components);
