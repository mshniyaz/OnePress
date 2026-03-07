<script>
	let { tabs = [], selected = $bindable(0) } = $props();
</script>

<div class="tabs">
	<div class="tab-container">
		{#each tabs as tab, i}
			<button
				class:selected={i === selected}
				onclick={() => {
					selected = i;
				}}
			>
				{tab}
			</button>
		{/each}
	</div>
</div>

<style>
	.tab-container {
		background-color: var(--content-accent-desc);
		padding: 4px;
		border-radius: 10px;
	}

	.tabs {
		display: flex;
		gap: 1rem;
	}

	button {
		background: none;
		border: none;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		cursor: pointer;
		color: var(--content-color);
		transition: background-color 0.2s;
	}

	button:first-child {
		border-radius: 10px 0 0 10px;
	}

	button:last-child {
		border-radius: 0 10px 10px 0;
	}

	button.selected {
		background-color: var(--content-accent);
	}

	button:hover {
	}
</style>
