// Svelte wrapper for componentStore - provides reactivity for UI
// Imports from non-Svelte version to share the same component registry

import { getComponentsArray, setComponentsChangedCallback } from './componentStore';

// Re-export types
export type { Component, ComponentsMap } from './componentStore';

// Create reactive state that mirrors the base store
let components = $state<ReturnType<typeof getComponentsArray>>(getComponentsArray());

// Register callback to update reactive state when base store changes
setComponentsChangedCallback(() => {
	// Create a new reference to trigger Svelte reactivity
	components = [...getComponentsArray()];
});

// Reactive getter for UI components
export const getComponentStoreValue = () => components;

// Re-export addToComponentStore (it will trigger the callback automatically)

export { addToComponentStore } from './componentStore';
