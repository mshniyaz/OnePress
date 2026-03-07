<script>
	import { Activity, Mic, Grid, LayoutDashboard } from "@lucide/svelte";
	import CardLink from "./CardLink.svelte";
</script>

<div id="landing-page">
	<div class='navcontent'>
		<h1>
			<Activity strokeWidth="3" size="30" />
			OnePress
		</h1>
		<p class="tagline">
			AI-powered dashboard to process cases from the Button (PAB) is installed
			in HDB rental flats where seniors live alone or with other seniors.
		</p>

		<div class="cards">
			<CardLink
				href="./record"
				title="Record"
				desc="Simulate the red button and record audio to send to the 24/7 helpline"
                color='red'
			>
				<Mic slot="icon" size="40" color='red'/>
			</CardLink>

			<CardLink
				href="./dashboard"
				title="Dashboard"
				desc="View reports based on recordings"
			>
				<LayoutDashboard slot="icon" size="40"/>
			</CardLink>
		</div>
	</div>
</div>

<style>
	#landing-page {
        background-color: inherit;
        color: inherit;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center; /* center navcontent vertically */
		text-align: center;
	}

	.tagline {
		font-weight: 400;
		margin-top: 0.5rem;
		color: var(--background-desc-color);
		width: 100%;
	}

    h1 {
        color: var(--content-accent);
    }

	.cards {
		display: flex;
		gap: 2rem;
		margin-top: 3rem;
	}

	.navcontent {
		max-width: 40rem;
	}
</style>
