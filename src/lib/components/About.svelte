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
		Currently, I am working at <a href="https://recruitu.com">RecruitU</a> as a Software Engineer working on visualizing human experiences in graph networks.
	</p>

	<p>
		Previously, I co-founded <a href="https://breakin.ai">BreakIn</a>, a platform that automates the outreach process for finance and investment banking recruiting.
		We scaled to over five figures in monthly revenue and over 5,000 users.
	</p>

	<p>
		I am currently interested in researching browser agents and reinforcement learning environments. Previously, I worked at 
		<a href="https://www.bcm.edu/research/faculty-labs/robert-waterland-lab">Waterland Lab</a> where I researched the long-term stability of human 
		<a href="https://google.com/search?q=Correlated+Regions+of+Systemic+Interindividual+Variation">CoRSIVs</a>.
	</p>

	<p>
		Outside of work, I enjoy reading novels, watching anime, and playing board games like Dune and Catan.
	</p>
</section>

<style>
	section {
		padding-top: 4rem;
	}

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

	/* Stack on small screens */
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
