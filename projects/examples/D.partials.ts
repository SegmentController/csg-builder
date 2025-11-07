import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const cylinderPartial = (): Solid => {
	return Solid.cylinder(8, 10, { color: 'blue', angle: Solid.DEG_90 });
};

export const spherePartial = (): Solid => {
	return Solid.sphere(8, { color: 'green', angle: Solid.DEG_180 });
};

export const conePartial = (): Solid => {
	return Solid.cone(8, 12, { color: 'red', angle: Solid.DEG_270 });
};

export const components: ComponentsMap = {
	'D. Partials: Cylinder 90°': cylinderPartial,
	'D. Partials: Sphere 180°': spherePartial,
	'D. Partials: Cone 270°': conePartial
};
