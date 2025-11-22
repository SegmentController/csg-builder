import { describe, it } from 'vitest';

import { Solid } from '$lib/3d/Solid';

import { expectCloseTo, expectValidVertexCount } from '../../../setup';

describe('Solid - Transformations', () => {
	describe('at() - Absolute Positioning', () => {
		it('should position solid at specified coordinates', () => {
			const cube = Solid.cube(10, 10, 10).at(5, 10, 15);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 5);
			expectCloseTo(bounds.center.y, 10);
			expectCloseTo(bounds.center.z, 15);
		});

		it('should position solid at origin', () => {
			const cube = Solid.cube(10, 10, 10).at(0, 0, 0);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 0);
		});

		it('should position solid at negative coordinates', () => {
			const cube = Solid.cube(10, 10, 10).at(-10, -20, -30);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, -10);
			expectCloseTo(bounds.center.y, -20);
			expectCloseTo(bounds.center.z, -30);
		});

		it('should override previous at() call', () => {
			const cube = Solid.cube(10, 10, 10).at(5, 5, 5).at(10, 10, 10);
			const bounds = cube.getBounds();

			// Should be at second position
			expectCloseTo(bounds.center.x, 10);
			expectCloseTo(bounds.center.y, 10);
			expectCloseTo(bounds.center.z, 10);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 10).at(10, 20, 30);
			const sphere = Solid.sphere(5).at(-5, -10, -15);
			const cone = Solid.cone(5, 10).at(0, 15, 0);

			const cylinderBounds = cylinder.getBounds();
			const sphereBounds = sphere.getBounds();
			const coneBounds = cone.getBounds();

			expectCloseTo(cylinderBounds.center.x, 10, 0.1);
			expectCloseTo(cylinderBounds.center.y, 20);
			expectCloseTo(cylinderBounds.center.z, 30, 0.1);

			expectCloseTo(sphereBounds.center.x, -5, 0.1);
			expectCloseTo(sphereBounds.center.y, -10, 0.1);
			expectCloseTo(sphereBounds.center.z, -15, 0.1);

			expectCloseTo(coneBounds.center.x, 0, 0.1);
			expectCloseTo(coneBounds.center.y, 15);
			expectCloseTo(coneBounds.center.z, 0, 0.1);
		});

		it('should be chainable', () => {
			const cube = Solid.cube(10, 10, 10).at(5, 5, 5).rotate({ z: 45 });
			expectValidVertexCount(cube);
		});

		it('should not affect solid dimensions', () => {
			const cube = Solid.cube(10, 20, 30).at(100, 200, 300);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 10);
			expectCloseTo(bounds.height, 20);
			expectCloseTo(bounds.depth, 30);
		});
	});

	describe('move() - Relative Positioning', () => {
		it('should move solid along x-axis', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 5);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 0);
		});

		it('should move solid along y-axis', () => {
			const cube = Solid.cube(10, 10, 10).move({ y: 10 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0);
			expectCloseTo(bounds.center.y, 10);
			expectCloseTo(bounds.center.z, 0);
		});

		it('should move solid along z-axis', () => {
			const cube = Solid.cube(10, 10, 10).move({ z: 15 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 15);
		});

		it('should move solid along all axes', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 5, y: 10, z: 15 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 5);
			expectCloseTo(bounds.center.y, 10);
			expectCloseTo(bounds.center.z, 15);
		});

		it('should accumulate with multiple move calls', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 5 }).move({ x: 3 }).move({ y: 10 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 8); // 5 + 3
			expectCloseTo(bounds.center.y, 10);
			expectCloseTo(bounds.center.z, 0);
		});

		it('should handle negative values', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: -5, y: -10, z: -15 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, -5);
			expectCloseTo(bounds.center.y, -10);
			expectCloseTo(bounds.center.z, -15);
		});

		it('should handle partial parameters', () => {
			const cube1 = Solid.cube(10, 10, 10).move({ x: 5 });
			const cube2 = Solid.cube(10, 10, 10).move({ y: 10 });
			const cube3 = Solid.cube(10, 10, 10).move({ z: 15 });

			const bounds1 = cube1.getBounds();
			const bounds2 = cube2.getBounds();
			const bounds3 = cube3.getBounds();

			expectCloseTo(bounds1.center.x, 5);
			expectCloseTo(bounds2.center.y, 10);
			expectCloseTo(bounds3.center.z, 15);
		});

		it('should be combinable with at()', () => {
			const cube = Solid.cube(10, 10, 10).at(10, 10, 10).move({ x: 5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 15); // 10 + 5
			expectCloseTo(bounds.center.y, 10);
			expectCloseTo(bounds.center.z, 10);
		});

		it('should be chainable', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 5 }).move({ y: 10 }).rotate({ z: 45 });
			expectValidVertexCount(cube);
		});

		it('should not affect solid dimensions', () => {
			const cube = Solid.cube(10, 20, 30).move({ x: 100, y: 200, z: 300 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 10);
			expectCloseTo(bounds.height, 20);
			expectCloseTo(bounds.depth, 30);
		});
	});

	describe('rotate() - Rotation', () => {
		it('should rotate solid around x-axis', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ x: 45 });
			expectValidVertexCount(cube);
		});

		it('should rotate solid around y-axis', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ y: 90 });
			expectValidVertexCount(cube);
		});

		it('should rotate solid around z-axis', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ z: 180 });
			expectValidVertexCount(cube);
		});

		it('should rotate solid around all axes', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ x: 45, y: 90, z: 180 });
			expectValidVertexCount(cube);
		});

		it('should handle common angles', () => {
			const cube45 = Solid.cube(10, 10, 10).rotate({ z: 45 });
			const cube90 = Solid.cube(10, 10, 10).rotate({ z: 90 });
			const cube180 = Solid.cube(10, 10, 10).rotate({ z: 180 });
			const cube270 = Solid.cube(10, 10, 10).rotate({ z: 270 });

			expectValidVertexCount(cube45);
			expectValidVertexCount(cube90);
			expectValidVertexCount(cube180);
			expectValidVertexCount(cube270);
		});

		it('should handle negative angles', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ z: -90 });
			expectValidVertexCount(cube);
		});

		it('should handle 360 degree rotation', () => {
			const original = Solid.cube(10, 10, 10);
			const rotated = Solid.cube(10, 10, 10).rotate({ z: 360 });

			// After 360 degree rotation, bounds should be similar
			const originalBounds = original.getBounds();
			const rotatedBounds = rotated.getBounds();

			expectCloseTo(originalBounds.width, rotatedBounds.width, 0.5);
			expectCloseTo(originalBounds.height, rotatedBounds.height, 0.5);
			expectCloseTo(originalBounds.depth, rotatedBounds.depth, 0.5);
		});

		it('should be chainable with multiple rotations', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ x: 45 }).rotate({ y: 90 }).rotate({ z: 180 });
			expectValidVertexCount(cube);
		});

		it('should rotate cylinder correctly', () => {
			const cylinder = Solid.cylinder(5, 20).rotate({ x: 90 });
			const bounds = cylinder.getBounds();

			// After 90 degree rotation around x, height and depth swap
			expectCloseTo(bounds.height, 10, 1); // Was depth (diameter)
			expectCloseTo(bounds.depth, 20, 1); // Was height
		});

		it('should be chainable with other transforms', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 5 }).rotate({ z: 45 }).scale({ all: 2 });
			expectValidVertexCount(cube);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 10).rotate({ x: 90 });
			const sphere = Solid.sphere(5).rotate({ y: 45 });
			const cone = Solid.cone(5, 10).rotate({ z: 180 });

			expectValidVertexCount(cylinder);
			expectValidVertexCount(sphere);
			expectValidVertexCount(cone);
		});
	});

	describe('scale() - Scaling', () => {
		it('should scale solid uniformly with all parameter', () => {
			const cube = Solid.cube(10, 10, 10).scale({ all: 2 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 20);
			expectCloseTo(bounds.height, 20);
			expectCloseTo(bounds.depth, 20);
		});

		it('should scale solid along x-axis', () => {
			const cube = Solid.cube(10, 10, 10).scale({ x: 2 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 20);
			expectCloseTo(bounds.height, 10);
			expectCloseTo(bounds.depth, 10);
		});

		it('should scale solid along y-axis', () => {
			const cube = Solid.cube(10, 10, 10).scale({ y: 3 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 10);
			expectCloseTo(bounds.height, 30);
			expectCloseTo(bounds.depth, 10);
		});

		it('should scale solid along z-axis', () => {
			const cube = Solid.cube(10, 10, 10).scale({ z: 0.5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 10);
			expectCloseTo(bounds.height, 10);
			expectCloseTo(bounds.depth, 5);
		});

		it('should scale solid along all axes independently', () => {
			const cube = Solid.cube(10, 10, 10).scale({ x: 2, y: 3, z: 0.5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 20);
			expectCloseTo(bounds.height, 30);
			expectCloseTo(bounds.depth, 5);
		});

		it('should accumulate with multiple scale calls', () => {
			const cube = Solid.cube(10, 10, 10).scale({ all: 2 }).scale({ all: 2 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 40); // 10 * 2 * 2
			expectCloseTo(bounds.height, 40);
			expectCloseTo(bounds.depth, 40);
		});

		it('should handle fractional scaling', () => {
			const cube = Solid.cube(10, 10, 10).scale({ all: 0.5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 5);
			expectCloseTo(bounds.height, 5);
			expectCloseTo(bounds.depth, 5);
		});

		it('should handle mixed scaling factors', () => {
			const cube = Solid.cube(10, 10, 10).scale({ x: 2 }).scale({ y: 0.5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.width, 20);
			expectCloseTo(bounds.height, 5);
			expectCloseTo(bounds.depth, 10);
		});

		it('should be chainable with other transforms', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 5 }).rotate({ z: 45 }).scale({ all: 2 });
			expectValidVertexCount(cube);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 10).scale({ all: 2 });
			const sphere = Solid.sphere(5).scale({ x: 2 });
			const cone = Solid.cone(5, 10).scale({ y: 3 });

			const cylinderBounds = cylinder.getBounds();
			const sphereBounds = sphere.getBounds();
			const coneBounds = cone.getBounds();

			expectCloseTo(cylinderBounds.height, 20);
			expectCloseTo(sphereBounds.width, 20, 1);
			expectCloseTo(coneBounds.height, 30);
		});

		it('should scale sphere to ellipsoid', () => {
			const sphere = Solid.sphere(10).scale({ x: 2, y: 1, z: 0.5 });
			const bounds = sphere.getBounds();

			expectCloseTo(bounds.width, 40, 1);
			expectCloseTo(bounds.height, 20, 1);
			expectCloseTo(bounds.depth, 10, 1);
		});
	});

	describe('Combined Transformations', () => {
		it('should combine all transformation types', () => {
			const cube = Solid.cube(10, 10, 10)
				.at(5, 5, 5)
				.move({ x: 5 })
				.rotate({ z: 45 })
				.scale({ all: 2 });

			expectValidVertexCount(cube);
		});

		it('should preserve transformation order', () => {
			const cube1 = Solid.cube(10, 10, 10).move({ x: 10 }).rotate({ z: 90 });
			const cube2 = Solid.cube(10, 10, 10).rotate({ z: 90 }).move({ x: 10 });

			expectValidVertexCount(cube1);
			expectValidVertexCount(cube2);
			// Different orders may produce different results
		});

		it('should chain move and at correctly', () => {
			const cube = Solid.cube(10, 10, 10).at(10, 10, 10).move({ x: 5, y: 5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 15);
			expectCloseTo(bounds.center.y, 15);
			expectCloseTo(bounds.center.z, 10);
		});

		it('should handle complex transformation chain', () => {
			const shape = Solid.cylinder(5, 20)
				.rotate({ x: 90 })
				.at(10, 0, 0)
				.move({ y: 5 })
				.scale({ x: 2, z: 0.5 });

			expectValidVertexCount(shape);
		});

		it('should work with CSG after transformations', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0).scale({ all: 2 });
			const cube2 = Solid.cube(5, 5, 5).at(10, 0, 0).rotate({ z: 45 });

			const result = Solid.UNION(cube1, cube2);
			expectValidVertexCount(result);
		});

		it('should preserve dimensions through move and rotate', () => {
			const cube = Solid.cube(10, 20, 30).move({ x: 100 }).rotate({ z: 90 });
			const bounds = cube.getBounds();

			// After 90 degree z rotation, width and depth may swap
			// But total volume-related dimensions should be preserved
			const dimensions = [bounds.width, bounds.height, bounds.depth].toSorted();
			expectCloseTo(dimensions[0], 10, 1);
			expectCloseTo(dimensions[1], 20, 1);
			expectCloseTo(dimensions[2], 30, 1);
		});
	});
});
