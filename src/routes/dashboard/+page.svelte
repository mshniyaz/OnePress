<script>
	import TabSelector from "$lib/components/TabSelector.svelte";

	// Track currently selected tab for sidebar
	let currentTabIndex = $state(0);
	const tabs = ["Pending", "Resolved"];
	let currentTab = $derived(tabs[currentTabIndex]);

	// TODO: Implement actual database
	// fetch mock data and put it into reactive state
	import casesDataRaw from "./sampledata.json";
	let casesData = $state(casesDataRaw);

	// compute currently visible cases whenever the index or data changes
	let currCases = $derived(casesData.filter((caseItem) => caseItem.status === tabs[currentTabIndex]));
</script>

<div id="dashboard-page">
	<div id="sidebar">
		<div id="case-selector">
			<h1 class="mini-title">Case Queue</h1>
			<TabSelector bind:selected={currentTabIndex} {tabs} />
		</div>
		<div id="case-list">
			{#if currCases.length === 0}
				<p id="nocase-alert">No cases queued</p>
			{:else}
				{#each currCases as caseItem (caseItem.id)}
					<div class="case-item">
						<p class='case-name'>{caseItem.name}</p>
						<p class='case-desc'>{caseItem.timestamp}</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
	<div id="case-viewer"></div>
</div>

<style>
	#dashboard-page {
		min-height: 100vh;
		display: flex;
		flex-direction: row;
		/* Local Vars */
		--sidebar-width: 25vw;
	}

	#sidebar {
		border-right: var(--dashboard-border);
		min-height: 100vh;
		min-width: var(--sidebar-width);
	}

	#case-viewer {
		min-height: 100vh;
		min-width: calc(100vw - var(--sidebar-width));
	}

	#case-selector {
		min-height: 10vh;
		display: flex;
		flex-direction: column;
		padding: 0px 20px;
	}

	#nocase-alert {
		color: var(--background-desc-color);
		padding: 20px 0px;
		margin: 0px;
		border-top: var(--dashboard-border);
		text-align: center;
		font-weight: bold;
		font-size: 0.8em;
	}

	.mini-title {
		font-size: 1.1em;
		color: var(--content-accent);
	}

	.case-item {
		padding: 25px 20px;
		border-top: var(--dashboard-border);
		cursor: pointer;
	}

	.case-item:last-child {
		border-bottom: var(--dashboard-border);
	}

	.case-item:hover {
		background-color: var(--background-accent);
	}

	.case-name {
		font-weight: bold;
		margin: 0px;
	}

	.case-desc {
		font-size: 0.9em;
		color: var(--content-desc-color);
		margin: 5px 0px 0px 0px;
	}
</style>
