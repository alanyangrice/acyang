<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Boids from '$lib/components/Boids.svelte';
	import favicon from '$lib/assets/ASCII_DNA_Helix.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Alan Yang</title>
</svelte:head>

<Boids />

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
