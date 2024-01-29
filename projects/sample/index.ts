import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

import { CYLINDER, MESH } from '$lib/3d/mesh';
import { addToComponentStore } from '$stores/componentStore';

import { box } from './box';

export const house = (): Brush => {
	let mesh = box();
	mesh.updateMatrixWorld();

	const circle = MESH(CYLINDER(3.7, 30));
	circle.updateMatrixWorld();

	const evaluator = new Evaluator();
	mesh = evaluator.evaluate(mesh, circle, SUBTRACTION);

	return mesh;
};

addToComponentStore({
	name: 'Tiny house',
	receiveData: () => new Float32Array(house().geometry.attributes['position'].array)
});
