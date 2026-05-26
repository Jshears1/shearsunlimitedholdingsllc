export const API_BASE = 'https://shearsunlimitedholdingsllc.jessenshears.workers.dev';

export function imgUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}
