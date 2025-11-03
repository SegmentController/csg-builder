import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import { cacheInlineFunction } from '$lib/cacheFunction';
import type { ComponentsMap } from '$stores/componentStore.svelte';

import { context } from './_context';
import { sideWindow } from './sideWindow';

const BRICK_WIDTH = 3;
const BRICK_HEIGHT = 1;
const BRICK_DEPTH = 2;
const BRICK_GAP_WIDTH = 0.2;
const BRICK_GAP_DEPTH = 0.2;

const brickItem = cacheInlineFunction('brickItem', (): Solid => {
	let result = Solid.cube(
		2 * BRICK_WIDTH + 2 * BRICK_GAP_WIDTH,
		2 * BRICK_HEIGHT + 2 * BRICK_GAP_WIDTH,
		BRICK_DEPTH - BRICK_GAP_DEPTH,
		'red'
	);

	if (context.production) {
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
	}

	return result;
});

export const brickWall = cacheInlineFunction(
	'brickWall',
	(cx: number, cy: number): Solid => Mesh.gridXY(brickItem(), { cols: cx, rows: cy }).toSolid()
);

export const centeredBrickWall = cacheInlineFunction(
	'centeredBrickWall',
	(cx: number, cy: number): Solid => brickWall(cx, cy).center()
);

export const brickWallWithWindow = cacheInlineFunction('brickWallWithWindow', (): Solid => {
	const wall = centeredBrickWall(6, 12);
	const window = sideWindow(15, 30, 3).move({ z: 0 }).center().scale({ x: 1.5, y: 0.3 });
	return Mesh.compose(wall, window).toSolid();
});

export const components: ComponentsMap = {
	BrickItem: () => brickItem(),
	BrickWall: () => brickWall(4, 4),
	BrickWallCentered: () => centeredBrickWall(4, 4),
	BrickWallWithWindow: () => brickWallWithWindow()
};
