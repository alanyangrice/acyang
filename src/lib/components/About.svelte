<section id="about">
	<h2>About</h2>

	<div class="intro-header">
		<h1>Hey, I'm Alan</h1>
		<div class="intro-photo">
			<img src="/headshot.jpg" alt="Headshot of Alan" />
		</div>
	</div>

	<hr />

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
</section>

<style>
	.intro-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.intro-header h1 {
		margin: 0;
	}

	.intro-photo {
		flex-shrink: 0;
	}

	.intro-photo img {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
		display: block;
	}

	@media (max-width: 560px) {
		.intro-header {
			flex-direction: column-reverse;
			align-items: center;
			text-align: center;
			gap: 1.25rem;
		}

		.intro-photo img {
			width: 110px;
			height: 110px;
		}
	}
</style>