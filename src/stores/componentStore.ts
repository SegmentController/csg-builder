import { get, writable } from 'svelte/store';

import type { BodySet } from '$lib/3d/BodySet';

export type Component = {
	name: string;
	receiveData: () => BodySet;
};

export const componentStore = writable<Component[]>([]);

export const getComponentStoreValue = (): Component[] => get(componentStore);
export const addToComponentStore = (component: Component) =>
	componentStore.update((current) => {
		if (current.some((c) => c.name === component.name)) return current;

		current.push(component);
		current.sort((a, b) => a.name.localeCompare(b.name));
		return current;
	});
