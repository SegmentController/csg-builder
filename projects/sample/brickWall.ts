import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore';

import { context } from './_context';

const BW = 4;
const BH = 2;

export const brickWall = (width: number, height: number): BodySet => {
	const result = new BodySet(Body.fromCube(width, height, 2, 'red'));

	if (!context.draft)
		for (let h = -height / 2; h < height / 2; h += BH) {
			const lh = Body.fromCube(width, 0.2, 1, 'blue').y(h).z(1).setNegative();
			result.merge(lh);
			for (let w = -width / 2; w < width / 2; w += BW) {
				const lw = Body.fromCube(0.2, BH, 1, 'green')
					.x((h / BH) % 2 === 0 ? w : w + BW / 2)
					.y(h + BH / 2)
					.z(1)
					.setNegative();
				result.merge(lw);
			}
		}

	return result;
};

addToComponentStore({
	name: 'BrickWall',
	receiveData: () => brickWall(30, 20)
});
