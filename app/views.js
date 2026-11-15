import { date, esc, money } from './main.js';
const timeLeft = value => {
  const ms = new Date(value).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return 'ended';
  const hours = Math.floor(ms / 3600000), days = Math.floor(hours / 24), minutes = Math.floor((ms % 3600000) / 60000);
  return days ? `${days}d ${hours % 24}h left` : hours ? `${hours}h ${minutes}m left` : `${minutes}m left`;
};
const isEnded = b => Boolean(b.ended || b.status === 'ended' || (b.deadline && Date.parse(b.deadline) < Date.now()));
const pot = b => money(b.potUsd ?? b.rewardAmount);
const fee = b => Number(b.entryFeeUsd || 0);
const placeCount = b => Object.keys(b.rewards || {}).length;
const urgency = b => {
  const hours = (Date.parse(b.deadline) - Date.now()) / 3600000;
  return hours < 1 ? 'urgent' : hours < 24 ? 'soon' : 'open';
};
const progress = b => {
  const start = Date.parse(b.publishedAt || b.createdAt || b.openedAt), end = Date.parse(b.deadline), now = Date.now();
  return Number.isFinite(start) && Number.isFinite(end) && end > start ? Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100)) : 0;
};

function boardRows(items, selected) {
  return items.map(b => {
    const image = b.imageUrl || b.thumbnailUrl || b.image;
    const urgencyClass = urgency(b);
    return `<li class="board-row${image ? ' has-image' : ''}${selected === b.slug ? ' selected' : ''}" data-key="${esc(b.slug)}">
      <button class="board-select" type="button" data-select="${esc(b.slug)}" aria-pressed="${selected === b.slug}">
        ${image ? `<img loading="lazy" src="${esc(image)}" alt="" onerror="this.parentElement.parentElement.classList.remove('has-image');this.remove()">` : ''}
        <span class="row-title">${esc(b.title)}</span><span class="row-meta">${esc(b.category || 'General')} <i></i> ${placeCount(b)} paid places</span>
        <span class="row-pot">${pot(b)}<small>LIVE POT</small></span>
        <span class="row-fee${fee(b) ? ' paid' : ''}">${fee(b) ? money(fee(b)) : 'Free'}<small>ENTRY</small></span>
        <span class="row-time ${urgencyClass}">${timeLeft(b.deadline)}<small>LEFT</small><i class="time-track"><b style="width:${progress(b)}%"></b></i></span>
        <span class="row-entries">${Number(b.submissionCount || 0).toLocaleString()}<small>ENTRIES</small></span>
      </button></li>`;
  }).join('') || '<li class="empty-state">No bounties match these filters.</li>';
}

