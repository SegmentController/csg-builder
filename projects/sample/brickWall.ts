import { Mesh } from '$lib/3d/Mesh';
import { Solid } from '$lib/3d/Solid';
import { cacheInlineFunction } from '$lib/cacheFunction';
import type { ComponentsMap } from '$stores/componentStore.svelte';

import { context } from './_context';
import { sideWindow } from './sideWindow';

const BW = 3;
const BH = 1;
const SEP_WIDTH = 0.2;
const SEP_DEPTH = 0.2;

export const brickItem = cacheInlineFunction(
	'brickItem',
	(width: number, height: number, depth: number): Solid => {
		let result = Solid.cube(width, height, depth, 'red');

		if (context.production) {
			let oddRow = false;
			for (let h = -height / 2; h < height / 2; h += BH) {
				const lh = Solid.cube(width, SEP_WIDTH, SEP_DEPTH, 'blue').move({
					y: h,
					z: depth / 2 - SEP_DEPTH / 2
				});
				result = result.subtract(lh);
				for (let w = -width / 2; w < width / 2; w += BW) {
					const lw = Solid.cube(SEP_WIDTH, BH, SEP_DEPTH, 'green').move({
						x: oddRow ? w : w + BW / 2,
						y: h + BH / 2,
						z: depth / 2 - SEP_DEPTH / 2
					});
					result = result.subtract(lw);
				}
				oddRow = !oddRow;
			}
		}

		return result;
	}
);

export const brickWall = cacheInlineFunction(
	'brickWall',
	(cx: number, cy: number): Solid => Mesh.array(brickItem(BW * 2, BH * 2, 1), cx, cy).toSolid()
);

export const centeredBrickWall = cacheInlineFunction(
	'centeredBrickWall',
	(cx: number, cy: number): Solid => brickWall(cx, cy).center()
);

export const brickWallWithWindow = cacheInlineFunction('brickWallWithWindow', (): Solid => {
	const wall = centeredBrickWall(4, 16);
	const window = sideWindow(15, 30, 3).move({ z: -1 }).center().scale({ x: 0.5, y: 0.3 });
	return Mesh.compose(wall, window).toSolid();
});

export const components: ComponentsMap = {
	BrickItem: () => brickItem(6, 2, 1),
	BrickWall: () => brickWall(4, 4),
	BrickWallCentered: () => centeredBrickWall(4, 4),
	BrickWallWithWindow: () => brickWallWithWindow()
};
