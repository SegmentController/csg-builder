import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

const BORDER = 2;

export const sideWindow = (width: number, height: number, depth: number): Mesh => {
	const frame = Solid.cube(width, height, depth, 'brown');

	// Opening cuts the frame first (internal operation)
	const opening = Solid.cube(width - BORDER * 2, height - BORDER * 2, depth * 4, 'gray');
	const hollowFrame = frame.subtract(opening);

	// External negative hole that will cut through walls when window is placed
	const externalHole = Solid.cube(
		width - BORDER * 2,
		height - BORDER * 2,
		depth * 4,
		'gray'
	).setNegative();

	// Bars are added AFTER the negative hole
	const verticalBar = Solid.cube(BORDER, height, depth - 1, 'brown').move({ z: -0.5 });
	const horizontalBar = Solid.cube(width, BORDER, depth - 1, 'brown').move({ z: -0.5 });

	// CRITICAL ORDER: hollow frame, negative hole, then bars
	// This way bars are unioned AFTER the negative is processed
	return new Mesh(hollowFrame, externalHole, verticalBar, horizontalBar);
};

export const components: ComponentsMap = {
	SideWindow: () => sideWindow(15, 30, 3)
};
