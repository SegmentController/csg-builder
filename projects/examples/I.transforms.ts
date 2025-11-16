import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';
import { addToComponentStore } from '$stores/componentStore';

/**
 * I. COMPLEX TRANSFORM CHAINS
 *
 * This example demonstrates advanced transformation patterns and order-of-operations.
 *
 * KEY CONCEPTS:
 * - Transform order matters: rotate-then-move ≠ move-then-rotate
 * - Absolute positioning (.at()) vs relative (.move())
 * - Combining .center(), .align(), .rotate(), .move(), .scale()
 * - Performance considerations (transform before CSG)
 * - Transform independence (each solid transforms separately)
 *
 * AVAILABLE TRANSFORM METHODS:
 * - .at(x, y, z) - Absolute position (requires all 3 params)
 * - .move({ x?, y?, z? }) - Relative translation (optional params)
 * - .rotate({ x?, y?, z? }) - Rotation in degrees (optional params)
 * - .scale({ all?, x?, y?, z? }) - Scaling (optional params)
 * - .center({ x?, y?, z? }) - Center on axes (optional params, defaults to all)
 * - .align('top'|'bottom'|'left'|'right'|'front'|'back') - Align edge to origin
 *
 * ALL METHODS RETURN `this` FOR CHAINING (fluent API pattern)
 */

/**
 * Example 1: Transform Order - Rotate Then Move vs Move Then Rotate
 *
 * One of the most important concepts: ORDER MATTERS!
 * Rotating changes the local coordinate system.
 */
const transformOrder = (): Solid => {
	// Scenario: Place a cylinder 20 units away from origin, then rotate it

	// Approach A: Move THEN Rotate
	// The rotation happens around the solid's current position
	const moveFirstCylinder = Solid.cylinder(3, 15, { color: 'red' })
		.rotate({ z: 90 }) // Orient horizontally first
		.move({ x: 20 }) // Move right
		.rotate({ y: 45 }); // Rotate - happens at position (20, 0, 0)
	// Result: Cylinder stays at x=20, rotates in place

	// Approach B: Rotate THEN Move
	// The move happens in the ROTATED coordinate system
	const rotateFirstCylinder = Solid.cylinder(3, 15, { color: 'blue' })
		.rotate({ z: 90 }) // Orient horizontally first
		.rotate({ y: 45 }) // Rotate at origin
		.move({ x: 10 }); // Move in the rotated direction
	// Result: Cylinder moves at an angle (following its rotated X-axis)

	// Visual reference: Show origin
	const origin = Solid.sphere(2, { color: 'yellow' });

	return Solid.MERGE([moveFirstCylinder, rotateFirstCylinder, origin]);
};

/**
 * Example 2: Centering in Transform Chains
 *
 * .center() is often used at the start or end of transform chains.
 * Understanding when to center is crucial for predictable positioning.
 */
const centeringInChains = (): Solid => {
	// Pattern A: Center FIRST, then transform
	// Good for: Symmetric rotations and scaling around center
	const centerFirst = Solid.cube(10, 20, 5, { color: 'green' })
		.center() // Center at origin (0,0,0)
		.rotate({ z: 45 }) // Rotate around center
		.move({ x: -30, y: 15 }); // Then move to final position

	// Pattern B: Transform, then center
	// Good for: Centering complex assemblies after composition
	const centerLast = Solid.UNION(
		Solid.cube(10, 20, 5, { color: 'cyan' }),
		Solid.cylinder(3, 25, { color: 'cyan' }).rotate({ x: 90 })
	)
		.rotate({ z: 30 }) // Rotate the assembly
		.center() // Center the final result
		.move({ x: 30, y: 15 }); // Position it

	// Pattern C: Selective centering (center only specific axes)
	const selectiveCentering = Solid.cube(8, 15, 6, { color: 'orange' })
		.align('bottom') // Place bottom face on Y=0
		.center({ x: true, z: true }) // Center horizontally only (Y unchanged)
		.move({ y: -15 }); // Move down

	return Solid.MERGE([centerFirst, centerLast, selectiveCentering]);
};

/**
 * Example 3: Absolute vs Relative Positioning
 *
 * .at() sets absolute position, .move() adds relative offset.
 * Understanding the difference prevents positioning bugs.
 */
const absoluteVsRelative = (): Solid => {
	// Absolute positioning with .at(x, y, z)
	// Always requires all three parameters
	// Each .at() call REPLACES previous position (last one wins)
	const absoluteCube = Solid.cube(8, 8, 8, { color: 'purple' })
		.at(0, 0, 0) // Position at origin
		.at(10, 5, 0) // REPLACES previous - now at (10, 5, 0)
		.at(-30, 10, 0); // REPLACES again - final position
	// Result: Only the last .at() matters, cube is at (-30, 10, 0)

	// Relative positioning with .move({ x?, y?, z? })
	// Parameters are optional, only specified axes move
	// Each .move() call ACCUMULATES (adds to previous position)
	const relativeCube = Solid.cube(8, 8, 8, { color: 'lime' })
		.move({ x: 10 }) // Move right 10 units
		.move({ y: 5 }) // Move up 5 units
		.move({ x: -5, z: 3 }); // Move left 5, forward 3
	// Result: Final position is (10-5, 5, 3) = (5, 5, 3)

	// Mixed: .at() then .move()
	// Common pattern: Place at specific location, then fine-tune
	const mixedCube = Solid.cube(8, 8, 8, { color: 'yellow' })
		.at(30, 0, 0) // Place at absolute position
		.move({ y: 10, z: 2 }); // Fine-tune with relative offset
	// Result: Position is (30, 10, 2)

	return Solid.MERGE([absoluteCube, relativeCube, mixedCube]);
};

