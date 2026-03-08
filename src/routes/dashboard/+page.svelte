<script>
	import TabSelector from "$lib/components/TabSelector.svelte";
	import CaseView from "../../lib/components/CaseView.svelte";
	import { supabase } from "$lib/supabaseClient";
	import { onMount } from "svelte";

	// Track currently selected tab for sidebar
	let currentTabIndex = $state(0);
	const tabs = ["Pending", "Resolved"];
	let currentTab = $derived(tabs[currentTabIndex]);

	// Track selected case
	let selectedCase = $state(null);

	// Fetch cases from Supabase
	let casesData = $state([]);

	onMount(async () => {
		const { data, error } = await supabase
			.from("cases")
			.select("*")
			.order("timestamp", { ascending: false });

		if (error) {
			console.error("Failed to fetch cases:", error.message);
		}
		casesData = data || [];

		// Listen for new inserts and updates in real-time
		const channel = supabase
			.channel("cases-realtime")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "cases" },
				(payload) => {
					casesData = [payload.new, ...casesData];
				},
			)
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "cases" },
				(payload) => {
					casesData = casesData.map((c) =>
						c.id === payload.new.id ? payload.new : c,
					);
					// Refresh selected case if it was updated
					if (selectedCase?.id === payload.new.id) {
						selectedCase = payload.new;
					}
				},
			)
			.subscribe();

		return () => supabase.removeChannel(channel);
	});

	// Compute currently visible cases whenever the index or data changes
	let currCases = $derived(
		// Ensure casesData exists before filtering to avoid "undefined" errors
		(casesData || [])
			.filter((caseItem) => caseItem.status === tabs[currentTabIndex])
			// Sort descending (Priority 5 at the top)
			.sort((a, b) => a.priority - b.priority),
	);

	$effect(() => {
		console.log(
			`[Dashboard] ${currCases.length} ${tabs[currentTabIndex]} cases:`,
			$state.snapshot(currCases),
		);
	});

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
			4: "var(--priority-unknown)",
		};
		return colors[priority] || "var(--priority-unknown)";
	}

	// Format timestamp to show time only in 24h format
	function formatTime(timestamp) {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes}`;
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
						<p class="case-desc">Submitted at {formatTime(caseItem.timestamp)}hrs</p>
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
