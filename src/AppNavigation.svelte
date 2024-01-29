<script lang="ts">
	import { Dropdown, DropdownItem, Navbar, NavBrand, NavLi, NavUl } from 'flowbite-svelte';
	import NavContainer from 'flowbite-svelte/NavContainer.svelte';
	import { createEventDispatcher } from 'svelte';

	import ChevronDown from '$components/icon/ChevronDown.svelte';
	import ChevronRight from '$components/icon/ChevronRight.svelte';
	import { getComponentStoreValue } from '$stores/componentStore';

	const dispatch = createEventDispatcher<{
		select: { name: string; vertices: Float32Array };
	}>();
</script>

<Navbar class="bg-gray-100">
	<NavContainer class="border w-3/5  px-5 py-2 rounded-lg bg-white">
		<NavBrand href="#">
			<img src="/pcb-board-32.png" class="me-3 h-6 sm:h-9" alt="PCB THT Holder Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold">CSG Builder</span>
		</NavBrand>
		<NavUl class="flex">
			{#if getComponentStoreValue().length}
				<NavLi class="cursor-pointer">
					Components<ChevronDown class="ms-2 text-primary-800 dark:text-white inline" />
				</NavLi>
				<Dropdown class="w-auto min-w-44 z-20">
					{#each getComponentStoreValue() as component}
						<DropdownItem
							on:click={() => {
								dispatch('select', { name: component.name, vertices: component.receiveData() });
							}}>{component.name}</DropdownItem
						>
					{/each}
				</Dropdown>
			{/if}
		</NavUl>
	</NavContainer>
</Navbar>
