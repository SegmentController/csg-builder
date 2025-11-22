import { describe, it, expect } from 'vitest';
import { Solid, straight, curve } from '$lib/3d/Solid';
import { expectValidVertexCount, expectCloseTo } from '../../../setup';

describe('Solid - Custom Profiles', () => {
	describe('profilePrism()', () => {
		it('should create a prism from shape builder', () => {
			const prism = Solid.profilePrism(10, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.lineTo(10, 10);
				shape.lineTo(0, 10);
				shape.lineTo(0, 0);
			});

			expectValidVertexCount(prism);
		});

		it('should create a triangular prism', () => {
			const prism = Solid.profilePrism(15, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 0);
			});

			expectValidVertexCount(prism);
		});

		it('should create a prism with arc', () => {
			const prism = Solid.profilePrism(10, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.arc(0, 10, 5);
				shape.lineTo(0, 0);
			});

			expectValidVertexCount(prism);
		});

		it('should have correct height', () => {
			const prism = Solid.profilePrism(20, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.lineTo(10, 10);
				shape.lineTo(0, 10);
				shape.lineTo(0, 0);
			});

			const bounds = prism.getBounds();
			expectCloseTo(bounds.height, 20);
		});

		it('should accept color option', () => {
			const prism = Solid.profilePrism(
				10,
				(shape) => {
					shape.moveTo(0, 0);
					shape.lineTo(10, 0);
					shape.lineTo(10, 10);
					shape.lineTo(0, 0);
				},
				{ color: 'blue' }
			);

			expectValidVertexCount(prism);
		});

		it('should create L-shaped profile', () => {
			const prism = Solid.profilePrism(15, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.lineTo(10, 5);
				shape.lineTo(5, 5);
				shape.lineTo(5, 15);
				shape.lineTo(0, 15);
				shape.lineTo(0, 0);
			});

			expectValidVertexCount(prism);
		});

		it('should create T-shaped profile', () => {
			const prism = Solid.profilePrism(10, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(15, 0);
				shape.lineTo(15, 5);
				shape.lineTo(10, 5);
				shape.lineTo(10, 15);
				shape.lineTo(5, 15);
				shape.lineTo(5, 5);
				shape.lineTo(0, 5);
				shape.lineTo(0, 0);
			});

			expectValidVertexCount(prism);
		});

		it('should be transformable', () => {
			const prism = Solid.profilePrism(10, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.lineTo(10, 10);
				shape.lineTo(0, 0);
			}).rotate({ x: 90 });

			expectValidVertexCount(prism);
		});

		it('should work with CSG operations', () => {
			const prism = Solid.profilePrism(10, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.lineTo(10, 10);
				shape.lineTo(0, 10);
				shape.lineTo(0, 0);
			});

			const hole = Solid.cylinder(2, 15);
			const result = Solid.SUBTRACT(prism, hole);

			expectValidVertexCount(result);
		});
	});

	describe('profilePrismFromPoints()', () => {
		it('should create a prism from points array', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[10, 10],
				[0, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points);
			expectValidVertexCount(prism);
		});

		it('should create triangular prism from 3 points', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[5, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points);
			expectValidVertexCount(prism);
		});

		it('should create hexagonal prism from 6 points', () => {
			const points: [number, number][] = [
				[5, 0],
				[10, 2.5],
				[10, 7.5],
				[5, 10],
				[0, 7.5],
				[0, 2.5]
			];

			const prism = Solid.profilePrismFromPoints(15, points);
			expectValidVertexCount(prism);
		});

		it('should accept color option', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[10, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points, { color: 'red' });
			expectValidVertexCount(prism);
		});

		it('should have correct height', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[10, 10],
				[0, 10]
			];

			const prism = Solid.profilePrismFromPoints(25, points);
			const bounds = prism.getBounds();

			expectCloseTo(bounds.height, 25);
		});

		it('should create star shape', () => {
			const points: [number, number][] = [
				[5, 0],
				[6, 4],
				[10, 4],
				[7, 6],
				[8, 10],
				[5, 7],
				[2, 10],
				[3, 6],
				[0, 4],
				[4, 4]
			];

			const prism = Solid.profilePrismFromPoints(5, points);
			expectValidVertexCount(prism);
		});

		it('should be transformable', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[5, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points).rotate({ y: 45 });
			expectValidVertexCount(prism);
		});

		it('should work with CSG operations', () => {
			const points: [number, number][] = [
				[0, 0],
				[15, 0],
				[15, 15],
				[0, 15]
			];

			const prism = Solid.profilePrismFromPoints(10, points);
			const cube = Solid.cube(5, 5, 5);
			const result = Solid.UNION(prism, cube);

			expectValidVertexCount(result);
		});
	});

	describe('profilePrismFromPath()', () => {
		it('should create a prism from straight segments', () => {
			const path = [straight(10), straight(10), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path);

			expectValidVertexCount(prism);
		});

		it('should create a square from four straights', () => {
			const path = [straight(10), straight(10), straight(10), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path);

			expectValidVertexCount(prism);
		});

		it('should create a prism with curve segments', () => {
			const path = [straight(10), curve(5, 90), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path);

			expectValidVertexCount(prism);
		});

		it('should create a rounded rectangle', () => {
			const path = [
				straight(10),
				curve(2, 90),
				straight(10),
				curve(2, 90),
				straight(10),
				curve(2, 90),
				straight(10),
				curve(2, 90)
			];

			const prism = Solid.profilePrismFromPath(15, path);
			expectValidVertexCount(prism);
		});

		it('should handle negative curve angles (left turn)', () => {
			const path = [straight(10), curve(5, -90), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path);

			expectValidVertexCount(prism);
		});

		it('should handle zero radius curve (sharp corner)', () => {
			const path = [straight(10), curve(0, 90), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path);

			expectValidVertexCount(prism);
		});

		it('should accept color option', () => {
			const path = [straight(10), curve(5, 90), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path, { color: 'green' });

			expectValidVertexCount(prism);
		});

		it('should have correct height', () => {
			const path = [straight(10), curve(5, 90), straight(10)];
			const prism = Solid.profilePrismFromPath(30, path);
			const bounds = prism.getBounds();

			expectCloseTo(bounds.height, 30);
		});

		it('should create zigzag pattern', () => {
			const path = [
				straight(5),
				curve(0, 45),
				straight(5),
				curve(0, -90),
				straight(5),
				curve(0, 45),
				straight(5)
			];

			const prism = Solid.profilePrismFromPath(10, path);
			expectValidVertexCount(prism);
		});

		it('should create C-shaped profile', () => {
			const path = [straight(10), curve(5, 90), straight(10), curve(5, 90), straight(10)];

			const prism = Solid.profilePrismFromPath(15, path);
			expectValidVertexCount(prism);
		});

		it('should create S-shaped profile', () => {
			const path = [
				straight(5),
				curve(3, 90),
				straight(3),
				curve(3, 90),
				straight(5),
				curve(3, -90),
				straight(3),
				curve(3, -90),
				straight(5)
			];

			const prism = Solid.profilePrismFromPath(10, path);
			expectValidVertexCount(prism);
		});

		it('should be transformable', () => {
			const path = [straight(10), curve(5, 90), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path).rotate({ z: 45 });

			expectValidVertexCount(prism);
		});

		it('should work with CSG operations', () => {
			const path = [straight(10), curve(5, 90), straight(10), curve(5, 90)];
			const prism = Solid.profilePrismFromPath(15, path);
			const hole = Solid.cube(3, 20, 3);
			const result = Solid.SUBTRACT(prism, hole);

			expectValidVertexCount(result);
		});
	});

	describe('straight() - Path Factory', () => {
		it('should create a straight segment with positive length', () => {
			const segment = straight(10);
			expect(segment).toBeDefined();
			expect(segment.type).toBe('straight');
			expect(segment.length).toBe(10);
		});

		it('should create segments with different lengths', () => {
			const short = straight(5);
			const medium = straight(10);
			const long = straight(20);

			expect(short.length).toBe(5);
			expect(medium.length).toBe(10);
			expect(long.length).toBe(20);
		});

		it('should work in path arrays', () => {
			const path = [straight(5), straight(10), straight(15)];
			const prism = Solid.profilePrismFromPath(10, path);

			expectValidVertexCount(prism);
		});
	});

	describe('curve() - Path Factory', () => {
		it('should create a curve segment with positive angle', () => {
			const segment = curve(5, 90);
			expect(segment).toBeDefined();
			expect(segment.type).toBe('curve');
			expect(segment.radius).toBe(5);
			expect(segment.angle).toBe(90);
		});

		it('should create a curve with negative angle (left turn)', () => {
			const segment = curve(5, -90);
			expect(segment.radius).toBe(5);
			expect(segment.angle).toBe(-90);
		});

		it('should create a curve with zero radius (sharp corner)', () => {
			const segment = curve(0, 90);
			expect(segment.radius).toBe(0);
			expect(segment.angle).toBe(90);
		});

		it('should create curves with different angles', () => {
			const curve45 = curve(5, 45);
			const curve90 = curve(5, 90);
			const curve180 = curve(5, 180);

			expect(curve45.angle).toBe(45);
			expect(curve90.angle).toBe(90);
			expect(curve180.angle).toBe(180);
		});

		it('should create curves with different radii', () => {
			const small = curve(2, 90);
			const medium = curve(5, 90);
			const large = curve(10, 90);

			expect(small.radius).toBe(2);
			expect(medium.radius).toBe(5);
			expect(large.radius).toBe(10);
		});

		it('should work in path arrays', () => {
			const path = [curve(5, 90), curve(5, 90), curve(5, 90)];
			const prism = Solid.profilePrismFromPath(10, path);

			expectValidVertexCount(prism);
		});
	});

	describe('Combined Path Segments', () => {
		it('should combine straight and curve segments', () => {
			const path = [straight(10), curve(5, 90), straight(10), curve(5, 90)];
			const prism = Solid.profilePrismFromPath(15, path);

			expectValidVertexCount(prism);
		});

		it('should create complex path with many segments', () => {
			const path = [
				straight(10),
				curve(3, 45),
				straight(5),
				curve(3, -90),
				straight(8),
				curve(3, 45),
				straight(10),
				curve(0, 90),
				straight(5)
			];

			const prism = Solid.profilePrismFromPath(12, path);
			expectValidVertexCount(prism);
		});

		it('should create stairs pattern', () => {
			const path = [
				straight(5),
				curve(0, 90),
				straight(3),
				curve(0, 90),
				straight(5),
				curve(0, 90),
				straight(3),
				curve(0, 90),
				straight(5),
				curve(0, 90),
				straight(3),
				curve(0, 90)
			];

			const prism = Solid.profilePrismFromPath(10, path);
			expectValidVertexCount(prism);
		});

		it('should create wave pattern', () => {
			const path = [
				straight(5),
				curve(2, 90),
				curve(2, 90),
				straight(5),
				curve(2, -90),
				curve(2, -90),
				straight(5)
			];

			const prism = Solid.profilePrismFromPath(10, path);
			expectValidVertexCount(prism);
		});
	});

	describe('Profile Integration with Other Features', () => {
		it('should align custom profile', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[10, 10],
				[0, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points).align('bottom');
			const bounds = prism.getBounds();

			expectCloseTo(bounds.min.y, 0, 0.5);
		});

		it('should center custom profile', () => {
			const path = [straight(10), curve(5, 90), straight(10)];
			const prism = Solid.profilePrismFromPath(15, path).center();

			const bounds = prism.getBounds();
			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.center.y, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should scale custom profile', () => {
			const prism = Solid.profilePrism(10, (shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(10, 0);
				shape.lineTo(10, 10);
				shape.lineTo(0, 0);
			}).scale({ all: 2 });

			const bounds = prism.getBounds();
			expectCloseTo(bounds.height, 20, 1);
		});

		it('should rotate custom profile', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[5, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points).rotate({ x: 90 });
			expectValidVertexCount(prism);
		});

		it('should create grid of custom profiles', () => {
			const path = [straight(5), curve(2, 90), straight(5)];
			const prism = Solid.profilePrismFromPath(8, path);
			const grid = Solid.GRID_XY(prism, { cols: 3, rows: 3, spacing: 1 });

			expectValidVertexCount(grid);
		});
	});
});
