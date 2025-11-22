import { describe, it } from 'vitest';

import { Solid } from '$lib/3d/Solid';

import { expectBoundsEqual, expectCloseTo, expectValidVertexCount } from '../../../setup';

describe('Solid - Alignment and Bounds', () => {
	describe('getBounds()', () => {
		it('should return correct bounds for cube', () => {
			const cube = Solid.cube(10, 20, 30);
			const bounds = cube.getBounds();

			expectBoundsEqual(bounds, {
				width: 10,
				height: 20,
				depth: 30
			});
		});

		it('should return correct center for centered cube', () => {
			const cube = Solid.cube(10, 10, 10);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 0);
		});

		it('should return correct min/max for cube', () => {
			const cube = Solid.cube(10, 10, 10);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.x, -5);
			expectCloseTo(bounds.min.y, -5);
			expectCloseTo(bounds.min.z, -5);
			expectCloseTo(bounds.max.x, 5);
			expectCloseTo(bounds.max.y, 5);
			expectCloseTo(bounds.max.z, 5);
		});

		it('should return correct bounds for cylinder', () => {
			const cylinder = Solid.cylinder(5, 20);
			const bounds = cylinder.getBounds();

			expectCloseTo(bounds.width, 10, 0.1); // diameter
			expectCloseTo(bounds.height, 20);
			expectCloseTo(bounds.depth, 10, 0.1); // diameter
		});

		it('should return correct bounds for sphere', () => {
			const sphere = Solid.sphere(10);
			const bounds = sphere.getBounds();

			expectCloseTo(bounds.width, 20, 0.1); // diameter
			expectCloseTo(bounds.height, 20, 0.1);
			expectCloseTo(bounds.depth, 20, 0.1);
		});

		it('should update bounds after transformation', () => {
			const cube = Solid.cube(10, 10, 10).at(20, 30, 40);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 20);
			expectCloseTo(bounds.center.y, 30);
			expectCloseTo(bounds.center.z, 40);
		});

		it('should update bounds after scaling', () => {
			const cube = Solid.cube(10, 10, 10).scale({ all: 2 });
			const bounds = cube.getBounds();

			expectBoundsEqual(bounds, {
				width: 20,
				height: 20,
				depth: 20
			});
		});

		it('should return bounds for complex CSG result', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(20, 0, 0);
			const union = Solid.UNION(cube1, cube2);
			const bounds = union.getBounds();

			// Should span from first cube to second
			expectCloseTo(bounds.width, 30, 1);
		});
	});

	describe('center()', () => {
		it('should center cube on all axes', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 20, y: 30, z: 40 }).center();
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.center.y, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should center cube on x-axis only', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 20, y: 30, z: 40 }).center({ x: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0, 1);
			// Y and Z might not be exactly 30 and 40 due to geometry translation
		});

		it('should center cube on y-axis only', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 20, y: 30, z: 40 }).center({ y: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.y, 0, 1);
		});

		it('should center cube on z-axis only', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 20, y: 30, z: 40 }).center({ z: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should center cube on x and y axes', () => {
			const cube = Solid.cube(10, 10, 10)
				.move({ x: 20, y: 30, z: 40 })
				.center({ x: true, y: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.center.y, 0, 1);
		});

		it('should center cube on x and z axes', () => {
			const cube = Solid.cube(10, 10, 10)
				.move({ x: 20, y: 30, z: 40 })
				.center({ x: true, z: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should center cube on y and z axes', () => {
			const cube = Solid.cube(10, 10, 10)
				.move({ x: 20, y: 30, z: 40 })
				.center({ y: true, z: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.y, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should center cube on all axes with explicit flags', () => {
			const cube = Solid.cube(10, 10, 10)
				.move({ x: 20, y: 30, z: 40 })
				.center({ x: true, y: true, z: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.center.y, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should not change dimensions', () => {
			const cube = Solid.cube(10, 20, 30).move({ x: 100, y: 200, z: 300 }).center();
			const bounds = cube.getBounds();

			expectBoundsEqual(bounds, {
				width: 10,
				height: 20,
				depth: 30
			});
		});

		it('should be chainable', () => {
			const cube = Solid.cube(10, 10, 10).move({ x: 20, y: 30, z: 40 }).center().rotate({ z: 45 });
			expectValidVertexCount(cube);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 10).move({ x: 20, y: 30, z: 40 }).center();
			const sphere = Solid.sphere(5).move({ x: 20, y: 30, z: 40 }).center();
			const cone = Solid.cone(5, 10).move({ x: 20, y: 30, z: 40 }).center();

			const cylinderBounds = cylinder.getBounds();
			const sphereBounds = sphere.getBounds();
			const coneBounds = cone.getBounds();

			expectCloseTo(cylinderBounds.center.x, 0, 1);
			expectCloseTo(cylinderBounds.center.y, 0, 1);
			expectCloseTo(cylinderBounds.center.z, 0, 1);

			expectCloseTo(sphereBounds.center.x, 0, 1);
			expectCloseTo(sphereBounds.center.y, 0, 1);
			expectCloseTo(sphereBounds.center.z, 0, 1);

			expectCloseTo(coneBounds.center.x, 0, 1);
			expectCloseTo(coneBounds.center.y, 0, 1);
			expectCloseTo(coneBounds.center.z, 0, 1);
		});
	});

	describe('align()', () => {
		it('should align cube to bottom', () => {
			const cube = Solid.cube(10, 20, 10).at(5, 10, 5).align('bottom');
			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.y, 0);
		});

		it('should align cube to top', () => {
			const cube = Solid.cube(10, 20, 10).at(5, 10, 5).align('top');
			const bounds = cube.getBounds();

			expectCloseTo(bounds.max.y, 0);
		});

		it('should align cube to left', () => {
			const cube = Solid.cube(20, 10, 10).at(10, 5, 5).align('left');
			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.x, 0);
		});

		it('should align cube to right', () => {
			const cube = Solid.cube(20, 10, 10).at(10, 5, 5).align('right');
			const bounds = cube.getBounds();

			expectCloseTo(bounds.max.x, 0);
		});

		it('should align cube to front', () => {
			const cube = Solid.cube(10, 10, 20).at(5, 5, 10).align('front');
			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.z, 0);
		});

		it('should align cube to back', () => {
			const cube = Solid.cube(10, 10, 20).at(5, 5, 10).align('back');
			const bounds = cube.getBounds();

			expectCloseTo(bounds.max.z, 0);
		});

		it('should chain multiple align calls', () => {
			const cube = Solid.cube(10, 20, 30).at(5, 10, 15).align('bottom').align('left');
			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.y, 0);
			expectCloseTo(bounds.min.x, 0);
		});

		it('should align to all six directions', () => {
			const bottom = Solid.cube(10, 20, 10).align('bottom');
			const top = Solid.cube(10, 20, 10).align('top');
			const left = Solid.cube(20, 10, 10).align('left');
			const right = Solid.cube(20, 10, 10).align('right');
			const front = Solid.cube(10, 10, 20).align('front');
			const back = Solid.cube(10, 10, 20).align('back');

			expectCloseTo(bottom.getBounds().min.y, 0);
			expectCloseTo(top.getBounds().max.y, 0);
			expectCloseTo(left.getBounds().min.x, 0);
			expectCloseTo(right.getBounds().max.x, 0);
			expectCloseTo(front.getBounds().min.z, 0);
			expectCloseTo(back.getBounds().max.z, 0);
		});

		it('should not change dimensions', () => {
			const cube = Solid.cube(10, 20, 30).align('bottom');
			const bounds = cube.getBounds();

			expectBoundsEqual(bounds, {
				width: 10,
				height: 20,
				depth: 30
			});
		});

		it('should be chainable with other operations', () => {
			const cube = Solid.cube(10, 20, 10).align('bottom').center({ x: true, z: true });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.y, 0);
			expectCloseTo(bounds.center.x, 0);
			expectCloseTo(bounds.center.z, 0);
		});

		it('should work with different primitives', () => {
			const cylinder = Solid.cylinder(5, 20).align('bottom');
			const sphere = Solid.sphere(10).align('top');
			const cone = Solid.cone(5, 15).align('left');

			const cylinderBounds = cylinder.getBounds();
			const sphereBounds = sphere.getBounds();
			const coneBounds = cone.getBounds();

			expectCloseTo(cylinderBounds.min.y, 0);
			expectCloseTo(sphereBounds.max.y, 0, 0.5);
			expectCloseTo(coneBounds.min.x, 0, 0.5);
		});

		it('should align CSG results', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(15, 0, 0);
			const union = Solid.UNION(cube1, cube2).align('bottom');

			const bounds = union.getBounds();
			expectCloseTo(bounds.min.y, 0, 0.5);
		});
	});

	describe('Combined Alignment Operations', () => {
		it('should combine center and align', () => {
			const cube = Solid.cube(10, 20, 30)
				.move({ x: 50, y: 60, z: 70 })
				.center({ x: true, z: true })
				.align('bottom');

			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
			expectCloseTo(bounds.min.y, 0, 1);
		});

		it('should align then move', () => {
			const cube = Solid.cube(10, 20, 10).align('bottom').move({ y: 5 });
			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.y, 5);
		});

		it('should align to bottom and center on xz plane', () => {
			const cube = Solid.cube(10, 20, 10)
				.move({ x: 100, y: 50, z: 75 })
				.align('bottom')
				.center({ x: true, z: true });

			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.min.y, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should align multiple sides sequentially', () => {
			const cube = Solid.cube(10, 20, 30)
				.move({ x: 50, y: 60, z: 70 })
				.align('bottom')
				.align('left')
				.align('front');

			const bounds = cube.getBounds();

			expectCloseTo(bounds.min.y, 0, 1);
			expectCloseTo(bounds.min.x, 0, 1);
			expectCloseTo(bounds.min.z, 0, 1);
		});

		it('should work with complex workflow', () => {
			const shape = Solid.cylinder(10, 30)
				.rotate({ x: 90 })
				.align('bottom')
				.center({ x: true, z: true })
				.scale({ x: 2 });

			expectValidVertexCount(shape);
		});

		it('should maintain alignment after CSG', () => {
			const base = Solid.cube(20, 10, 20).align('bottom');
			const hole = Solid.cylinder(3, 15).align('bottom');

			const result = Solid.SUBTRACT(base, hole);
			const bounds = result.getBounds();

			// Should still be roughly aligned to bottom
			expectCloseTo(bounds.min.y, 0, 1);
		});
	});

	describe('Edge Cases', () => {
		it('should handle very small solids', () => {
			const tiny = Solid.cube(0.1, 0.1, 0.1);
			const bounds = tiny.getBounds();

			expectBoundsEqual(bounds, {
				width: 0.1,
				height: 0.1,
				depth: 0.1
			});
		});

		it('should handle very large solids', () => {
			const huge = Solid.cube(1000, 1000, 1000);
			const bounds = huge.getBounds();

			expectBoundsEqual(bounds, {
				width: 1000,
				height: 1000,
				depth: 1000
			});
		});

		it('should handle asymmetric solids', () => {
			const rect = Solid.cube(10, 50, 100);
			const bounds = rect.getBounds();

			expectBoundsEqual(bounds, {
				width: 10,
				height: 50,
				depth: 100
			});
		});

		it('should center already centered solid', () => {
			const cube = Solid.cube(10, 10, 10);
			const bounds1 = cube.getBounds();
			cube.center();
			const bounds2 = cube.getBounds();

			expectCloseTo(bounds1.center.x, bounds2.center.x);
			expectCloseTo(bounds1.center.y, bounds2.center.y);
			expectCloseTo(bounds1.center.z, bounds2.center.z);
		});
	});
});
