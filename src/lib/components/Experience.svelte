<script lang="ts">
	import { experiences } from '$lib/data/experience';
	import { buildTimeline, buildYearLabels, month } from '$lib/utils/timeline';

	const axisHeight = 720;
	const timelinePadding = 40;
	const containerHeight = axisHeight + timelinePadding * 2;
	const axisX = 36;
	const barWidth = 11;
	const barGap = 5;
	const barStartX = 58;
	const labelStartX = 104;

	const timelineConfig = {
		axisHeight,
		padding: timelinePadding,
		start: month(2023, 9),
		end: month(2026, 8)
	};

	const timelineExperiences = buildTimeline(experiences, timelineConfig);
	const yearLabels = buildYearLabels([2026, 2025, 2024], timelineConfig);

	let selectedId = $state(timelineExperiences[0].id);
	let panelHeight = $state(0);
	let selected = $derived(
		timelineExperiences.find((experience) => experience.id === selectedId) ?? timelineExperiences[0]
	);
	let panelTop = $derived(
		Math.max(0, Math.min(selected.center - panelHeight / 2, containerHeight - panelHeight))
	);
</script>

<section id="experience">
	<h2>Experience</h2>

	<div class="experience-timeline" style:height={`${containerHeight}px`}>
		<div class="timeline-axis" aria-label="Experience timeline" style:height={`${containerHeight}px`}>
			<div
				class="axis-line"
				style:left={`${axisX}px`}
				style:top={`${timelinePadding}px`}
				style:bottom={`${timelinePadding}px`}
			></div>

			{#each yearLabels as label}
				<div class="year-marker" style:top={`${label.top}px`}>
					<span class="year-tick" style:left={`${axisX - 3}px`}></span>
					<span class="year-label" style:left={`${axisX - 30}px`}>{label.year}</span>
				</div>
			{/each}

			{#each timelineExperiences as experience}
				<button
					type="button"
					class="timeline-bar"
					class:active={selected.id === experience.id}
					style:left={`${barStartX + experience.column * (barWidth + barGap)}px`}
					style:top={`${experience.top}px`}
					style:height={`${experience.height}px`}
					aria-label={`Show ${experience.company} experience`}
					aria-pressed={selected.id === experience.id}
					onclick={() => (selectedId = experience.id)}
				></button>

				<button
					type="button"
					class="entry-label"
					class:active={selected.id === experience.id}
					style:left={`${labelStartX}px`}
					style:top={`${experience.center}px`}
					onclick={() => (selectedId = experience.id)}
				>
					<span>{experience.company}</span>
				</button>
			{/each}
		</div>

		<aside class="detail-panel" style:top={`${panelTop}px`}>
			{#key selected.id}
				<div class="detail-content" bind:clientHeight={panelHeight}>
					<h3>
						{selected.role}
						<span>@</span>
						<a href={selected.url} target="_blank" rel="noopener noreferrer">{selected.company}</a>
					</h3>
					<p class="dates">
						<span>{selected.period}</span>
						{#if selected.location}
							<span class="date-separator">·</span>
							<span>{selected.location}</span>
						{/if}
					</p>

					<ul class="description">
						{#each selected.bullets as bullet}
							<li>{bullet}</li>
						{/each}
					</ul>

					{#if selected.tags.length > 0}
						<div class="tags" aria-label={`${selected.company} technologies`}>
							{#each selected.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			{/key}
		</aside>
	</div>
</section>

<style>
	.experience-timeline {
		display: grid;
		grid-template-columns: 280px minmax(0, 1fr);
		gap: 1rem;
		position: relative;
	}

	.timeline-axis {
		position: relative;
	}

	.axis-line {
		position: absolute;
		width: 1px;
		background: var(--border);
	}

	.year-marker {
		position: absolute;
		left: 0;
		width: 100%;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.year-tick {
		position: absolute;
		top: 50%;
		width: 8px;
		height: 1px;
		background: var(--border);
	}

	.year-label {
		position: absolute;
		top: 50%;
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1;
		transform: translateY(-50%);
	}

	.timeline-bar {
		position: absolute;
		width: 11px;
		border: 0;
		border-radius: 4px;
		background: color-mix(in srgb, var(--text) 18%, transparent);
		cursor: pointer;
		transition:
			background 0.16s ease,
			transform 0.16s ease;
	}

	.timeline-bar:hover {
		background: color-mix(in srgb, var(--text) 32%, transparent);
	}

	.timeline-bar.active {
		background: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.entry-label {
		position: absolute;
		width: 100px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--text-muted);
		font: inherit;
		font-size: 13px;
		line-height: 1.25;
		text-align: left;
		cursor: pointer;
		opacity: 0.68;
		transform: translateY(-50%);
		transition:
			color 0.16s ease,
			opacity 0.16s ease;
	}

	.entry-label.active {
		color: var(--text);
		font-weight: 500;
		opacity: 1;
	}

	.entry-label span {
		max-width: 100px;
		white-space: normal;
	}

	.detail-panel {
		position: absolute;
		left: calc(280px + 1rem);
		right: 0;
		transition: top 0.24s ease;
	}

	.detail-content {
		padding-right: 0.25rem;
		animation: detail-enter 0.2s ease both;
	}

	h3 {
		margin: 0;
		color: var(--text);
		font-size: 16px;
		font-weight: 500;
		line-height: 1.35;
	}

	h3 span {
		color: var(--text-muted);
		font-weight: 400;
	}

	h3 a {
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: var(--accent);
		text-underline-offset: 2px;
		white-space: nowrap;
	}

	.dates {
		display: inline-grid;
		grid-template-columns: auto 1fr auto;
		min-width: min(100%, 280px);
		margin-top: 0.25rem;
		margin-bottom: 0;
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.4;
		white-space: nowrap;
	}

	.date-separator {
		text-align: center;
	}

	.description {
		margin-top: 0.6rem;
		margin-bottom: 0;
		padding-left: 1rem;
		color: var(--text-muted);
		font-size: 13.5px;
		line-height: 1.55;
	}

	.description li + li {
		margin-top: 0.3rem;
	}

	@keyframes detail-enter {
		from {
			opacity: 0;
			transform: translateY(4px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 620px) {
		.experience-timeline {
			display: block;
			height: auto !important;
		}

		.detail-panel {
			position: static;
			margin-top: 1.25rem;
			transition: none;
		}

		.detail-content {
			padding-right: 0;
		}

		.entry-label {
			width: calc(100% - 104px);
			max-width: 190px;
			font-size: 12px;
		}

		h3 a {
			white-space: normal;
		}

		.dates {
			display: flex;
			flex-wrap: wrap;
			gap: 0 0.4rem;
			min-width: 0;
			white-space: normal;
		}
	}
</style>
