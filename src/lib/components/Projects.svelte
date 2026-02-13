<script lang="ts">
	const projects = [
		{
			name: 'Project Alpha',
			description: 'A tool for automating workflow pipelines with a clean CLI interface.',
			url: 'https://example.com',
			tags: ['TypeScript', 'CLI']
		},
		{
			name: 'Project Beta',
			description: 'Real-time collaborative editor built for small teams.',
			url: 'https://example.com',
			tags: ['Svelte', 'WebSockets']
		},
		{
			name: 'Project Gamma',
			description: 'Open-source library for fast image processing on the web.',
			url: 'https://example.com',
			tags: ['Rust', 'WASM']
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
