import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore.svelte';

const BORDER = 2;

export const sideWindow = (width: number, height: number, depth: number): BodySet => {
	const empty = Body.fromCube(
		width - BORDER * 2,
		height - BORDER * 2,
		depth * 4,
		'gray'
	).setNegative();
	const result = new BodySet(Body.fromCube(width, height, depth, 'brown'), empty).merge();

	//empty.y(3);

	result.append(
		empty,
		Body.fromCube(BORDER, height, depth - 1, 'brown').dZ(-0.5),
		Body.fromCube(width, BORDER, depth - 1, 'brown').dZ(-0.5)
	);

	return result;
};

addToComponentStore({
	SideWindow: () => sideWindow(15, 30, 3)
});
