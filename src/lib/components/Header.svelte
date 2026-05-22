<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ label: 'About', href: '/', index: '00' },
		{ label: 'Experience', href: '/experience', index: '01' },
		{ label: 'Projects', href: '/projects', index: '02' }
	];

	const isActive = (href: string) => {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	};
</script>

<header>
	<div class="container header-inner">
		<a class="site-name" href="/" aria-label="Alan Yang home">
			<span class="site-mark">AY</span>
			<span>Alan Yang</span>
		</a>
		<nav aria-label="Primary">
			{#each navItems as item}
				<a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
					<span class="nav-index">{item.index}</span>
					{item.label}
				</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	header {
		border-bottom: var(--rule);
		background: color-mix(in srgb, var(--color-paper) 92%, transparent);
		backdrop-filter: blur(10px);
	}

	.header-inner {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-sm);
		min-height: 3.5rem;
		padding-top: var(--space-sm);
		padding-bottom: var(--space-sm);
	}

	.site-name {
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-xs);
		font-size: var(--text-md);
		font-weight: 500;
		letter-spacing: -0.01em;
		text-decoration: none;
		color: var(--color-ink);
		white-space: nowrap;
	}

	.site-mark,
	.nav-index {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 400;
		letter-spacing: 0;
	}

	.site-mark {
		padding: 1px 5px;
		border: var(--rule);
		border-radius: var(--radius-xs);
		color: var(--color-ink-2);
	}

	.site-name:hover {
		text-decoration: none;
		color: var(--color-ink-2);
	}

	nav {
		display: flex;
		gap: var(--space-sm);
	}

	nav a {
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-3xs);
		font-size: var(--text-sm);
		color: var(--color-ink-2);
		text-decoration: none;
		line-height: 1;
		padding-block: var(--space-3xs);
		transition: color var(--dur-short) var(--ease-out);
	}

	nav a:hover {
		color: var(--color-ink);
	}

	nav a[aria-current='page'] {
		color: var(--color-ink);
		font-weight: 500;
	}

	.nav-index {
		color: var(--color-ink-3);
	}

	@media (max-width: 480px) {
		.header-inner {
			align-items: center;
			gap: var(--space-xs);
		}

		.site-name {
			gap: var(--space-3xs);
		}

		nav {
			gap: var(--space-xs);
		}

		.nav-index {
			display: none;
		}
	}
</style>
