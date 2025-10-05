import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import type { ComponentsMap } from '$stores/componentStore.svelte';

import { context } from './_context';

const BW = 3;
const BH = 1;
const SEP_WIDTH = 0.2;
const SEP_DEPTH = 0.2;

export const brickItem = (width: number, height: number, depth: number): BodySet => {
	const result = new BodySet(Body.fromCube(width, height, depth, 'red'));

	if (context.production) {
		let oddRow = false;
		for (let h = -height / 2; h < height / 2; h += BH) {
			const lh = Body.fromCube(width, SEP_WIDTH, SEP_DEPTH, 'blue')
				.setNegative()
				.dY(h)
				.dZ(depth / 2 - SEP_DEPTH / 2);
			result.merge(lh);
			for (let w = -width / 2; w < width / 2; w += BW) {
				const lw = Body.fromCube(SEP_WIDTH, BH, SEP_DEPTH, 'green')
					.setNegative()
					.dX(oddRow ? w : w + BW / 2)
					.dY(h + BH / 2)
					.dZ(depth / 2 - SEP_DEPTH / 2);
				result.merge(lw);
			}
			oddRow = !oddRow;
		}
	}

	return result;
};

export const brickWall = (cx: number, cy: number): BodySet => {
	return BodySet.array(brickItem(BW * 2, BH * 2, 1).getBodies()[0], cx, cy);
};

export const components: ComponentsMap = {
	BrickItem: () => brickItem(6, 2, 1),
	BrickWall: () => brickWall(4, 4)
};
