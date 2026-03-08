<script>
	import favicon from "$lib/assets/favicon.svg";
	import { ArrowLeft } from "@lucide/svelte";

	let { children } = $props();
</script>

<nav id="topbar">
	<a href="/">
		<ArrowLeft color="#ffffff" />
	</a>
</nav>
{@render children()}

<style>
	#topbar {
		display: flex;
		height: 5vh;
		align-items: center;
		padding: 0px 10px;
		color: var(--content-accent);
	}

	a {
		display: flex;
		align-items: center; /* Vertical center */
		justify-content: center; /* Horizontal center */
		padding: 0px 10px;
		margin-right: 10px;
	}
</style>