/**
 * Example 4: Alignment Workflow
 *
 * .align() is powerful for building from edges/faces.
 * Common in architectural modeling and assembly.
 */
const alignmentWorkflow = (): Solid => {
	// Build a tower from the ground up
	// Pattern: align('bottom') to place base at Y=0, then stack with .move()
	const base = Solid.cube(15, 5, 15, { color: 'brown' })
		.align('bottom') // Bottom face at Y=0
		.center({ x: true, z: true }); // Center horizontally

	const column = Solid.cylinder(4, 20, { color: 'gray' })
		.align('bottom') // Bottom at Y=0
		.move({ y: 5 }) // Stack on top of base (base height = 5)
		.center({ x: true, z: true });

	const roof = Solid.cone(8, 10, { color: 'red' })
		.align('bottom')
		.move({ y: 25 }) // Stack on top of column (5 + 20)
		.center({ x: true, z: true });

	// Align different faces for wall placement
	const leftWall = Solid.cube(2, 20, 15, { color: 'blue' })
		.align('right') // Right face at X=0
		.move({ x: -7.5 }) // Offset to tower edge
		.align('bottom')
		.move({ y: 5, x: 2 });

	const rightWall = Solid.cube(2, 20, 15, { color: 'blue' })
		.align('left') // Left face at X=0
		.move({ x: 7.5 }) // Offset to tower edge
		.align('bottom')
		.move({ y: 5, x: -2 });

	return Solid.MERGE([base, column, roof, leftWall, rightWall]);
};

/**
 * Example 5: Complete Transform Chain - Practical Pattern
 *
 * Putting it all together: A complete workflow for positioned components.
 * This pattern is used in production code (see /projects/castle).
 */
const completeWorkflow = (): Solid => {
	// Create a window component with proper transform chain
	const createWindow = (width: number, height: number): Solid => {
		const frame = Solid.cube(width, height, 2, { color: 'brown' });
		const opening = Solid.cube(width - 2, height - 2, 3, { color: 'brown' }).center({
			x: true,
			y: true
		}); // Center opening in frame
		const crossbar = Solid.cube(0.8, height, 2, { color: 'brown' }).center({ x: true, y: true });

		const frameWithOpening = Solid.SUBTRACT(frame, opening);
		return Solid.UNION(frameWithOpening, crossbar);
	};

	// Wall with windows following complete transform pattern
	const wall = Solid.cube(60, 30, 3, { color: 'lightgray' })
		.align('bottom') // 1. Align to ground
		.center({ x: true, z: true }); // 2. Center horizontally

	// Window 1: Complete chain - scale, center, rotate, move
	const window1 = createWindow(8, 12)
		.scale({ x: 1.2 }) // 1. Scale if needed
		.center() // 2. Center for rotation
		.rotate({ z: 0 }) // 3. Rotate (0° in this case)
		.move({ x: -20, y: 15, z: 1.5 }); // 4. Final position

	// Window 2: Same pattern with rotation
	const window2 = createWindow(8, 12)
		.scale({ y: 1.3 }) // Taller variant
		.center()
		.rotate({ z: 0 })
		.move({ x: 0, y: 15, z: 1.5 });

	// Window 3: Rotated variant
	const window3 = createWindow(8, 12)
		.center()
		.rotate({ z: 10 }) // Slight rotation
		.move({ x: 20, y: 15, z: 1.5 });

	return Solid.MERGE([wall, window1, window2, window3]);
};

/**
 * PERFORMANCE CONSIDERATIONS:
 *
 * 1. TRANSFORM BEFORE CSG:
 *    - Transform primitives BEFORE boolean operations
 *    - CSG operations are expensive, transforms are cheap
 *    - Good: Solid.SUBTRACT(a.move({x:10}), b.move({x:10}))
 *    - Avoid: Solid.SUBTRACT(a, b).move({x:10})
 *
 * 2. MINIMIZE CSG OPERATIONS:
 *    - Use .move() and .rotate() to position copies
 *    - Don't recreate geometry when transforms work
 *    - Example: Create one brick, then .move() for array
 *
 * 3. TRANSFORM ORDER OPTIMIZATION:
 *    - Cheap operations: .move(), .rotate(), .scale()
 *    - Expensive operations: .center() (calculates bounds), .align()
 *    - Pattern: Scale → Rotate → Move → Center/Align
 *
 * COMMON MISTAKES:
 *
 * 1. Forgetting transform order:
 *    - .rotate().move() ≠ .move().rotate()
 *
 * 2. Using .at() when .move() is needed:
 *    - .at() REPLACES position, .move() ADDS offset
 *
 * 3. Not centering before rotation:
 *    - Rotations happen around current position
 *    - Center first for symmetric rotation
 *
 * 4. Transforming after CSG:
 *    - Can cause precision issues and artifacts
 *    - Transform primitives before boolean operations
 */

// Register all examples for the UI dropdown
export const components: ComponentsMap = {
	'I1: Transform Order': transformOrder,
	'I2: Centering in Chains': centeringInChains,
	'I3: Absolute vs Relative': absoluteVsRelative,
	'I4: Alignment Workflow': alignmentWorkflow,
	'I5: Complete Transform Chain': completeWorkflow
};

addToComponentStore(components);
