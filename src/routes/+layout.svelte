<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import GameOfLife from '$lib/components/GameOfLife.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Your Name</title>
</svelte:head>

<GameOfLife />

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
