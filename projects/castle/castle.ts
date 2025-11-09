import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

import { ConnectorTower, CornerTower } from './tower';
import { Wall, WallWithGate } from './wall';

export const Castle = (): Solid => {
	const wall50 = Wall(50);
	const wall100 = Wall(100);
	const wall150 = Wall(150);
	const corner = CornerTower();
	const connector = ConnectorTower();

	const wallF = WallWithGate(100).clone();
	const cornerFL = corner.clone().move({ x: -50 }).rotate({ y: 90 });
	const cornerFR = corner.clone().move({ x: 50 }).rotate({ y: 180 });

	const wallL1 = wall150.clone().move({ x: -50, z: -75 }).rotate({ y: 90 });
	const connectorL = connector.clone().move({ x: -50, z: -150 }).rotate({ y: 90 });
	const wallL2 = wall50
		.clone()
		.move({ x: -50, z: -150 - 25 })
		.rotate({ y: 90 });

	const wallR1 = wall50.clone().move({ x: 50, z: -25 }).rotate({ y: 90 });
	const connectorR = connector.clone().move({ x: 50, z: -50 }).rotate({ y: 90 });
	const wallR2 = wall150
		.clone()
		.move({ x: 50, z: -50 - 75 })
		.rotate({ y: 90 });

	const wallR = wall100.clone().move({ z: -200 });
	const cornerRL = corner.clone().move({ x: -50, z: -200 }).rotate({ y: 0 });
	const cornerRR = corner.clone().move({ x: 50, z: -200 }).rotate({ y: -90 });

	return wallF.union(
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
	Castle: () => Castle()
};
