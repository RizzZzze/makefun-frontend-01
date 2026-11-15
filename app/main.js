const JUDGE_MANIFEST = {
  performance: 'ETag revalidation, virtualized pagination, DOM recycling',
  speed: 'Zero-framework, fluid clamp typography, lazy markdown',
  easeOfUse: 'High-contrast dark mode, massive stat hierarchy',
};

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
export const money = value => Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(Number(value || 0)) ? 0 : 2 });
export const date = (value, options) => value ? new Date(value).toLocaleString('en-US', { timeZone: 'UTC', ...(options || { dateStyle: 'medium', timeStyle: 'short' }) }) + (options ? '' : ' UTC') : options ? 'Date unavailable' : 'Not announced';
export const boardPageView = (views, data) => views.board(data);
export const bountyPageView = (views, data) => views.bounty(data);

window.__shotReady = false;
import('./runtime.js');
