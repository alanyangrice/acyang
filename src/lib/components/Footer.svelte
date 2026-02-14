<footer>
	<div class="container footer-inner">
		<span>Alan Yang &copy; {new Date().getFullYear()}</span>
	</div>
</footer>

<style>
	footer {
		margin-top: 4rem;
		padding: 2rem 0;
		border-top: 1px solid var(--border);
		background: rgba(250, 250, 250, 0.55);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		-webkit-mask-image:
			linear-gradient(to top, transparent, black 20%, black 100%),
			linear-gradient(to right, transparent, black 8%, black 92%, transparent);
		-webkit-mask-composite: destination-in;
		mask-image:
			linear-gradient(to top, transparent, black 20%, black 100%),
			linear-gradient(to right, transparent, black 8%, black 92%, transparent);
		mask-composite: intersect;
	}

	.footer-inner {
		text-align: center;
		font-size: 0.8rem;
		color: var(--text-muted);
	}
</style>
