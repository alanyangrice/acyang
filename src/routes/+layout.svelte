<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Your Name</title>
</svelte:head>

<div id="top"></div>
<Header />
<main class="container">
	{@render children()}
</main>
<Footer />
