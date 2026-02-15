<script lang="ts">
	const projects = [
		{
			name: 'Poker MCP',
			description: 'MCP server that provides LLMs poker action recommendations using game theory optimal (GTO) equity calculations, player tracking, and exploit-based recommendations.',
			url: 'https://github.com/alanyangrice/mcp-poker',
			tags: ['MCP', 'TypeScript', 'Python', 'SQLite']
		},
		{
			name: 'Checkers Reinforcement Learning',
			description: 'Fully playable checkers game with a reinforcement learning agent trained via Proximal Policy Optimization (PPO) self-play, curriculum learning, opponent pools, and alpha-zero training loop.',
			url: 'https://github.com/alanyangrice/checkersRL',
			tags: ['PyTorch', 'Gymnasium', 'Multiprocessing', 'Python']
		},
		{
			name: '[In Progress] Realtime Crypto Market Websocket',
			description: 'Low-latency Rust service that injests real-time crypto market data from Kraken and Coinbase WebSocket and normalizes it into a consistent schema stored in a database.',
			url: 'https://github.com/alanyangrice/crypto-websocket',
			tags: ['Rust', 'Tokio', 'Postgres', 'Redis']
		}
	];
</script>

<section id="projects">
	<h2>Projects</h2>

	<ul class="project-list">
		{#each projects as project}
			<li>
				<a href={project.url} target="_blank" rel="noopener noreferrer" class="project-name">
					{project.name}
				</a>
				<p class="project-desc">{project.description}</p>
				<div class="tags">
					{#each project.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.project-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.project-name {
		font-weight: 600;
		font-size: 1rem;
	}

	.project-desc {
		margin-top: 0.25rem;
		margin-bottom: 0.5rem;
		color: var(--text-muted);
		font-size: 0.95rem;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		background-color: var(--border);
		color: var(--text-muted);
	}
</style>
