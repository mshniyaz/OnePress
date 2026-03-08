<script>
	import TabSelector from "$lib/components/TabSelector.svelte";
	import {
		Volume2,
		CircleQuestionMark,
		House,
		User,
		IdCard,
		Phone,
		CheckCircle,
		RotateCcw,
	} from "@lucide/svelte";
	import { supabase } from "$lib/supabaseClient";

	let { caseData } = $props();

	const getPriorityBadge = (priority) => {
		const badges = {
			1: { label: "P1 - Critical", color: "var(--priority-red)" },
			2: { label: "P2 - Medium", color: "var(--priority-yellow)" },
			3: { label: "P3 - Low", color: "var(--priority-green)" },
			4: { label: "P4 - Unknown", color: "var(--priority-unknown)" },
		};
		return (
			badges[priority] || { label: "Unknown", color: "var(--priority-unknown)" }
		);
	};

	const getStatusBadgeColor = (status) => {
		return status === "Pending" ? "pending" : "resolved";
	};

	// Tab selection for transcript view
	let currentTabIndex = $state(0);
	const tabs = ["Raw Transcript", "Eng Transcript"];

	const getTranscriptContent = $derived(() => {
		let caseTranscript;
		if (currentTabIndex === 0) {
			caseTranscript = caseData?.rawTranscript || "";
		} else {
			caseTranscript = caseData?.engTranscript || "";
		}

		// Check if empty
		if (!caseTranscript.trim()) {
			return "Transcript not available";
		} else {
			return caseTranscript;
		}
	});

	// Update the status of the case between resolved and pending
	const resolveCase = () => {
		caseData.status = "Resolved";
		supabase.from("cases").update({ status: "Resolved" }).eq("id", caseData.id);
	};

	const reopenCase = () => {
		caseData.status = "Pending";
		supabase.from("cases").update({ status: "Pending" }).eq("id", caseData.id);
	};
</script>

