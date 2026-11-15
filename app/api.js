// make.fun's public API: read-only GET requests, open to any origin (CORS).
// The full API is described at https://make.fun/api/openapi.json.

const API = 'https://make.fun/api';

const cache = new Map();
async function get(path) {
  const previous = cache.get(path);
  const headers = previous?.etag ? { 'If-None-Match': previous.etag } : {};
  const response = await fetch(API + path, { headers, cache: 'no-cache' });
  if (response.status === 304 && previous) return previous.data;
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  cache.set(path, { data, etag: response.headers.get('etag') });
  return data;
}

/** The open bounties: { items: [...] } (activity=times leaves out the activity a board does not show). */
export const getBounties = () => get('/competitions?status=open&activity=times');

/** One bounty, by its slug. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
export const getRanking = (handle) => get(`/rankings/${encodeURIComponent(handle)}`);
