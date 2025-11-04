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
		angle: Solid.DEG_90
	}).align('bottom');
};

export const cylinderHalf = (): Solid => {
	// Half cylinder (180 degrees)
	return Solid.cylinder(8, 10, {
		color: 'blue',
		angle: Solid.DEG_180
	}).align('bottom');
};

export const cylinderThreeQuarters = (): Solid => {
	// Three-quarter cylinder (270 degrees)
	return Solid.cylinder(8, 10, {
		color: 'green',
		angle: Solid.DEG_270
	}).align('bottom');
};

export const coneWedge = (): Solid => {
	// 180-degree cone wedge
	return Solid.cone(8, 12, {
		color: 'orange',
		angle: Solid.DEG_180
	}).align('bottom');
};

export const coneQuarter = (): Solid => {
	// 90-degree cone wedge
	return Solid.cone(8, 12, {
		color: 'purple',
		angle: Solid.DEG_90
	}).align('bottom');
};

export const hemisphere = (): Solid => {
	// Half sphere (180 degrees horizontal sweep)
	return Solid.sphere(8, {
		color: 'cyan',
		angle: Solid.DEG_180
	});
};

export const sphereQuarter = (): Solid => {
	// Quarter sphere (90 degrees)
	return Solid.sphere(8, {
		color: 'magenta',
		angle: Solid.DEG_90
	});
};

export const prismPartial = (): Solid => {
	// Partial hexagonal prism (180 degrees)
	return Solid.prism(6, 8, 10, {
		color: 'teal',
		angle: Solid.DEG_90
	}).align('bottom');
};

export const pieChart = (): Solid => {
	// Composite shape: pie chart with 3 slices
	const slice1 = Solid.cylinder(10, 2, {
		color: 'red',
		angle: 90
	});

	const slice2 = Solid.cylinder(10, 2, {
		color: 'blue',
		angle: 90
	}).rotate({ y: 120 });

	const slice3 = Solid.cylinder(10, 2, {
		color: 'green',
		angle: 90
	}).rotate({ y: 240 });

	return Mesh.union(slice1, slice2, slice3).toSolid().align('bottom');
};

export const partialGear = (): Solid => {
	// Create a partial gear using octagonal prism
	const outer = Solid.prism(8, 10, 4, {
		color: 'silver',
		angle: Solid.DEG_270
	});

	const innerHole = Solid.cylinder(5, 5, { color: 'silver' });

	return outer.subtract(innerHole).align('bottom');
};

// NEW: Custom profile prism demos

export const lBracket = (): Solid => {
	// L-shaped bracket using profilePrism with Shape builder API
	return Solid.profilePrism(
		3,
		(shape) => {
			shape.moveTo(0, 0);
			shape.lineTo(20, 0);
			shape.lineTo(20, 5);
			shape.lineTo(5, 5);
			shape.lineTo(5, 20);
			shape.lineTo(0, 20);
		},
		'blue'
	).align('bottom');
};

export const trapezoidPrism = (): Solid => {
	// Trapezoid using profilePrismFromPoints with coordinate array
	// Demonstrates auto-close feature: no need to repeat first point
	return Solid.profilePrismFromPoints(
		8,
		[
			[0, 0], // Start point
			[10, 0], // Bottom right
			[8, 5], // Top right
			[2, 5] // Top left
			// Auto-closes back to [0, 0]
		],
		'red'
	).align('bottom');
};

export const arrowShape = (): Solid => {
	// Arrow shape using profilePrismFromPoints
	return Solid.profilePrismFromPoints(
		4,
		[
			[0, 5], // Left middle (arrow tail start)
			[10, 5], // Arrow shaft top
			[10, 8], // Arrow head top
			[15, 4], // Arrow point
			[10, 0], // Arrow head bottom
			[10, 3], // Arrow shaft bottom
			[0, 3] // Left bottom (arrow tail end)
			// Auto-closes back to [0, 5]
		],
		'orange'
	)
		.align('bottom')
		.center({ x: true, z: true });
};

export const starPrism = (): Solid => {
	// 5-pointed star using profilePrism with Shape API
	// Demonstrates complex custom profiles
	return Solid.profilePrism(
		3,
		(shape) => {
			const outerRadius = 10;
			const innerRadius = 4;
			const points = 5;

			// Start at first outer point
			shape.moveTo(outerRadius * Math.cos(0), outerRadius * Math.sin(0));

			// Draw star by alternating between outer and inner points
			for (let index = 1; index <= points * 2; index++) {
				const angle = (index * Math.PI) / points;
				const radius = index % 2 === 0 ? outerRadius : innerRadius;
				shape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
			}
		},
		'gold'
	)
		.align('bottom')
		.center({ x: true, z: true });
};

export const tShapedBeam = (): Solid => {
	// T-shaped I-beam profile
	return Solid.profilePrismFromPoints(
		15,
		[
			[0, 0], // Bottom left of base
			[12, 0], // Bottom right of base
			[12, 2], // Top right of base
			[8, 2], // Right side of vertical section bottom
			[8, 10], // Right side of vertical section top
			[4, 10], // Left side of vertical section top
			[4, 2], // Left side of vertical section bottom
			[0, 2] // Top left of base
		],
		'gray'
	)
		.align('bottom')
		.center({ x: true, z: true });
};

export const customProfileWithHole = (): Solid => {
	// L-bracket with mounting hole
	const bracket = Solid.profilePrismFromPoints(
		5,
		[
			[0, 0],
			[25, 0],
			[25, 6],
			[6, 6],
			[6, 25],
			[0, 25]
		],
		'teal'
	)
		.align('bottom')
		.center({ x: true, z: true });

	// Add mounting holes
	const hole1 = Solid.cylinder(2, 7, { color: 'teal' })
		.move({ x: -9.5, y: 21.5 })
		.rotate({ x: 90 });
	const hole2 = Solid.cylinder(2, 7, { color: 'teal' }).move({ x: 9, y: 3 }).rotate({ x: 90 });

	return bracket.subtract(hole1).subtract(hole2);
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
	'Partial: Gear Section (270°)': () => partialGear(),
	// Custom profile prism demos
	'Custom: L-Bracket': () => lBracket(),
	'Custom: Trapezoid': () => trapezoidPrism(),
	'Custom: Arrow Shape': () => arrowShape(),
	'Custom: Star Prism': () => starPrism(),
	'Custom: T-Beam': () => tShapedBeam(),
	'Custom: Profile with Holes': () => customProfileWithHole()
};