{#if caseData}
	<div id="case-view-container">
		<!-- Header with priority, tags, and impt details-->
		<div id="case-header">
			<div id="header-top">
				<h1>{caseData.name}</h1>
				{#if caseData.status === "Pending"}
					<button id="resolve-button" onclick={resolveCase}>
						<CheckCircle size={18} color="white" />
						Resolve Case
					</button>
				{:else if caseData.status === "Resolved"}
					<button id="reopen-button" onclick={reopenCase}>
						<RotateCcw size={18} color="white" />
						Reopen Case
					</button>
				{/if}
			</div>
			<div id="badge-container">
				<span class={`status-badge ${getStatusBadgeColor(caseData.status)}`}>
					{caseData.status}
				</span>
				<span
					class="priority-badge"
					style:background-color={getPriorityBadge(caseData.priority).color}
				>
					{getPriorityBadge(caseData.priority).label}
				</span>
				{#each caseData.tags as tag}
					<span class="tag-badge">{tag}</span>
				{/each}
			</div>
		</div>

		<div id="case-content">
			<!-- Patient info section-->
			<div id="patient-info">
				<h2 class="section-title">Patient Information</h2>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">
							<House size={16} color="var(--content-color)" />
							ADDRESS
						</span>
						<span class="info-value">{caseData.address}</span>
					</div>
					<div class="info-item">
						<span class="info-label">
							<User size={16} color="var(--content-color)" />
							AGE
						</span>
						<span class="info-value">{caseData.age}</span>
					</div>
					<div class="info-item">
						<span class="info-label">
							<IdCard size={16} color="var(--content-color)" />
							NRIC
						</span>
						<span class="info-value">{caseData.nric}</span>
					</div>
					<div class="info-item">
						<span class="info-label">
							<Phone size={16} color="var(--content-color)" />
							PHONE
						</span>
						<span class="info-value">{caseData.phone}</span>
					</div>
				</div>
			</div>

			<!-- Audio Recording section-->
			{#key caseData.id}
				{#if caseData.audio_url}
					<div id="audio-section">
						<h2 class="section-title">Audio Recording</h2>
						<audio controls style="width: 100%;">
							<source src={caseData.audio_url} type="audio/webm" />
							Your browser does not support the audio element.
						</audio>
					</div>
				{/if}
			{/key}

			<!-- Summary section -->
			<div id="summary-section">
				<h2 class="section-title">AI Summary</h2>
				<div id="ai-summary">
					<p>
						{caseData.aiSummary}
					</p>
				</div>
			</div>

			<!-- Transcript section -->
			<div id="transcript-section">
				<h2 class="section-title">Transcript</h2>
				<!-- Transcript Tabs -->
				{#if caseData.lang !== "English" && caseData.rawTranscript}
					<TabSelector bind:selected={currentTabIndex} {tabs} />
				{/if}

				<div id="transcript-content">
					<h3>Detected: {currentTabIndex === 0 ? caseData.lang : "English"}</h3>
					<p>{getTranscriptContent()}</p>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div id="no-case" class="mono">
		<CircleQuestionMark size={40} color='#fff'/>
		<p>Select a case to view details</p>
	</div>
{/if}

<style>
	#case-view-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
		background-color: var(--background-color);
	}

	#no-case {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--background-desc-color);
		font-size: 1.1em;
	}

	/* Case header styles */

	#case-header {
		padding: 30px;
		border-bottom: var(--dashboard-border);
		background-color: var(--background-accent);
	}

	#header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	#case-header h1 {
		margin: 0px;
		font-size: 2em;
	}

	#resolve-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.95em;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	#resolve-button:hover {
		background-color: #45a049;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	#reopen-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background-color: var(--priority-red);
		color: white;
		border: none;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.95em;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	#reopen-button:hover {
		filter: brightness(0.9);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	#badge-container {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.status-badge {
		padding: 5px 12px;
		border-radius: 4px;
		font-size: 0.85em;
		font-weight: bold;
		background-color: var(--background-color);
	}

	.status-badge.pending {
		color: #ff9500;
		border: 1px solid #ff9500;
	}

	.status-badge.resolved {
		color: #4caf50;
		border: 1px solid #4caf50;
	}

	.priority-badge {
		padding: 5px 12px;
		border-radius: 4px;
		font-size: 0.85em;
		font-weight: bold;
		color: white;
	}

	.tag-badge {
		padding: 5px 12px;
		border-radius: 4px;
		font-size: 0.85em;
		background-color: var(--content-accent);
		color: white;
	}

	#case-content {
		padding: 30px;
	}

	/* Patient info styles */

	#patient-info,
	#summary-section {
		border-bottom: var(--dashboard-border);
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 1.2em;
		margin: 0px 0px 15px 0px;
		color: var(--content-accent);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
		margin-bottom: 30px;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		border-left: 3px solid var(--content-accent);
		padding-left: 15px;
	}

	.info-label {
		font-size: 0.8em;
		color: var(--background-desc-color);
		text-transform: uppercase;
		display: flex;
		gap: 5px;
		letter-spacing: 1px;
		margin-bottom: 5px;
	}

	.info-value {
		font-size: 1.1em;
		font-weight: 500;
	}

	/* Audio Player */

	audio {
		width: 100%;
		margin-top: 10px;
	}

	#audio-section {
		padding-bottom: 30px;
		margin-bottom: 30px;
		border-bottom: 1px solid var(--background-accent);
	}

	/* AI Summary of transcript*/

	#ai-summary {
		display: flex;
		gap: 15px;
		padding: 20px;
		background-color: var(--background-accent);
		border-left: 4px solid #ff9500;
		border-radius: 4px;
		margin-bottom: 20px;
		align-items: flex-start;
	}

  #ai-summary .lucide {
    min-width: 1em;
    min-height: 1em;
  }

	#ai-summary p {
		margin: 0px;
		line-height: 1.6;
	}

	#transcript-tabs {
		display: flex;
		gap: 10px;
		margin: 20px 0px;
		border-bottom: 1px solid var(--background-accent);
	}

	/* Tab between raw and translated transcript */

	.tab-button {
		padding: 10px 20px;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--background-desc-color);
		border-bottom: 2px solid transparent;
		transition: all 0.3s ease;
	}

	.tab-button.active {
		color: var(--content-accent);
		border-bottom-color: var(--content-accent);
	}

	.tab-button:hover {
		color: var(--content-accent);
	}

	/* Transcript Content */

	#transcript-content {
		margin-top: 15px;
	}

	#transcript-content h3 {
		margin: 0px 0px 10px 0px;
		font-size: 0.95em;
		color: var(--background-desc-color);
	}

	#transcript-content p {
		line-height: 1.6;
		word-break: break-word;
	}

	@media (max-width: 1024px) {
		.info-grid {
			grid-template-columns: 1fr;
		}

		#case-header {
			padding: 20px;
		}

		#case-content {
			padding: 20px;
		}
	}
</style>