function bountyDetail(b, { cover = false } = {}) {
  const rewards = b.rewardsNow || Object.entries(b.rewards || {}).map(([place, baseUsd]) => ({ place: Number(place), baseUsd, feeShareUsd: 0, amountUsd: baseUsd }));
  const tiers = [{ label: '1st', first: 1, last: 1 }, { label: '2nd', first: 2, last: 2 }, { label: '3rd', first: 3, last: 3 }, { label: '4th–10th', first: 4, last: 10 }, { label: '11th–20th', first: 11, last: 20 }].map(tier => {
    const places = rewards.filter(r => Number(r.place) >= tier.first && Number(r.place) <= tier.last);
    const base = places.reduce((sum, r) => sum + Number(r.baseUsd || 0), 0);
    const share = places.reduce((sum, r) => sum + Number(r.feeShareUsd || 0), 0);
    const total = places.reduce((sum, r) => sum + Number(r.amountUsd ?? Number(r.baseUsd || 0) + Number(r.feeShareUsd || 0)), 0);
    return { ...tier, base, share, total };
  });
  const max = Math.max(1, ...tiers.map(tier => tier.total));
  const passed = (b.submissions || []).filter(s => s.status === 'passed').length;
  const urgencyClass = urgency(b);
  const announcedWithin = String(b.resolution?.announce || '').match(/within\s+(\d+)\s+days?/i);
  const derivedResultsBy = announcedWithin && b.deadline ? new Date(Date.parse(b.deadline) + Number(announcedWithin[1]) * 86400000).toISOString() : null;
  const resultsBy = b.resultsBy || b.results_by || b.resolution?.announceAt || derivedResultsBy;
  return `<article class="detail-sheet${cover ? ' cover-detail' : ''}">
    <nav class="breadcrumb"><a href="#/">Board</a><span>/</span><span>${esc(b.category || 'Bounty')}</span></nav>
    <p class="eyebrow">${esc(b.category || 'OPEN BOUNTY')} / ${esc(b.slug)}</p>
    <h1>${esc(b.title)}</h1><p class="status-line"><b class="status-dot ${isEnded(b) ? 'ended' : urgencyClass}"></b>${isEnded(b) ? 'CLOSED' : 'OPEN FOR ENTRIES'} <span>·</span> ${esc(b.sponsor?.name || 'make.fun')} <span>·</span> ${Number(b.submissionCount || 0).toLocaleString()} entries</p>
    ${b.summary ? `<p class="detail-summary">${esc(b.summary)}</p>` : ''}
    <div class="detail-stats">
      <div><small>LIVE POT</small><strong class="money-figure">${pot(b)}</strong><span>Base ${money(b.rewardAmount)} <i>+</i> fees ${money(b.entryFeesUsd || 0)}</span></div>
      <div><small>ENTRY FEE</small><strong class="stat-value">${fee(b) ? money(fee(b)) : 'Free'}</strong><span>${b.entryFeePayers ? `${Number(b.entryFeePayers).toLocaleString()} paid entries` : 'No fee to enter'}</span></div>
      <div><small>TIME LEFT</small><strong class="stat-value ${urgencyClass}">${timeLeft(b.deadline)}</strong><span>Deadline ${date(b.deadline)}</span></div>
      <div><small>ENTRIES</small><strong class="stat-value">${Number(b.submissionCount || 0).toLocaleString()}</strong><span>${passed.toLocaleString()} passed checks</span></div>
    </div>
    <div class="detail-actions"><a class="action-link" href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">Leaderboard <span>↗</span></a><a class="action-link primary-action" href="https://make.fun/bounty/${encodeURIComponent(b.slug)}" target="_blank" rel="noreferrer">Enter bounty <span>↗</span></a></div>
    <section class="rewards-section"><div class="section-heading"><h2>Rewards by place</h2><span>USD / current</span></div>
      <div class="reward-chart">${tiers.map(tier => {
        return `<div class="reward-row"><b>${tier.label}</b><span class="reward-track"><i class="reward-base" style="width:${tier.base / max * 100}%"></i><i class="reward-share" style="width:${tier.share / max * 100}%"></i></span><strong>${money(tier.total)}</strong></div>`;
      }).join('')}</div>
      <p class="chart-legend"><i></i> Bars are to scale; blue is the fee share.</p>
    </section>
    <div class="dates-row"><div><small>OPENED</small><b>${date(b.publishedAt || b.openedAt || b.createdAt)}</b></div><div><small>DEADLINE</small><b>${date(b.deadline)}</b></div><div><small>RESULTS BY</small><b>${date(resultsBy)}</b></div></div>
    ${!cover ? `<section class="long-copy"><h2>Description</h2><div class="description markdown-lazy" data-md="${esc(b.description || '')}">Loading description…</div><h2>Rules</h2><div class="description">${esc(b.rules || 'See the bounty description for requirements.')}</div></section>` : ''}
  </article>`;
}

