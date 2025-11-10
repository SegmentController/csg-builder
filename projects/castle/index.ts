import { addToComponentStore } from '$stores/componentStore';

import { components as castleComponents } from './castle';
import { components as towerComponents } from './tower';
import { components as wallComponents } from './wall';

addToComponentStore({
	...wallComponents,
	...towerComponents,
	...castleComponents
});
