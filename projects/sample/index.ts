import { addToComponentStore } from '$stores/componentStore.svelte';

import { components as boxComponents } from './box';
import { components as brickComponents } from './brickWall';
import { components as windowComponents } from './sideWindow';

// Register all components from this project
addToComponentStore({
	...brickComponents,
	...boxComponents,
	...windowComponents
});
