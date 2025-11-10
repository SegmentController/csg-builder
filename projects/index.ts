import { addToComponentStore } from '$stores/componentStore';

import * as castle from './castle';
import * as examples from './examples';

addToComponentStore({
	...castle,
	...examples
});
