<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import FlowField from '$lib/components/simulations/FlowField.svelte';
	import Boids from '$lib/components/simulations/Boids.svelte';
	import GameOfLife from '$lib/components/simulations/GameOfLife.svelte';
	import favicon from '$lib/assets/ASCII_DNA_Helix.png';

	let { children } = $props();

	afterNavigate(({ to }) => {
		const hash = to?.url.hash;
		if (!hash) return;
		requestAnimationFrame(() => {
			document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
		});
	});

	// const backgrounds = ['flowfield', 'boids', 'gameoflife'] as const;
	// const selected = backgrounds[(Math.random() * backgrounds.length) | 0];
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
	}
</style>
