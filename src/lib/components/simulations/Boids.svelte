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
	const BOID_SIZE = 3;

	// --- Trail decay ---
	const TRAIL_FADE = 0.03;

	// --- Predator tuning ---
	const PREDATOR_SPEED = 2.0;
	const PREDATOR_ACCEL = 0.08;
	const PREDATOR_SCARE_RADIUS = 120;
	const FLEE_FORCE = 0.35;
	const PREDATOR_SIZE = 6;

	// --- Scatter tuning ---
	const SCATTER_COOLDOWN = 180;
	let scatterTimer = SCATTER_COOLDOWN;

	// Blue palette
	const COLOR_RGB: [number, number, number][] = [
		[74, 111, 165],
		[59, 130, 246],
		[96, 165, 250],
		[74, 111, 165]
	];
	const COLOR_BASE_ALPHA = [0.55, 0.45, 0.40, 0.35];
	const NUM_COLORS = COLOR_RGB.length;
	const COLOR_STR = COLOR_RGB.map(([r, g, b]) => `rgb(${r},${g},${b})`);

	interface Boid {
		x: number;
		y: number;
		px: number;  // previous x
		py: number;  // previous y
		vx: number;
		vy: number;
		colorIdx: number;
	}

	interface Predator {
		x: number;
		y: number;
		px: number;
		py: number;
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

	// --- Spatial grid ---
	const CELL_SIZE = VISUAL_RANGE;
	const MAX_PER_CELL = 32;
	let gridCols = 0;
	let gridRows = 0;
	let gridCells: Int16Array;
	let gridCounts: Int16Array;

	function rebuildGrid() {
		gridCols = Math.ceil(width / CELL_SIZE) || 1;
		gridRows = Math.ceil(height / CELL_SIZE) || 1;
		gridCells = new Int16Array(gridCols * gridRows * MAX_PER_CELL);
		gridCounts = new Int16Array(gridCols * gridRows);
	}

	function populateGrid() {
		gridCounts.fill(0);
		for (let i = 0; i < boids.length; i++) {
			const b = boids[i];
			const cx = Math.min((b.x / CELL_SIZE) | 0, gridCols - 1);
			const cy = Math.min((b.y / CELL_SIZE) | 0, gridRows - 1);
			const cellIdx = cy * gridCols + cx;
			const count = gridCounts[cellIdx];
			if (count < MAX_PER_CELL) {
				gridCells[cellIdx * MAX_PER_CELL + count] = i;
				gridCounts[cellIdx] = count + 1;
			}
		}
	}

	function initBoids() {
		boids = [];
		for (let i = 0; i < NUM_BOIDS; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
			const x = Math.random() * width;
			const y = Math.random() * height;
			boids.push({
				x, y, px: x, py: y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				colorIdx: (Math.random() * NUM_COLORS) | 0
			});
		}
	}

	function initPredator() {
		const angle = Math.random() * Math.PI * 2;
		const x = Math.random() * width;
		const y = Math.random() * height;
		predator = {
			x, y, px: x, py: y,
			vx: Math.cos(angle) * PREDATOR_SPEED * 0.5,
			vy: Math.sin(angle) * PREDATOR_SPEED * 0.5
		};
	}

	function findFlockCenter(): { x: number; y: number } {
		let bestX = width / 2, bestY = height / 2, bestCount = 0;
		const n = boids.length;
		const vr2 = VISUAL_RANGE * VISUAL_RANGE;
		for (let i = 0; i < n; i += 8) {
			const b = boids[i];
			let count = 0;
			for (let j = 0; j < n; j++) {
				const dx = boids[j].x - b.x;
				const dy = boids[j].y - b.y;
				if (dx * dx + dy * dy < vr2) count++;
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
		p.px = p.x;
		p.py = p.y;

		const target = findFlockCenter();
		const dx = target.x - p.x;
		const dy = target.y - p.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 0) {
			p.vx += (dx / dist) * PREDATOR_ACCEL;
			p.vy += (dy / dist) * PREDATOR_ACCEL;
		}
		if (p.x < EDGE_MARGIN) p.vx += EDGE_TURN;
		if (p.x > width - EDGE_MARGIN) p.vx -= EDGE_TURN;
		if (p.y < EDGE_MARGIN) p.vy += EDGE_TURN;
		if (p.y > height - EDGE_MARGIN) p.vy -= EDGE_TURN;

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
		const predX = predator.x;
		const predY = predator.y;
		const scareR2 = PREDATOR_SCARE_RADIUS * PREDATOR_SCARE_RADIUS;
		const cursorR2 = CURSOR_SCARE_RADIUS * CURSOR_SCARE_RADIUS;
		const vr2 = VISUAL_RANGE * VISUAL_RANGE;
		const sepD2 = SEPARATION_DIST * SEPARATION_DIST;

		// Occasional scatter burst
		scatterTimer--;
		if (scatterTimer <= 0) {
			scatterTimer = SCATTER_COOLDOWN + ((Math.random() * 120) | 0);
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
		populateGrid();

		for (let i = 0; i < n; i++) {
			const b = boids[i];

			// Store previous position (for trail drawing)
			b.px = b.x;
			b.py = b.y;

			let sepX = 0, sepY = 0;
			let alignVx = 0, alignVy = 0, alignCount = 0;
			let cohX = 0, cohY = 0, cohCount = 0;

			// Spatial grid neighbor lookup
			const cx = Math.min((b.x / CELL_SIZE) | 0, gridCols - 1);
			const cy = Math.min((b.y / CELL_SIZE) | 0, gridRows - 1);
			const cxMin = cx > 0 ? cx - 1 : 0;
			const cxMax = cx < gridCols - 1 ? cx + 1 : gridCols - 1;
			const cyMin = cy > 0 ? cy - 1 : 0;
			const cyMax = cy < gridRows - 1 ? cy + 1 : gridRows - 1;

			for (let gy = cyMin; gy <= cyMax; gy++) {
				for (let gx = cxMin; gx <= cxMax; gx++) {
					const cellIdx = gy * gridCols + gx;
					const count = gridCounts[cellIdx];
					const base = cellIdx * MAX_PER_CELL;
					for (let k = 0; k < count; k++) {
						const j = gridCells[base + k];
						if (j === i) continue;
						const other = boids[j];
						const dx = other.x - b.x;
						const dy = other.y - b.y;
						const d2 = dx * dx + dy * dy;

						if (d2 < sepD2 && d2 > 0) {
							const dist = Math.sqrt(d2);
							sepX -= dx / dist;
							sepY -= dy / dist;
						}
						if (d2 < vr2) {
							alignVx += other.vx;
							alignVy += other.vy;
							alignCount++;
							cohX += other.x;
							cohY += other.y;
							cohCount++;
						}
					}
				}
			}

			b.vx += sepX * SEPARATION_FORCE;
			b.vy += sepY * SEPARATION_FORCE;
			if (alignCount > 0) {
				b.vx += (alignVx / alignCount - b.vx) * ALIGNMENT_FORCE;
				b.vy += (alignVy / alignCount - b.vy) * ALIGNMENT_FORCE;
			}
			if (cohCount > 0) {
				b.vx += (cohX / cohCount - b.x) * COHESION_FORCE;
				b.vy += (cohY / cohCount - b.y) * COHESION_FORCE;
			}

			// Flee from predator
			let currentMaxSpeed = MAX_SPEED;
			const fdx = b.x - predX;
			const fdy = b.y - predY;
			const fd2 = fdx * fdx + fdy * fdy;
			if (fd2 < scareR2 && fd2 > 0) {
				const fdist = Math.sqrt(fd2);
				const s = FLEE_FORCE * (1 - fdist / PREDATOR_SCARE_RADIUS);
				b.vx += (fdx / fdist) * s;
				b.vy += (fdy / fdist) * s;
				currentMaxSpeed = FLEE_SPEED;
			}

			// Flee from cursor
			const cdx = b.x - mouseX;
			const cdy = b.y - mouseY;
			const cd2 = cdx * cdx + cdy * cdy;
			if (cd2 < cursorR2 && cd2 > 0) {
				const cdist = Math.sqrt(cd2);
				const s = CURSOR_FLEE_FORCE * (1 - cdist / CURSOR_SCARE_RADIUS);
				b.vx += (cdx / cdist) * s;
				b.vy += (cdy / cdist) * s;
				currentMaxSpeed = FLEE_SPEED;
			}

			if (b.x < EDGE_MARGIN) b.vx += EDGE_TURN;
			if (b.x > width - EDGE_MARGIN) b.vx -= EDGE_TURN;
			if (b.y < EDGE_MARGIN) b.vy += EDGE_TURN;
			if (b.y > height - EDGE_MARGIN) b.vy -= EDGE_TURN;

			const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
			if (speed > currentMaxSpeed) {
				b.vx = (b.vx / speed) * currentMaxSpeed;
				b.vy = (b.vy / speed) * currentMaxSpeed;
			} else if (speed < MIN_SPEED && speed > 0) {
				b.vx = (b.vx / speed) * MIN_SPEED;
				b.vy = (b.vy / speed) * MIN_SPEED;
			}

			b.x += b.vx;
			b.y += b.vy;
		}
	}

	function draw() {
		if (!ctx) return;

		// Fade existing pixels toward transparent (trail lifespan)
		ctx.globalCompositeOperation = 'destination-out';
		ctx.globalAlpha = TRAIL_FADE;
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, height);
		ctx.globalCompositeOperation = 'source-over';

		// --- Boid trail segments (prev -> current), batched by color ---
		ctx.lineWidth = 1.5;
		for (let c = 0; c < NUM_COLORS; c++) {
			ctx.globalAlpha = COLOR_BASE_ALPHA[c] * 0.6;
			ctx.strokeStyle = COLOR_STR[c];
			ctx.beginPath();

			for (let i = 0; i < boids.length; i++) {
				const b = boids[i];
				if (b.colorIdx !== c) continue;
				ctx.moveTo(b.px, b.py);
				ctx.lineTo(b.x, b.y);
			}

			ctx.stroke();
		}

		// --- Boid heads, batched by color (no trig -- direction from velocity) ---
		for (let c = 0; c < NUM_COLORS; c++) {
			ctx.globalAlpha = COLOR_BASE_ALPHA[c];
			ctx.fillStyle = COLOR_STR[c];
			ctx.beginPath();

			for (let i = 0; i < boids.length; i++) {
				const b = boids[i];
				if (b.colorIdx !== c) continue;

				const inv = 1 / (Math.sqrt(b.vx * b.vx + b.vy * b.vy) + 1e-8);
				const ux = b.vx * inv, uy = b.vy * inv;
				const perpX = -uy, perpY = ux;
				const s = BOID_SIZE;

				ctx.moveTo(b.x + ux * s * 2, b.y + uy * s * 2);
				ctx.lineTo(b.x - ux * s + perpX * s, b.y - uy * s + perpY * s);
				ctx.lineTo(b.x - ux * s - perpX * s, b.y - uy * s - perpY * s);
			}

			ctx.fill();
		}

		// --- Predator trail segment ---
		ctx.lineWidth = 2;
		ctx.globalAlpha = 0.4;
		ctx.strokeStyle = 'rgb(180,60,60)';
		ctx.beginPath();
		ctx.moveTo(predator.px, predator.py);
		ctx.lineTo(predator.x, predator.y);
		ctx.stroke();

		// --- Predator head ---
		const p = predator;
		const pInv = 1 / (Math.sqrt(p.vx * p.vx + p.vy * p.vy) + 1e-8);
		const pux = p.vx * pInv, puy = p.vy * pInv;
		const pperpX = -puy, pperpY = pux;
		const sz = PREDATOR_SIZE;
		ctx.globalAlpha = 0.7;
		ctx.fillStyle = 'rgb(180,60,60)';
		ctx.beginPath();
		ctx.moveTo(p.x + pux * sz * 2, p.y + puy * sz * 2);
		ctx.lineTo(p.x - pux * sz + pperpX * sz, p.y - puy * sz + pperpY * sz);
		ctx.lineTo(p.x - pux * sz - pperpX * sz, p.y - puy * sz - pperpY * sz);
		ctx.fill();

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
		rebuildGrid();
		if (boids.length === 0) {
			initBoids();
			initPredator();
		}
		if (ctx) ctx.clearRect(0, 0, width, height);
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
