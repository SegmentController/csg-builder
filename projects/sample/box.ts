import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const box = (): BodySet => {
	const result = new BodySet(Body.fromCube(10, 10, 10, 'blue'));

	const cyl = Body.fromCylinder(3, 20, 'red').setNegative(false).rotate(0, 0, 0);
	//result.merge(cyl);
	result.append(cyl);

	return result;
};

export const components: ComponentsMap = {
	Box: () => box()
};
