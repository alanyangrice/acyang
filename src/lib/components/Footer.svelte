<footer>
	<div class="container footer-inner">
		<span class="copyright">Alan Yang / {new Date().getFullYear()}</span>
		<span class="footer-rule" aria-hidden="true">--------------------------------</span>
		<div class="footer-links">
			<a href="mailto:alan.c.yang@rice.edu">Email</a>
			<a href="https://github.com/alanyangrice" target="_blank" rel="noopener noreferrer">GitHub</a>
		</div>
	</div>
</footer>

<style>
	footer {
		margin-top: auto;
		padding: var(--space-md) 0 var(--space-lg);
		border-top: var(--rule);
		background: color-mix(in srgb, var(--color-paper) 88%, transparent);
	}

	.footer-inner {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-sm);
		color: var(--color-ink-3);
	}

	.copyright {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.footer-rule {
		overflow: hidden;
		color: var(--color-rule);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		white-space: nowrap;
	}

	.footer-links {
		display: flex;
		gap: var(--space-sm);
	}

	.footer-links a {
		font-size: var(--text-xs);
		color: var(--color-ink-3);
		text-decoration: none;
	}

	.footer-links a:hover {
		color: var(--color-ink);
	}

	@media (max-width: 480px) {
		.footer-inner {
			grid-template-columns: 1fr;
			align-items: flex-start;
			gap: var(--space-xs);
		}

		.footer-rule {
			width: 100%;
		}
	}
</style>
