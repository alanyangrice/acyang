<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const CELL_SIZE = 10;
	const ALIVE_PROBABILITY = 0.15;
	const TICK_MS = 100;
	const BRUSH_RADIUS = 1;

	// Shades of blue (0 = dead, 1–4 = alive with different tones)
	const BLUE_SHADES = [
		'rgba(74, 111, 165, 0.22)',
		'rgba(74, 111, 165, 0.16)',
		'rgba(59, 130, 246, 0.18)',
		'rgba(96, 165, 250, 0.14)'
	];
	const NUM_SHADES = BLUE_SHADES.length;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let cols = 0;
	let rows = 0;
	let grid: Uint8Array;
	let nextGrid: Uint8Array;
	let tickInterval: ReturnType<typeof setInterval>;
	let rafId: number;
	let renderQueued = false;
	let forceFullRedraw = true;

	// Precomputed wrap lookup tables
	let wrapXL: Uint16Array;
	let wrapXR: Uint16Array;
	let wrapYA: Uint32Array; // row offset for y-1
	let wrapYB: Uint32Array; // row offset for y+1

	function randomShade(): number {
		return 1 + ((Math.random() * NUM_SHADES) | 0);
	}

	function rebuildLookup() {
		wrapXL = new Uint16Array(cols);
		wrapXR = new Uint16Array(cols);
		for (let x = 0; x < cols; x++) {
			wrapXL[x] = x === 0 ? cols - 1 : x - 1;
			wrapXR[x] = x === cols - 1 ? 0 : x + 1;
		}

		wrapYA = new Uint32Array(rows);
		wrapYB = new Uint32Array(rows);
		for (let y = 0; y < rows; y++) {
			wrapYA[y] = (y === 0 ? rows - 1 : y - 1) * cols;
			wrapYB[y] = (y === rows - 1 ? 0 : y + 1) * cols;
		}
	}

	function invalidate() {
		if (renderQueued) return;
		renderQueued = true;
		rafId = requestAnimationFrame(() => {
			renderQueued = false;
			draw();
		});
	}

	function initAndResize() {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const oldGrid = grid;
		const oldCols = cols;
		const oldRows = rows;

		cols = Math.ceil(canvas.width / CELL_SIZE);
		rows = Math.ceil(canvas.height / CELL_SIZE);
		const len = cols * rows;
		grid = new Uint8Array(len);
		nextGrid = new Uint8Array(len);

		rebuildLookup();

		if (oldGrid && oldCols > 0) {
			// Copy existing state
			const minCols = Math.min(oldCols, cols);
			const minRows = Math.min(oldRows, rows);
			for (let y = 0; y < minRows; y++) {
				const srcOff = y * oldCols;
				const dstOff = y * cols;
				for (let x = 0; x < minCols; x++) {
					grid[dstOff + x] = oldGrid[srcOff + x];
				}
			}
			// Fill new cells randomly
			for (let y = 0; y < rows; y++) {
				const off = y * cols;
				for (let x = 0; x < cols; x++) {
					if (x >= oldCols || y >= oldRows) {
						grid[off + x] = Math.random() < ALIVE_PROBABILITY ? randomShade() : 0;
					}
				}
			}
		} else {
			// First init: random seed
			for (let i = 0; i < len; i++) {
				grid[i] = Math.random() < ALIVE_PROBABILITY ? randomShade() : 0;
			}
		}

		// Copy grid into nextGrid so first diff-draw doesn't see stale data
		nextGrid.set(grid);
		forceFullRedraw = true;
		invalidate();
	}

	function tick() {
		const c = cols;
		const r = rows;
		const g = grid;
		const ng = nextGrid;
		const xl = wrapXL;
		const xr = wrapXR;
		const ya = wrapYA;
		const yb = wrapYB;

		for (let y = 0; y < r; y++) {
			const yOff = y * c;
			const above = ya[y];
			const below = yb[y];

			for (let x = 0; x < c; x++) {
				const left = xl[x];
				const right = xr[x];

				const neighbors =
					(g[above + left] > 0 ? 1 : 0) +
					(g[above + x] > 0 ? 1 : 0) +
					(g[above + right] > 0 ? 1 : 0) +
					(g[yOff + left] > 0 ? 1 : 0) +
					(g[yOff + right] > 0 ? 1 : 0) +
					(g[below + left] > 0 ? 1 : 0) +
					(g[below + x] > 0 ? 1 : 0) +
					(g[below + right] > 0 ? 1 : 0);

				const i = yOff + x;
				const cur = g[i];

				if (cur > 0) {
					ng[i] = (neighbors === 2 || neighbors === 3) ? cur : 0;
				} else {
					ng[i] = neighbors === 3 ? randomShade() : 0;
				}
			}
		}

		// Swap buffers (nextGrid now holds previous generation for diffing)
		const tmp = grid;
		grid = nextGrid;
		nextGrid = tmp;
		invalidate();
	}

	function draw() {
		if (!ctx) return;

		const g = grid;
		const prev = nextGrid; // previous generation after swap
		const c = cols;
		const r = rows;
		const sz = CELL_SIZE;
		const gap = sz - 1;

		if (forceFullRedraw) {
			forceFullRedraw = false;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let s = 0; s < NUM_SHADES; s++) {
				const shade = s + 1;
				ctx.fillStyle = BLUE_SHADES[s];
				ctx.beginPath();
				for (let y = 0; y < r; y++) {
					const yOff = y * c;
					const py = y * sz;
					for (let x = 0; x < c; x++) {
						if (g[yOff + x] === shade) {
							ctx.rect(x * sz, py, gap, gap);
						}
					}
				}
				ctx.fill();
			}
			return;
		}

		// Diff-based draw: only update changed cells
		const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
		let hasChanges = false;

		const len = g.length;
		for (let i = 0; i < len; i++) {
			const now = g[i];
			const old = prev[i];
			if (now === old) continue;

			hasChanges = true;
			const x = (i % c) * sz;
			const y = ((i / c) | 0) * sz;

			// Clear the old cell
			ctx.clearRect(x, y, gap, gap);

			// If now alive, add to the shade's path
			if (now > 0) paths[now - 1].rect(x, y, gap, gap);
		}

		if (hasChanges) {
			for (let s = 0; s < NUM_SHADES; s++) {
				ctx.fillStyle = BLUE_SHADES[s];
				ctx.fill(paths[s]);
			}
		}
	}

	let lastMouseMove = 0;
	function handlePointerMove(e: PointerEvent) {
		const now = performance.now();
		if (now - lastMouseMove < 50) return;
		lastMouseMove = now;

		const cx = (e.clientX / CELL_SIZE) | 0;
		const cy = (e.clientY / CELL_SIZE) | 0;

		for (let dy = -BRUSH_RADIUS; dy <= BRUSH_RADIUS; dy++) {
			const ny = cy + dy;
			if (ny < 0 || ny >= rows) continue;
			const off = ny * cols;
			for (let dx = -BRUSH_RADIUS; dx <= BRUSH_RADIUS; dx++) {
				const nx = cx + dx;
				if (nx >= 0 && nx < cols) {
					grid[off + nx] = randomShade();
				}
			}
		}
		invalidate();
	}

	function handleVisibilityChange() {
		if (document.hidden) {
			clearInterval(tickInterval);
		} else {
			clearInterval(tickInterval);
			tickInterval = setInterval(tick, TICK_MS);
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d', { desynchronized: true });
		initAndResize();

		tickInterval = setInterval(tick, TICK_MS);

		window.addEventListener('resize', initAndResize);
		window.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('visibilitychange', handleVisibilityChange);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		clearInterval(tickInterval);
		cancelAnimationFrame(rafId);
		window.removeEventListener('resize', initAndResize);
		window.removeEventListener('pointermove', handlePointerMove);
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
