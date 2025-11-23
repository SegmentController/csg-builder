import { describe, expect, it } from 'vitest';

import { Solid } from '$lib/3d/Solid';

import { expectCloseTo, expectValidVertexCount } from '../../../setup';

describe('Solid - Grid Operations', () => {
	describe('GRID_X() - 1D Grid', () => {
		it('should create a 1D grid with specified columns', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 5 });

			expectValidVertexCount(grid);
		});

		it('should create grid with correct spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3, spacing: 2 });

			const bounds = grid.getBounds();
			// Total width: (5 + 2) * 3 - 2 = 19
			expectCloseTo(bounds.width, 19, 1);
		});

		it('should create grid without spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3 });

			const bounds = grid.getBounds();
			// Total width: 5 * 3 = 15
			expectCloseTo(bounds.width, 15, 1);
		});

		it('should create grid with zero spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3, spacing: 0 });

			const bounds = grid.getBounds();
			// Total width: 5 * 3 = 15
			expectCloseTo(bounds.width, 15, 1);
		});

		it('should create single column grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 1 });

			const bounds = grid.getBounds();
			expectCloseTo(bounds.width, 5, 0.5);
		});

		it('should create large grid', () => {
			const cube = Solid.cube(2, 2, 2);
			const grid = Solid.GRID_X(cube, { cols: 10, spacing: 1 });

			expectValidVertexCount(grid);
		});

		it('should not mutate original solid', () => {
			const cube = Solid.cube(5, 5, 5);
			const originalVertices = cube.getVertices().length;

			Solid.GRID_X(cube, { cols: 5 });

			expect(cube.getVertices().length).toBe(originalVertices);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(2, 5);
			const sphere = Solid.sphere(3);
			const cone = Solid.cone(2, 5);

			const gridCylinder = Solid.GRID_X(cylinder, { cols: 3 });
			const gridSphere = Solid.GRID_X(sphere, { cols: 3 });
			const gridCone = Solid.GRID_X(cone, { cols: 3 });

			expectValidVertexCount(gridCylinder);
			expectValidVertexCount(gridSphere);
			expectValidVertexCount(gridCone);
		});

		it('should be chainable', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3 }).rotate({ z: 45 });

			expectValidVertexCount(grid);
		});

		it('should handle negative spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3, spacing: -1 });

			expectValidVertexCount(grid);
		});
	});

	describe('GRID_XY() - 2D Grid', () => {
		it('should create a 2D grid with specified rows and columns', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 2 });

			expectValidVertexCount(grid);
		});

		it('should create grid with correct spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 2, spacing: [2, 2] });

			const bounds = grid.getBounds();
			// Width: (5 + 2) * 3 - 2 = 19
			// Depth: (5 + 2) * 2 - 2 = 12
			expectCloseTo(bounds.width, 19, 1);
			expectCloseTo(bounds.depth, 12, 1);
		});

		it('should create grid with array spacing [x, y]', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 2, spacing: [2, 3] });

			const bounds = grid.getBounds();
			// Width: (5 + 2) * 3 - 2 = 19
			// Depth: (5 + 3) * 2 - 3 = 13
			expectCloseTo(bounds.width, 19, 1);
			expectCloseTo(bounds.depth, 13, 1);
		});

		it('should create grid without spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 2 });

			const bounds = grid.getBounds();
			// Width: 5 * 3 = 15
			// Depth: 5 * 2 = 10
			expectCloseTo(bounds.width, 15, 1);
			expectCloseTo(bounds.depth, 10, 1);
		});

		it('should create single cell grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 1, rows: 1 });

			const bounds = grid.getBounds();
			expectCloseTo(bounds.width, 5, 0.5);
			expectCloseTo(bounds.depth, 5, 0.5);
		});

		it('should create single row grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 5, rows: 1 });

			expectValidVertexCount(grid);
		});

		it('should create single column grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 1, rows: 5 });

			expectValidVertexCount(grid);
		});

		it('should create large 2D grid', () => {
			const cube = Solid.cube(2, 2, 2);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 3, spacing: 1 });

			expectValidVertexCount(grid);
		});

		it('should not mutate original solid', () => {
			const cube = Solid.cube(5, 5, 5);
			const originalVertices = cube.getVertices().length;

			Solid.GRID_XY(cube, { cols: 3, rows: 2 });

			expect(cube.getVertices().length).toBe(originalVertices);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(2, 5);
			const sphere = Solid.sphere(3);
			const cone = Solid.cone(2, 5);

			const gridCylinder = Solid.GRID_XY(cylinder, { cols: 2, rows: 2 });
			const gridSphere = Solid.GRID_XY(sphere, { cols: 2, rows: 2 });
			const gridCone = Solid.GRID_XY(cone, { cols: 2, rows: 2 });

			expectValidVertexCount(gridCylinder);
			expectValidVertexCount(gridSphere);
			expectValidVertexCount(gridCone);
		});

		it('should be chainable', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 2 }).move({ y: 10 });

			expectValidVertexCount(grid);
		});

		it('should handle zero spacing array', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 2, spacing: [0, 0] });

			expectValidVertexCount(grid);
		});

		it('should create checkerboard pattern', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 4, rows: 4, spacing: 0 });

			expectValidVertexCount(grid);
		});
	});

	describe('GRID_XYZ() - 3D Grid', () => {
		it('should create a 3D grid with specified dimensions', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2 });

			expectValidVertexCount(grid);
		});

		it('should create grid with correct spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2, spacing: [2, 2, 2] });

			const bounds = grid.getBounds();
			// Width: (5 + 2) * 2 - 2 = 12
			// Height: (5 + 2) * 2 - 2 = 12
			// Depth: (5 + 2) * 2 - 2 = 12
			expectCloseTo(bounds.width, 12, 1);
			expectCloseTo(bounds.height, 12, 1);
			expectCloseTo(bounds.depth, 12, 1);
		});

		it('should create grid with array spacing [x, y, z]', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2, spacing: [1, 2, 3] });

			const bounds = grid.getBounds();
			// Width: (5 + 1) * 2 - 1 = 11
			// Height: (5 + 2) * 2 - 2 = 12
			// Depth: (5 + 3) * 2 - 3 = 13
			expectCloseTo(bounds.width, 11, 1);
			expectCloseTo(bounds.height, 12, 1);
			expectCloseTo(bounds.depth, 13, 1);
		});

		it('should create grid without spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2 });

			const bounds = grid.getBounds();
			// Width: 5 * 2 = 10
			// Height: 5 * 2 = 10
			// Depth: 5 * 2 = 10
			expectCloseTo(bounds.width, 10, 1);
			expectCloseTo(bounds.height, 10, 1);
			expectCloseTo(bounds.depth, 10, 1);
		});

		it('should create single cell grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 1, rows: 1, levels: 1 });

			const bounds = grid.getBounds();
			expectCloseTo(bounds.width, 5, 0.5);
			expectCloseTo(bounds.height, 5, 0.5);
			expectCloseTo(bounds.depth, 5, 0.5);
		});

		it('should create flat 3D grid (1 level)', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 3, rows: 3, levels: 1 });

			expectValidVertexCount(grid);
		});

		it('should create tower 3D grid (1x1 base, many levels)', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 1, rows: 1, levels: 5 });

			expectValidVertexCount(grid);
		});

		it('should create moderate 3D grid', () => {
			const cube = Solid.cube(3, 3, 3);
			const grid = Solid.GRID_XYZ(cube, { cols: 3, rows: 3, levels: 3, spacing: 1 });

			expectValidVertexCount(grid);
		});

		it('should not mutate original solid', () => {
			const cube = Solid.cube(5, 5, 5);
			const originalVertices = cube.getVertices().length;

			Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2 });

			expect(cube.getVertices().length).toBe(originalVertices);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(2, 3);
			const sphere = Solid.sphere(2);

			const gridCylinder = Solid.GRID_XYZ(cylinder, { cols: 2, rows: 2, levels: 2 });
			const gridSphere = Solid.GRID_XYZ(sphere, { cols: 2, rows: 2, levels: 2 });

			expectValidVertexCount(gridCylinder);
			expectValidVertexCount(gridSphere);
		});

		it('should be chainable', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2 }).scale({ all: 0.5 });

			expectValidVertexCount(grid);
		});

		it('should handle zero spacing array', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2, spacing: [0, 0, 0] });

			expectValidVertexCount(grid);
		});

		it('should create rubiks cube-like structure', () => {
			const cube = Solid.cube(3, 3, 3);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2, spacing: 0.5 });

			expectValidVertexCount(grid);
		});
	});

	describe('Grid with Transformations', () => {
		it('should transform grid after creation', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 3 }).move({ y: 10 }).rotate({ z: 45 });

			expectValidVertexCount(grid);
		});

		it('should align grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XYZ(cube, { cols: 2, rows: 2, levels: 2 }).align('bottom');

			const bounds = grid.getBounds();
			expectCloseTo(bounds.min.y, 0, 1);
		});

		it('should center grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 5, spacing: 1 }).center();

			const bounds = grid.getBounds();
			expectCloseTo(bounds.center.x, 0, 1);
		});

		it('should scale grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 2, rows: 2 }).scale({ all: 2 });

			expectValidVertexCount(grid);
		});
	});

	describe('Edge Cases', () => {
		it('should handle very small cubes in grid', () => {
			const tiny = Solid.cube(0.5, 0.5, 0.5);
			const grid = Solid.GRID_XY(tiny, { cols: 10, rows: 10, spacing: 0.1 });

			expectValidVertexCount(grid);
		});

		it('should handle large spacing', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3, spacing: 50 });

			const bounds = grid.getBounds();
			expectCloseTo(bounds.width, 115, 2); // (5 + 50) * 3 - 50
		});

		it('should handle grid of complex shapes', () => {
			const shape = Solid.cylinder(3, 10).rotate({ x: 90 });
			const grid = Solid.GRID_XY(shape, { cols: 3, rows: 3, spacing: 2 });

			expectValidVertexCount(grid);
		});
	});
});
