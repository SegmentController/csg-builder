import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

const BRICK_WIDTH = 3;
const BRICK_HEIGHT = 1;
const BRICK_DEPTH = 2;
const BRICK_GAP_WIDTH = 0.2;
const BRICK_GAP_DEPTH = 0.2;

const brickItem = (): Solid => {
	let result = Solid.cube(
		2 * BRICK_WIDTH + 2 * BRICK_GAP_WIDTH,
		2 * BRICK_HEIGHT + 2 * BRICK_GAP_WIDTH,
		BRICK_DEPTH - BRICK_GAP_DEPTH,
		'red'
	);

	const ROW_A_Y = BRICK_HEIGHT / 2 + BRICK_GAP_WIDTH;
	const ROW_B_Y = -BRICK_HEIGHT / 2;

	const full = Solid.cube(BRICK_WIDTH, BRICK_HEIGHT, BRICK_GAP_DEPTH).move({
		z: BRICK_DEPTH / 2
	});
	const half = Solid.cube(BRICK_WIDTH / 2, BRICK_HEIGHT, BRICK_GAP_DEPTH).move({
		z: BRICK_DEPTH / 2
	});

	const a1 = full.clone().move({
		x: -BRICK_WIDTH / 2,
		y: ROW_A_Y
	});
	const a2 = full.clone().move({
		x: BRICK_WIDTH / 2 + BRICK_GAP_WIDTH,
		y: ROW_A_Y
	});

	const b1 = half.clone().move({
		x: -BRICK_WIDTH / 2 - BRICK_WIDTH / 4 - BRICK_GAP_WIDTH,
		y: ROW_B_Y
	});
	const b2 = full.clone().move({
		x: 0,
		y: ROW_B_Y
	});
	const b3 = half.clone().move({
		x: BRICK_WIDTH / 2 + BRICK_WIDTH / 4 + BRICK_GAP_WIDTH,
		y: ROW_B_Y
	});

	result = result.union(a1, a2, b1, b2, b3);

	return result;
};

export const brickWall = (cx: number, cy: number): Solid =>
	Mesh.gridXY(brickItem(), { cols: cx, rows: cy }).toSolid();

export const window = (width: number, height: number, depth: number): Mesh => {
	const frame = Solid.cube(width, height, depth, 'brown');
	const BORDER = 2;

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

export const brickWallWithWindow = (): Solid => {
	const wall = brickWall(5, 7).center();

	const win = window(10, 14, 3).center().center();
	return Mesh.compose(wall, win).toSolid();
};

export const components: ComponentsMap = {
	'E. Wall: Brick Item': brickItem,
	'E. Wall: Brick Wall': () => brickWall(2, 2),
	'E. Wall: Window': () => window(15, 30, 3),
	'E. Wall: Brick Wall with Window': () => brickWallWithWindow()
};
