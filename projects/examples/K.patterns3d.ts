import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';
import { addToComponentStore } from '$stores/componentStore';

/**
 * K. ADVANCED 3D SPATIAL ARRANGEMENTS
 *
 * This example demonstrates advanced patterns for creating complex 3D structures.
 *
 * KEY CONCEPTS:
 * - Programmatic grid generation with loops
 * - Using .getBounds() for dynamic spacing calculations
 * - Combining grids with CSG operations (hollowing, carving)
 * - Mixed primitive arrays
 * - Architectural patterns (columns, arches, stadium seating)
 * - Mathematical patterns (spirals, helixes)
 *
 * ADVANCED TECHNIQUES:
 * - Dynamic positioning based on geometry dimensions
 * - Conditional element placement in grids
 * - Multi-level compositions with different grid densities
 * - Parametric patterns driven by mathematical functions
 *
 * BOUNDING BOX API:
 * - solid.getBounds() returns { width, height, depth, min, max, center }
 * - Useful for calculating spacing, centering, and layout
 * - More precise than manual dimension tracking
 */

/**
 * Example 1: Using getBounds() for Dynamic Spacing
 *
 * Calculate spacing dynamically based on actual geometry dimensions.
 */
const dynamicSpacing = (): Solid => {
	// Create a complex shape with unknown total dimensions
	const element = Solid.UNION(
		Solid.cube(8, 12, 4, { color: 'teal' }),
		Solid.cylinder(3, 15, { color: 'teal' }).move({ y: 6 })
	);

	// Get actual dimensions using getBounds()
	const bounds = element.getBounds();
	const { width, height, depth, center } = bounds;

	// Calculate spacing to create a specific gap
	const desiredGap = 5;
	const spacingX = desiredGap;
	const spacingY = desiredGap;
	const spacingZ = desiredGap;

	// Create grid with precise spacing
	const grid = Solid.GRID_XYZ(element, {
		cols: 3,
		rows: 2,
		levels: 2,
		spacing: [spacingX, spacingY, spacingZ]
	});

	// Visual reference: Show bounding box of single element
	const boundingBox = Solid.cube(width, height, depth, { color: 'red' })
		.at(center.x, center.y, center.z)
		.move({ x: -30 });

	return Solid.MERGE([grid.center(), boundingBox]);
};

/**
 * Example 2: Programmatic Grid with Loops
 *
 * Use loops for more control over element placement and variation.
 */
const programmaticGrid = (): Solid => {
	const elements: Solid[] = [];

	// Create a 5x5x3 grid with varying heights
	for (let level = 0; level < 3; level++) {
		for (let row = 0; row < 5; row++) {
			for (let col = 0; col < 5; col++) {
				// Vary height based on position (create a wave pattern)
				const baseHeight = 5;
				const heightVariation = Math.sin(col * 0.5) * Math.cos(row * 0.5) * 3;
				const height = baseHeight + heightVariation;

				// Vary color based on level
				const colors = ['red', 'green', 'blue'];
				const color = colors[level];

				// Create cube with calculated height
				const cube = Solid.cube(3, height, 3, { color })
					.align('bottom')
					.move({
						x: col * 5,
						y: level * 10,
						z: row * 5
					});

				elements.push(cube);
			}
		}
	}

	return Solid.MERGE(elements).center();
};

/**
 * Example 3: Hollow Grid Structure (Grid + CSG)
 *
 * Combine grids with CSG operations to create complex patterns.
 */
const hollowGrid = (): Solid => {
	// Create a solid 3D grid
	const cube = Solid.cube(6, 6, 6, { color: 'purple' });
	const solidGrid = Solid.GRID_XYZ(cube, {
		cols: 4,
		rows: 4,
		levels: 4,
		spacing: [2, 2, 2]
	}).center();

	// Create a hollow sphere to carve out the center
	const outerSphere = Solid.sphere(18, { color: 'purple' });
	const innerSphere = Solid.sphere(14, { color: 'purple' });
	const hollowSphere = Solid.SUBTRACT(outerSphere, innerSphere);

	// Subtract the hollow sphere from the grid
	// This creates a spherical cavity in the grid
	return Solid.INTERSECT(solidGrid, hollowSphere);
};

/**
 * Example 4: Architectural Column Grid
 *
 * Create a classical building facade with columns and arches.
 */
