import { curve, Solid, straight } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const chessPawn = (): Solid => {
	return Solid.revolutionSolidFromPoints(
		[
			[0, 0], // Bottom center (x = radius, y = height)
			[2, 0], // Bottom edge
			[1.5, 1], // Narrow stem
			[1.5, 4], // Stem height
			[3, 6], // Body bulge
			[1.5, 8], // Neck
			[2.5, 10], // Head
			[0, 10] // Top center
		],
		{ color: 'white' }
	);
};

export const quarterVase = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(3), // Bottom radius
			curve(1, 45), // Rounded corner up
			straight(8), // Body height
			curve(2, 45), // Curve outward for rim
			straight(4) // Rim width
		],
		{ angle: 90, color: 'purple' }
	);
};

export const components: ComponentsMap = {
	'G. ShapeRevolution: Chess Pawn': chessPawn,
	'G. ShapeRevolution: Quarter Vase': quarterVase
};
