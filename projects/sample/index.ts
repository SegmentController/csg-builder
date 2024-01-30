import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore';

import { box } from './box';
import { brickWall } from './brickWall';

export const house = (): BodySet => {
	return new BodySet([box(), brickWall(20, 20)]);
};

addToComponentStore({
	name: '[Composed]',
	receiveData: () => house()
});
