import { describe, expect, it } from 'vitest';

import { Solid } from '$lib/3d/Solid';

import { expectCloseTo, expectImmutability, expectValidVertexCount } from '../../../setup';

describe('Solid - CSG Operations', () => {
	describe('SUBTRACT()', () => {
		it('should subtract one solid from another', () => {
			const cube = Solid.cube(10, 10, 10);
			const hole = Solid.cube(5, 5, 15);
			const result = Solid.SUBTRACT(cube, hole);

			expectValidVertexCount(result);
			// Result should have more vertices than original cube due to the hole
			expect(result.getVertices().length).toBeGreaterThan(36);
		});

		it('should not mutate the original solids', () => {
			const cube = Solid.cube(10, 10, 10);
			const hole = Solid.cube(5, 5, 15);
			const originalCubeVertices = cube.getVertices().length;
			const originalHoleVertices = hole.getVertices().length;

			const result = Solid.SUBTRACT(cube, hole);

			expectImmutability(cube, result);
			expect(cube.getVertices().length).toBe(originalCubeVertices);
			expect(hole.getVertices().length).toBe(originalHoleVertices);
		});

		it('should subtract multiple solids', () => {
			const base = Solid.cube(20, 20, 20);
			const hole1 = Solid.cylinder(2, 30).at(5, 0, 0);
			const hole2 = Solid.cylinder(2, 30).at(-5, 0, 0);
			const hole3 = Solid.cylinder(2, 30).at(0, 0, 5);

			const result = Solid.SUBTRACT(base, hole1, hole2, hole3);

			expectValidVertexCount(result);
		});

		it('should handle sphere subtraction', () => {
			const cube = Solid.cube(10, 10, 10);
			const sphere = Solid.sphere(6);

			const result = Solid.SUBTRACT(cube, sphere);

			expectValidVertexCount(result);
		});

		it('should handle cylinder subtraction from cube', () => {
			const cube = Solid.cube(10, 10, 10);
			const cylinder = Solid.cylinder(3, 15).rotate({ x: 90 });

			const result = Solid.SUBTRACT(cube, cylinder);

			expectValidVertexCount(result);
		});

		it('should result in an empty solid when subtracting a larger solid', () => {
			const small = Solid.cube(5, 5, 5);
			const large = Solid.cube(20, 20, 20);

			const result = Solid.SUBTRACT(small, large);

			// Result should have very few or no vertices
			const vertices = result.getVertices();
			expect(vertices.length).toBeLessThanOrEqual(36); // At most the original cube
		});

		it('should be chainable with other operations', () => {
			const base = Solid.cube(10, 10, 10);
			const hole = Solid.cylinder(2, 15);
			const result = Solid.SUBTRACT(base, hole).move({ x: 5 });

			expectValidVertexCount(result);
		});
	});

	describe('UNION()', () => {
		it('should combine two solids', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(10, 10, 10).move({ x: 5 });

			const result = Solid.UNION(cube1, cube2);

			expectValidVertexCount(result);
		});

		it('should not mutate the original solids', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(10, 10, 10).move({ x: 5 });
			const originalCube1Vertices = cube1.getVertices().length;
			const originalCube2Vertices = cube2.getVertices().length;

			const result = Solid.UNION(cube1, cube2);

			expectImmutability(cube1, result);
			expect(cube1.getVertices().length).toBe(originalCube1Vertices);
			expect(cube2.getVertices().length).toBe(originalCube2Vertices);
		});

		it('should combine multiple solids', () => {
			const cube1 = Solid.cube(5, 5, 5).at(0, 0, 0);
			const cube2 = Solid.cube(5, 5, 5).at(6, 0, 0);
			const cube3 = Solid.cube(5, 5, 5).at(12, 0, 0);
			const cube4 = Solid.cube(5, 5, 5).at(18, 0, 0);

			const result = Solid.UNION(cube1, cube2, cube3, cube4);

			expectValidVertexCount(result);
		});

		it('should handle union of different shapes', () => {
			const cube = Solid.cube(10, 10, 10);
			const sphere = Solid.sphere(7).move({ x: 10 });
			const cylinder = Solid.cylinder(3, 15).move({ x: -10 });

			const result = Solid.UNION(cube, sphere, cylinder);

			expectValidVertexCount(result);
		});

		it('should create correct bounds for union', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(20, 0, 0);

			const result = Solid.UNION(cube1, cube2);
			const bounds = result.getBounds();

			// Width should span from first cube to second cube
			expectCloseTo(bounds.width, 30, 0.5);
		});

		it('should handle overlapping solids', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(5, 0, 0); // Overlapping

			const result = Solid.UNION(cube1, cube2);

			expectValidVertexCount(result);
			// CSG union creates valid geometry with additional vertices at intersection boundaries
			expect(result.getVertices().length).toBeGreaterThan(0);
		});

		it('should be chainable with other operations', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(10, 10, 10).move({ x: 5 });
			const result = Solid.UNION(cube1, cube2).rotate({ y: 45 });

			expectValidVertexCount(result);
		});
	});

	describe('INTERSECT()', () => {
		it('should intersect two solids', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(5, 0, 0);

			const result = Solid.INTERSECT(cube1, cube2);

			expectValidVertexCount(result);
		});

		it('should not mutate the original solids', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(5, 0, 0);
			const originalCube1Vertices = cube1.getVertices().length;
			const originalCube2Vertices = cube2.getVertices().length;

			const result = Solid.INTERSECT(cube1, cube2);

			expectImmutability(cube1, result);
			expect(cube1.getVertices().length).toBe(originalCube1Vertices);
			expect(cube2.getVertices().length).toBe(originalCube2Vertices);
		});

		it('should create smaller result from overlapping region', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(5, 0, 0); // Half overlap

			const result = Solid.INTERSECT(cube1, cube2);
			const bounds = result.getBounds();

			// Intersection should be approximately 5x10x10
			expectCloseTo(bounds.width, 5, 0.5);
			expectCloseTo(bounds.height, 10, 0.5);
			expectCloseTo(bounds.depth, 10, 0.5);
		});

		it('should handle sphere-cube intersection', () => {
			const cube = Solid.cube(10, 10, 10);
			const sphere = Solid.sphere(7);

			const result = Solid.INTERSECT(cube, sphere);

			expectValidVertexCount(result);
		});

		it('should result in empty when solids do not overlap', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(20, 0, 0); // No overlap

			const result = Solid.INTERSECT(cube1, cube2);

			// Should have minimal or no vertices
			const vertices = result.getVertices();
			expect(vertices.length).toBeLessThanOrEqual(36);
		});

		it('should be chainable with other operations', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(10, 10, 10).move({ x: 5 });
			const result = Solid.INTERSECT(cube1, cube2).scale({ all: 2 });

			expectValidVertexCount(result);
		});
	});

	describe('MERGE()', () => {
		it('should merge array of positive solids', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(15, 0, 0);
			const cube3 = Solid.cube(10, 10, 10).at(30, 0, 0);

			const result = Solid.MERGE([cube1, cube2, cube3]);

			expectValidVertexCount(result);
		});

		it('should handle negative solids in array', () => {
			const base = Solid.cube(20, 20, 20);
			const hole = Solid.cylinder(3, 25).setNegative();

			const result = Solid.MERGE([base, hole]);

			expectValidVertexCount(result);
		});

		it('should throw error if first solid is negative', () => {
			const negative = Solid.cube(10, 10, 10).setNegative();
			const positive = Solid.cube(5, 5, 5);

			expect(() => {
				Solid.MERGE([negative, positive]);
			}).toThrow('First solid in MERGE cannot be negative');
		});

		it('should process solids in array order', () => {
			const base = Solid.cube(20, 20, 10);
			const add1 = Solid.cube(5, 5, 5).at(10, 10, 0);
			const subtract1 = Solid.cylinder(2, 15).setNegative();
			const add2 = Solid.sphere(3).at(-10, -10, 0);

			const result = Solid.MERGE([base, add1, subtract1, add2]);

			expectValidVertexCount(result);
		});

		it('should handle complex pattern with alternating positive/negative', () => {
			const base = Solid.cube(30, 30, 5);
			const pillar1 = Solid.cylinder(3, 10).at(10, 10, 0);
			const hole1 = Solid.cylinder(1, 15).at(10, 10, 0).setNegative();
			const pillar2 = Solid.cylinder(3, 10).at(-10, -10, 0);
			const hole2 = Solid.cylinder(1, 15).at(-10, -10, 0).setNegative();

			const result = Solid.MERGE([base, pillar1, hole1, pillar2, hole2]);

			expectValidVertexCount(result);
		});

		it('should not mutate original solids in array', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(10, 10, 10).move({ x: 15 });
			const originalCube1Vertices = cube1.getVertices().length;
			const originalCube2Vertices = cube2.getVertices().length;

			const result = Solid.MERGE([cube1, cube2]);

			expect(cube1.getVertices().length).toBe(originalCube1Vertices);
			expect(cube2.getVertices().length).toBe(originalCube2Vertices);
			expect(result).not.toBe(cube1);
			expect(result).not.toBe(cube2);
		});

		it('should handle single solid in array', () => {
			const cube = Solid.cube(10, 10, 10);
			const result = Solid.MERGE([cube]);

			expectValidVertexCount(result);
		});

		it('should be equivalent to UNION for all positive solids', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(15, 0, 0);

			const mergeResult = Solid.MERGE([cube1, cube2]);
			const unionResult = Solid.UNION(cube1, cube2);

			// Should have similar vertex counts
			expect(
				Math.abs(mergeResult.getVertices().length - unionResult.getVertices().length)
			).toBeLessThan(100);
		});

		it('should be chainable with other operations', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(5, 5, 5).setNegative();
			const result = Solid.MERGE([cube1, cube2]).rotate({ z: 45 });

			expectValidVertexCount(result);
		});
	});

	describe('CSG Operations - Combined', () => {
		it('should combine SUBTRACT and UNION', () => {
			const base1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const base2 = Solid.cube(10, 10, 10).at(15, 0, 0);
			const union = Solid.UNION(base1, base2);

			const hole = Solid.cylinder(2, 15);
			const result = Solid.SUBTRACT(union, hole);

			expectValidVertexCount(result);
		});

		it('should combine UNION and INTERSECT', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(5, 0, 0);
			const intersection = Solid.INTERSECT(cube1, cube2);

			const cube3 = Solid.cube(5, 5, 5).at(20, 0, 0);
			const result = Solid.UNION(intersection, cube3);

			expectValidVertexCount(result);
		});

		it('should handle nested CSG operations', () => {
			const base = Solid.cube(20, 20, 20);
			const hole1 = Solid.cylinder(3, 25);
			const part1 = Solid.SUBTRACT(base, hole1);

			const add = Solid.sphere(5).move({ x: 15 });
			const part2 = Solid.UNION(part1, add);

			const hole2 = Solid.cube(5, 5, 5).move({ x: 15 });
			const result = Solid.SUBTRACT(part2, hole2);

			expectValidVertexCount(result);
		});

		it('should handle complex CSG workflow', () => {
			// Create base
			const base = Solid.cube(30, 30, 10);

			// Add some features
			const pillar1 = Solid.cylinder(4, 15).at(10, 10, 0);
			const pillar2 = Solid.cylinder(4, 15).at(-10, -10, 0);
			const withPillars = Solid.UNION(base, pillar1, pillar2);

			// Subtract holes
			const hole1 = Solid.cylinder(2, 20).at(10, 10, 0);
			const hole2 = Solid.cylinder(2, 20).at(-10, -10, 0);
			const result = Solid.SUBTRACT(withPillars, hole1, hole2);

			expectValidVertexCount(result);
		});
	});
});
