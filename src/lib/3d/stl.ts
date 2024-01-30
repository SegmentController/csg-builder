import { writeFloatLE, writeInt16LE, writeInt32LE } from '$lib/buffer';

export const getBinaryStlSizeKbFromVertices = (verticesLength: number) =>
	Math.round((80 + 4 + 50 * (verticesLength / 9)) / 1024);

export const generateBinaryStlFromVertices = (vertices: Float32Array): Uint8Array => {
	const buffer = new Uint8Array(80 + 4 + 50 * (vertices.length / 9));

	let pos = writeInt32LE(buffer, vertices.length / 9, 80);
	if (vertices.length % 9 === 0) {
		let index = 0;
		while (index < vertices.length) {
			for (let pointIndex = 0; pointIndex < 3; pointIndex++) pos = writeFloatLE(buffer, 0, pos);
			for (let pointIndex = 0; pointIndex < 3; pointIndex++) {
				pos = writeFloatLE(buffer, vertices.at(index + 0)!, pos);
				pos = writeFloatLE(buffer, -vertices.at(index + 2)!, pos);
				pos = writeFloatLE(buffer, vertices.at(index + 1)!, pos);
				index += 3;
			}
			pos = writeInt16LE(buffer, 0, pos);
		}
	}

	return buffer;
};
