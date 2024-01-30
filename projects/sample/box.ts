import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore';

export const box = (): BodySet => {
	const result = new BodySet(Body.fromCube(10, 10, 10, 'blue'));

	const cyl = Body.fromCylinder(3, 30, 'red').rotateX(30).rotateY(30).rotateZ(30).setNegative();
	result.merge(cyl);
	result.append(cyl);

	return result;
};

addToComponentStore({
	name: 'Box',
	receiveData: () => box()
});
