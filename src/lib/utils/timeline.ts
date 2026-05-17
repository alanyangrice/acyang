export type TimelineSource = {
	id: string;
	start: number;
	end: number;
};

export type TimelineItem<T extends TimelineSource> = T & {
	column: number;
	top: number;
	bottom: number;
	height: number;
	center: number;
};

type TimelineConfig = {
	axisHeight: number;
	padding: number;
	start: number;
	end: number;
};

export const month = (year: number, monthIndex: number) => Date.UTC(year, monthIndex, 1);

const overlaps = (a: TimelineSource, b: TimelineSource) => a.start <= b.end && a.end >= b.start;

const positionForDate = (date: number, config: TimelineConfig) =>
	((config.end - date) / (config.end - config.start)) * config.axisHeight;

export const buildTimeline = <T extends TimelineSource>(
	items: T[],
	config: TimelineConfig
): TimelineItem<T>[] => {
	const timelineItems: TimelineItem<T>[] = [];

	items.forEach((item) => {
		const usedColumns = new Set(
			timelineItems.filter((previous) => overlaps(item, previous)).map((previous) => previous.column)
		);

		let column = 0;
		while (usedColumns.has(column)) column += 1;

		const top = positionForDate(item.end, config);
		const bottom = positionForDate(item.start, config);
		const height = Math.max(bottom - top, 12);

		timelineItems.push({
			...item,
			column,
			top: top + config.padding,
			bottom: bottom + config.padding,
			height,
			center: top + height / 2 + config.padding
		});
	});

	return timelineItems;
};

export const buildYearLabels = (years: number[], config: TimelineConfig) =>
	years.map((year) => ({
		year: String(year),
		top: positionForDate(month(year, 0), config) + config.padding
	}));
