<script>
	import TabSelector from "$lib/components/TabSelector.svelte";
	import CaseView from "../../lib/components/CaseView.svelte";

	// Track currently selected tab for sidebar
	let currentTabIndex = $state(0);
	const tabs = ["Pending", "Resolved"];
	let currentTab = $derived(tabs[currentTabIndex]);

	// Track selected case
	let selectedCase = $state(null);

	// TODO: Implement actual database
	// fetch mock data and put it into reactive state
	import casesDataRaw from "./sampledata.json";
	let casesData = $state(casesDataRaw);

	// Subscribe to supabase data
	// import { supabase } from "$lib/supabaseClient";
	// import { onMount } from "svelte";

	// let casesData = $state([]);

	// onMount(async () => {
	// 	// 1. Get existing data so the dashboard isn't empty on refresh
	// 	const { data } = await supabase
	// 		.from("cases")
	// 		.select("*")
	// 		.order("timestamp", { ascending: false });
	// 	casesData = data || [];

	// 	// 2. Listen for NEW rows (the "INSERT" event)
	// 	const channel = supabase
	// 		.channel("schema-db-changes")
	// 		.on(
	// 			"postgres_changes",
	// 			{ event: "INSERT", schema: "public", table: "cases" },
	// 			(payload) => {
	// 				console.log("New case received!", payload.new);
	// 				// Add the new record to the top of your array
	// 				casesData = [payload.new, ...casesData];
	// 			},
	// 		)
	// 		.subscribe();

	// 	// Clean up connection when component unmounts
	// 	return () => supabase.removeChannel(channel);
	// });

	// Compute currently visible cases whenever the index or data changes
	let currCases = $derived(
		// Ensure casesData exists before filtering to avoid "undefined" errors
		(casesData || [])
			.filter((caseItem) => caseItem.status === tabs[currentTabIndex])
			// Sort descending (Priority 5 at the top)
			.sort((a, b) => b.priority - a.priority),
	);

	// Handle case selection
	const selectCase = (caseItem) => {
		selectedCase = caseItem;
	};

	// Handle mapping to colors based on priority
	function getPriorityColor(priority) {
		const colors = {
			1: "var(--priority-red)",
			2: "var(--priority-yellow)",
			3: "var(--priority-green)",
		};
		return colors[priority] || "var(--priority-unknown)";
	}
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
					<div
						class="case-item"
						class:selected={selectedCase?.id === caseItem.id}
						onclick={() => selectCase(caseItem)}
						style:--priority-color={getPriorityColor(caseItem.priority)}
					>
						<p class="case-name">{caseItem.name}</p>
						<p class="case-desc">{caseItem.timestamp}</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
	<div id="case-viewer">
		<CaseView caseData={selectedCase} />
	</div>
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
		border-left: 10px solid var(--priority-color);
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.case-item:last-child {
		border-bottom: var(--dashboard-border);
	}

	.case-item:hover {
		background-color: var(--background-accent);
	}

	.case-item.selected {
		background-color: var(--content-accent);
		color: var(--background-color);
	}

	.case-item.selected .case-name {
		color: var(--background-color);
	}

	.case-item.selected .case-desc {
		color: var(--background-color);
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
