import { api } from './client';

export interface SitePage {
  id: number;
  villaId: number;
  slug: string;
  titleEn: string;
  titleEl: string | null;
  contentEn: string;
  contentEl: string | null;
  lastModified: string;
  createdAt: string;
}

export interface SitePageListItem {
  id: number;
  slug: string;
  titleEn: string;
  titleEl: string | null;
  lastModified: string;
  createdAt: string;
}

export const PRIVACY_SLUG = 'privacy-policy';
export const TERMS_SLUG = 'terms-and-conditions';

interface SitePageResponse {
  data: SitePage;
}

interface SitePageListResponse {
  data: SitePageListItem[];
}

export async function fetchPageBySlug(slug: string): Promise<SitePage> {
  const res = await api<SitePageResponse>(`/api/pages/${slug}`);
  return res.data;
}

export async function fetchAdminPages(): Promise<SitePageListItem[]> {
  const res = await api<SitePageListResponse>('/api/admin/pages');
  return res.data;
}

export async function fetchAdminPageById(id: number): Promise<SitePage> {
  const res = await api<SitePageResponse>(`/api/admin/pages/${id}`);
  return res.data;
}

export interface UpdateSitePageInput {
  titleEn?: string;
  titleEl?: string | null;
  contentEn?: string;
  contentEl?: string | null;
}

export async function updateSitePage(
  id: number,
  data: UpdateSitePageInput,
): Promise<SitePage> {
  const res = await api<SitePageResponse>(`/api/admin/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}
