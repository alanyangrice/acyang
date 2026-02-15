<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// --- Tuning ---
	const NUM_PARTICLES = 1500;
	const NOISE_SCALE = 0.003;
	const TIME_SPEED = 0.0004;
	const PARTICLE_SPEED = 1.5;
	const PARTICLE_ALPHA = 0.12;
	const CURSOR_RADIUS = 200;
	const CURSOR_R2 = CURSOR_RADIUS * CURSOR_RADIUS;
	const CURSOR_VORTEX = 0.6;
	const LINE_WIDTH = 1.2;
	const NUM_FIELDS = 3;

	// --- Trail decay (periodic to bypass 8-bit quantization floor) ---
	// Fade once every FADE_INTERVAL frames with a big-enough step.
	// Effective per-frame rate ≈ FADE_AMOUNT / FADE_INTERVAL ≈ 0.001
	// Half-life ≈ ln(0.5)/ln(1-FADE_AMOUNT) * FADE_INTERVAL ≈ 600 frames (~10s)
	const FADE_INTERVAL = 45;  // frames between fade passes
	const FADE_AMOUNT = 0.06;  // alpha removed per pass (>0.04 beats 8-bit floor)
	let frameCount = 0;

	// Blue palette
	const COLOR_RGB: [number, number, number][] = [
		[74, 111, 165],
		[59, 130, 246],
		[96, 165, 250],
		[74, 111, 165]
	];
	const COLOR_BASE_ALPHA = [
		PARTICLE_ALPHA,
		PARTICLE_ALPHA * 0.85,
		PARTICLE_ALPHA * 0.7,
		PARTICLE_ALPHA * 0.6
	];
	const NUM_COLORS = COLOR_RGB.length;
	const COLOR_STR = COLOR_RGB.map(([r, g, b]) => `rgb(${r},${g},${b})`);

	interface Particle {
		x: number;
		y: number;
		px: number;  // previous x
		py: number;  // previous y
		colorIdx: number;
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

	// ---- Perlin noise ----
	const perm = new Uint8Array(512);
	const grad3 = [
		[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
		[1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
		[0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
	];

	function initNoise() {
		const p = new Uint8Array(256);
		for (let i = 0; i < 256; i++) p[i] = i;
		for (let i = 255; i > 0; i--) {
			const j = (Math.random() * (i + 1)) | 0;
			const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
		}
		for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
	}

	function dot3(g: number[], x: number, y: number, z: number): number {
		return g[0] * x + g[1] * y + g[2] * z;
	}

	function fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }
	function lerp(t: number, a: number, b: number): number { return a + t * (b - a); }

	function noise3D(xin: number, yin: number, zin: number): number {
		const X = Math.floor(xin) & 255;
		const Y = Math.floor(yin) & 255;
		const Z = Math.floor(zin) & 255;
		const x = xin - Math.floor(xin);
		const y = yin - Math.floor(yin);
		const z = zin - Math.floor(zin);
		const u = fade(x), v = fade(y), w = fade(z);
		const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
		const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
		return lerp(w,
			lerp(v,
				lerp(u, dot3(grad3[perm[AA] % 12], x, y, z), dot3(grad3[perm[BA] % 12], x - 1, y, z)),
				lerp(u, dot3(grad3[perm[AB] % 12], x, y - 1, z), dot3(grad3[perm[BB] % 12], x - 1, y - 1, z))
			),
			lerp(v,
				lerp(u, dot3(grad3[perm[AA + 1] % 12], x, y, z - 1), dot3(grad3[perm[BA + 1] % 12], x - 1, y, z - 1)),
				lerp(u, dot3(grad3[perm[AB + 1] % 12], x, y - 1, z - 1), dot3(grad3[perm[BB + 1] % 12], x - 1, y - 1, z - 1))
			)
		);
	}

	// ---- Multi-layer flow field (precomputed timeMul) ----
	const fieldLayers = [
		{ scale: NOISE_SCALE, offsetX: 0, offsetY: 0, weight: 1.0, timeMul: 1.0 },
		{ scale: NOISE_SCALE * 2.5, offsetX: 100, offsetY: 200, weight: 0.5, timeMul: 1.8 },
		{ scale: NOISE_SCALE * 0.4, offsetX: -300, offsetY: 150, weight: 0.35, timeMul: 0.5 }
	];

	function getAngle(x: number, y: number): number {
		let totalAngle = 0, totalWeight = 0;
		for (let i = 0; i < NUM_FIELDS; i++) {
			const l = fieldLayers[i];
			const n = noise3D(
				(x + l.offsetX) * l.scale,
				(y + l.offsetY) * l.scale,
				time * l.timeMul
			);
			totalAngle += n * Math.PI * 4 * l.weight;
			totalWeight += l.weight;
		}
		let angle = totalAngle / totalWeight;

		// Cursor vortex (only compute sqrt if inside radius)
		const dx = x - mouseX, dy = y - mouseY;
		const d2 = dx * dx + dy * dy;
		if (d2 < CURSOR_R2 && d2 > 0) {
			const dist = Math.sqrt(d2);
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
			x, y, px: x, py: y,
			colorIdx: (Math.random() * NUM_COLORS) | 0,
			life: 0, maxLife
		};
	}

	function initParticles() {
		particles = [];
		for (let i = 0; i < NUM_PARTICLES; i++) {
			const p = spawnParticle();
			p.life = (Math.random() * p.maxLife) | 0;
			particles.push(p);
		}
	}

	function update() {
		time += TIME_SPEED;
		for (let i = 0; i < particles.length; i++) {
			const p = particles[i];

			// Store previous position
			p.px = p.x;
			p.py = p.y;

			const angle = getAngle(p.x, p.y);
			p.x += Math.cos(angle) * PARTICLE_SPEED;
			p.y += Math.sin(angle) * PARTICLE_SPEED;
			p.life++;

			// Respawn if off-screen or expired
			if (p.life >= p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
				const np = spawnParticle();
				p.x = np.x; p.y = np.y;
				p.px = np.px; p.py = np.py;
				p.colorIdx = np.colorIdx;
				p.life = 0; p.maxLife = np.maxLife;
			}
		}
	}

	function draw() {
		if (!ctx) return;

		// Periodic fade: one big step every N frames (bypasses 8-bit quantization floor)
		frameCount++;
		if (frameCount >= FADE_INTERVAL) {
			frameCount = 0;
			ctx.globalCompositeOperation = 'destination-out';
			ctx.globalAlpha = FADE_AMOUNT;
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, width, height);
			ctx.globalCompositeOperation = 'source-over';
		}

		// Draw only prev -> current segments, batched by color
		ctx.lineWidth = LINE_WIDTH;
		for (let c = 0; c < NUM_COLORS; c++) {
			ctx.globalAlpha = COLOR_BASE_ALPHA[c];
			ctx.strokeStyle = COLOR_STR[c];
			ctx.beginPath();

			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				if (p.colorIdx !== c) continue;

				// Skip first few frames (fade in) and last frames (fade out before respawn)
				const lifeRatio = p.life / p.maxLife;
				if (lifeRatio < 0.02 || lifeRatio > 0.95) continue;

				ctx.moveTo(p.px, p.py);
				ctx.lineTo(p.x, p.y);
			}

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
		if (particles.length === 0) { initNoise(); initParticles(); }
		if (ctx) ctx.clearRect(0, 0, width, height);
	}

	function handlePointerMove(e: PointerEvent) { mouseX = e.clientX; mouseY = e.clientY; }
	function handlePointerLeave() { mouseX = -1000; mouseY = -1000; }
	function handleVisibilityChange() {
		if (document.hidden) cancelAnimationFrame(rafId);
		else rafId = requestAnimationFrame(loop);
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
