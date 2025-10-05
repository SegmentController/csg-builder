<script lang="ts">
	import { Button, Navbar, NavBrand, NavUl, Select, Toggle } from 'flowbite-svelte';
	import NavContainer from 'flowbite-svelte/NavContainer.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	import type { BodySet } from '$lib/3d/BodySet';
	import { getComponentStoreValue } from '$stores/componentStore';

	const dispatch = createEventDispatcher<{
		select: BodySet;
		download: void;
	}>();
	export let wireframe: boolean;

	onMount(() => {
		let hash = window.location.hash;
		if (hash.startsWith('#')) hash = hash.slice(1);

		if (hash) {
			hash = decodeURIComponent(hash);
			const sel = getComponentStoreValue().find((c) => c.name === hash);
			if (sel) selected = sel.name;
			change();
		}
	});

	let selected: string;
	let generateTimeMs = 0;
	let vertexCount = 0;
	const change = () => {
		const sel = getComponentStoreValue().find((c) => c.name === selected);
		if (sel) {
			const startTime = Date.now();
			const data = sel.receiveData();
			data.merge();
			vertexCount = data.getBodies()[0].getVertices().length / 9;
			generateTimeMs = Date.now() - startTime;

			window.location.href = `/#${sel.name}`;
			dispatch('select', data);
		}
	};
</script>

<Navbar class="bg-gray-100">
	<NavContainer class="border w-3/5 px-5 py-2 rounded-lg bg-white">
		<NavBrand href="#">
			<img class="me-3 h-6 sm:h-9" alt="CSG Builder" src="/favicon.png" />
			<span class="self-center whitespace-nowrap text-xl font-semibold">CSG Builder</span>
		</NavBrand>
		<NavUl>
			{#if getComponentStoreValue().length}
				<span class="my-auto text-xs"
					>{generateTimeMs} ms
					<br />
					{vertexCount} tr.
				</span>
				<Toggle id="wireframe" bind:checked={wireframe}>Wireframe</Toggle>
				<Select
					class="w-72"
					items={getComponentStoreValue().map((c) => ({ value: c.name, name: c.name }))}
					onchange={change}
					placeholder="Select model part..."
					size="lg"
					bind:value={selected}
				/>
				<Button onclick={() => dispatch('download')}>Download</Button>
			{/if}
		</NavUl>
	</NavContainer>
</Navbar>
