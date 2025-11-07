import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

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

export const cubeMinus = (): Solid => {
	const cube = Solid.cube(10, 10, 10, 'blue');
	const sphere = Solid.sphere(3, { angle: 180 }).move({ y: 5 }).setNegative();
	const sphere2 = sphere.clone().move({ y: 5 }).setNegative(false);

	return Mesh.union(cube, sphere, sphere2).toSolid();
};

export const components: ComponentsMap = {
	Box: () => box(),
	BoxAligned: () => alignedBox(),
	CubeMinus: () => cubeMinus()
};
