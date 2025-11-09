import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const union = (): Solid => {
	const cube1 = Solid.cube(10, 10, 10, 'blue');
	const cube2 = Solid.cube(10, 10, 10, 'blue').move({ x: 5, y: 5, z: -5 });

	return Solid.UNION(cube1, cube2);
};

export const subtract = (): Solid => {
	const base = Solid.cube(15, 15, 15, 'red');
	const hole = Solid.cylinder(4, 20, { color: 'red' }).rotate({ x: 90 });

	return Solid.SUBTRACT(base, hole);
};

export const intersect = (): Solid => {
	const sphere1 = Solid.sphere(8, { color: 'green' });
	const sphere2 = Solid.sphere(4, { color: 'green' }).move({ x: 6 });

	return Solid.INTERSECT(sphere1, sphere2);
};

export const components: ComponentsMap = {
	'B. Operations: Union': union,
	'B. Operations: Subtract': subtract,
	'B. Operations: Intersect': intersect
};