const columnGrid = (): Solid => {
	// Create base (bottom part of column)
	const base = Solid.cube(4, 2, 4, { color: 'gray' }).align('bottom').center({ x: true, z: true });

	// Create shaft (middle cylindrical part)
	const shaft = Solid.cylinder(1.5, 20, { color: 'lightgray' })
		.center({ x: true, z: true })
		.align('bottom')
		.move({ y: 2 });

	// Create capital (top decorative part)
	const capital = Solid.cube(4, 3, 4, { color: 'gray' })
		.center({ x: true, z: true })
		.align('bottom')
		.move({ y: 22 });

	// Merge into single column
	const singleColumn = Solid.MERGE([base, shaft, capital]);

	// Create column grid (4 columns in a row)
	const columns = Solid.GRID_X(singleColumn, { cols: 4, spacing: 10 })
		.align('left')
		.center({ z: true });

	// Create floor platform
	const platform = Solid.cube(50, 1, 15, { color: 'brown' })
		.align('bottom')
		.center({ x: true, z: true })
		.move({ y: -0.5, x: 22.5 });

	// Create entablature (horizontal beam on top)
	const entablature = Solid.cube(50, 4, 12, { color: 'gray' })
		.align('bottom')
		.move({ y: 25, x: -22.5 })
		.center({ x: true, z: true });

	return Solid.MERGE([platform, columns, entablature]);
};

/**
 * Example 5: Stadium Seating (Tiered Rows)
 *
 * Create a stadium seating arrangement with multiple tiers.
 */
const stadiumSeating = (): Solid => {
	const seats: Solid[] = [];

	// Create 10 tiers of seating
	const tiers = 10;
	const seatsPerTier = 15;
	const tierHeight = 2; // Each tier rises 2 units
	const tierDepth = 3; // Each tier goes back 3 units

	for (let tier = 0; tier < tiers; tier++) {
		// Create a seat (simple cube)
		const seat = Solid.cube(1.5, 1.5, 2, { color: 'blue' });

		// Create a row of seats for this tier
		const row = Solid.GRID_X(seat, {
			cols: seatsPerTier,
			spacing: 0.5
		})
			.align('bottom')
			.move({
				y: tier * tierHeight, // Each tier rises
				z: tier * tierDepth // Each tier goes back
			})
			.center({ x: true });

		seats.push(row);
	}

	// Add a field/stage at the front
	const field = Solid.cube(30, 0.5, 15, { color: 'green' })
		.align('bottom')
		.move({ y: -1, z: -10 })
		.center({ x: true });

	seats.push(field);

	return Solid.MERGE(seats).center({ z: true });
};

/**
 * ADVANCED PATTERNS:
 *
 * 1. CONDITIONAL PLACEMENT:
 *    - Use loops with if/else to place elements selectively
 *    - Example: Skip center elements for hollow structures
 *    - Example: Place different primitives based on position
 *
 * 2. MATHEMATICAL PATTERNS:
 *    - Use Math.sin(), Math.cos() for wave patterns
 *    - Use formulas for spirals, helixes
 *    - Calculate positions with equations
 *
 * 3. MULTI-DENSITY GRIDS:
 *    - Combine dense and sparse grids
 *    - Different grid densities per level/region
 *    - Create detail where needed, simplify elsewhere
 *
 * 4. GRID AS CSG OPERAND:
 *    - Use grids as subtraction volumes (window arrays)
 *    - Intersect grids with shapes for complex patterns
 *    - Union multiple grids with different primitives
 *
 * 5. HIERARCHICAL COMPOSITION:
 *    - Create components with internal grids
 *    - Use grids to place complex components
 *    - Multi-level composition (grid of grids)
 *
 * PERFORMANCE TIPS:
 *
 * 1. LOOP LIMITS:
 *    - Keep total elements under 500 for reasonable performance
 *    - Test with small counts, scale up gradually
 *    - Consider caching (see example L) for large grids
 *
 * 2. CSG ON GRIDS:
 *    - Apply CSG to individual elements when possible
 *    - CSG on large merged grids is very expensive
 *    - Pattern: Create element with holes, then grid it
 *
 * 3. BOUNDS CALCULATION:
 *    - .getBounds() is moderately expensive
 *    - Call once, store result, reuse values
 *    - Don't call in tight loops
 *
 * COMMON USE CASES:
 *
 * 1. ARCHITECTURE:
 *    - Building facades with window arrays
 *    - Column grids and porticos
 *    - Tiered structures (amphitheaters, terraces)
 *
 * 2. MECHANICAL:
 *    - Ventilation grilles (regular hole patterns)
 *    - Heat sinks (fin arrays)
 *    - Fastener arrays (bolt patterns)
 *
 * 3. ARTISTIC:
 *    - Parametric sculptures
 *    - Mathematical visualizations
 *    - Generative patterns
 *
 * 4. FUNCTIONAL:
 *    - Storage systems (shelving, organizers)
 *    - Lattice structures (lightweight but strong)
 *    - Drainage/ventilation patterns
 */

// Register all examples for the UI dropdown
export const components: ComponentsMap = {
	'K1: Dynamic Spacing with getBounds()': dynamicSpacing,
	'K2: Programmatic Grid (Wave Pattern)': programmaticGrid,
	'K3: Hollow Grid Structure': hollowGrid,
	'K4: Architectural Column Grid': columnGrid,
	'K5: Stadium Seating': stadiumSeating
};

addToComponentStore(components);
