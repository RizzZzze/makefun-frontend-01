import { date, esc, money } from './main.js';
const pct = value => value == null ? '—' : `${(Number(value) > 1 ? Number(value) / 10000 : Number(value) * 100).toFixed(1)}%`;
function winRate(r) {
  const j = r.judge || {}, v = r.values || {};
  if (j.win_rate != null) return Number(j.win_rate) > 1 ? Number(j.win_rate) : Number(j.win_rate) * 100;
  if (v.judge != null) return Number(v.judge) > 1 ? Number(v.judge) / 10000 : Number(v.judge) * 100;
  const wins = Number(j.wins ?? v.wins ?? 0), draws = Number(j.draws ?? v.draws ?? 0), losses = Number(j.losses ?? v.losses ?? 0), total = wins + draws + losses;
  return total ? (wins + draws / 2) / total * 100 : null;
}
function interval(r) {
  const value = r.interval;
  if (!value || value.low == null || value.high == null) return '—';
  return `${pct(value.low)}–${pct(value.high)}`;
}

export function leaderboard(data, slug, bountyData = {}) {
  const rows = data.entries || data.rows || [];
  const phase = data.phase?.key || 'dev';
  const filtered = rows.filter(r => !data.handleFilter || String(r.handle || '').toLowerCase().includes(data.handleFilter.toLowerCase()));
  const pageSize = 25, pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(0, Number(data.page || 0)), pages - 1);
  const prizes = bountyData.rewardsNow || [];
  const renderPrize = r => {
    const reward = prizes.find(x => Number(x.place) === Number(r.prize_rank));
    const fallback = bountyData.rewards?.[String(r.prize_rank)];
    return r.prize_rank ? money(reward?.amountUsd ?? fallback) : '—';
  };
  const body = filtered.slice(page * pageSize, (page + 1) * pageSize).map((r, i) => {
    const rank = r.rank?.overall ?? r.ranks?.overall ?? r.rank?.performance ?? r.rank ?? page * pageSize + i + 1;
    const rate = winRate(r);
    return `<tr><td class="rank-cell">${esc(rank)}</td><td class="entrant-cell"><a href="#/profile/${encodeURIComponent(r.handle || '')}">@${esc(r.handle || 'unknown')}</a><small>${esc(r.title || 'Untitled entry')}</small></td><td class="rate-cell">${rate == null ? '—' : `${rate.toFixed(1)}%`}</td><td class="interval-cell">${interval(r)}</td><td class="prize-cell">${renderPrize(r)}</td><td class="entered-cell">${r.received_at ? date(r.received_at, { month: 'short', day: 'numeric' }) : '—'}</td></tr>`;
  }).join('');
  const first = filtered.length ? page * pageSize + 1 : 0, last = Math.min((page + 1) * pageSize, filtered.length);
  return `<section class="leaderboard-page"><div class="leaderboard-heading"><p class="eyebrow">LIVE STANDINGS / ${esc(slug)}</p><nav class="breadcrumb"><a href="#/">Board</a><span>/</span><a href="#/bounty/${encodeURIComponent(slug)}">${esc(bountyData.title || slug)}</a><span>/</span><span>Leaderboard</span></nav>
    <div class="leaderboard-title-row"><div><h1>Leaderboard</h1><p>${esc(bountyData.title || data.title || 'Bounty standings')} <span>·</span> ${rows.length.toLocaleString()} entries</p></div><div class="phase-mark">${phase === 'final' ? 'FINAL' : 'DEVELOPMENT'}<small>${esc(data.phase?.title || '')}</small></div></div>
    <nav class="table-pagination" aria-label="Leaderboard pages"><span>Rows <b>${first}–${last}</b> of <b>${filtered.length.toLocaleString()}</b> <i>·</i> Page <b>${page + 1}</b> of <b>${pages}</b></span><div><button data-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>← Prev</button><button data-page="${page + 1}" ${page + 1 >= pages ? 'disabled' : ''}>Next →</button></div></nav></div>
    <div class="leaderboard-controls"><div class="phase-tabs" role="tablist" aria-label="Leaderboard phase"><button data-phase="dev" role="tab" aria-selected="${phase !== 'final'}" class="${phase !== 'final' ? 'active' : ''}">Development</button><button data-phase="final" role="tab" aria-selected="${phase === 'final'}" class="${phase === 'final' ? 'active' : ''}">Final</button></div><label class="handle-filter"><span>Filter handle</span><input type="search" data-handle-filter placeholder="Search entrants" value="${esc(data.handleFilter || '')}"></label></div>
    <div class="table-wrap"><table class="leaderboard-table"><thead><tr><th>Rank</th><th>Entrant / entry</th><th>Judge win rate</th><th class="interval-cell">90% interval</th><th>Prize</th><th>Entered</th></tr></thead><tbody>${body || `<tr><td colspan="6" class="empty-table">${rows.length ? 'No entrants match this handle.' : 'No final standings have been published.'}</td></tr>`}</tbody></table></div>
  </section>`;
}
