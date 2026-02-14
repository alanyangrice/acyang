<script lang="ts">
	const navItems = [
		{ label: 'About', href: '#about' },
		{ label: 'Projects', href: '#projects' },
		{ label: 'Contact', href: '#contact' }
	];
</script>

<header>
	<div class="container header-inner">
		<a class="site-name" href="#top">Alan Yang</a>
		<nav>
			{#each navItems as item}
				<a href={item.href}>{item.label}</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	header {
		background: rgba(250, 250, 250, 0.55);
		backdrop-filter: blur(1px);
		-webkit-backdrop-filter: blur(1px);
		border-bottom: 1px solid var(--border);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 3.5rem;
	}

	.site-name {
		font-size: 1.1rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--text);
	}

	.site-name:hover {
		color: var(--accent);
	}

	nav {
		display: flex;
		gap: 1.5rem;
	}

	nav a {
		font-size: 0.9rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	nav a:hover {
		color: var(--text);
	}
</style>
