<section id="contact">
	<h2>Contact</h2>

	<div class="contact-panel">
		<p class="contact-lede">
			If you're building something interesting or just want to chat,
			<a href="mailto:alan.c.yang@rice.edu">reach out</a>.
		</p>

		<div class="links">
			<a href="mailto:alan.c.yang@rice.edu"><span>mail</span>alan.c.yang@rice.edu</a>
			<a href="https://github.com/alanyangrice" target="_blank" rel="noopener noreferrer">
				<span>github</span>github.com/alanyangrice
			</a>
			<a href="https://linkedin.com/in/achenyang" target="_blank" rel="noopener noreferrer">
				<span>linkedin</span>linkedin.com/in/achenyang
			</a>
			<a href="https://x.com/AlanYang6783" target="_blank" rel="noopener noreferrer">
				<span>twitter/x</span>x.com/AlanYang6783
			</a>
		</div>
	</div>
</section>

<style>
	#contact {
		padding-top: var(--space-md);
		padding-bottom: 0;
	}

	.contact-panel {
		padding: var(--space-lg);
		border: var(--rule);
		border-radius: var(--radius-md);
		background: var(--color-paper);
	}

	.contact-lede {
		color: var(--color-ink-2);
		font-size: var(--text-sm);
		line-height: 1.65;
	}

	.links {
		display: grid;
		gap: var(--space-xs);
		margin-top: var(--space-sm);
		padding-top: var(--space-sm);
		border-top: var(--rule);
	}

	.links a {
		display: grid;
		grid-template-columns: 5rem minmax(0, 1fr);
		align-items: baseline;
		gap: var(--space-sm);
		font-size: var(--text-sm);
		color: var(--color-ink-2);
		text-decoration: none;
		line-height: 1.35;
	}

	.links span {
		color: var(--color-ink-3);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		line-height: inherit;
	}

	.links a:hover {
		color: var(--color-ink);
		text-decoration: underline;
		text-decoration-color: var(--color-rule);
	}

	@media (max-width: 480px) {
		.contact-panel {
			padding: var(--space-md);
		}

		.links a {
			grid-template-columns: 4.75rem minmax(0, 1fr);
			gap: var(--space-xs);
		}
	}
</style>
