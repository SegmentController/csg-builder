import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore';

import { brickWall } from './brickWall';
import { sideWindow } from './sideWindow';

export const house = (): BodySet => {
	const result = new BodySet(brickWall(10, 18));

	for (let c = 0; c < 4; c++)
		result.append(
			sideWindow(15, 30, 3)
				.dX(c * 30 - 40)
				.dZ(0.5)
		);

	result.merge();

	return result;
};

addToComponentStore({
	name: '[Composed]',
	receiveData: () => house()
});
