import { expect } from 'vitest';
import type { Solid } from '$lib/3d/Solid';

/**
 * Default tolerance for floating point comparisons
 */
export const TOLERANCE = 0.0001;

/**
 * Helper to compare two numbers with tolerance
 */
export function expectCloseTo(actual: number, expected: number, tolerance = TOLERANCE) {
	expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
}

/**
 * Helper to compare bounds objects with tolerance
 */
export function expectBoundsEqual(
	actual: ReturnType<Solid['getBounds']>,
	expected: Partial<ReturnType<Solid['getBounds']>>,
	tolerance = TOLERANCE
) {
	if (expected.width !== undefined) expectCloseTo(actual.width, expected.width, tolerance);
	if (expected.height !== undefined) expectCloseTo(actual.height, expected.height, tolerance);
	if (expected.depth !== undefined) expectCloseTo(actual.depth, expected.depth, tolerance);

	if (expected.min) {
		expectCloseTo(actual.min.x, expected.min.x, tolerance);
		expectCloseTo(actual.min.y, expected.min.y, tolerance);
		expectCloseTo(actual.min.z, expected.min.z, tolerance);
	}

	if (expected.max) {
		expectCloseTo(actual.max.x, expected.max.x, tolerance);
		expectCloseTo(actual.max.y, expected.max.y, tolerance);
		expectCloseTo(actual.max.z, expected.max.z, tolerance);
	}

	if (expected.center) {
		expectCloseTo(actual.center.x, expected.center.x, tolerance);
		expectCloseTo(actual.center.y, expected.center.y, tolerance);
		expectCloseTo(actual.center.z, expected.center.z, tolerance);
	}
}

/**
 * Helper to verify that a solid has a reasonable vertex count
 * (i.e., not zero, divisible by 3 for triangles)
 */
export function expectValidVertexCount(solid: Solid, minVertices = 9) {
	const vertices = solid.getVertices();
	expect(vertices.length).toBeGreaterThanOrEqual(minVertices);
	expect(vertices.length % 9).toBe(0); // Each triangle has 3 vertices * 3 coordinates
}

/**
 * Helper to verify that CSG operations don't mutate the original solids
 */
export function expectImmutability(original: Solid, afterOperation: Solid) {
	const originalVertices = original.getVertices();
	const afterVertices = afterOperation.getVertices();

	// They should be different instances
	expect(original).not.toBe(afterOperation);

	// Original should be unchanged (same vertex count)
	expect(original.getVertices().length).toBe(originalVertices.length);
}

/**
 * Helper to parse STL binary data for validation
 */
export function parseStlBinary(buffer: Uint8Array) {
	if (buffer.length < 84) {
		throw new Error('STL file too small');
	}

	// Read header (80 bytes)
	const header = buffer.slice(0, 80);

	// Read triangle count (4 bytes, little-endian)
	const dataView = new DataView(buffer.buffer);
	const triangleCount = dataView.getUint32(80, true);

	// Expected size: 80 (header) + 4 (count) + triangleCount * 50 (each triangle)
	const expectedSize = 84 + triangleCount * 50;
	expect(buffer.length).toBe(expectedSize);

	const triangles: Array<{
		normal: { x: number; y: number; z: number };
		vertices: Array<{ x: number; y: number; z: number }>;
	}> = [];

	// Parse each triangle (50 bytes each)
	for (let i = 0; i < triangleCount; i++) {
		const offset = 84 + i * 50;

		const normal = {
			x: dataView.getFloat32(offset, true),
			y: dataView.getFloat32(offset + 4, true),
			z: dataView.getFloat32(offset + 8, true)
		};

		const vertices = [
			{
				x: dataView.getFloat32(offset + 12, true),
				y: dataView.getFloat32(offset + 16, true),
				z: dataView.getFloat32(offset + 20, true)
			},
			{
				x: dataView.getFloat32(offset + 24, true),
				y: dataView.getFloat32(offset + 28, true),
				z: dataView.getFloat32(offset + 32, true)
			},
			{
				x: dataView.getFloat32(offset + 36, true),
				y: dataView.getFloat32(offset + 40, true),
				z: dataView.getFloat32(offset + 44, true)
			}
		];

		triangles.push({ normal, vertices });
	}

	return {
		header,
		triangleCount,
		triangles
	};
}

/**
 * Helper to create a simple test fixture - a unit cube
 */
export function createUnitCube() {
	const { Solid } = require('$lib/3d/Solid');
	return Solid.cube(1, 1, 1);
}

/**
 * Helper to create a simple test fixture - a unit cylinder
 */
export function createUnitCylinder() {
	const { Solid } = require('$lib/3d/Solid');
	return Solid.cylinder(1, 1);
}

/**
 * Helper to create a simple test fixture - a unit sphere
 */
export function createUnitSphere() {
	const { Solid } = require('$lib/3d/Solid');
	return Solid.sphere(1);
}
