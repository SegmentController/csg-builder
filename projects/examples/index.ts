import { addToComponentStore } from '$stores/componentStore';

import { components as solidsComponents } from './A.solids';
import { components as operationsComponents } from './B.operations';
import { components as alignmentComponents } from './C.alignment';
import { components as partialsComponents } from './D.partials';
import { components as wallAndWindowComponents } from './E.wallAndWindow';
import { components as shapesComponents } from './F.shapes';
import { components as revolutionComponents } from './G.revolution';

addToComponentStore({
	...solidsComponents,
	...operationsComponents,
	...alignmentComponents,
	...partialsComponents,
	...wallAndWindowComponents,
	...shapesComponents,
	...revolutionComponents
});
