<script lang="ts">
	const projects = [
		{
			name: 'Agent Router',
			description: 'MCP-first agent coordination platform with a three-role pipeline (coder, QA, reviewer), CAS-based task state machine, dependency DAG, push-based SSE notifications, and a real-time Kanban dashboard.',
			url: 'https://github.com/alanyangrice/agent-router',
			tags: ['Go', 'MCP', 'Postgres', 'Next.js', 'Concurrency']
		},
		{
			name: 'Checkers Reinforcement Learning',
			description: 'Fully playable checkers game with a reinforcement learning agent trained via Proximal Policy Optimization (PPO) self-play, curriculum learning, opponent pools, and alpha-zero training loop.',
			url: 'https://github.com/alanyangrice/checkersRL',
			tags: ['PyTorch', 'Gymnasium', 'Multiprocessing', 'Python']
		},
		{
			name: 'Realtime Crypto Market Data Websocket',
			description: 'Low-latency Rust service that injests real-time crypto market data from multiple venues, compute derived analytics, and persists everything to a Parquet data lake and Redis hot-state cache.',
			url: 'https://github.com/alanyangrice/crypto-websocket',
			tags: ['Rust', 'Tokio', 'Parquet', 'Redis']
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
