import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const sphereDemo = (): Solid => Solid.sphere(8, 'green');

export const coneDemo = (): Solid => Solid.cone(6, 12, 'yellow').align('bottom');

export const cylinderDemo = (): Solid => Solid.cylinder(6, 12, 'red').align('bottom');

export const trianglePrismDemo = (): Solid => {
	return Solid.trianglePrism(6, 10, 'cyan').align('bottom');
};

export const hexagonalPrismDemo = (): Solid => {
	return Solid.prism(6, 6, 10, 'purple').align('bottom');
};

export const octagonalPrismDemo = (): Solid => {
	return Solid.prism(8, 6, 10, 'orange').align('bottom');
};

export const roundedCube = (): Solid => {
	// Demonstrate sphere subtraction for rounded corners
	const cube = Solid.cube(20, 20, 20, 'red').center();
	const corner1 = Solid.sphere(3, 'red').move({ x: 10, y: 10, z: 10 });
	const corner2 = Solid.sphere(3, 'red').move({ x: -10, y: 10, z: 10 });
	const corner3 = Solid.sphere(3, 'red').move({ x: 10, y: -10, z: 10 });
	const corner4 = Solid.sphere(3, 'red').move({ x: -10, y: -10, z: 10 });

	return cube.subtract(corner1).subtract(corner2).subtract(corner3).subtract(corner4);
};

export const chamferedBlock = (): Solid => {
	// Demonstrate cone subtraction for chamfered edges
	const block = Solid.cube(15, 15, 15, 'blue').center();
	const chamfer = Solid.cone(4, 8, 'blue').rotate({ x: 90 }).move({ z: 7.5 });

	return block.subtract(chamfer);
};

export const hexNut = (): Solid => {
	// Hexagonal nut using prism
	const outer = Solid.prism(6, 10, 5, 'gray').center();
	const hole = Solid.cylinder(4, 6, 'gray');

	return outer.subtract(hole);
};

export const complexShape = (): Solid => {
	// Combine multiple new primitives
	const base = Solid.cube(20, 4, 20, 'teal').align('bottom').center({ x: true, z: true });
	const sphere = Solid.sphere(8, 'teal').move({ y: 10 });
	const cone = Solid.cone(5, 10, 'teal').move({ y: 18 });
	const prismCut = Solid.trianglePrism(6, 30, 'teal').rotate({ z: 90, x: 90 });

	return Mesh.union(base, sphere, cone).toSolid().subtract(prismCut);
};

export const components: ComponentsMap = {
	'New: Sphere': () => sphereDemo(),
	'New: Cone': () => coneDemo(),
	'New: Cylinder': () => cylinderDemo(),
	'New: Triangle Prism': () => trianglePrismDemo(),
	'New: Hexagonal Prism': () => hexagonalPrismDemo(),
	'New: Octagonal Prism': () => octagonalPrismDemo(),
	'Example: Rounded Cube': () => roundedCube(),
	'Example: Chamfered Block': () => chamferedBlock(),
	'Example: Hex Nut': () => hexNut(),
	'Example: Complex Shape': () => complexShape()
};