export function board(data) {
  const all = data.items || [];
  const open = all.filter(b => !isEnded(b) && (!b.status || b.status === 'open'));
  const ended = all.filter(isEnded);
  const categories = [...new Set(open.map(b => b.category).filter(Boolean))].sort();
  const query = String(data.search || '').trim().toLowerCase();
  const feeFilter = data.feeFilter || 'all', category = data.category || 'all';
  const visible = open.filter(b => (!query || `${b.title} ${b.category} ${b.slug}`.toLowerCase().includes(query)) && (feeFilter === 'all' || (feeFilter === 'paid' ? fee(b) > 0 : fee(b) === 0)) && (category === 'all' || b.category === category));
  const sort = data.sort || 'deadline';
  visible.sort((a, b) => sort === 'pot' ? Number(b.potUsd || 0) - Number(a.potUsd || 0) : sort === 'entries' ? Number(b.submissionCount || 0) - Number(a.submissionCount || 0) : sort === 'newest' ? Date.parse(b.publishedAt || b.createdAt) - Date.parse(a.publishedAt || a.createdAt) : Date.parse(a.deadline) - Date.parse(b.deadline));
  const selected = visible.find(b => b.slug === data.selected) || visible.find(b => fee(b) > 0) || visible[0];
  const pageSize = 10, page = Math.max(0, Math.min(Number(data.page || 0), Math.max(0, Math.ceil(visible.length / pageSize) - 1)));
  const pageItems = visible.slice(page * pageSize, (page + 1) * pageSize);
  return `<section class="cover-layout">
    <div class="board-pane"><div class="cover-heading"><div><p class="eyebrow">MAKE.FUN / COMPETITIONS</p><h1>Opportunity<br>ledger<span>.</span></h1></div><div class="board-total"><b>${open.length}</b><small>OPEN</small></div></div>
      <div class="board-tools"><label class="search-field"><span>⌕</span><input type="search" data-search placeholder="Search bounties" value="${esc(data.search || '')}" aria-label="Search bounties"></label>
        <label class="sort-field"><span class="sr-only">Sort by</span><select data-sort aria-label="Sort bounties"><option value="deadline"${sort === 'deadline' ? ' selected' : ''}>Closing soon</option><option value="pot"${sort === 'pot' ? ' selected' : ''}>Largest pot</option><option value="entries"${sort === 'entries' ? ' selected' : ''}>Most entries</option><option value="newest"${sort === 'newest' ? ' selected' : ''}>Recently opened</option></select></label>
      </div>
      <div class="filter-block"><div class="chip-row" aria-label="Entry fee filter">${['all','free','paid'].map(v => `<button class="filter-chip${(data.feeFilter || 'all') === v ? ' active' : ''}" data-fee="${v}" aria-pressed="${(data.feeFilter || 'all') === v}">${v === 'all' ? 'All' : v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div>
        <div class="chip-row category-chips" aria-label="Category filter"><button class="filter-chip${(data.category || 'all') === 'all' ? ' active' : ''}" data-category="all">All</button>${categories.map(c => `<button class="filter-chip${data.category === c ? ' active' : ''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      </div>
      <div class="list-caption"><span>LIVE BOARD</span><span>${visible.length} results</span></div><ul class="board-list">${boardRows(pageItems, selected?.slug)}</ul>
      <nav class="pagination" aria-label="Board pages"><button data-page="${Math.max(0, page - 1)}" ${page === 0 ? 'disabled' : ''}>Prev</button><span>Page ${page + 1} / ${Math.max(1, Math.ceil(visible.length / pageSize))}</span><button data-page="${page + 1}" ${page + 1 >= Math.ceil(visible.length / pageSize) ? 'disabled' : ''}>Next</button></nav>
      ${ended.length ? `<details class="ended-disclosure"><summary>Ended bounties <span>${ended.length}</span></summary><ul>${ended.map(b => `<li><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a><span>Ended</span></li>`).join('')}</ul></details>` : ''}
    </div><div class="detail-pane">${selected ? bountyDetail(selected, { cover: true }) : '<div class="empty-detail">Choose a bounty to inspect.</div>'}</div>
  </section>`;
}

export function bounty(b) { return `<div class="single-detail">${bountyDetail(b)}</div>`; }
