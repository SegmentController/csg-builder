import { Mesh } from '$lib/3d/Mesh';
import { addToComponentStore } from '$stores/componentStore';

import { box } from './box';

export const house = (): Mesh => {
	const mesh = box();

	const c = Mesh.fromCylinder(4, 30);
	mesh.sub(c);

	return mesh;
};

addToComponentStore({
	name: '[Composed]',
	receiveData: () => house().vertices
});
