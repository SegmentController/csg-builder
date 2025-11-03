import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const box = (): Solid => {
	const cube = Solid.cube(10, 10, 10, 'blue');
	const cyl = Solid.cylinder(3, 20, 'red').rotate(0, 0, 0);

	return Mesh.union(cube, cyl).toSolid();
};

export const components: ComponentsMap = {
	Box: () => box()
};
