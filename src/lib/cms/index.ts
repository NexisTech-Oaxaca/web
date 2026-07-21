import type { AxiosResponse } from 'axios';
import type { EventItem, HomeContent, ProjectItem, StartupItem, TeamMember } from './types';
import apiClient, { hasStrapi, strapiBaseUrl, toQuery, flattenEntry } from './client';
import {
	localEvents,
	localHomeContent,
	localProjects,
	localStartups,
	localTeam,
	normalizeEvent,
	normalizeProject,
	normalizeStartup,
	normalizeTeamMember,
} from './normalize';

const findBySlug = <T extends { slug: string; id: string }>(items: T[], slug: string) =>
	items.find((item) => item.slug === slug) ?? null;

const publishedParams = { status: 'published', populate: '*' };

async function fetchCollection<T = Record<string, unknown>>(
	path: string,
): Promise<T[]> {
	const query = toQuery(publishedParams);
	try {
		const response: AxiosResponse<{ data?: unknown[] }> = await apiClient.get(`/${path}?${query}`);
		if (!response.data?.data || !Array.isArray(response.data.data)) return [];
		return response.data.data.map((item) => flattenEntry(item)).filter(Boolean) as T[];
	} catch {
		return [];
	}
}

async function fetchBySlug<T = Record<string, unknown>>(
	collectionPath: string,
	slug: string,
): Promise<T | null> {
	const query = toQuery({ ...publishedParams, 'filters[slug][$eq]': slug });
	try {
		const response: AxiosResponse<{ data?: unknown[] | unknown }> = await apiClient.get(`/${collectionPath}?${query}`);
		if (!response.data?.data) return null;
		const items = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
		const entry = flattenEntry(items[0]);
		return entry as T | null;
	} catch {
		return null;
	}
}

async function fetchWithFallback<T>(
	fetchFn: () => Promise<T[]>,
	localFallback: T[],
): Promise<T[]> {
	if (!hasStrapi) return localFallback;
	const items = await fetchFn();
	return items.length > 0 ? items : localFallback;
}

async function fetchOneWithFallback<T>(
	fetchFn: () => Promise<T | null>,
	fallbackList: T[],
	slug: string,
): Promise<T | null> {
	if (!hasStrapi) return findBySlug(fallbackList, slug);
	const item = await fetchFn();
	return item ?? findBySlug(fallbackList, slug);
}

export async function getEvents(): Promise<EventItem[]> {
	return fetchWithFallback(
		async () => {
			const items = await fetchCollection('api/events');
			return items.map((item) => normalizeEvent(item, strapiBaseUrl));
		},
		localEvents,
	);
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
	return fetchOneWithFallback(
		async () => {
			const item = await fetchBySlug('api/events', slug);
			return item ? normalizeEvent(item, strapiBaseUrl) : null;
		},
		localEvents,
		slug,
	);
}

export async function getProjects(): Promise<ProjectItem[]> {
	return fetchWithFallback(
		async () => {
			const items = await fetchCollection('api/projects');
			return items.map((item) => normalizeProject(item, strapiBaseUrl));
		},
		localProjects,
	);
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
	return fetchOneWithFallback(
		async () => {
			const item = await fetchBySlug('api/projects', slug);
			return item ? normalizeProject(item, strapiBaseUrl) : null;
		},
		localProjects,
		slug,
	);
}

export async function getStartups(): Promise<StartupItem[]> {
	return fetchWithFallback(
		async () => {
			const items = await fetchCollection('api/startups');
			return items.map((item) => normalizeStartup(item, strapiBaseUrl));
		},
		localStartups,
	);
}

export async function getStartupBySlug(slug: string): Promise<StartupItem | null> {
	return fetchOneWithFallback(
		async () => {
			const item = await fetchBySlug('api/startups', slug);
			return item ? normalizeStartup(item, strapiBaseUrl) : null;
		},
		localStartups,
		slug,
	);
}

export async function getTeamMembers(): Promise<TeamMember[]> {
	if (!hasStrapi) return localTeam;
	const items = await fetchCollection('api/team-members');
	return items.map((item, index) => normalizeTeamMember(item, index, strapiBaseUrl));
}

export async function getHomeContent(): Promise<HomeContent> {
	if (!hasStrapi) return localHomeContent;

	const [events, projects, team] = await Promise.all([
		getEvents(),
		getProjects(),
		getTeamMembers(),
	]);

	return { events, projects, team };
}

export { hasStrapi };
export type { EventItem, HomeContent, ProjectItem, StartupItem, TeamMember } from './types';
