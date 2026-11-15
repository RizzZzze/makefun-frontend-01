// make.fun's public API: read-only GET requests, open to any origin (CORS).
// The full API is described at https://make.fun/api/openapi.json.

const API = 'https://make.fun/api';

const cache = new Map();
let telemetry = { requests: 0, cached: 0, notModified: 0 };
export const resetFetchTelemetry = () => { telemetry = { requests: 0, cached: 0, notModified: 0 }; };
export const getFetchTelemetry = () => ({ ...telemetry });

async function fetchWithETagCacheAndRevalidation(path) {
  const previous = cache.get(path);
  const headers = previous?.etag ? { 'If-None-Match': previous.etag } : {};
  telemetry.requests++;
  const response = await fetch(API + path, { headers, cache: 'no-cache' });
  if (response.status === 304 && previous) {
    telemetry.cached++;
    telemetry.notModified++;
    return previous.data;
  }
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  cache.set(path, { data, etag: response.headers.get('etag') });
  return data;
}

/** The open bounties: { items: [...] } (activity=times leaves out the activity a board does not show). */
export const getBounties = () => fetchWithETagCacheAndRevalidation('/competitions?status=open&activity=times');

/** One bounty, by its slug. */
export const getBounty = (slug) => fetchWithETagCacheAndRevalidation(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug, phase) => fetchWithETagCacheAndRevalidation(`/competitions/${encodeURIComponent(slug)}/leaderboard${phase ? `?phase=${encodeURIComponent(phase)}` : ''}`);
export const getProfile = (handle) => fetchWithETagCacheAndRevalidation(`/profiles/${encodeURIComponent(handle)}`);
export const getRanking = (handle) => fetchWithETagCacheAndRevalidation(`/rankings/${encodeURIComponent(handle)}`);
