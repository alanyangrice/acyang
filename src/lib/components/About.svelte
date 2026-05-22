<section id="about">
	<h2>About</h2>

	<div class="intro-header">
		<div class="intro-copy">
			<h1>Hey, I'm Alan</h1>
		</div>
		<div class="intro-photo">
			<img src="/headshot.jpg" alt="Headshot of Alan Yang" width="112" height="112" />
		</div>
	</div>

	<div class="about-body">
		<p>
			I am a junior at <a href="https://www.rice.edu">Rice University</a> studying Computer Science and Statistics.
			This summer, I am joining <a href="https://aws.amazon.com/redshift/">AWS Redshift</a> as a Software Development Engineer Intern.
		</p>

		<p>
			Previously, I worked at <a href="https://recruitu.com">RecruitU</a> as a Software Engineer, where I built migration tooling for their API and search infrastructure.
			Before that, I co-founded <a href="https://breakin.ai">BreakIn</a>, a platform that automates outreach for finance recruiting.
			We scaled to six figures in annual revenue and 2,000 users before being acquired by RecruitU.
		</p>

		<p>
			I am interested in reinforcement learning, recursive learning agents, and high performance systems.
			I also worked at <a href="https://www.bcm.edu/research/faculty-labs/robert-waterland-lab">Waterland Lab</a> where I researched the long-term stability of human
			<a href="https://pubmed.ncbi.nlm.nih.gov/36631879">CoRSIVs</a>,
			co-authoring a paper accepted at Nucleic Acids Research.
		</p>

		<p>
			Outside of work, I enjoy reading novels, watching anime, and playing board games like Dune and Catan.
		</p>
	</div>
</section>

<style>
	#about {
		padding-bottom: var(--space-md);
	}

	.intro-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-xl);
		margin-bottom: var(--space-md);
		padding-bottom: var(--space-md);
		border-bottom: var(--rule);
	}

	.intro-copy {
		min-width: 0;
	}

	.intro-copy h1 {
		font-size: clamp(2rem, 8vw, 3.6rem);
	}

	.intro-photo {
		flex-shrink: 0;
	}

	.intro-photo img {
		width: 118px;
		height: 118px;
		border-radius: var(--radius-md);
		object-fit: cover;
		display: block;
		border: var(--rule);
		filter: grayscale(0.2) contrast(1.04);
	}

	.about-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.about-body p {
		color: var(--color-ink-2);
		font-size: var(--text-sm);
		line-height: 1.65;
		max-width: none;
	}

	.about-body a {
		color: var(--color-ink);
	}

	@media (max-width: 560px) {
		.intro-header {
			grid-template-columns: 1fr;
			justify-items: center;
			text-align: center;
			gap: var(--space-md);
		}

		.intro-copy {
			order: 2;
		}

		.intro-photo {
			order: 1;
		}

		.intro-photo img {
			width: 92px;
			height: 92px;
		}
	}
</style>
