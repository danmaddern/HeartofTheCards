// Strip trailing slash so `apiUrl('/api/foo')` always works correctly
const raw = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
export const apiBase = raw.replace(/\/$/, '');

export const apiUrl = (path: string) => `${apiBase}${path}`;
