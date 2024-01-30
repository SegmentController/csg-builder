import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore';

import { box } from './box';
import { brickWall } from './brickWall';
import { sideWindow } from './sideWindow';

export const house = (): BodySet => {
	return new BodySet(box(), brickWall(20, 20), sideWindow(15, 30, 3));
};

addToComponentStore({
	name: '[Composed]',
	receiveData: () => house()
});
