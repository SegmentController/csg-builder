import { writeFloatLE, writeInt16LE, writeInt32LE } from '$lib/buffer';

export const getBinaryStlSizeKbFromVertices = (vertices: Float32Array) =>
	(80 + 4 + 50 * (vertices.length / 9)) / 1024;

export const generateBinaryStlFromVertices = (vertices: Float32Array): Uint8Array => {
	// Validate input: vertices array cannot be empty
	if (vertices.length === 0) throw new Error('Vertices array cannot be empty');

	// Validate input: vertices array must contain complete triangles (9 values per triangle)
	if (vertices.length % 9 !== 0) throw new Error('Vertices length must be divisible by 9');

	const buffer = new Uint8Array(80 + 4 + 50 * (vertices.length / 9));

	let pos = writeInt32LE(buffer, vertices.length / 9, 80);

	let index = 0;
	while (index < vertices.length) {
		// Write normal vector (calculated by slicer, set to zero)
		const NORMAL_COMPONENTS = 3;
		for (let pointIndex = 0; pointIndex < NORMAL_COMPONENTS; pointIndex++)
			pos = writeFloatLE(buffer, 0, pos);

		// Write triangle vertices (3 points, 3 coordinates each)
		// Transform Three.js coordinates to STL: (X, Y, Z) → (X, -Z, Y)
		for (let pointIndex = 0; pointIndex < 3; pointIndex++) {
			pos = writeFloatLE(buffer, vertices[index + 0], pos); // X coordinate
			pos = writeFloatLE(buffer, -vertices[index + 2], pos); // -Z coordinate (negated)
			pos = writeFloatLE(buffer, vertices[index + 1], pos); // Y coordinate
			index += 3;
		}

		// Write attribute byte count (unused, set to zero)
		pos = writeInt16LE(buffer, 0, pos);
	}

	return buffer;
};
