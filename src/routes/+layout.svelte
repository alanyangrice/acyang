<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import favicon from '$lib/assets/ASCII_DNA_Helix.png';

	let { children } = $props();

	afterNavigate(({ to }) => {
		const hash = to?.url.hash;
		if (!hash) return;
		requestAnimationFrame(() => {
			document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="page-wrapper">
	<div id="top"></div>
	<Header />
	<main class="container">
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.page-wrapper {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-paper) 82%, transparent),
			var(--color-paper) 34rem
		);
	}

	@media (max-width: 760px) {
		.page-wrapper::before {
			top: 6rem;
			right: -7rem;
			opacity: 0.04;
		}
	}
</style>
