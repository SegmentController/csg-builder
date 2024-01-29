<script lang="ts">
	import { Navbar, NavBrand, NavUl, Select, Toggle } from 'flowbite-svelte';
	import NavContainer from 'flowbite-svelte/NavContainer.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	import { getComponentStoreValue } from '$stores/componentStore';

	const dispatch = createEventDispatcher<{
		select: Float32Array;
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
	const change = () => {
		const sel = getComponentStoreValue().find((c) => c.name === selected);
		if (sel) {
			window.location.href = `/#${sel.name}`;
			dispatch('select', sel.receiveData());
		}
	};
</script>

<Navbar class="bg-gray-100">
	<NavContainer class="border w-3/5 px-5 py-2 rounded-lg bg-white">
		<NavBrand href="#">
			<img src="/favicon.png" class="me-3 h-6 sm:h-9" alt="CSG Builder" />
			<span class="self-center whitespace-nowrap text-xl font-semibold">CSG Builder</span>
		</NavBrand>
		<NavUl>
			{#if getComponentStoreValue().length}
				<Toggle id="wireframe" bind:checked={wireframe}>Wireframe</Toggle>
				<Select
					placeholder="Select model part..."
					size="lg"
					class="w-96"
					items={getComponentStoreValue().map((c) => ({ value: c.name, name: c.name }))}
					bind:value={selected}
					on:change={change}
				/>
			{/if}
		</NavUl>
	</NavContainer>
</Navbar>
