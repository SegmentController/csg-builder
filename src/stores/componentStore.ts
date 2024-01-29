import { get, writable } from 'svelte/store';

export type Component = {
    name: string,
    receiveData: () => Float32Array,
}

export const componentStore = writable<Component[]>([]);

export const getComponentStoreValue = (): Component[] => get(componentStore);
export const addToComponentStore = (component: Component) => componentStore.update((current) => {
    if (current.some(c => c.name === component.name)) return current;

    current.push(component);
    current.sort((a, b) => a.name.localeCompare(b.name));
    return current;
});
