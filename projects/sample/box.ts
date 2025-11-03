import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const box = (): Solid => {
	const cube = Solid.cube(10, 10, 10, 'blue');
	const cyl = Solid.cylinder(3, 20, { color: 'red' });

	return Mesh.union(cube, cyl).toSolid();
};

export const alignedBox = (): Solid => {
	const cube = Solid.cube(10, 10, 10, 'blue');
	const cyl = Solid.cylinder(3, 20, { color: 'red' });

	// Align to bottom (sitting on Y=0 plane)
	return Mesh.union(cube, cyl).toSolid().align('bottom');
};

export const components: ComponentsMap = {
	Box: () => box(),
	BoxAligned: () => alignedBox()
};
