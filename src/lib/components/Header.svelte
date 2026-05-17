<script lang="ts">
	const navItems = [
		{ label: 'About', href: '/' },
		{ label: 'Experience', href: '/experience' },
		{ label: 'Projects', href: '/projects' }
	];
</script>

<header>
	<div class="container header-inner">
		<a class="site-name" href="/">Alan Yang</a>
		<nav>
			{#each navItems as item}
				<a href={item.href}>{item.label}</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	header {
		background: color-mix(in srgb, var(--bg) 55%, transparent);
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

	@media (max-width: 480px) {
		.site-name {
			font-size: 0.95rem;
		}

		nav {
			gap: 0.8rem;
		}

		nav a {
			font-size: 0.78rem;
		}
	}
</style>
