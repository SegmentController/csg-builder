import { describe, expect, it } from 'vitest';

import { curve, Solid, straight } from '$lib/3d/Solid';

import { expectCloseTo, expectValidVertexCount } from '../../../setup';

describe('Solid - Revolution Solids', () => {
	describe('revolutionSolid()', () => {
		it('should create a revolution solid from shape builder', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(5, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 10);
			});

			expectValidVertexCount(solid);
		});

		it('should create a cylinder-like shape', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(5, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 10);
				shape.lineTo(0, 0);
			});

			const bounds = solid.getBounds();
			expectCloseTo(bounds.width, 10, 1); // diameter
			expectCloseTo(bounds.height, 10);
			expectCloseTo(bounds.depth, 10, 1); // diameter
		});

		it('should create a cone-like shape', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(5, 0);
				shape.lineTo(0, 10);
			});

			expectValidVertexCount(solid);
		});

		it('should create a bowl shape', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.arc(5, 5, 5);
				shape.lineTo(0, 5);
			});

			expectValidVertexCount(solid);
		});

		it('should create a vase shape', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(2, 0);
				shape.lineTo(3, 5);
				shape.lineTo(5, 10);
				shape.lineTo(4, 15);
				shape.lineTo(0, 15);
				shape.lineTo(0, 0);
			});

			expectValidVertexCount(solid);
		});

		it('should accept partial angle', () => {
			const full = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(5, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 10);
			});

			const half = Solid.revolutionSolid(
				(shape) => {
					shape.moveTo(0, 0);
					shape.lineTo(5, 0);
					shape.lineTo(5, 10);
					shape.lineTo(0, 10);
				},
				{ angle: 180 }
			);

			const fullVertices = full.getVertices();
			const halfVertices = half.getVertices();

			expect(halfVertices.length).toBeLessThan(fullVertices.length);
		});

		it('should accept color option', () => {
			const solid = Solid.revolutionSolid(
				(shape) => {
					shape.moveTo(0, 0);
					shape.lineTo(5, 0);
					shape.lineTo(5, 10);
					shape.lineTo(0, 10);
				},
				{ color: 'blue' }
			);

			expectValidVertexCount(solid);
		});

		it('should handle 90 degree revolution', () => {
			const solid = Solid.revolutionSolid(
				(shape) => {
					shape.moveTo(0, 0);
					shape.lineTo(5, 0);
					shape.lineTo(5, 10);
					shape.lineTo(0, 10);
				},
				{ angle: 90 }
			);

			expectValidVertexCount(solid);
		});

		it('should handle 270 degree revolution', () => {
			const solid = Solid.revolutionSolid(
				(shape) => {
					shape.moveTo(0, 0);
					shape.lineTo(5, 0);
					shape.lineTo(5, 10);
					shape.lineTo(0, 10);
				},
				{ angle: 270 }
			);

			expectValidVertexCount(solid);
		});

		it('should be transformable', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(5, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 10);
			}).rotate({ x: 90 });

			expectValidVertexCount(solid);
		});

		it('should work with CSG operations', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(5, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 10);
			});

			const cube = Solid.cube(3, 3, 3);
			const result = Solid.SUBTRACT(solid, cube);

			expectValidVertexCount(result);
		});
	});

	describe('revolutionSolidFromPoints()', () => {
		it('should create a revolution solid from points', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			expectValidVertexCount(solid);
		});

		it('should create cylinder from rectangular profile', () => {
			const points: [number, number][] = [
				[3, 0],
				[5, 0],
				[5, 10],
				[3, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			expectValidVertexCount(solid);
		});

		it('should create cone from triangular profile', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			expectValidVertexCount(solid);
		});

		it('should create sphere-like shape from arc points', () => {
			const points: [number, number][] = [
				[0, 0],
				[3, 1],
				[5, 5],
				[3, 9],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			expectValidVertexCount(solid);
		});

		it('should accept partial angle', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const full = Solid.revolutionSolidFromPoints(points);
			const half = Solid.revolutionSolidFromPoints(points, { angle: 180 });

			const fullVertices = full.getVertices();
			const halfVertices = half.getVertices();

			expect(halfVertices.length).toBeLessThan(fullVertices.length);
		});

		it('should accept color option', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points, { color: 'red' });
			expectValidVertexCount(solid);
		});

		it('should create hourglass shape', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[2, 5],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			expectValidVertexCount(solid);
		});

		it('should create bottle shape', () => {
			const points: [number, number][] = [
				[0, 0],
				[4, 0],
				[4, 8],
				[2, 9],
				[2, 12],
				[0, 12]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			expectValidVertexCount(solid);
		});

		it('should be transformable', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points).rotate({ y: 45 });
			expectValidVertexCount(solid);
		});

		it('should work with CSG operations', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			const hole = Solid.cylinder(2, 15);
			const result = Solid.SUBTRACT(solid, hole);

			expectValidVertexCount(result);
		});
	});

	describe('revolutionSolidFromPath()', () => {
		it('should create a revolution solid from path segments', () => {
			const path = [straight(5), straight(10), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should create cylinder from straight vertical segment', () => {
			const path = [straight(10)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should create shape with curve segments', () => {
			const path = [straight(5), curve(3, 90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should create rounded vase', () => {
			const path = [curve(2, 90), straight(10), curve(2, 90)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should create bowl with curved bottom', () => {
			const path = [straight(5), curve(5, 90), straight(3)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should handle negative curve angles', () => {
			const path = [straight(5), curve(3, -90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should handle zero radius curves (sharp corners)', () => {
			const path = [straight(5), curve(0, 90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should accept partial angle', () => {
			const path = [straight(5), curve(3, 90), straight(5)];
			const full = Solid.revolutionSolidFromPath(path);
			const half = Solid.revolutionSolidFromPath(path, { angle: 180 });

			const fullVertices = full.getVertices();
			const halfVertices = half.getVertices();

			expect(halfVertices.length).toBeLessThan(fullVertices.length);
		});

		it('should accept color option', () => {
			const path = [straight(5), curve(3, 90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path, { color: 'green' });

			expectValidVertexCount(solid);
		});

		it('should create glass shape', () => {
			const path = [curve(2, 90), straight(8), curve(1, -45), straight(2)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should create goblet shape', () => {
			const path = [straight(1), curve(2, 90), straight(5), curve(3, 90), straight(2)];
			const solid = Solid.revolutionSolidFromPath(path);

			expectValidVertexCount(solid);
		});

		it('should create complex profile with many segments', () => {
			const path = [
				straight(3),
				curve(1, 90),
				straight(2),
				curve(2, -45),
				straight(4),
				curve(2, 90),
				straight(3),
				curve(1, 90),
				straight(2)
			];

			const solid = Solid.revolutionSolidFromPath(path);
			expectValidVertexCount(solid);
		});

		it('should be transformable', () => {
			const path = [straight(5), curve(3, 90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path).rotate({ z: 45 });

			expectValidVertexCount(solid);
		});

		it('should work with CSG operations', () => {
			const path = [straight(5), curve(3, 90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path);
			const cube = Solid.cube(3, 3, 3);
			const result = Solid.UNION(solid, cube);

			expectValidVertexCount(result);
		});
	});

	describe('Revolution with Different Angles', () => {
		it('should create quarter revolution (90 degrees)', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points, { angle: 90 });
			expectValidVertexCount(solid);
		});

		it('should create half revolution (180 degrees)', () => {
			const path = [straight(5), curve(3, 90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path, { angle: 180 });

			expectValidVertexCount(solid);
		});

		it('should create three-quarter revolution (270 degrees)', () => {
			const solid = Solid.revolutionSolid(
				(shape) => {
					shape.moveTo(0, 0);
					shape.lineTo(5, 0);
					shape.lineTo(5, 10);
					shape.lineTo(0, 10);
				},
				{ angle: 270 }
			);

			expectValidVertexCount(solid);
		});

		it('should use different angles', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid90 = Solid.revolutionSolidFromPoints(points, { angle: 90 });
			const solid180 = Solid.revolutionSolidFromPoints(points, { angle: 180 });
			const solid270 = Solid.revolutionSolidFromPoints(points, { angle: 270 });

			expectValidVertexCount(solid90);
			expectValidVertexCount(solid180);
			expectValidVertexCount(solid270);
		});

		it('should compare full vs partial revolutions', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const full = Solid.revolutionSolidFromPoints(points, { angle: 360 });
			const quarter = Solid.revolutionSolidFromPoints(points, { angle: 90 });

			const fullVertices = full.getVertices();
			const quarterVertices = quarter.getVertices();

			// Quarter should have significantly fewer vertices
			expect(quarterVertices.length).toBeLessThan(fullVertices.length);
		});
	});

	describe('Revolution Integration with Other Features', () => {
		it('should align revolution solid', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points).align('bottom');
			const bounds = solid.getBounds();

			expectCloseTo(bounds.min.y, 0, 1);
		});

		it('should center revolution solid', () => {
			const path = [straight(5), curve(3, 90), straight(5)];
			const solid = Solid.revolutionSolidFromPath(path).center();

			const bounds = solid.getBounds();
			expectCloseTo(bounds.center.x, 0, 1);
			expectCloseTo(bounds.center.y, 0, 1);
			expectCloseTo(bounds.center.z, 0, 1);
		});

		it('should scale revolution solid', () => {
			const solid = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(5, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 10);
			}).scale({ all: 2 });

			expectValidVertexCount(solid);
		});

		it('should rotate revolution solid', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points).rotate({ x: 90 });
			expectValidVertexCount(solid);
		});

		it('should create grid of revolution solids', () => {
			const path = [straight(3), curve(2, 90), straight(2)];
			const solid = Solid.revolutionSolidFromPath(path);
			const grid = Solid.GRID_X(solid, { cols: 3, spacing: 2 });

			expectValidVertexCount(grid);
		});

		it('should combine revolution solids with CSG', () => {
			const vase = Solid.revolutionSolid((shape) => {
				shape.moveTo(2, 0);
				shape.lineTo(4, 0);
				shape.lineTo(5, 10);
				shape.lineTo(3, 10);
			});

			const lid = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 10);
				shape.lineTo(6, 10);
				shape.lineTo(6, 12);
				shape.lineTo(0, 12);
			});

			const result = Solid.UNION(vase, lid);
			expectValidVertexCount(result);
		});

		it('should hollow out revolution solid', () => {
			const outer = Solid.revolutionSolid((shape) => {
				shape.moveTo(0, 0);
				shape.lineTo(5, 0);
				shape.lineTo(5, 10);
				shape.lineTo(0, 10);
			});

			const inner = Solid.revolutionSolid((shape) => {
				shape.moveTo(1, 1);
				shape.lineTo(4, 1);
				shape.lineTo(4, 11);
				shape.lineTo(1, 11);
			});

			const result = Solid.SUBTRACT(outer, inner);
			expectValidVertexCount(result);
		});
	});
});
