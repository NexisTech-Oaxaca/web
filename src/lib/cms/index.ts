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

export async function getEvents(): Promise<EventItem[]> {
	if (!hasStrapi) return localEvents;
	const items = await fetchCollection('api/events');
	return items.map((item) => normalizeEvent(item, strapiBaseUrl));
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
	if (!hasStrapi) return findBySlug(localEvents, slug);
	const item = await fetchBySlug('api/events', slug);
	return item ? normalizeEvent(item, strapiBaseUrl) : null;
}

export async function getProjects(): Promise<ProjectItem[]> {
	if (!hasStrapi) return localProjects;
	const items = await fetchCollection('api/projects');
	return items.map((item) => normalizeProject(item, strapiBaseUrl));
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
	if (!hasStrapi) return findBySlug(localProjects, slug);
	const item = await fetchBySlug('api/projects', slug);
	return item ? normalizeProject(item, strapiBaseUrl) : null;
}

export async function getStartups(): Promise<StartupItem[]> {
	if (!hasStrapi) return localStartups;
	const items = await fetchCollection('api/startups');
	return items.map((item) => normalizeStartup(item, strapiBaseUrl));
}

export async function getStartupBySlug(slug: string): Promise<StartupItem | null> {
	if (!hasStrapi) return findBySlug(localStartups, slug);
	const item = await fetchBySlug('api/startups', slug);
	return item ? normalizeStartup(item, strapiBaseUrl) : null;
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
