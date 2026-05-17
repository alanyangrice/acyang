import { month } from '$lib/utils/timeline';

export type Experience = {
	id: string;
	role: string;
	company: string;
	url: string;
	period: string;
	location?: string;
	start: number;
	end: number;
	bullets: string[];
	tags: string[];
};

export const experiences: Experience[] = [
	{
		id: 'aws',
		role: 'Software Development Engineer Intern',
		company: 'AWS — Redshift',
		url: 'https://aws.amazon.com/redshift/',
		period: 'Jun 2026 — Aug 2026',
		location: 'Redmond, WA',
		start: month(2026, 5),
		end: month(2026, 7),
		bullets: ['Incoming Summer 2026.'],
		tags: []
	},
	{
		id: 'recruitu',
		role: 'Software Engineer Intern',
		company: 'RecruitU',
		url: 'https://recruitu.com',
		period: 'Jan 2026 — May 2026',
		location: 'New York, NY',
		start: month(2026, 0),
		end: month(2026, 4),
		bullets: [
			'Built a Go parity-testing CLI for a Python-to-Go migration, cutting per-endpoint QA from 15 minutes to seconds.',
			'Migrated search from Typesense to Elasticsearch, reducing infrastructure costs by 80%.',
			'Shipped Firestore-to-PostgreSQL ETL with dual-write syncing across 43 collections.'
		],
		tags: ['Go', 'Elasticsearch', 'PostgreSQL', 'Firestore', 'Python']
	},
	{
		id: 'breakin',
		role: 'Co-Founder',
		company: 'BreakIn (acquired)',
		url: 'https://breakin.ai',
		period: 'Apr 2025 — Dec 2025',
		start: month(2025, 3),
		end: month(2025, 11),
		bullets: [
			'Grew BreakIn to $100k ARR and 2,000+ users by architecting Stripe subscription and billing.',
			'Reduced API latency from 3s to under 500ms by eliminating N+1 queries and adding async Redis micro-caching.',
			'Built a vectorized semantic search layer over 100k+ banker profiles.',
			'Obtained CASA Tier 2 verification with captcha, CSRF protection, CORS, and secure headers.'
		],
		tags: ['Python', 'FastAPI', 'TypeScript', 'React', 'Supabase', 'Redis', 'Docker']
	},
	{
		id: 'baylor',
		role: 'Research Intern',
		company: 'Baylor College of Medicine',
		url: 'https://www.bcm.edu/research/faculty-labs/robert-waterland-lab',
		period: 'May 2024 — May 2025',
		location: 'Houston, TX',
		start: month(2024, 4),
		end: month(2025, 4),
		bullets: [
			'Automated whole-genome bisulfite sequencing processing with Bash on Linux clusters at 2TB+ scale.',
			'Built statistical algorithms for intraclass correlation coefficients across Illumina methylation array datasets.',
			'Designed an LLM-powered literature triage pipeline classifying 2,000 papers into exportable labels and metadata.',
			'Analyzed longitudinal systemic epigenetic variation; co-authored paper accepted to Nucleic Acids Research.'
		],
		tags: ['Python', 'R', 'Bash', 'Linux', 'Bioinformatics']
	},
	{
		id: 'riceapps',
		role: 'Full Stack Engineer',
		company: 'RiceApps',
		url: 'https://riceapps.org',
		period: 'Oct 2023 — Apr 2024',
		location: 'Houston, TX',
		start: month(2023, 9),
		end: month(2024, 3),
		bullets: [
			'Developed a theater management app for Rice Dance Theatre with MongoDB, Express, React, and Node.',
			'Built JWT auth and role-based Express middleware for admin and attendee flows; shipped QR check-in, seat selection, event details, and reservations.'
		],
		tags: ['MongoDB', 'Express', 'React', 'Node.js']
	}
];
