import { Solid } from '$lib/3d/Solid';
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

export const quarterChessPawn = (): Solid => {
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
		{ angle: 90, color: 'purple' }
	);
};

export const components: ComponentsMap = {
	'G. ShapeRevolution: Chess Pawn': chessPawn,
	'G. ShapeRevolution: Quarter Pawn': quarterChessPawn
};
