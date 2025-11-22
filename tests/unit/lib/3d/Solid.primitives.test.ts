import { describe, expect, it } from 'vitest';

import { Solid } from '$lib/3d/Solid';

import { expectBoundsEqual, expectCloseTo, expectValidVertexCount } from '../../../setup';

describe('Solid - Primitive Creation', () => {
	describe('cube()', () => {
		it('should create a cube with correct dimensions', () => {
			const cube = Solid.cube(10, 20, 30);
			const bounds = cube.getBounds();

			expectBoundsEqual(bounds, {
				width: 10,
				height: 20,
				depth: 30
			});
		});

		it('should create a cube centered at origin', () => {
			const cube = Solid.cube(10, 10, 10);
			const bounds = cube.getBounds();

			expectCloseTo(bounds.center.x, 0);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 0);
		});

		it('should create a cube with color option', () => {
			const cube = Solid.cube(10, 10, 10, { color: 'red' });
			expectValidVertexCount(cube);
		});

		it('should create a cube with different dimensions', () => {
			const cube = Solid.cube(5, 15, 25);
			const bounds = cube.getBounds();

			expectBoundsEqual(bounds, {
				width: 5,
				height: 15,
				depth: 25
			});
		});

		it('should create a unit cube', () => {
			const cube = Solid.cube(1, 1, 1);
			const bounds = cube.getBounds();

			expectBoundsEqual(bounds, {
				width: 1,
				height: 1,
				depth: 1
			});
		});

		it('should have valid vertex count', () => {
			const cube = Solid.cube(10, 10, 10);
			expectValidVertexCount(cube, 36); // 12 triangles * 3 vertices
		});
	});

	describe('cylinder()', () => {
		it('should create a cylinder with correct dimensions', () => {
			const cylinder = Solid.cylinder(5, 10);
			const bounds = cylinder.getBounds();

			expectCloseTo(bounds.width, 10, 0.1); // diameter = 2 * radius
			expectCloseTo(bounds.depth, 10, 0.1);
			expectCloseTo(bounds.height, 10);
		});

		it('should create a cylinder centered at origin', () => {
			const cylinder = Solid.cylinder(5, 10);
			const bounds = cylinder.getBounds();

			expectCloseTo(bounds.center.x, 0, 0.1);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 0, 0.1);
		});

		it('should create a cylinder with color option', () => {
			const cylinder = Solid.cylinder(5, 10, { color: 'blue' });
			expectValidVertexCount(cylinder);
		});

		it('should create a partial cylinder with angle', () => {
			const fullCylinder = Solid.cylinder(5, 10);
			const halfCylinder = Solid.cylinder(5, 10, { angle: 180 });

			expectValidVertexCount(fullCylinder);
			expectValidVertexCount(halfCylinder);

			// Partial geometry created via CSG subtraction adds vertices at cutting planes
			expect(halfCylinder.getVertices().length).toBeGreaterThan(0);
		});

		it('should create a cylinder with 90 degree angle', () => {
			const quarterCylinder = Solid.cylinder(5, 10, { angle: 90 });
			expectValidVertexCount(quarterCylinder);
		});

		it('should create a cylinder with 270 degree angle', () => {
			const threeFourthsCylinder = Solid.cylinder(5, 10, { angle: 270 });
			expectValidVertexCount(threeFourthsCylinder);
		});

		it('should use 360 degree angle', () => {
			const fullCylinder = Solid.cylinder(5, 10, { angle: 360 });
			expectValidVertexCount(fullCylinder);
		});

		it('should create a cone-shaped cylinder with topRadius', () => {
			const coneCylinder = Solid.cylinder(10, 20, { topRadius: 5 });
			const bounds = coneCylinder.getBounds();

			expectCloseTo(bounds.height, 20);
		});

		it('should create a cylinder with topRadius = 0 (pure cone)', () => {
			const pureCone = Solid.cylinder(10, 20, { topRadius: 0 });
			expectValidVertexCount(pureCone);
		});

		it('should have valid vertex count', () => {
			const cylinder = Solid.cylinder(5, 10);
			expectValidVertexCount(cylinder);
		});
	});

	describe('sphere()', () => {
		it('should create a sphere with correct radius', () => {
			const sphere = Solid.sphere(5);
			const bounds = sphere.getBounds();

			expectCloseTo(bounds.width, 10, 0.1); // diameter = 2 * radius
			expectCloseTo(bounds.height, 10, 0.1);
			expectCloseTo(bounds.depth, 10, 0.1);
		});

		it('should create a sphere centered at origin', () => {
			const sphere = Solid.sphere(5);
			const bounds = sphere.getBounds();

			expectCloseTo(bounds.center.x, 0, 0.1);
			expectCloseTo(bounds.center.y, 0, 0.1);
			expectCloseTo(bounds.center.z, 0, 0.1);
		});

		it('should create a sphere with color option', () => {
			const sphere = Solid.sphere(5, { color: 'green' });
			expectValidVertexCount(sphere);
		});

		it('should create a partial sphere with angle', () => {
			const fullSphere = Solid.sphere(5);
			const halfSphere = Solid.sphere(5, { angle: 180 });

			expectValidVertexCount(fullSphere);
			expectValidVertexCount(halfSphere);

			// Partial geometry created via CSG subtraction adds vertices at cutting planes
			expect(halfSphere.getVertices().length).toBeGreaterThan(0);
		});

		it('should create a sphere with 90 degree angle', () => {
			const quarterSphere = Solid.sphere(5, { angle: 90 });
			expectValidVertexCount(quarterSphere);
		});

		it('should create a sphere with 270 degree angle', () => {
			const threeFourthsSphere = Solid.sphere(5, { angle: 270 });
			expectValidVertexCount(threeFourthsSphere);
		});

		it('should have valid vertex count', () => {
			const sphere = Solid.sphere(5);
			expectValidVertexCount(sphere);
		});
	});

	describe('cone()', () => {
		it('should create a cone with correct dimensions', () => {
			const cone = Solid.cone(5, 10);
			const bounds = cone.getBounds();

			expectCloseTo(bounds.width, 10, 0.1); // diameter at base
			expectCloseTo(bounds.depth, 10, 0.1);
			expectCloseTo(bounds.height, 10);
		});

		it('should create a cone centered at origin', () => {
			const cone = Solid.cone(5, 10);
			const bounds = cone.getBounds();

			expectCloseTo(bounds.center.x, 0, 0.1);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 0, 0.1);
		});

		it('should create a cone with color option', () => {
			const cone = Solid.cone(5, 10, { color: 'yellow' });
			expectValidVertexCount(cone);
		});

		it('should create a partial cone with angle', () => {
			const fullCone = Solid.cone(5, 10);
			const halfCone = Solid.cone(5, 10, { angle: 180 });

			expectValidVertexCount(fullCone);
			expectValidVertexCount(halfCone);

			// Partial geometry created via CSG subtraction adds vertices at cutting planes
			expect(halfCone.getVertices().length).toBeGreaterThan(0);
		});

		it('should create a cone with 90 degree angle', () => {
			const quarterCone = Solid.cone(5, 10, { angle: 90 });
			expectValidVertexCount(quarterCone);
		});

		it('should use 180 degree angle', () => {
			const halfCone = Solid.cone(5, 10, { angle: 180 });
			expectValidVertexCount(halfCone);
		});

		it('should have valid vertex count', () => {
			const cone = Solid.cone(5, 10);
			expectValidVertexCount(cone);
		});
	});

	describe('prism()', () => {
		it('should create a triangular prism (3 sides)', () => {
			const prism = Solid.prism(3, 5, 10);
			const bounds = prism.getBounds();

			expectCloseTo(bounds.height, 10);
			expectValidVertexCount(prism);
		});

		it('should create a square prism (4 sides)', () => {
			const prism = Solid.prism(4, 5, 10);
			expectValidVertexCount(prism);
		});

		it('should create a hexagonal prism (6 sides)', () => {
			const prism = Solid.prism(6, 5, 10);
			expectValidVertexCount(prism);
		});

		it('should create an octagonal prism (8 sides)', () => {
			const prism = Solid.prism(8, 5, 10);
			expectValidVertexCount(prism);
		});

		it('should create a prism with color option', () => {
			const prism = Solid.prism(5, 5, 10, { color: 'purple' });
			expectValidVertexCount(prism);
		});

		it('should create a partial prism with angle', () => {
			const fullPrism = Solid.prism(6, 5, 10);
			const halfPrism = Solid.prism(6, 5, 10, { angle: 180 });

			expectValidVertexCount(fullPrism);
			expectValidVertexCount(halfPrism);

			// Partial geometry created via CSG subtraction adds vertices at cutting planes
			expect(halfPrism.getVertices().length).toBeGreaterThan(0);
		});

		it('should create a prism with topRadius (tapered)', () => {
			const taperedPrism = Solid.prism(6, 10, 20, { topRadius: 5 });
			expectValidVertexCount(taperedPrism);
		});

		it('should create a prism with topRadius = 0 (pyramid)', () => {
			const pyramid = Solid.prism(6, 10, 20, { topRadius: 0 });
			expectValidVertexCount(pyramid);
		});

		it('should have more vertices with more sides', () => {
			const triangle = Solid.prism(3, 5, 10);
			const hexagon = Solid.prism(6, 5, 10);
			const dodecagon = Solid.prism(12, 5, 10);

			const triangleVertices = triangle.getVertices().length;
			const hexagonVertices = hexagon.getVertices().length;
			const dodecagonVertices = dodecagon.getVertices().length;

			expect(hexagonVertices).toBeGreaterThan(triangleVertices);
			expect(dodecagonVertices).toBeGreaterThan(hexagonVertices);
		});

		it('should be centered at origin', () => {
			const prism = Solid.prism(6, 5, 10);
			const bounds = prism.getBounds();

			expectCloseTo(bounds.center.x, 0, 0.1);
			expectCloseTo(bounds.center.y, 0);
			expectCloseTo(bounds.center.z, 0, 0.1);
		});
	});

	describe('trianglePrism()', () => {
		it('should create a triangular prism', () => {
			const prism = Solid.trianglePrism(5, 10);
			expectValidVertexCount(prism);
		});

		it('should be equivalent to prism(3, radius, height)', () => {
			const trianglePrism = Solid.trianglePrism(5, 10);
			const prism3 = Solid.prism(3, 5, 10);

			const triangleVertices = trianglePrism.getVertices().length;
			const prism3Vertices = prism3.getVertices().length;

			// Should have similar vertex counts (may vary slightly due to normalization)
			expect(Math.abs(triangleVertices - prism3Vertices)).toBeLessThan(100);
		});

		it('should create a triangular prism with color option', () => {
			const prism = Solid.trianglePrism(5, 10, { color: 'orange' });
			expectValidVertexCount(prism);
		});

		it('should be centered at origin', () => {
			const prism = Solid.trianglePrism(5, 10);
			const bounds = prism.getBounds();

			expectCloseTo(bounds.center.y, 0);
		});

		it('should have correct height', () => {
			const prism = Solid.trianglePrism(5, 10);
			const bounds = prism.getBounds();

			expectCloseTo(bounds.height, 10);
		});
	});

	describe('Color options', () => {
		it('should accept various color formats', () => {
			const cube1 = Solid.cube(10, 10, 10, { color: 'red' });
			const cube2 = Solid.cube(10, 10, 10, { color: '#ff0000' });
			const cube3 = Solid.cube(10, 10, 10, { color: 'rgb(255, 0, 0)' });

			expectValidVertexCount(cube1);
			expectValidVertexCount(cube2);
			expectValidVertexCount(cube3);
		});

		it('should work with all primitives', () => {
			const cube = Solid.cube(10, 10, 10, { color: 'red' });
			const cylinder = Solid.cylinder(5, 10, { color: 'blue' });
			const sphere = Solid.sphere(5, { color: 'green' });
			const cone = Solid.cone(5, 10, { color: 'yellow' });
			const prism = Solid.prism(6, 5, 10, { color: 'purple' });
			const trianglePrism = Solid.trianglePrism(5, 10, { color: 'orange' });

			expectValidVertexCount(cube);
			expectValidVertexCount(cylinder);
			expectValidVertexCount(sphere);
			expectValidVertexCount(cone);
			expectValidVertexCount(prism);
			expectValidVertexCount(trianglePrism);
		});
	});
});
