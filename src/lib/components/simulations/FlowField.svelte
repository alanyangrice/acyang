<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// --- Tuning ---
	const NUM_PARTICLES = 1500;
	const NOISE_SCALE = 0.003;       // lower = larger, smoother swirls
	const TIME_SPEED = 0.0004;       // how fast the flow evolves
	const PARTICLE_SPEED = 1.5;
	const TRAIL_ALPHA = 0.025;       // lower = longer trails
	const PARTICLE_ALPHA = 0.25;
	const CURSOR_RADIUS = 200;
	const CURSOR_VORTEX = 0.6;       // strength of cursor swirl
	const LINE_WIDTH = 1.2;
	const NUM_FIELDS = 3;            // number of overlapping noise fields

	// Subtle blue palette
	const COLORS = [
		`rgba(74, 111, 165, ${PARTICLE_ALPHA})`,
		`rgba(59, 130, 246, ${PARTICLE_ALPHA * 0.85})`,
		`rgba(96, 165, 250, ${PARTICLE_ALPHA * 0.7})`,
		`rgba(74, 111, 165, ${PARTICLE_ALPHA * 0.6})`
	];

	interface Particle {
		x: number;
		y: number;
		px: number;  // previous x (for drawing lines)
		py: number;  // previous y
		color: string;
		life: number;
		maxLife: number;
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let width = 0;
	let height = 0;
	let particles: Particle[] = [];
	let rafId: number;
	let time = 0;
	let mouseX = -1000;
	let mouseY = -1000;

	// ---- Simplex-like noise (2D + 3D) ----
	// Permutation table
	const perm = new Uint8Array(512);
	const grad3 = [
		[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
		[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
		[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
	];

	function initNoise() {
		const p = new Uint8Array(256);
		for (let i = 0; i < 256; i++) p[i] = i;
		// Fisher-Yates shuffle
		for (let i = 255; i > 0; i--) {
			const j = (Math.random() * (i + 1)) | 0;
			const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
		}
		for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
	}

	function dot3(g: number[], x: number, y: number, z: number): number {
		return g[0] * x + g[1] * y + g[2] * z;
	}

	function noise3D(xin: number, yin: number, zin: number): number {
		// Simple 3D noise via interpolated lattice
		const X = Math.floor(xin) & 255;
		const Y = Math.floor(yin) & 255;
		const Z = Math.floor(zin) & 255;
		const x = xin - Math.floor(xin);
		const y = yin - Math.floor(yin);
		const z = zin - Math.floor(zin);

		const u = fade(x);
		const v = fade(y);
		const w = fade(z);

		const A  = perm[X] + Y;
		const AA = perm[A] + Z;
		const AB = perm[A + 1] + Z;
		const B  = perm[X + 1] + Y;
		const BA = perm[B] + Z;
		const BB = perm[B + 1] + Z;

		return lerp(w,
			lerp(v,
				lerp(u,
					dot3(grad3[perm[AA] % 12], x, y, z),
					dot3(grad3[perm[BA] % 12], x - 1, y, z)
				),
				lerp(u,
					dot3(grad3[perm[AB] % 12], x, y - 1, z),
					dot3(grad3[perm[BB] % 12], x - 1, y - 1, z)
				)
			),
			lerp(v,
				lerp(u,
					dot3(grad3[perm[AA + 1] % 12], x, y, z - 1),
					dot3(grad3[perm[BA + 1] % 12], x - 1, y, z - 1)
				),
				lerp(u,
					dot3(grad3[perm[AB + 1] % 12], x, y - 1, z - 1),
					dot3(grad3[perm[BB + 1] % 12], x - 1, y - 1, z - 1)
				)
			)
		);
	}

	function fade(t: number): number {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	function lerp(t: number, a: number, b: number): number {
		return a + t * (b - a);
	}

	// ---- Multi-layer flow field ----
	// Each layer samples noise at a different scale, speed, and offset,
	// then they're blended together for richer, more complex flow patterns.
	const fieldLayers = [
		{ scale: NOISE_SCALE,       speed: TIME_SPEED,       offsetX: 0,    offsetY: 0,    weight: 1.0  },
		{ scale: NOISE_SCALE * 2.5, speed: TIME_SPEED * 1.8, offsetX: 100,  offsetY: 200,  weight: 0.5  },
		{ scale: NOISE_SCALE * 0.4, speed: TIME_SPEED * 0.5, offsetX: -300, offsetY: 150,  weight: 0.35 }
	];

	function getAngle(x: number, y: number): number {
		let totalAngle = 0;
		let totalWeight = 0;

		for (let i = 0; i < NUM_FIELDS; i++) {
			const layer = fieldLayers[i];
			const n = noise3D(
				(x + layer.offsetX) * layer.scale,
				(y + layer.offsetY) * layer.scale,
				time * (layer.speed / TIME_SPEED)
			);
			totalAngle += n * Math.PI * 4 * layer.weight;
			totalWeight += layer.weight;
		}

		let angle = totalAngle / totalWeight;

		// Cursor vortex: swirl particles around cursor
		const dx = x - mouseX;
		const dy = y - mouseY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist < CURSOR_RADIUS && dist > 0) {
			const vortexAngle = Math.atan2(dx, -dy);
			const influence = (1 - dist / CURSOR_RADIUS) * CURSOR_VORTEX;
			angle = angle * (1 - influence) + vortexAngle * influence;
		}

		return angle;
	}

	function spawnParticle(): Particle {
		const maxLife = 200 + ((Math.random() * 300) | 0);
		const x = Math.random() * width;
		const y = Math.random() * height;
		return {
			x,
			y,
			px: x,
			py: y,
			color: COLORS[(Math.random() * COLORS.length) | 0],
			life: 0,
			maxLife
		};
	}

	function initParticles() {
		particles = [];
		for (let i = 0; i < NUM_PARTICLES; i++) {
			const p = spawnParticle();
			p.life = (Math.random() * p.maxLife) | 0; // stagger lifetimes
			particles.push(p);
		}
	}

	function update() {
		time += TIME_SPEED;

		for (let i = 0; i < particles.length; i++) {
			const p = particles[i];

			p.px = p.x;
			p.py = p.y;

			const angle = getAngle(p.x, p.y);
			p.x += Math.cos(angle) * PARTICLE_SPEED;
			p.y += Math.sin(angle) * PARTICLE_SPEED;

			p.life++;

			// Respawn if off-screen or expired
			if (p.life >= p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
				const np = spawnParticle();
				p.x = np.x;
				p.y = np.y;
				p.px = np.x;
				p.py = np.y;
				p.color = np.color;
				p.life = 0;
				p.maxLife = np.maxLife;
			}
		}
	}

	function draw() {
		if (!ctx) return;

		// Fade previous frame for trails
		ctx.fillStyle = `rgba(250, 250, 250, ${TRAIL_ALPHA})`;
		ctx.fillRect(0, 0, width, height);

		ctx.lineWidth = LINE_WIDTH;

		for (let i = 0; i < particles.length; i++) {
			const p = particles[i];

			// Fade in at birth, fade out near death
			const lifeRatio = p.life / p.maxLife;
			let alpha = 1;
			if (lifeRatio < 0.05) alpha = lifeRatio / 0.05;
			else if (lifeRatio > 0.9) alpha = (1 - lifeRatio) / 0.1;

			if (alpha <= 0) continue;

			ctx.globalAlpha = alpha;
			ctx.strokeStyle = p.color;
			ctx.beginPath();
			ctx.moveTo(p.px, p.py);
			ctx.lineTo(p.x, p.y);
			ctx.stroke();
		}

		ctx.globalAlpha = 1;
	}

	function loop() {
		update();
		draw();
		rafId = requestAnimationFrame(loop);
	}

	function resize() {
		if (!canvas) return;
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;

		if (particles.length === 0) {
			initNoise();
			initParticles();
		}

		if (ctx) {
			ctx.clearRect(0, 0, width, height);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	function handlePointerLeave() {
		mouseX = -1000;
		mouseY = -1000;
	}

	function handleVisibilityChange() {
		if (document.hidden) {
			cancelAnimationFrame(rafId);
		} else {
			rafId = requestAnimationFrame(loop);
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d', { desynchronized: true });
		resize();
		rafId = requestAnimationFrame(loop);

		window.addEventListener('resize', resize);
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerleave', handlePointerLeave);
		document.addEventListener('visibilitychange', handleVisibilityChange);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(rafId);
		window.removeEventListener('resize', resize);
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerleave', handlePointerLeave);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 0;
		pointer-events: none;
	}
</style>
