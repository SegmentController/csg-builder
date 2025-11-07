import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const cube = (): Solid => {
	return Solid.cube(10, 10, 10, 'red');
};

export const cylinder = (): Solid => {
	return Solid.cylinder(5, 12, { color: 'blue' });
};

export const sphere = (): Solid => {
	return Solid.sphere(6, { color: 'green' });
};

export const cone = (): Solid => {
	return Solid.cone(6, 12, { color: 'orange' });
};

export const trianglePrism = (): Solid => {
	return Solid.trianglePrism(6, 12, { color: 'purple' });
};

export const hexagonalPrism = (): Solid => {
	return Solid.prism(6, 6, 12, { color: 'cyan' });
};

export const components: ComponentsMap = {
	'A. Solids: Cube': cube,
	'A. Solids: Cylinder': cylinder,
	'A. Solids: Sphere': sphere,
	'A. Solids: Cone': cone,
	'A. Solids: Triangle Prism': trianglePrism,
	'A. Solids: Hexagonal Prism': hexagonalPrism
};
