export const API_BASE = 'https://www.shearsunlimitedholdingsllc.com';

export function imgUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}
