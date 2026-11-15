// The two pages, each a function from API data to HTML.

import { date, esc, money, timeLeft } from './format.js';

/** The reward as it stands now: the prize plus any entry fees paid into it. */
const pot = (b) => money(b.potUsd ?? b.rewardAmount);

/** The entry fee, when the bounty charges one. */
const fee = (b) => (b.entryFeeUsd ? `${money(b.entryFeeUsd)} entry fee` : '');

export function board(data) {
  const items = data.items || [];
  const isEnded = b => b.ended || (b.deadline && Date.parse(b.deadline) < Date.now());
  const open = items.filter(b => !isEnded(b) && (!b.status || b.status === 'open')).sort((a,b) => Number(Boolean(b.entryFeeUsd))-Number(Boolean(a.entryFeeUsd)));
  const ended = items.filter(isEnded);
  const page = Math.max(0, Number(data.page || 0));
  const pageItems = open.slice(page * 10, page * 10 + 10);
  const rows = pageItems
    .map(
      (b) => `
      <li class="board-card${b.imageUrl || b.thumbnailUrl || b.image ? ' has-image' : ''}">
        ${b.imageUrl || b.thumbnailUrl || b.image ? `<img loading="lazy" src="${esc(b.imageUrl || b.thumbnailUrl || b.image)}" alt="" onerror="this.hidden=true">` : ''}
        <a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a>
        <span class="board-pot"><small>Live pot</small>${pot(b)}</span>
        <span><small>Entry</small>${fee(b) ? `<b class="fee">${fee(b)}</b>` : '<b class="free">No fee</b>'}</span>
        <span><small>Time left</small>${timeLeft(b.deadline)}</span>
        <span><small>Entries</small>${b.submissionCount} ${b.submissionCount === 1 ? 'entry' : 'entries'}</span>
      </li>`,
    )
    .join('');
  const endedRows = ended.map(b => `<li class="ended"><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a><span>Ended</span><span>${pot(b)}</span></li>`).join('');
  return `<h1>Open bounties</h1><ul class="board">${rows || '<li>No open bounties.</li>'}</ul><nav class="pagination">${page > 0 ? `<button data-page="${page - 1}">Previous</button>` : ''}${(page + 1) * 10 < open.length ? `<button data-page="${page + 1}">Next</button>` : ''}</nav><h2>Ended bounties</h2><ul class="board ended-list">${endedRows || '<li>None</li>'}</ul>`;
}

export function bounty(b) {
  return `
    <p class="section-nav"><a href="#/">All bounties</a> · <a href="#description">Description</a> · <a href="#rewards">Rewards</a></p>
    <h1>${esc(b.title)}</h1>
    <p>${esc(b.summary)}</p>
    <dl class="bounty-facts">
      <dt>Live pot</dt><dd class="fact-pot">${pot(b)}</dd>
      ${b.entryFeeUsd ? `<dt>Entry fee</dt><dd>${money(b.entryFeeUsd)}</dd>` : ''}
      <dt>Time left</dt><dd>${timeLeft(b.deadline)} <small>· ${date(b.deadline)}</small></dd>
      <dt>Entries</dt><dd>${b.submissionCount}</dd>
    </dl>
    <p><a href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">View leaderboard →</a></p><h2 id="rewards">Rewards</h2><table><thead><tr><th>Place</th><th>Amount</th></tr></thead><tbody>${Object.entries(b.rewards || {}).map(([place, amount]) => `<tr><td>#${esc(place)}</td><td>${money(amount)}</td></tr>`).join('')}</tbody></table><h2 id="description">Description</h2><div class="description markdown-lazy" data-md="${esc(b.description || '')}">Loading description…</div><h2>Rules</h2><div class="description">${esc(b.rules || '')}</div>`;
}

export function leaderboard(data, slug) {
  const rows = data.entries || data.rows || [];
 return `<p><a href="#/bounty/${encodeURIComponent(slug)}">Back to bounty</a></p><h1>Leaderboard</h1><p>${esc(data.phase?.title || 'Current standings')} · ${rows.length} entries</p><table><thead><tr><th>Rank</th><th>Entrant</th><th>Score / prize</th></tr></thead><tbody>${rows.map((r,i)=>{const j=r.judge||{}; const score=r.values?.judge; return `<tr><td>${esc(r.rank?.overall ?? r.rank?.performance ?? r.rank ?? i+1)}</td><td><a href="#/profile/${encodeURIComponent(r.handle || '')}">${esc(r.handle || r.title || 'Entrant')}</a></td><td>${score == null ? '—' : (Number(score)/1000000).toFixed(3)}${j.matches != null ? ` <small>(${j.wins}/${j.draws}/${j.losses} · ${j.matches} matches)</small>` : ''}${r.prize_rank != null ? ` · Prize #${esc(r.prize_rank)}` : ''}</td></tr>`;}).join('')}</tbody></table>`;
}

export function profile(p, ranking, handle) {
 const record=p.record||{}; const solutions=p.solutions||[];
 return `<p><a href="#/">All bounties</a></p><section class="profile-head"><img class="avatar" src="https://make.fun/api/profiles/${encodeURIComponent(handle)}/picture.png" alt=""><div><h1>${esc(p.display_name||p.displayName||p.handle||handle)}</h1><p>@${esc(p.handle||handle)}${ranking?.account?.rank ? ` · Ranked #${esc(ranking.account.rank)}` : ''}</p><p>${esc(p.bio||'')}</p></div></section><h2>Track record</h2><dl><dt>Competitions entered</dt><dd>${record.competitions_entered??0}</dd><dt>Placed</dt><dd>${record.competitions_placed??0}</dd><dt>Won</dt><dd>${record.competitions_won??0}</dd><dt>Best placement</dt><dd>${record.best_placement??'—'}</dd><dt>Prizes</dt><dd>${money(record.prize_usd??0)}</dd></dl><h2>Recent solutions</h2><ul>${solutions.map(s=>`<li><a href="#/bounty/${encodeURIComponent(s.competition?.slug||'')}">${esc(s.title||s.competition?.title||'Solution')}</a> ${s.placement!=null?`· #${esc(s.placement)}`:''} ${s.prize_usd!=null?`· ${money(s.prize_usd)}`:''}</li>`).join('')||'<li>No public solutions yet.</li>'}</ul>`;
}
