<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Global styles
	import '../lib/styles/global.css';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
