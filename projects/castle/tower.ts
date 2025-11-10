import { Solid } from '$lib/3d/Solid';
import { cacheInlineFunction } from '$lib/cacheFunction';
import type { ComponentsMap } from '$stores/componentStore';

import { TOWER, WALL } from './_const';
import { Wall } from './wall';

const Tower = (radius: number): Solid => {
	const tower = Solid.prism(8, radius, WALL.HEIGHT, { color: 'red' })
		.align('bottom')
		.rotate({ y: 22.5 });
	const footer = Solid.prism(8, radius + 2, WALL.WIDTH * 2)
		.align('bottom')
		.rotate({ y: 22.5 });
	const top = Solid.prism(8, radius + 4, WALL.HEIGHT / 2)
		.align('bottom')
		.move({ y: WALL.HEIGHT })
		.rotate({ y: 22.5 });

	const topInner = Solid.prism(8, radius + 3, WALL.HEIGHT / 2 + 1)
		.align('bottom')
		.move({ y: WALL.HEIGHT + 0.5 })
		.rotate({ y: 22.5 });
	let result = Solid.UNION(tower, footer, top);
	result = Solid.SUBTRACT(result, topInner);

	const window = Solid.cube(radius * 4, WALL.WIDTH * 2, WALL.WIDTH)
		.align('bottom')
		.move({ y: WALL.HEIGHT * 1.5 - WALL.WIDTH * 2 });
	for (let step = 0; step < 4; step++) {
		result = Solid.SUBTRACT(result, window);
		window.rotate({ y: 45 });
	}

	let cone = Solid.cone(radius + 4 + 2, WALL.HEIGHT / 2, { segments: 8 })
		.rotate({ y: 22.5 })
		.align('bottom');
	const coneInner = Solid.cone(radius + 4, WALL.HEIGHT / 2 + 2, { segments: 8 })
		.rotate({ y: 22.5 })
		.align('bottom');
	cone = Solid.SUBTRACT(cone, coneInner).move({ y: WALL.HEIGHT + WALL.HEIGHT / 2 });

	result = Solid.UNION(result, cone);

	return result.align('bottom');
};

export const CornerTower = cacheInlineFunction('CornetTower', (): Solid => {
	let tower = Tower(TOWER.CORNER_RADIUS);

	const wall = Wall(20, { includeFootPath: true })
		.align('left')
		.move({ x: TOWER.CORNER_RADIUS - 2 });
	tower = Solid.SUBTRACT(tower, wall);

	const wall2 = Wall(20, { includeFootPath: true })
		.align('right')
		.rotate({ y: 90 })
		.move({ z: TOWER.CORNER_RADIUS - 2 });
	tower = Solid.SUBTRACT(tower, wall2);

	return tower;
});

export const ConnectorTower = cacheInlineFunction('ConnectorTower', (): Solid => {
	let tower = Tower(TOWER.CONNECTOR_RADIUS);

	const wall = Wall(20, { includeFootPath: true })
		.align('left')
		.move({ x: TOWER.CONNECTOR_RADIUS - 2 });
	tower = Solid.SUBTRACT(tower, wall);

	const wall2 = Wall(20, { includeFootPath: true })
		.align('right')
		.move({ x: -TOWER.CONNECTOR_RADIUS + 2 });
	tower = Solid.SUBTRACT(tower, wall2);

	return tower;
});

export const components: ComponentsMap = {
	'X. Example: Corner Tower 10': () => CornerTower(),
	'X. Example: Connector Tower 10': () => ConnectorTower()
};
