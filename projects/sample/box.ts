import { Mesh } from '$lib/3d/Mesh';
import { addToComponentStore } from '$stores/componentStore';

export const box = (): Mesh => {
	return Mesh.fromCube(10, 10, 10);
};

addToComponentStore({
	name: 'Wall',
	receiveData: () => box().vertices
});
