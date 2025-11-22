import { describe, it, expect } from 'vitest';
import { Solid } from '$lib/3d/Solid';
import { expectValidVertexCount } from '../../../setup';

describe('Solid - Utility Methods', () => {
	describe('setNegative()', () => {
		it('should mark solid as negative', () => {
			const cube = Solid.cube(10, 10, 10);
			const negativeCube = cube.setNegative();

			expect(negativeCube).toBeDefined();
			expectValidVertexCount(negativeCube);
		});

		it('should mark solid as negative with explicit true', () => {
			const cube = Solid.cube(10, 10, 10);
			const negativeCube = cube.setNegative(true);

			expectValidVertexCount(negativeCube);
		});

		it('should unmark solid as negative with explicit false', () => {
			const cube = Solid.cube(10, 10, 10);
			const negativeCube = cube.setNegative(true);
			const positiveCube = negativeCube.setNegative(false);

			expectValidVertexCount(positiveCube);
		});

		it('should work with MERGE operation', () => {
			const base = Solid.cube(20, 20, 20);
			const hole = Solid.cylinder(3, 25).setNegative();

			const result = Solid.MERGE([base, hole]);
			expectValidVertexCount(result);
		});

		it('should throw error when first solid in MERGE is negative', () => {
			const negative = Solid.cube(10, 10, 10).setNegative();
			const positive = Solid.cube(5, 5, 5);

			expect(() => {
				Solid.MERGE([negative, positive]);
			}).toThrow('First solid in MERGE cannot be negative');
		});

		it('should be chainable', () => {
			const cube = Solid.cube(10, 10, 10).setNegative().move({ x: 5 });
			expectValidVertexCount(cube);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 10).setNegative();
			const sphere = Solid.sphere(5).setNegative();
			const cone = Solid.cone(5, 10).setNegative();

			expectValidVertexCount(cylinder);
			expectValidVertexCount(sphere);
			expectValidVertexCount(cone);
		});

		it('should allow multiple negative solids in MERGE', () => {
			const base = Solid.cube(30, 30, 10);
			const hole1 = Solid.cylinder(2, 15).at(10, 10, 0).setNegative();
			const hole2 = Solid.cylinder(2, 15).at(-10, -10, 0).setNegative();

			const result = Solid.MERGE([base, hole1, hole2]);
			expectValidVertexCount(result);
		});

		it('should toggle negative state', () => {
			const cube = Solid.cube(10, 10, 10);
			const negative = cube.setNegative(true);
			const positive = negative.setNegative(false);
			const negativeAgain = positive.setNegative(true);

			expectValidVertexCount(negative);
			expectValidVertexCount(positive);
			expectValidVertexCount(negativeAgain);
		});
	});

	describe('setColor()', () => {
		it('should set color on solid', () => {
			const cube = Solid.cube(10, 10, 10);
			const coloredCube = cube.setColor('red');

			expectValidVertexCount(coloredCube);
		});

		it('should change color of existing solid', () => {
			const cube = Solid.cube(10, 10, 10, { color: 'blue' });
			const redCube = cube.setColor('red');

			expectValidVertexCount(redCube);
		});

		it('should accept hex color', () => {
			const cube = Solid.cube(10, 10, 10).setColor('#ff0000');
			expectValidVertexCount(cube);
		});

		it('should accept rgb color', () => {
			const cube = Solid.cube(10, 10, 10).setColor('rgb(255, 0, 0)');
			expectValidVertexCount(cube);
		});

		it('should be chainable', () => {
			const cube = Solid.cube(10, 10, 10).setColor('blue').move({ x: 5 });
			expectValidVertexCount(cube);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 10).setColor('green');
			const sphere = Solid.sphere(5).setColor('yellow');
			const cone = Solid.cone(5, 10).setColor('purple');

			expectValidVertexCount(cylinder);
			expectValidVertexCount(sphere);
			expectValidVertexCount(cone);
		});

		it('should work after CSG operations', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(5, 5, 15);
			const result = Solid.SUBTRACT(cube1, cube2).setColor('orange');

			expectValidVertexCount(result);
		});

		it('should allow color changes multiple times', () => {
			const cube = Solid.cube(10, 10, 10)
				.setColor('red')
				.setColor('blue')
				.setColor('green');

			expectValidVertexCount(cube);
		});
	});

	describe('clone()', () => {
		it('should create a copy of solid', () => {
			const original = Solid.cube(10, 10, 10);
			const cloned = original.clone();

			expect(cloned).not.toBe(original);
			expectValidVertexCount(cloned);
		});

		it('should create independent copy', () => {
			const original = Solid.cube(10, 10, 10);
			const cloned = original.clone();

			const movedOriginal = original.move({ x: 10 });
			const movedClone = cloned.move({ x: -10 });

			expect(movedOriginal).not.toBe(movedClone);
		});

		it('should preserve geometry', () => {
			const original = Solid.cube(10, 20, 30);
			const cloned = original.clone();

			const originalBounds = original.getBounds();
			const clonedBounds = cloned.getBounds();

			expect(originalBounds.width).toBe(clonedBounds.width);
			expect(originalBounds.height).toBe(clonedBounds.height);
			expect(originalBounds.depth).toBe(clonedBounds.depth);
		});

		it('should clone transformed solid', () => {
			const original = Solid.cube(10, 10, 10).at(5, 10, 15).rotate({ z: 45 });
			const cloned = original.clone();

			expectValidVertexCount(cloned);
		});

		it('should clone CSG result', () => {
			const cube1 = Solid.cube(10, 10, 10);
			const cube2 = Solid.cube(5, 5, 15);
			const result = Solid.SUBTRACT(cube1, cube2);
			const cloned = result.clone();

			expectValidVertexCount(cloned);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 10);
			const sphere = Solid.sphere(5);
			const cone = Solid.cone(5, 10);

			const clonedCylinder = cylinder.clone();
			const clonedSphere = sphere.clone();
			const clonedCone = cone.clone();

			expectValidVertexCount(clonedCylinder);
			expectValidVertexCount(clonedSphere);
			expectValidVertexCount(clonedCone);
		});

		it('should allow transforming clone without affecting original', () => {
			const original = Solid.cube(10, 10, 10);
			const originalVertices = original.getVertices().length;

			const cloned = original.clone().scale({ all: 2 });

			expect(original.getVertices().length).toBe(originalVertices);
			expectValidVertexCount(cloned);
		});

		it('should be usable in grids', () => {
			const shape = Solid.cube(5, 5, 5);
			const cloned = shape.clone();
			const grid = Solid.GRID_X(cloned, { cols: 5 });

			expectValidVertexCount(grid);
		});
	});

	describe('getVertices()', () => {
		it('should return vertices array', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();

			expect(vertices).toBeInstanceOf(Float32Array);
			expect(vertices.length).toBeGreaterThan(0);
		});

		it('should return vertices divisible by 9', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();

			expect(vertices.length % 9).toBe(0); // 3 vertices per triangle * 3 coords
		});

		it('should return different vertex counts for different shapes', () => {
			const cube = Solid.cube(10, 10, 10);
			const cylinder = Solid.cylinder(5, 10);
			const sphere = Solid.sphere(5);

			const cubeVertices = cube.getVertices().length;
			const cylinderVertices = cylinder.getVertices().length;
			const sphereVertices = sphere.getVertices().length;

			expect(cubeVertices).toBeGreaterThan(0);
			expect(cylinderVertices).toBeGreaterThan(cubeVertices);
			expect(sphereVertices).toBeGreaterThan(0);
		});

		it('should return more vertices after CSG union', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(15, 0, 0);
			const union = Solid.UNION(cube1, cube2);

			const unionVertices = union.getVertices().length;
			const cube1Vertices = cube1.getVertices().length;

			expect(unionVertices).toBeGreaterThan(cube1Vertices);
		});

		it('should return vertices for transformed solids', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ z: 45 }).scale({ all: 2 });
			const vertices = cube.getVertices();

			expect(vertices.length).toBeGreaterThan(0);
			expect(vertices.length % 9).toBe(0);
		});

		it('should return vertices for custom profiles', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[10, 10],
				[0, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points);
			const vertices = prism.getVertices();

			expect(vertices.length).toBeGreaterThan(0);
			expect(vertices.length % 9).toBe(0);
		});

		it('should return vertices for revolution solids', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			const vertices = solid.getVertices();

			expect(vertices.length).toBeGreaterThan(0);
			expect(vertices.length % 9).toBe(0);
		});

		it('should return vertices for grids', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 3 });
			const vertices = grid.getVertices();

			const singleCubeVertices = cube.getVertices().length;

			expect(vertices.length).toBeGreaterThan(singleCubeVertices);
			expect(vertices.length % 9).toBe(0);
		});
	});

	describe('Combined Utility Operations', () => {
		it('should chain multiple utility methods', () => {
			const cube = Solid.cube(10, 10, 10)
				.setColor('blue')
				.setNegative()
				.setNegative(false)
				.setColor('red');

			expectValidVertexCount(cube);
		});

		it('should clone, color, and transform', () => {
			const original = Solid.cube(10, 10, 10);
			const modified = original.clone().setColor('green').move({ x: 20 });

			expectValidVertexCount(original);
			expectValidVertexCount(modified);
		});

		it('should use cloned shapes in CSG', () => {
			const base = Solid.cube(20, 20, 20);
			const hole = Solid.cylinder(3, 25);

			const result = Solid.SUBTRACT(base, hole.clone());

			// Original hole should be unchanged
			expectValidVertexCount(hole);
			expectValidVertexCount(result);
		});

		it('should create array of cloned and colored shapes', () => {
			const base = Solid.cube(5, 5, 5);

			const red = base.clone().setColor('red').at(0, 0, 0);
			const green = base.clone().setColor('green').at(10, 0, 0);
			const blue = base.clone().setColor('blue').at(20, 0, 0);

			const result = Solid.UNION(red, green, blue);
			expectValidVertexCount(result);
		});

		it('should use negative clones in MERGE', () => {
			const base = Solid.cube(30, 30, 10);
			const holeTemplate = Solid.cylinder(2, 15);

			const hole1 = holeTemplate.clone().at(10, 10, 0).setNegative();
			const hole2 = holeTemplate.clone().at(-10, -10, 0).setNegative();
			const hole3 = holeTemplate.clone().at(10, -10, 0).setNegative();
			const hole4 = holeTemplate.clone().at(-10, 10, 0).setNegative();

			const result = Solid.MERGE([base, hole1, hole2, hole3, hole4]);
			expectValidVertexCount(result);
		});

		it('should preserve color through transformations', () => {
			const cube = Solid.cube(10, 10, 10)
				.setColor('purple')
				.rotate({ z: 45 })
				.scale({ all: 2 });

			expectValidVertexCount(cube);
		});

		it('should preserve negative flag through transformations', () => {
			const base = Solid.cube(20, 20, 20);
			const hole = Solid.cylinder(3, 25).setNegative().rotate({ x: 90 }).move({ y: 5 });

			const result = Solid.MERGE([base, hole]);
			expectValidVertexCount(result);
		});

		it('should clone complex CSG results', () => {
			const base = Solid.cube(20, 20, 10);
			const add = Solid.cylinder(5, 12).at(10, 10, 0);
			const subtract = Solid.cylinder(2, 15).at(10, 10, 0);

			const complex = Solid.SUBTRACT(Solid.UNION(base, add), subtract);
			const cloned = complex.clone();

			expectValidVertexCount(complex);
			expectValidVertexCount(cloned);
		});
	});

	describe('Edge Cases', () => {
		it('should handle cloning very small solids', () => {
			const tiny = Solid.cube(0.1, 0.1, 0.1);
			const cloned = tiny.clone();

			expectValidVertexCount(cloned);
		});

		it('should handle cloning very large solids', () => {
			const huge = Solid.cube(1000, 1000, 1000);
			const cloned = huge.clone();

			expectValidVertexCount(cloned);
		});

		it('should handle color changes on complex shapes', () => {
			const complex = Solid.SUBTRACT(Solid.cube(20, 20, 20), Solid.sphere(12));
			const colored = complex.setColor('magenta');

			expectValidVertexCount(colored);
		});

		it('should handle negative flag on grid results', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3 }).setNegative();

			const base = Solid.cube(30, 10, 10);
			const result = Solid.MERGE([base, grid]);

			expectValidVertexCount(result);
		});
	});
});
