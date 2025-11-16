import type { Solid } from '$lib/3d/Solid';

export type Component = {
	name: string;
	receiveData: () => Solid | Solid[];
};

export type ComponentsMap = Record<string, () => Solid | Solid[]>;

// Plain array without Svelte runes (for CLI and non-Svelte usage)
const components: Component[] = [];

// Export the array directly so Svelte version can reference it
export const getComponentsArray = () => components;

// Direct access function
export const getComponentStoreValue = (): Component[] => components;

// Callback for when components are added (used by Svelte version for reactivity)
let onComponentsChanged: (() => void) | undefined;

export const setComponentsChangedCallback = (callback: () => void) => {
	onComponentsChanged = callback;
};

// Simplified add function (direct mutation)
export const addToComponentStore = (componentsMap: ComponentsMap) => {
	for (const [name, receiveData] of Object.entries(componentsMap)) {
		if (components.some((c) => c.name === name)) continue;
		components.push({ name, receiveData });
	}
	components.sort((a, b) => a.name.localeCompare(b.name));

	// Notify Svelte wrapper if callback is set
	if (onComponentsChanged) onComponentsChanged();
};
