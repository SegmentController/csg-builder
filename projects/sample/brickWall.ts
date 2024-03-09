import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore';

import { context } from './_context';

const BW = 4;
const BH = 2;

export const brickWall = (width: number, height: number): BodySet => {
	const result = new BodySet(Body.fromCube(width, height, 2, 'red'));

	if (context.production) {
		let oddRow = false;
		// for (let h = -height / 2; h < height / 2; h += BH) {
		// 	const lh = Body.fromCube(width, 0.4, 1, 'blue').setNegative().dY(h).dZ(1);
		// 	result.merge(lh);
		// 	// for (let w = -width / 2; w < width / 2; w += BW) {
		// 	// 	const lw = Body.fromCube(0.4, BH, 1, 'green')
		// 	// 		.setNegative()
		// 	// 		.dX(oddRow ? w : w + BW / 2)
		// 	// 		.dY(h + BH / 2)
		// 	// 		.dZ(1);
		// 	// 	result.merge(lw);
		// 	// }
		// 	oddRow = !oddRow;
		// }
	}

	return result;
};

addToComponentStore({
	name: 'BrickWall',
	receiveData: () => brickWall(125, 110)
});
