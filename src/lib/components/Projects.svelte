<script lang="ts">
	import { fly } from 'svelte/transition';
	import checkersGameplay from '$lib/assets/checkersrl-gameplay.gif';
	import tinyGptResults from '$lib/assets/tinygpt-results.png';

	const projects = [
		{
			name: 'Checkers Reinforcement Learning',
			pitch: 'MCTS & PPO self-play · League Training',
			description: 'Fully playable checkers game with four RL training pipelines: PPO self-play with curriculum learning and league play against opponent pools, and two AlphaZero MCTS variants using scalar value and win/draw/loss heads.',
			tags: ['PyTorch', 'Python', 'CUDA', 'NumPy'],
			mediaLabel: 'Demo GIF of agent gameplay',
			media: checkersGameplay,
			links: [
				{ label: 'Code', url: 'https://github.com/alanyangrice/checkers-rl', icon: 'github' },
				{ label: 'Demo', url: 'https://www.checkers-rl.com', icon: 'external' }
			]
		},
		{
			name: 'Tiny GPT',
			pitch: 'LLaMA architecture · Attention Residuals',
			description: 'A GPT language model built from scratch in PyTorch using Moonshot AI\'s Attention Residuals to replace standard residual connections. Features a LLaMA-style architecture (RoPE, RMSNorm, SwiGLU, GQA) and supports zero-disk HuggingFace dataset streaming.',
			tags: ['PyTorch', 'Python', 'LLMs', 'Transformers'],
			mediaLabel: 'Screenshot of training curves',
			media: tinyGptResults,
			links: [{ label: 'Code', url: 'https://github.com/alanyangrice/tiny-gpt', icon: 'github' }]
		},
		{
			name: 'Missile Defense World Model',
			pitch: 'VAE + MDN-RNN · Dream Rollouts',
			description: 'A Gymnasium missile defense simulator to train a Ha and Schmidhuber-style World Model: full-resolution rollout collection, VAE frame encoding, MDN-RNN latent dynamics with reward prediction, and a CMA-ES controller planned for imagined rollouts.',
			tags: ['PyTorch', 'Python', 'Gymnasium', 'Pygame'],
			mediaLabel: 'Radar environment or dream rollout screenshot',
			links: [{ label: 'Code', url: 'https://github.com/alanyangrice/irondome-wm', icon: 'github' }]
		},
		{
			name: 'Realtime Crypto Market Data Websocket',
			pitch: 'Low-latency Rust · multi-venue ingestion',
			description: 'Low-latency Rust service that ingests real-time crypto market data from multiple venues, computes derived analytics, and persists everything to a Parquet data lake and Redis hot-state cache.',
			tags: ['Rust', 'Tokio', 'Parquet', 'Redis'],
			mediaLabel: 'Architecture diagram or terminal screenshot',
			links: [
				{ label: 'Code', url: 'https://github.com/alanyangrice/crypto-websocket', icon: 'github' }
			]
		}
	];

	let selectedIndex = $state(0);
	let selected = $derived(projects[selectedIndex]);

	const selectProject = (index: number) => {
		selectedIndex = index;
	};

	const previousProject = () => {
		selectedIndex = (selectedIndex - 1 + projects.length) % projects.length;
	};

	const nextProject = () => {
		selectedIndex = (selectedIndex + 1) % projects.length;
	};
</script>

