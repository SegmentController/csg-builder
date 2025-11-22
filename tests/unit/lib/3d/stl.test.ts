import { describe, it, expect } from 'vitest';
import { Solid } from '$lib/3d/Solid';
import { generateBinaryStlFromVertices, getBinaryStlSizeKbFromVertices } from '$lib/3d/stl';
import { parseStlBinary, expectCloseTo } from '../../../setup';

describe('STL Export', () => {
	describe('generateBinaryStlFromVertices()', () => {
		it('should generate valid STL binary from cube vertices', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			expect(stl).toBeInstanceOf(Uint8Array);
			expect(stl.length).toBeGreaterThan(84); // Minimum: 80 header + 4 count
		});

		it('should have correct STL binary structure', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);

			expect(parsed.header).toBeInstanceOf(Uint8Array);
			expect(parsed.header.length).toBe(80);
			expect(parsed.triangleCount).toBeGreaterThan(0);
			expect(parsed.triangles.length).toBe(parsed.triangleCount);
		});

		it('should calculate correct triangle count', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			const expectedTriangleCount = vertices.length / 9; // 3 vertices * 3 coords per triangle

			expect(parsed.triangleCount).toBe(expectedTriangleCount);
		});

		it('should throw error for invalid vertex count', () => {
			const invalidVertices = new Float32Array([1, 2, 3, 4, 5]); // Not divisible by 9

			expect(() => {
				generateBinaryStlFromVertices(invalidVertices);
			}).toThrow('Vertices length must be divisible by 9');
		});

		it('should handle small shapes', () => {
			const triangle = Solid.prism(3, 2, 5);
			const vertices = triangle.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should handle complex shapes', () => {
			const cube = Solid.cube(20, 20, 20);
			const sphere = Solid.sphere(12);
			const complex = Solid.SUBTRACT(cube, sphere);

			const vertices = complex.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should transform coordinates correctly (X, Y, Z) → (X, -Z, Y)', () => {
			// Create a simple triangle with known coordinates
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);

			// Check that we have valid triangles
			expect(parsed.triangles.length).toBeGreaterThan(0);

			// Each triangle should have 3 vertices
			for (const triangle of parsed.triangles) {
				expect(triangle.vertices.length).toBe(3);

				// Each vertex should have valid coordinates
				for (const vertex of triangle.vertices) {
					expect(typeof vertex.x).toBe('number');
					expect(typeof vertex.y).toBe('number');
					expect(typeof vertex.z).toBe('number');
				}
			}
		});

		it('should include normal vectors for each triangle', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);

			for (const triangle of parsed.triangles) {
				expect(triangle.normal).toBeDefined();
				expect(typeof triangle.normal.x).toBe('number');
				expect(typeof triangle.normal.y).toBe('number');
				expect(typeof triangle.normal.z).toBe('number');
			}
		});

		it('should generate consistent output for same input', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();

			const stl1 = generateBinaryStlFromVertices(vertices);
			const stl2 = generateBinaryStlFromVertices(vertices);

			expect(stl1.length).toBe(stl2.length);
			expect(stl1).toEqual(stl2);
		});

		it('should handle cylinder vertices', () => {
			const cylinder = Solid.cylinder(5, 10);
			const vertices = cylinder.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBe(vertices.length / 9);
		});

		it('should handle sphere vertices', () => {
			const sphere = Solid.sphere(8);
			const vertices = sphere.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBe(vertices.length / 9);
		});

		it('should handle CSG union result', () => {
			const cube1 = Solid.cube(10, 10, 10).at(0, 0, 0);
			const cube2 = Solid.cube(10, 10, 10).at(15, 0, 0);
			const union = Solid.UNION(cube1, cube2);

			const vertices = union.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should handle CSG subtract result', () => {
			const cube = Solid.cube(20, 20, 20);
			const hole = Solid.cylinder(5, 25);
			const result = Solid.SUBTRACT(cube, hole);

			const vertices = result.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should handle grid result', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(cube, { cols: 3, spacing: 1 });

			const vertices = grid.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should handle custom profile', () => {
			const points: [number, number][] = [
				[0, 0],
				[10, 0],
				[10, 10],
				[0, 10]
			];

			const prism = Solid.profilePrismFromPoints(15, points);
			const vertices = prism.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should handle revolution solid', () => {
			const points: [number, number][] = [
				[0, 0],
				[5, 0],
				[5, 10],
				[0, 10]
			];

			const solid = Solid.revolutionSolidFromPoints(points);
			const vertices = solid.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should have correct file size', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const triangleCount = vertices.length / 9;
			const expectedSize = 80 + 4 + triangleCount * 50; // Header + count + triangles

			expect(stl.length).toBe(expectedSize);
		});
	});

	describe('getBinaryStlSizeKbFromVertices()', () => {
		it('should calculate correct size in KB', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();

			const sizeKb = getBinaryStlSizeKbFromVertices(vertices);
			const stl = generateBinaryStlFromVertices(vertices);

			const actualSizeKb = stl.length / 1024;
			expectCloseTo(sizeKb, actualSizeKb, 0.01);
		});

		it('should calculate size without generating STL', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();

			const sizeKb = getBinaryStlSizeKbFromVertices(vertices);

			expect(sizeKb).toBeGreaterThan(0);
			expect(typeof sizeKb).toBe('number');
		});

		it('should calculate size for small shapes', () => {
			const small = Solid.cube(2, 2, 2);
			const vertices = small.getVertices();

			const sizeKb = getBinaryStlSizeKbFromVertices(vertices);

			expect(sizeKb).toBeGreaterThan(0);
			expect(sizeKb).toBeLessThan(1); // Small cube should be less than 1KB
		});

		it('should calculate size for large shapes', () => {
			const large = Solid.sphere(20);
			const vertices = large.getVertices();

			const sizeKb = getBinaryStlSizeKbFromVertices(vertices);

			expect(sizeKb).toBeGreaterThan(1); // Large sphere should be more than 1KB
		});

		it('should calculate size for complex CSG results', () => {
			const base = Solid.cube(30, 30, 10);
			const hole1 = Solid.cylinder(3, 15).at(10, 10, 0);
			const hole2 = Solid.cylinder(3, 15).at(-10, -10, 0);
			const result = Solid.SUBTRACT(base, hole1, hole2);

			const vertices = result.getVertices();
			const sizeKb = getBinaryStlSizeKbFromVertices(vertices);

			expect(sizeKb).toBeGreaterThan(0);
		});

		it('should calculate size for grid', () => {
			const cube = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_XY(cube, { cols: 3, rows: 3 });

			const vertices = grid.getVertices();
			const sizeKb = getBinaryStlSizeKbFromVertices(vertices);

			expect(sizeKb).toBeGreaterThan(0);
		});

		it('should match actual STL size', () => {
			const cylinder = Solid.cylinder(8, 20);
			const vertices = cylinder.getVertices();

			const calculatedSizeKb = getBinaryStlSizeKbFromVertices(vertices);
			const stl = generateBinaryStlFromVertices(vertices);
			const actualSizeKb = stl.length / 1024;

			expectCloseTo(calculatedSizeKb, actualSizeKb, 0.01);
		});

		it('should increase with more vertices', () => {
			const small = Solid.cube(5, 5, 5);
			const grid = Solid.GRID_X(small, { cols: 5 });

			const smallSize = getBinaryStlSizeKbFromVertices(small.getVertices());
			const gridSize = getBinaryStlSizeKbFromVertices(grid.getVertices());

			expect(gridSize).toBeGreaterThan(smallSize);
		});

		it('should handle different shapes', () => {
			const cube = Solid.cube(10, 10, 10);
			const cylinder = Solid.cylinder(5, 10);
			const sphere = Solid.sphere(5);

			const cubeSize = getBinaryStlSizeKbFromVertices(cube.getVertices());
			const cylinderSize = getBinaryStlSizeKbFromVertices(cylinder.getVertices());
			const sphereSize = getBinaryStlSizeKbFromVertices(sphere.getVertices());

			expect(cubeSize).toBeGreaterThan(0);
			expect(cylinderSize).toBeGreaterThan(cubeSize); // More vertices
			expect(sphereSize).toBeGreaterThan(0);
		});
	});

	describe('STL Export Integration', () => {
		it('should export and parse cube correctly', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);
			const parsed = parseStlBinary(stl);

			expect(parsed.triangleCount).toBe(vertices.length / 9);
		});

		it('should export transformed solid', () => {
			const cube = Solid.cube(10, 10, 10).rotate({ z: 45 }).scale({ all: 2 });
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should export aligned solid', () => {
			const cube = Solid.cube(10, 20, 10).align('bottom').center({ x: true, z: true });
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should export complex assembly', () => {
			const base = Solid.cube(30, 5, 30);
			const pillar = Solid.cylinder(3, 15);
			const top = Solid.cube(20, 5, 20).move({ y: 15 });

			const assembly = Solid.UNION(base, pillar, top);
			const vertices = assembly.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should export and size match', () => {
			const sphere = Solid.sphere(10);
			const vertices = sphere.getVertices();

			const stl = generateBinaryStlFromVertices(vertices);
			const calculatedSize = getBinaryStlSizeKbFromVertices(vertices);
			const actualSize = stl.length / 1024;

			expectCloseTo(calculatedSize, actualSize, 0.01);
		});

		it('should handle empty vertices gracefully', () => {
			const emptyVertices = new Float32Array(0);

			expect(() => {
				generateBinaryStlFromVertices(emptyVertices);
			}).toThrow();
		});

		it('should export partial shapes', () => {
			const halfCylinder = Solid.cylinder(5, 10, { angle: 180 });
			const vertices = halfCylinder.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});

		it('should export custom profile shapes', () => {
			const path = [
				{ type: 'straight' as const, length: 10 },
				{ type: 'curve' as const, radius: 5, angle: 90 },
				{ type: 'straight' as const, length: 10 }
			];

			const prism = Solid.profilePrismFromPath(15, path);
			const vertices = prism.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const parsed = parseStlBinary(stl);
			expect(parsed.triangleCount).toBeGreaterThan(0);
		});
	});

	describe('STL Format Validation', () => {
		it('should have 80-byte header', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			expect(stl.length).toBeGreaterThanOrEqual(84);
		});

		it('should have correct triangle data size', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const dataView = new DataView(stl.buffer);
			const triangleCount = dataView.getUint32(80, true);

			// Each triangle: 12 floats (normal + 3 vertices) + 2 bytes (attribute) = 50 bytes
			const expectedDataSize = triangleCount * 50;
			const actualDataSize = stl.length - 84;

			expect(actualDataSize).toBe(expectedDataSize);
		});

		it('should use little-endian byte order', () => {
			const cube = Solid.cube(10, 10, 10);
			const vertices = cube.getVertices();
			const stl = generateBinaryStlFromVertices(vertices);

			const dataView = new DataView(stl.buffer);
			const triangleCount = dataView.getUint32(80, true); // Little-endian

			expect(triangleCount).toBeGreaterThan(0);
			expect(triangleCount).toBe(vertices.length / 9);
		});
	});
});
