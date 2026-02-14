<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const CELL_SIZE = 14;
	const ALIVE_PROBABILITY = 0.15;
	const TICK_MS = 120;
	const BRUSH_RADIUS = 1;

	// Shades of blue (0 = dead, 1–4 = alive with different opacity/tones)
	const BLUE_SHADES = [
		'rgba(74, 111, 165, 0.22)',
		'rgba(74, 111, 165, 0.16)',
		'rgba(59, 130, 246, 0.18)',
		'rgba(96, 165, 250, 0.14)'
	];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let cols = 0;
	let rows = 0;
	let grid: Uint8Array;
	let nextGrid: Uint8Array;
	let tickInterval: ReturnType<typeof setInterval>;
	let rafId: number;
	let isVisible = true;

	function randomShade(): number {
		return 1 + Math.floor(Math.random() * BLUE_SHADES.length);
	}

	function initGrid() {
		cols = Math.ceil(window.innerWidth / CELL_SIZE);
		rows = Math.ceil(window.innerHeight / CELL_SIZE);
		grid = new Uint8Array(cols * rows);
		nextGrid = new Uint8Array(cols * rows);

		// Random initial state; alive cells get a random shade (1–4)
		for (let i = 0; i < grid.length; i++) {
			grid[i] = Math.random() < ALIVE_PROBABILITY ? randomShade() : 0;
		}
	}

	function idx(x: number, y: number): number {
		return y * cols + x;
	}

	function countNeighbors(x: number, y: number): number {
		let count = 0;
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx === 0 && dy === 0) continue;
				const nx = (x + dx + cols) % cols;
				const ny = (y + dy + rows) % rows;
				count += grid[idx(nx, ny)] > 0 ? 1 : 0;
			}
		}
		return count;
	}

	function tick() {
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				const neighbors = countNeighbors(x, y);
				const i = idx(x, y);
				const alive = grid[i] > 0;
				if (alive) {
					nextGrid[i] = neighbors === 2 || neighbors === 3 ? grid[i] : 0;
				} else {
					nextGrid[i] = neighbors === 3 ? randomShade() : 0;
				}
			}
		}
		// Swap buffers
		const tmp = grid;
		grid = nextGrid;
		nextGrid = tmp;
	}

	function draw() {
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				const v = grid[idx(x, y)];
				if (v > 0) {
					ctx.fillStyle = BLUE_SHADES[v - 1];
					ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
				}
			}
		}

		rafId = requestAnimationFrame(draw);
	}

	function resizeCanvas() {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const oldGrid = grid;
		const oldCols = cols;
		const oldRows = rows;

		cols = Math.ceil(canvas.width / CELL_SIZE);
		rows = Math.ceil(canvas.height / CELL_SIZE);
		grid = new Uint8Array(cols * rows);
		nextGrid = new Uint8Array(cols * rows);

		// Copy old state into resized grid
		if (oldGrid) {
			const minCols = Math.min(oldCols, cols);
			const minRows = Math.min(oldRows, rows);
			for (let y = 0; y < minRows; y++) {
				for (let x = 0; x < minCols; x++) {
					grid[idx(x, y)] = oldGrid[y * oldCols + x];
				}
			}
			// Fill new cells randomly
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					if (x >= oldCols || y >= oldRows) {
						grid[idx(x, y)] = Math.random() < ALIVE_PROBABILITY ? randomShade() : 0;
					}
				}
			}
		}
	}

	let lastMouseMove = 0;
	function handleMouseMove(e: MouseEvent) {
		const now = performance.now();
		if (now - lastMouseMove < 50) return; // Throttle to ~20fps
		lastMouseMove = now;

		const cx = Math.floor(e.clientX / CELL_SIZE);
		const cy = Math.floor(e.clientY / CELL_SIZE);

		for (let dy = -BRUSH_RADIUS; dy <= BRUSH_RADIUS; dy++) {
			for (let dx = -BRUSH_RADIUS; dx <= BRUSH_RADIUS; dx++) {
				const nx = cx + dx;
				const ny = cy + dy;
				if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
					grid[idx(nx, ny)] = randomShade();
				}
			}
		}
	}

	function handleTouchMove(e: TouchEvent) {
		const touch = e.touches[0];
		if (!touch) return;
		handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
	}

	function handleVisibilityChange() {
		isVisible = !document.hidden;
		if (isVisible) {
			clearInterval(tickInterval);
			tickInterval = setInterval(tick, TICK_MS);
		} else {
			clearInterval(tickInterval);
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		initGrid();
		resizeCanvas();

		tickInterval = setInterval(tick, TICK_MS);
		rafId = requestAnimationFrame(draw);

		window.addEventListener('resize', resizeCanvas);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('touchmove', handleTouchMove, { passive: true });
		document.addEventListener('visibilitychange', handleVisibilityChange);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		clearInterval(tickInterval);
		cancelAnimationFrame(rafId);
		window.removeEventListener('resize', resizeCanvas);
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('touchmove', handleTouchMove);
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
