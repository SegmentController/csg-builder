import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const bottomAligned = (): Solid => {
	return Solid.cube(12, 15, 8, 'orange').align('bottom');
};

export const topAligned = (): Solid => {
	return Solid.cylinder(6, 18, { color: 'purple' }).align('top');
};

export const centered = (): Solid => {
	return Solid.sphere(7, { color: 'cyan' }).center();
};

export const components: ComponentsMap = {
	'C. Alignment: Bottom': bottomAligned,
	'C. Alignment: Top': topAligned,
	'C. Alignment: Center': centered
};
