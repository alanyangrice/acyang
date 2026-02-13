<section id="about">
	<h2>About</h2>

	<div class="intro-header">
		<h1>Hey, I'm Your Name</h1>
		<div class="intro-photo">
			<img src="/headshot.svg" alt="Headshot of Your Name" />
		</div>
	</div>

	<hr />

	<p>
		I am a software engineer passionate about building products that matter. Currently, I am
		working on <a href="https://example.com">exciting projects</a> at the intersection of
		technology and design.
	</p>

	<p>
		Previously, I worked on full-stack applications at
		<a href="https://example.com">Company A</a> and contributed to open-source tools at
		<a href="https://example.com">Company B</a>. I studied Computer Science at
		<a href="https://example.com">University</a>, where I focused on systems programming and
		human-computer interaction.
	</p>

	<p>
		Outside of work, I enjoy photography, reading, and exploring new places. The small details in
		how things are built fascinate me, whether it's software architecture or a well-designed
		building.
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
