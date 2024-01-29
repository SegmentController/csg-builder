export type MeshDimensionInfo = {
	width: number;
	height: number;
	depth: number;
};

export type MeshInfo = {
	vertexArray: Float32Array;
	dimensions: MeshDimensionInfo;
};
