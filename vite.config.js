import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Make sure to run svelte preprocessor on these modules
	ssr: {
		noExternal: ['@lucide/svelte']
	},
});
