import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

import { BOX, CYLINDER, MESH } from '$lib/3d/mesh';
import { addToComponentStore } from '$stores/componentStore';

export const box = (): Brush => {
	let mesh = MESH(BOX(10, 10, 5));
	//mesh.updateMatrixWorld();

	const circle = MESH(CYLINDER(0, 0));
	circle.updateMatrixWorld();

	const evaluator = new Evaluator();
	//mesh = evaluator.evaluate(mesh, circle, SUBTRACTION);

	return mesh;
};

addToComponentStore({
	name: 'Box',
	receiveData: () => new Float32Array(box().geometry.attributes['position'].array)
});