<section id="projects">
	<h2>PROJECTS</h2>

	<div class="projects-carousel" aria-live="polite">
		{#key selected.name}
			<article class="project-card" in:fly={{ y: 6, duration: 250 }}>
				<div class="project-media" aria-label={selected.mediaLabel}>
					{#if selected.media}
						<img src={selected.media} alt={selected.mediaLabel} />
					{:else}
						<span>{selected.mediaLabel}</span>
					{/if}
				</div>

				<a
					href={selected.links[0].url}
					target="_blank"
					rel="noopener noreferrer"
					class="project-title"
				>
					{selected.name}
				</a>
				<p class="project-pitch">{selected.pitch}</p>
				<p class="project-desc">{selected.description}</p>

				<div class="project-tags" aria-label={`${selected.name} technologies`}>
					{#each selected.tags as tag}
						<span>{tag}</span>
					{/each}
				</div>

				<div class="project-links">
					{#each selected.links as link}
						<a href={link.url} target="_blank" rel="noopener noreferrer">
							{#if link.icon === 'github'}
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.86 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.51.47-3.16-.63-3.36-1.2-.11-.29-.6-1.2-1.03-1.44-.35-.19-.85-.66-.01-.67.79-.01 1.35.74 1.54 1.04.9 1.55 2.34 1.11 2.91.85.09-.67.35-1.11.64-1.37-2.22-.26-4.55-1.14-4.55-5.05 0-1.11.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.28 9.28 0 0 1 12 6.99c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.05.36.32.68.93.68 1.89 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.16 10.16 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
									/>
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M14 4.5a.75.75 0 0 1 .75-.75h4.75a.75.75 0 0 1 .75.75v4.75a.75.75 0 0 1-1.5 0V6.31l-7.22 7.22a.75.75 0 1 1-1.06-1.06l7.22-7.22h-2.94A.75.75 0 0 1 14 4.5ZM5.75 6.25a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-5a.75.75 0 0 1 1.5 0v5a2.5 2.5 0 0 1-2.5 2.5h-11a2.5 2.5 0 0 1-2.5-2.5v-11a2.5 2.5 0 0 1 2.5-2.5h5a.75.75 0 0 1 0 1.5h-5Z"
									/>
								</svg>
							{/if}
							<span>{link.label}</span>
						</a>
					{/each}
				</div>
			</article>
		{/key}

		<div class="carousel-nav" aria-label="Project carousel controls">
			<div class="dots" role="tablist" aria-label="Choose project">
				{#each projects as project, index}
					<button
						type="button"
						class:active={selectedIndex === index}
						aria-label={`Show ${project.name}`}
						aria-selected={selectedIndex === index}
						role="tab"
						onclick={() => selectProject(index)}
					></button>
				{/each}
			</div>

			<div class="arrow-controls">
				<span class="counter">{selectedIndex + 1} / {projects.length}</span>
				<button type="button" class="arrow-button" aria-label="Previous project" onclick={previousProject}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M15.5 5.75 9.25 12l6.25 6.25-1.06 1.06L7.13 12l7.31-7.31 1.06 1.06Z" />
					</svg>
				</button>
				<button type="button" class="arrow-button" aria-label="Next project" onclick={nextProject}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="m8.5 18.25 6.25-6.25L8.5 5.75l1.06-1.06L16.87 12l-7.31 7.31-1.06-1.06Z" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</section>

<style>
	.projects-carousel {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.project-card {
		padding: 1.25rem;
		border: 0.5px solid var(--border);
		border-radius: 12px;
		background: var(--bg);
	}

	.project-media {
		display: flex;
		aspect-ratio: 16 / 9;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.25rem;
		border: 0.5px solid var(--border);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 12px;
		text-align: center;
		overflow: hidden;
	}

	.project-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.project-title {
		color: var(--text);
		font-size: 17px;
		font-weight: 500;
		line-height: 1.35;
		text-decoration-color: var(--border);
		text-underline-offset: 3px;
	}

	.project-title:hover {
		color: var(--text);
		text-decoration-color: var(--text-muted);
	}

	.project-pitch {
		margin-top: 2px;
		margin-bottom: 10px;
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.5;
	}

	.project-desc {
		margin-bottom: 14px;
		color: var(--text-muted);
		font-size: 14px;
		line-height: 1.6;
	}

	.project-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-bottom: 14px;
	}

	.project-tags span {
		padding: 3px 9px;
		border-radius: 3px;
		background: var(--bg-secondary);
		color: var(--text-tertiary);
		font-size: 11px;
		line-height: 1.35;
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding-top: 14px;
		border-top: 0.5px solid var(--border);
	}

	.project-links a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		font-size: 13px;
		line-height: 1;
		text-decoration: none;
	}

	.project-links a:hover {
		color: var(--text);
	}

	.project-links svg,
	.arrow-button svg {
		width: 15px;
		height: 15px;
		fill: currentColor;
	}

	.carousel-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.dots {
		display: flex;
		gap: 8px;
	}

	.dots button {
		width: 6px;
		height: 6px;
		border: 0;
		border-radius: 999px;
		background: var(--text);
		cursor: pointer;
		opacity: 0.15;
	}

	.dots button.active {
		opacity: 0.5;
	}

	.arrow-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.counter {
		margin-right: 2px;
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1;
	}

	.arrow-button {
		display: inline-flex;
		width: 32px;
		height: 32px;
		align-items: center;
		justify-content: center;
		border: 0.5px solid var(--border);
		border-radius: 999px;
		background: var(--bg);
		color: var(--text);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.arrow-button:hover {
		border-color: var(--text-tertiary);
		background: var(--bg-secondary);
	}

	.arrow-button svg {
		width: 16px;
		height: 16px;
	}
</style>
