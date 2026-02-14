<script lang="ts">
	const experiences = [
		{
			role: 'Software Engineer Intern',
			company: 'Capital One',
			url: 'https://www.capitalone.com',
			period: 'Jun 2026 – Aug 2026',
			description: 'Incoming Summer 2026.',
			tags: []
		},
		{
			role: 'Software Engineer Intern',
			company: 'RecruitU',
			url: 'https://recruitu.com',
			period: 'Jan 2026 – May 2026',
			description:
				'Built a large-scale graph database with Neo4j to index 6M+ professional profiles and designed weighted shortest-path traversal for career trajectory graphs. Implemented a recruiting readiness scoring model using feature engineering over 2,000+ resumes. Migrated search from Typesense to Elasticsearch and refactored services from Python to Go.',
			tags: ['Go', 'Neo4j', 'Elasticsearch', 'PostgreSQL', 'Python']
		},
		{
			role: 'Co-Founder',
			company: 'BreakIn (acquired)',
			url: 'https://breakin.ai',
			period: 'Apr 2025 – Dec 2025',
			description:
				'Built and scaled a recruiting automation platform to $100k ARR and 2,000+ users, acquired by RecruitU. Reduced API latency from 3s to 500ms, built vectorized semantic search over 100k+ profiles, and shipped resilient autosave, billing with Stripe, and CASA Tier 2 security.',
			tags: ['Python', 'FastAPI', 'TypeScript', 'React', 'Supabase', 'Redis', 'Docker']
		},
		{
			role: 'Research Intern',
			company: 'Baylor College of Medicine',
			url: 'https://www.bcm.edu/research/faculty-labs/robert-waterland-lab',
			period: 'May 2024 – May 2025',
			description:
				'Automated whole-genome bisulfite sequencing processing at 2TB+ scale. Built an LLM-powered literature triage pipeline to classify 2,000 papers. Co-authored a manuscript accepted to Nucleic Acids Research and first-authored an abstract presented at the 13th DOHaD World Congress.',
			tags: ['Python', 'R', 'Bash', 'Linux', 'Bioinformatics']
		},
	];
</script>

<section id="experience">
	<h2>Experience</h2>

	<ul class="timeline">
		{#each experiences as exp}
			<li>
				<div class="exp-header">
					<span class="exp-role">
						{exp.role} @ <a href={exp.url} target="_blank" rel="noopener noreferrer">{exp.company}</a>
					</span>
					<span class="exp-period">{exp.period}</span>
				</div>
				<p class="exp-desc">{exp.description}</p>
				{#if exp.tags.length > 0}
					<div class="tags">
						{#each exp.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.timeline {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.exp-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.exp-role {
		font-weight: 600;
		font-size: 1rem;
	}

	.exp-period {
		font-size: 0.85rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.exp-desc {
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
