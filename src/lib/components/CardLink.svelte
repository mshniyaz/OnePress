<script>
	let {
		title = "title",
		desc = "desc",
		href = "/",
		color = "",
		isSelected = false,
		onclick = null,
		isCaseItem = false,
	} = $props();
</script>

<a class="card" {href} style:--content-accent={color}>
	<slot name="icon"/>
	<h2>{title}</h2>
	<p class="desc">{desc}</p>
</a>

<style>
	.card {
		background: var(--background-accent);
		/*border: 1px solid #333;*/
		border-radius: 0.75rem;
		padding: 2rem;
		width: 16rem;
		text-decoration: none;
		color: var(--content-color);
		border: 3px solid var(--background-accent);
		transition: 0.2s ease-in-out;
		display: flex;
		flex-direction: column;
		text-align: left;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
		border: 3px solid var(--content-accent);
	}

	:global(.lucide) {
		transition: 0.2s ease-in-out;
		color: var(--content-accent);
	}

	.card:hover :global(.lucide) {
		height: 44px;
		width: 44px;
	}

	.card h2 {
		margin: 10px 0px; /* remove top margin so it vertically centers with the icon */
		font-size: 1.5rem;
	}

	.card .desc {
		font-weight: 400;
		font-size: 0.9rem;
		color: var(--content-desc-color);
		margin: 0px;
	}
</style>
