import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

import { ConnectorTower, CornerTower } from './tower';
import { Wall, WallWithGate } from './wall';

export const Castle = (): Solid => {
	const wallF = WallWithGate(100).clone();
	const cornerFL = CornerTower().clone().move({ x: -50 }).rotate({ y: 90 });
	const cornerFR = CornerTower().clone().move({ x: 50 }).rotate({ y: 180 });

	const wallL1 = Wall(150).clone().move({ x: -50, z: -75 }).rotate({ y: 90 });
	const connectorL = ConnectorTower().clone().move({ x: -50, z: -150 }).rotate({ y: 90 });
	const wallL2 = Wall(50)
		.clone()
		.move({ x: -50, z: -150 - 25 })
		.rotate({ y: 90 });

	const wallR1 = Wall(50).clone().move({ x: 50, z: -25 }).rotate({ y: 90 });
	const connectorR = ConnectorTower().clone().move({ x: 50, z: -50 }).rotate({ y: 90 });
	const wallR2 = Wall(150)
		.clone()
		.move({ x: 50, z: -50 - 75 })
		.rotate({ y: 90 });

	const wallR = Wall(100).clone().move({ z: -200 });
	const cornerRL = CornerTower().clone().move({ x: -50, z: -200 }).rotate({ y: 0 });
	const cornerRR = CornerTower().clone().move({ x: 50, z: -200 }).rotate({ y: -90 });

	return Solid.UNION(
		wallF,
		cornerFL,
		cornerFR,
		wallL1,
		connectorL,
		wallL2,
		wallR1,
		connectorR,
		wallR2,
		wallR,
		cornerRL,
		cornerRR
	);
};

export const components: ComponentsMap = {
	'X. Example: Whole Castle': () => Castle()
};
