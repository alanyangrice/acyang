<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// --- Flock tuning ---
	const NUM_BOIDS = 250;
	const MAX_SPEED = 2.5;
	const FLEE_SPEED = 4.5;
	const MIN_SPEED = 0.8;
	const VISUAL_RANGE = 75;
	const SEPARATION_DIST = 24;
	const SEPARATION_FORCE = 0.05;
	const ALIGNMENT_FORCE = 0.045;
	const COHESION_FORCE = 0.005;
	const EDGE_MARGIN = 80;
	const EDGE_TURN = 0.15;
	const CURSOR_SCARE_RADIUS = 130;
	const CURSOR_FLEE_FORCE = 0.3;
	const TRAIL_ALPHA = 0.12;
	const BOID_SIZE = 3;

	// --- Predator tuning ---
	const PREDATOR_SPEED = 2.0;
	const PREDATOR_ACCEL = 0.04;
	const PREDATOR_SCARE_RADIUS = 120;  // boids flee within this range
	const FLEE_FORCE = 0.35;
	const PREDATOR_SIZE = 6;
	const PREDATOR_COLOR = 'rgba(180, 60, 60, 0.7)';

	// --- Scatter tuning ---
	const SCATTER_COOLDOWN = 180;  // frames between scatters (~3 sec at 60fps)
	let scatterTimer = SCATTER_COOLDOWN;

	// Subtle blue palette for boids
	const COLORS = [
		'rgba(74, 111, 165, 0.55)',
		'rgba(59, 130, 246, 0.45)',
		'rgba(96, 165, 250, 0.40)',
		'rgba(74, 111, 165, 0.35)'
	];

	interface Boid {
		x: number;
		y: number;
		vx: number;
		vy: number;
		color: string;
	}

	interface Predator {
		x: number;
		y: number;
		vx: number;
		vy: number;
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let width = 0;
	let height = 0;
	let boids: Boid[] = [];
	let predator: Predator;
	let rafId: number;
	let mouseX = -1000;
	let mouseY = -1000;

	function initBoids() {
		boids = [];
		for (let i = 0; i < NUM_BOIDS; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
			boids.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				color: COLORS[(Math.random() * COLORS.length) | 0]
			});
		}
	}

	function initPredator() {
		const angle = Math.random() * Math.PI * 2;
		predator = {
			x: Math.random() * width,
			y: Math.random() * height,
			vx: Math.cos(angle) * PREDATOR_SPEED * 0.5,
			vy: Math.sin(angle) * PREDATOR_SPEED * 0.5
		};
	}

	function findFlockCenter(): { x: number; y: number } {
		// Find the densest cluster by picking the boid with the most neighbors
		let bestX = width / 2;
		let bestY = height / 2;
		let bestCount = 0;
		const n = boids.length;
		// Sample every 5th boid to save CPU
		for (let i = 0; i < n; i += 5) {
			const b = boids[i];
			let count = 0;
			for (let j = 0; j < n; j++) {
				const dx = boids[j].x - b.x;
				const dy = boids[j].y - b.y;
				if (dx * dx + dy * dy < VISUAL_RANGE * VISUAL_RANGE) {
					count++;
				}
			}
			if (count > bestCount) {
				bestCount = count;
				bestX = b.x;
				bestY = b.y;
			}
		}
		return { x: bestX, y: bestY };
	}

	function updatePredator() {
		const p = predator;
		const target = findFlockCenter();

		// Steer toward densest flock cluster
		const dx = target.x - p.x;
		const dy = target.y - p.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 0) {
			p.vx += (dx / dist) * PREDATOR_ACCEL;
			p.vy += (dy / dist) * PREDATOR_ACCEL;
		}

		// Edge avoidance
		if (p.x < EDGE_MARGIN) p.vx += EDGE_TURN;
		if (p.x > width - EDGE_MARGIN) p.vx -= EDGE_TURN;
		if (p.y < EDGE_MARGIN) p.vy += EDGE_TURN;
		if (p.y > height - EDGE_MARGIN) p.vy -= EDGE_TURN;

		// Clamp speed
		const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
		if (speed > PREDATOR_SPEED) {
			p.vx = (p.vx / speed) * PREDATOR_SPEED;
			p.vy = (p.vy / speed) * PREDATOR_SPEED;
		}

		p.x += p.vx;
		p.y += p.vy;
	}

	function update() {
		const n = boids.length;
		const px = predator.x;
		const py = predator.y;
		const scareR2 = PREDATOR_SCARE_RADIUS * PREDATOR_SCARE_RADIUS;

		// Occasional scatter: predator bursts toward the flock
		scatterTimer--;
		if (scatterTimer <= 0) {
			scatterTimer = SCATTER_COOLDOWN + ((Math.random() * 120) | 0);
			// Give predator a speed burst toward the flock
			const target = findFlockCenter();
			const dx = target.x - predator.x;
			const dy = target.y - predator.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist > 0) {
				predator.vx = (dx / dist) * PREDATOR_SPEED * 2.5;
				predator.vy = (dy / dist) * PREDATOR_SPEED * 2.5;
			}
		}

		updatePredator();

		for (let i = 0; i < n; i++) {
			const b = boids[i];

			let sepX = 0, sepY = 0;
			let alignVx = 0, alignVy = 0, alignCount = 0;
			let cohX = 0, cohY = 0, cohCount = 0;

			for (let j = 0; j < n; j++) {
				if (i === j) continue;
				const other = boids[j];
				const dx = other.x - b.x;
				const dy = other.y - b.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < SEPARATION_DIST && dist > 0) {
					sepX -= dx / dist;
					sepY -= dy / dist;
				}

				if (dist < VISUAL_RANGE) {
					alignVx += other.vx;
					alignVy += other.vy;
					alignCount++;
					cohX += other.x;
					cohY += other.y;
					cohCount++;
				}
			}

			// Apply separation
			b.vx += sepX * SEPARATION_FORCE;
			b.vy += sepY * SEPARATION_FORCE;

			// Apply alignment
			if (alignCount > 0) {
				alignVx /= alignCount;
				alignVy /= alignCount;
				b.vx += (alignVx - b.vx) * ALIGNMENT_FORCE;
				b.vy += (alignVy - b.vy) * ALIGNMENT_FORCE;
			}

			// Apply cohesion
			if (cohCount > 0) {
				cohX /= cohCount;
				cohY /= cohCount;
				b.vx += (cohX - b.x) * COHESION_FORCE;
				b.vy += (cohY - b.y) * COHESION_FORCE;
			}

			// Flee from predator
			const fdx = b.x - px;
			const fdy = b.y - py;
			const fdist2 = fdx * fdx + fdy * fdy;
			let currentMaxSpeed = MAX_SPEED;

			if (fdist2 < scareR2 && fdist2 > 0) {
				const fdist = Math.sqrt(fdist2);
				const strength = FLEE_FORCE * (1 - fdist / PREDATOR_SCARE_RADIUS);
				b.vx += (fdx / fdist) * strength;
				b.vy += (fdy / fdist) * strength;
				currentMaxSpeed = FLEE_SPEED;
			}

			// Flee from cursor (acts as second predator)
			const cdx = b.x - mouseX;
			const cdy = b.y - mouseY;
			const cdist2 = cdx * cdx + cdy * cdy;
			const cursorR2 = CURSOR_SCARE_RADIUS * CURSOR_SCARE_RADIUS;

			if (cdist2 < cursorR2 && cdist2 > 0) {
				const cdist = Math.sqrt(cdist2);
				const strength = CURSOR_FLEE_FORCE * (1 - cdist / CURSOR_SCARE_RADIUS);
				b.vx += (cdx / cdist) * strength;
				b.vy += (cdy / cdist) * strength;
				currentMaxSpeed = FLEE_SPEED;
			}

			// Soft edge avoidance
			if (b.x < EDGE_MARGIN) b.vx += EDGE_TURN;
			if (b.x > width - EDGE_MARGIN) b.vx -= EDGE_TURN;
			if (b.y < EDGE_MARGIN) b.vy += EDGE_TURN;
			if (b.y > height - EDGE_MARGIN) b.vy -= EDGE_TURN;

			// Clamp speed
			const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
			if (speed > currentMaxSpeed) {
				b.vx = (b.vx / speed) * currentMaxSpeed;
				b.vy = (b.vy / speed) * currentMaxSpeed;
			} else if (speed < MIN_SPEED && speed > 0) {
				b.vx = (b.vx / speed) * MIN_SPEED;
				b.vy = (b.vy / speed) * MIN_SPEED;
			}

			// Move
			b.x += b.vx;
			b.y += b.vy;
		}
	}

	function draw() {
		if (!ctx) return;

		// Fade previous frame for trails
		ctx.fillStyle = `rgba(250, 250, 250, ${TRAIL_ALPHA})`;
		ctx.fillRect(0, 0, width, height);

		// Draw boids
		for (let i = 0; i < boids.length; i++) {
			const b = boids[i];
			const angle = Math.atan2(b.vy, b.vx);

			ctx.save();
			ctx.translate(b.x, b.y);
			ctx.rotate(angle);

			ctx.beginPath();
			ctx.moveTo(BOID_SIZE * 2, 0);
			ctx.lineTo(-BOID_SIZE, -BOID_SIZE);
			ctx.lineTo(-BOID_SIZE, BOID_SIZE);
			ctx.closePath();

			ctx.fillStyle = b.color;
			ctx.fill();
			ctx.restore();
		}

		// Draw predator (larger, red-tinted triangle)
		const p = predator;
		const pAngle = Math.atan2(p.vy, p.vx);

		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(pAngle);

		ctx.beginPath();
		ctx.moveTo(PREDATOR_SIZE * 2, 0);
		ctx.lineTo(-PREDATOR_SIZE, -PREDATOR_SIZE);
		ctx.lineTo(-PREDATOR_SIZE, PREDATOR_SIZE);
		ctx.closePath();

		ctx.fillStyle = PREDATOR_COLOR;
		ctx.fill();
		ctx.restore();
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

		if (boids.length === 0) {
			initBoids();
			initPredator();
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
