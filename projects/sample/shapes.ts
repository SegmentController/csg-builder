import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const sphereDemo = (): Solid => Solid.sphere(8, { color: 'green' });

export const coneDemo = (): Solid => Solid.cone(6, 12, { color: 'yellow' }).align('bottom');

export const cylinderDemo = (): Solid => Solid.cylinder(6, 12, { color: 'red' }).align('bottom');

export const trianglePrismDemo = (): Solid => {
	return Solid.trianglePrism(6, 10, { color: 'cyan' }).align('bottom');
};

export const hexagonalPrismDemo = (): Solid => {
	return Solid.prism(6, 6, 10, { color: 'purple' }).align('bottom');
};

export const octagonalPrismDemo = (): Solid => {
	return Solid.prism(8, 6, 10, { color: 'orange' }).align('bottom');
};

export const roundedCube = (): Solid => {
	// Demonstrate sphere subtraction for rounded corners
	const cube = Solid.cube(20, 20, 20, 'red').center();
	const corner1 = Solid.sphere(3, { color: 'red' }).move({ x: 10, y: 10, z: 10 });
	const corner2 = Solid.sphere(3, { color: 'red' }).move({ x: -10, y: 10, z: 10 });
	const corner3 = Solid.sphere(3, { color: 'red' }).move({ x: 10, y: -10, z: 10 });
	const corner4 = Solid.sphere(3, { color: 'red' }).move({ x: -10, y: -10, z: 10 });

	return cube.subtract(corner1).subtract(corner2).subtract(corner3).subtract(corner4);
};

export const chamferedBlock = (): Solid => {
	// Demonstrate cone subtraction for chamfered edges
	const block = Solid.cube(15, 15, 15, 'blue').center();
	const chamfer = Solid.cone(4, 8, { color: 'blue' }).rotate({ x: 90 }).move({ z: 7.5 });

	return block.subtract(chamfer);
};

export const hexNut = (): Solid => {
	// Hexagonal nut using prism
	const outer = Solid.prism(6, 10, 5, { color: 'gray' }).center();
	const hole = Solid.cylinder(4, 6, { color: 'gray' });

	return outer.subtract(hole);
};

export const complexShape = (): Solid => {
	// Combine multiple new primitives
	const base = Solid.cube(20, 4, 20, 'teal').align('bottom').center({ x: true, z: true });
	const sphere = Solid.sphere(8, { color: 'teal' }).move({ y: 10 });
	const cone = Solid.cone(5, 10, { color: 'teal' }).move({ y: 18 });
	const prismCut = Solid.trianglePrism(6, 30, { color: 'teal' }).rotate({ z: 90, x: 90 });

	return Mesh.union(base, sphere, cone).toSolid().subtract(prismCut);
};

// NEW: Partial geometry demos using theta angles

export const cylinderPieSlice = (): Solid => {
	// 90-degree pie slice cylinder
	return Solid.cylinder(8, 10, {
		color: 'red',
		thetaStart: 0,
		thetaLength: Solid.DEG_90
	}).align('bottom');
};

export const cylinderHalf = (): Solid => {
	// Half cylinder (180 degrees)
	return Solid.cylinder(8, 10, {
		color: 'blue',
		thetaStart: 0,
		thetaLength: Solid.DEG_180
	}).align('bottom');
};

export const cylinderThreeQuarters = (): Solid => {
	// Three-quarter cylinder (270 degrees)
	return Solid.cylinder(8, 10, {
		color: 'green',
		thetaStart: 0,
		thetaLength: Solid.DEG_270
	}).align('bottom');
};

export const coneWedge = (): Solid => {
	// 180-degree cone wedge
	return Solid.cone(8, 12, {
		color: 'orange',
		thetaStart: 0,
		thetaLength: Solid.DEG_180
	}).align('bottom');
};

export const coneQuarter = (): Solid => {
	// 90-degree cone wedge
	return Solid.cone(8, 12, {
		color: 'purple',
		thetaStart: 0,
		thetaLength: Solid.DEG_90
	}).align('bottom');
};

export const hemisphere = (): Solid => {
	// Half sphere (180 degrees horizontal sweep)
	return Solid.sphere(8, {
		color: 'cyan',
		thetaStart: 0,
		thetaLength: Solid.DEG_180
	});
};

export const sphereQuarter = (): Solid => {
	// Quarter sphere (90 degrees)
	return Solid.sphere(8, {
		color: 'magenta',
		thetaStart: 0,
		thetaLength: 45
	});
};

export const prismPartial = (): Solid => {
	// Partial hexagonal prism (180 degrees)
	return Solid.prism(6, 8, 10, {
		color: 'teal',
		thetaStart: Solid.DEG_90,
		thetaLength: Solid.DEG_90
	}).align('bottom');
};

export const pieChart = (): Solid => {
	// Composite shape: pie chart with 3 slices
	const slice1 = Solid.cylinder(10, 2, {
		color: 'red',
		//thetaStart: 0,
		thetaLength: 180
	});

	// const slice2 = Solid.cylinder(10, 2, {
	// 	color: 'blue',
	// 	thetaStart: 120,
	// 	thetaLength: 90
	// });

	// const slice3 = Solid.cylinder(10, 2, {
	// 	color: 'green',
	// 	thetaStart: 240,
	// 	thetaLength: 90
	// });

	return Mesh.union(slice1).toSolid().align('bottom');
};

export const partialGear = (): Solid => {
	// Create a partial gear using octagonal prism
	const outer = Solid.prism(8, 10, 4, {
		color: 'silver',
		thetaStart: 0,
		thetaLength: Solid.DEG_270
	});

	const innerHole = Solid.cylinder(5, 5, { color: 'silver' });

	return outer.subtract(innerHole).align('bottom');
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
	'Example: Complex Shape': () => complexShape(),
	// Partial geometry demos
	'Partial: Cylinder Pie (90°)': () => cylinderPieSlice(),
	'Partial: Cylinder Half (180°)': () => cylinderHalf(),
	'Partial: Cylinder 3/4 (270°)': () => cylinderThreeQuarters(),
	'Partial: Cone Wedge (180°)': () => coneWedge(),
	'Partial: Cone Quarter (90°)': () => coneQuarter(),
	'Partial: Hemisphere (180°)': () => hemisphere(),
	'Partial: Sphere Quarter (90°)': () => sphereQuarter(),
	'Partial: Hexagonal Prism (180°)': () => prismPartial(),
	'Partial: Pie Chart (3 slices)': () => pieChart(),
	'Partial: Gear Section (270°)': () => partialGear()
};
