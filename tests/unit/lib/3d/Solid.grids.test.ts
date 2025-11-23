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

	describe('MIRROR() - Reflection Operations', () => {
		describe('Basic Mirroring', () => {
			it('should mirror across X axis (YZ plane)', () => {
				const cube = Solid.cube(10, 5, 3, { color: 'blue' }).move({ x: 5 });
				const mirrored = Solid.MIRROR(cube, 'X');

				expectValidVertexCount(mirrored);

				// Mirrored cube should have same dimensions
				const originalBounds = cube.getBounds();
				const mirroredBounds = mirrored.getBounds();
				expectCloseTo(originalBounds.width, mirroredBounds.width, 0.5);
				expectCloseTo(originalBounds.height, mirroredBounds.height, 0.5);
				expectCloseTo(originalBounds.depth, mirroredBounds.depth, 0.5);

				// Center X should be negated
				expectCloseTo(mirroredBounds.center.x, -originalBounds.center.x, 0.5);
			});

			it('should mirror across Y axis (XZ plane)', () => {
				const cube = Solid.cube(5, 10, 3, { color: 'red' }).move({ y: 5 });
				const mirrored = Solid.MIRROR(cube, 'Y');

				expectValidVertexCount(mirrored);

				const originalBounds = cube.getBounds();
				const mirroredBounds = mirrored.getBounds();
				expectCloseTo(originalBounds.width, mirroredBounds.width, 0.5);
				expectCloseTo(originalBounds.height, mirroredBounds.height, 0.5);
				expectCloseTo(originalBounds.depth, mirroredBounds.depth, 0.5);

				// Center Y should be negated
				expectCloseTo(mirroredBounds.center.y, -originalBounds.center.y, 0.5);
			});

			it('should mirror across Z axis (XY plane)', () => {
				const cube = Solid.cube(5, 3, 10, { color: 'green' }).move({ z: 5 });
				const mirrored = Solid.MIRROR(cube, 'Z');

				expectValidVertexCount(mirrored);

				const originalBounds = cube.getBounds();
				const mirroredBounds = mirrored.getBounds();
				expectCloseTo(originalBounds.width, mirroredBounds.width, 0.5);
				expectCloseTo(originalBounds.height, mirroredBounds.height, 0.5);
				expectCloseTo(originalBounds.depth, mirroredBounds.depth, 0.5);

				// Center Z should be negated
				expectCloseTo(mirroredBounds.center.z, -originalBounds.center.z, 0.5);
			});
		});

		describe('Symmetry Composition', () => {
			it('should create bilateral symmetry with UNION', () => {
				const half = Solid.cube(10, 20, 5, { color: 'blue' }).move({ x: 10 });
				const symmetric = Solid.UNION(half, Solid.MIRROR(half, 'X'));

				expectValidVertexCount(symmetric);

				// Symmetric object should be centered around origin
				const bounds = symmetric.getBounds();
				expectCloseTo(bounds.center.x, 0, 1);
			});

			it('should create full 3D symmetry by chaining mirrors', () => {
				const quarter = Solid.cube(5, 5, 5, { color: 'red' }).move({ x: 10, z: 10 });
				const halfX = Solid.UNION(quarter, Solid.MIRROR(quarter, 'X'));
				const full = Solid.UNION(halfX, Solid.MIRROR(halfX, 'Z'));

				expectValidVertexCount(full);

				// Full symmetric object should be centered
				const bounds = full.getBounds();
				expectCloseTo(bounds.center.x, 0, 1);
				expectCloseTo(bounds.center.z, 0, 1);
			});

			it('should create octant symmetry (mirror all 3 axes)', () => {
				const octant = Solid.cube(5, 5, 5, { color: 'purple' }).move({ x: 10, y: 10, z: 10 });
				const mirrorX = Solid.UNION(octant, Solid.MIRROR(octant, 'X'));
				const mirrorY = Solid.UNION(mirrorX, Solid.MIRROR(mirrorX, 'Y'));
				const mirrorZ = Solid.UNION(mirrorY, Solid.MIRROR(mirrorY, 'Z'));

				expectValidVertexCount(mirrorZ);

				const bounds = mirrorZ.getBounds();
				expectCloseTo(bounds.center.x, 0, 1);
				expectCloseTo(bounds.center.y, 0, 1);
				expectCloseTo(bounds.center.z, 0, 1);
			});
		});

		describe('Different Primitives', () => {
			it('should mirror cylinders', () => {
				const cylinder = Solid.cylinder(5, 10, { color: 'blue' }).move({ x: 10 });
				const mirrored = Solid.MIRROR(cylinder, 'X');

				expectValidVertexCount(mirrored);
			});

			it('should mirror spheres', () => {
				const sphere = Solid.sphere(5, { color: 'red' }).move({ y: 10 });
				const mirrored = Solid.MIRROR(sphere, 'Y');

				expectValidVertexCount(mirrored);
			});

			it('should mirror cones', () => {
				const cone = Solid.cone(5, 10, { color: 'green' }).move({ z: 10 });
				const mirrored = Solid.MIRROR(cone, 'Z');

				expectValidVertexCount(mirrored);
			});

			it('should mirror complex CSG shapes', () => {
				const base = Solid.cube(10, 10, 5, { color: 'gray' });
				const hole = Solid.cylinder(2, 10, { color: 'gray' });
				const shape = Solid.SUBTRACT(base, hole).move({ x: 15 });

				const mirrored = Solid.MIRROR(shape, 'X');

				expectValidVertexCount(mirrored);
			});
		});

		describe('Negative Solids', () => {
			it('should mirror negative solids', () => {
				const hole = Solid.cylinder(2, 20, { color: 'blue' }).move({ x: 5 }).setNegative();
				const mirrored = Solid.MIRROR(hole, 'X');

				expectValidVertexCount(mirrored);
				expect(mirrored._isNegative).toBe(true);
			});

			it('should work with negative solids in MERGE', () => {
				const base = Solid.cube(30, 30, 5, { color: 'gray' });
				const hole = Solid.cylinder(2, 10, { color: 'gray' }).move({ x: 5 }).setNegative();
				const result = Solid.MERGE([base, hole, Solid.MIRROR(hole, 'X')]);

				expectValidVertexCount(result);
			});
		});

		describe('Transformed Solids', () => {
			it('should mirror rotated solids', () => {
				const shape = Solid.cube(10, 5, 3, { color: 'blue' }).rotate({ z: 45 }).move({ x: 10 });
				const mirrored = Solid.MIRROR(shape, 'X');

				expectValidVertexCount(mirrored);
			});

			it('should mirror scaled solids', () => {
				const shape = Solid.cube(10, 5, 3, { color: 'red' })
					.scale({ x: 2, y: 0.5 })
					.move({ y: 10 });
				const mirrored = Solid.MIRROR(shape, 'Y');

				expectValidVertexCount(mirrored);
			});

			it('should mirror complex transformed solids', () => {
				const shape = Solid.cylinder(5, 10, { color: 'green' })
					.rotate({ x: 45 })
					.scale({ all: 1.5 })
					.move({ x: 5, y: 5, z: 5 });
				const mirrored = Solid.MIRROR(shape, 'X');

				expectValidVertexCount(mirrored);
			});
		});

		describe('Immutability', () => {
			it('should not mutate original solid', () => {
				const cube = Solid.cube(10, 10, 10, { color: 'blue' }).move({ x: 5 });
				const originalVertices = cube.getVertices().length;
				const originalBounds = cube.getBounds();

				Solid.MIRROR(cube, 'X');

				expect(cube.getVertices().length).toBe(originalVertices);
				expectCloseTo(cube.getBounds().center.x, originalBounds.center.x, 0.1);
			});

			it('should be chainable', () => {
				const cube = Solid.cube(10, 10, 10, { color: 'blue' }).move({ x: 5 });
				const mirrored = Solid.MIRROR(cube, 'X').rotate({ y: 45 }).scale({ all: 2 });

				expectValidVertexCount(mirrored);
			});
		});

		describe('Error Handling', () => {
			it('should throw error for invalid axis', () => {
				const cube = Solid.cube(10, 10, 10, { color: 'blue' });

				expect(() => {
					// @ts-expect-error - Testing invalid axis
					Solid.MIRROR(cube, 'W');
				}).toThrow("axis must be 'X', 'Y', or 'Z'");
			});

			it('should throw error for lowercase axis', () => {
				const cube = Solid.cube(10, 10, 10, { color: 'blue' });

				expect(() => {
					// @ts-expect-error - Testing lowercase axis
					Solid.MIRROR(cube, 'x');
				}).toThrow("axis must be 'X', 'Y', or 'Z'");
			});
		});

		describe('Edge Cases', () => {
			it('should mirror centered solid', () => {
				const cube = Solid.cube(10, 10, 10, { color: 'blue' }).center();
				const mirrored = Solid.MIRROR(cube, 'X');

				expectValidVertexCount(mirrored);

				// Centered solid mirrored should remain in same position
				const bounds = mirrored.getBounds();
				expectCloseTo(bounds.center.x, 0, 0.5);
			});

			it('should mirror aligned solid', () => {
				const cube = Solid.cube(10, 10, 10, { color: 'red' }).align('bottom');
				const mirrored = Solid.MIRROR(cube, 'Y');

				expectValidVertexCount(mirrored);
			});

			it('should mirror very small solid', () => {
				const tiny = Solid.cube(0.5, 0.5, 0.5, { color: 'green' }).move({ x: 1 });
				const mirrored = Solid.MIRROR(tiny, 'X');

				expectValidVertexCount(mirrored);
			});

			it('should mirror very large solid', () => {
				const large = Solid.cube(100, 100, 100, { color: 'blue' }).move({ z: 50 });
				const mirrored = Solid.MIRROR(large, 'Z');

				expectValidVertexCount(mirrored);
			});

			it('should mirror partial cylinder', () => {
				const partial = Solid.cylinder(10, 5, { color: 'orange', angle: 180 }).move({ x: 10 });
				const mirrored = Solid.MIRROR(partial, 'X');

				expectValidVertexCount(mirrored);
			});
		});
	});
});
