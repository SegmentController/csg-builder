import type { Mesh } from '$lib/3d/Mesh';
import type { Solid } from '$lib/3d/Solid';

export type Component = {
	name: string;
	receiveData: () => Solid | Mesh;
};

export type ComponentsMap = Record<string, () => Solid | Mesh>;

// Module-level reactive state (Svelte 5 runes)
const components = $state<Component[]>([]);

// Direct access function
export const getComponentStoreValue = (): Component[] => components;

// Simplified add function (direct mutation)
export const addToComponentStore = (componentsMap: ComponentsMap) => {
	for (const [name, receiveData] of Object.entries(componentsMap)) {
		if (components.some((c) => c.name === name)) continue;
		components.push({ name, receiveData });
	}
	components.sort((a, b) => a.name.localeCompare(b.name));
};
