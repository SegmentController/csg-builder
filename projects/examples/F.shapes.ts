import { curve, Solid, straight } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const arrow = (): Solid => {
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

export const star = (): Solid => {
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

export const lProfileWithHoles = (): Solid => {
	const lProfile = Solid.profilePrism(
		4,
		(shape) => {
			shape.moveTo(0, 0);
			shape.lineTo(10, 0);
			shape.lineTo(10, 3);
			shape.lineTo(3, 3);
			shape.lineTo(3, 10);
			shape.lineTo(0, 10);
			shape.lineTo(0, 0);
		},
		'gray'
	);

	const hole1 = Solid.cylinder(1, 5, { color: 'gray' }).at(2, 7, 2);
	const hole2 = Solid.cylinder(1, 5, { color: 'gray' }).at(7, 1.5, 2);

	return Solid.SUBTRACT(lProfile, hole1, hole2);
};

export const raceTrack = (): Solid => {
	return Solid.profilePrismFromPath(
		2,
		[
			straight(20), // Straightaway
			curve(5, 180), // Semicircle turn
			straight(20), // Back straightaway
			curve(5, 180) // Return semicircle
		],
		'green'
	);
};

export const components: ComponentsMap = {
	'F. Shapes: Arrow': arrow,
	'F. Shapes: Star': star,
	'F. Shapes: L Profile With Holes': lProfileWithHoles,
	'F. Shapes: Race Track': raceTrack
};
