<script lang="ts">
	import { Button, Navbar, NavBrand, NavUl, Select, Toggle } from 'flowbite-svelte';
	import NavContainer from 'flowbite-svelte/NavContainer.svelte';
	import { onMount } from 'svelte';

	import { Solid } from '$lib/3d/Solid';
	import type { CameraState } from '$lib/urlState';
	import { parseCameraFromURL, parseComponentFromURL, updateURLHash } from '$lib/urlState';
	import { getComponentStoreValue } from '$stores/componentStore.svelte';

	type Properties = {
		wireframe: boolean;
		saveCameraToUrl: boolean;
		onselect?: (name: string, data: Solid | Solid[]) => void;
		ondownload?: () => void;
		oncamerastate?: (state: CameraState | undefined) => void;
	};

	let {
		wireframe = $bindable(),
		saveCameraToUrl = $bindable(),
		onselect,
		ondownload,
		oncamerastate
	}: Properties = $props();

	onMount(() => {
		// Parse component name from URL
		const componentName = parseComponentFromURL();
		if (componentName) {
			const sel = getComponentStoreValue().find((c) => c.name === componentName);
			if (sel) {
				selected = sel.name;
			}
		}

		// Parse camera state from URL and pass to parent
		const cameraState = parseCameraFromURL();

		// If URL contains camera params, enable the toggle
		if (cameraState) {
			saveCameraToUrl = true;
		}

		oncamerastate?.(cameraState);

		// Trigger initial load if component found
		if (componentName) {
			loadComponent(true); // Pass true to skip URL update and preserve camera params
		}
	});

	let selected = $state<string>();
	let generateTimeMs = $state(0);
	let faceCount = $state(0);
	let dimension = $state({ width: 0, height: 0, depth: 0 });

	const loadComponent = (skipUrlUpdate = false) => {
		const sel = getComponentStoreValue().find((c) => c.name === selected);
		if (sel) {
			const startTime = Date.now();
			const data = sel.receiveData();
			// Handle both Solid and Mesh
			const solid = Array.isArray(data) ? Solid.MERGE(data) : data;
			faceCount = solid.getVertices().length / 9;
			dimension = solid.getBounds();
			generateTimeMs = Date.now() - startTime;

			// Update URL without camera params (resets camera to default)
			// Skip URL update on initial load to preserve camera params from URL
			if (!skipUrlUpdate) {
				updateURLHash(sel.name);
			}
			onselect?.(sel.name, data);
		}
	};

	// Event handler for dropdown change
	const change = () => {
		loadComponent(false);
	};
</script>

<Navbar class="bg-gray-100">
	<NavContainer class="border w-4/5 px-5 py-2 rounded-lg bg-white border-gray-200">
		<NavBrand href="#">
			<img class="me-3 h-8 sm:h-18" alt="CSG Builder" src="favicon.png" />
			<span class="self-center whitespace-nowrap text-xl font-semibold">CSG Builder</span>
		</NavBrand>
		<NavUl>
			{#if getComponentStoreValue().length}
				<span class="my-auto text-xs">
					{dimension.width} x {dimension.height} x {dimension.depth}
					<br />
					{faceCount.toLocaleString()} faces
					<br />
					{generateTimeMs} ms
				</span>
				<span class="flex flex-col gap-2">
					<Toggle id="wireframe" class="ml-4" bind:checked={wireframe}>Wireframe</Toggle>
					<Toggle id="saveCameraToUrl" class="ml-4" bind:checked={saveCameraToUrl}
						>Save camera</Toggle
					>
				</span>
				<Select
					class="w-72 ml-4"
					items={getComponentStoreValue().map((c) => ({ value: c.name, name: c.name }))}
					onchange={change}
					placeholder="Select model part..."
					size="lg"
					bind:value={selected}
				/>
				<Button class="ml-4" onclick={() => ondownload?.()}>Download</Button>
			{/if}
		</NavUl>
	</NavContainer>
</Navbar>
