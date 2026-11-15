import { getBounties, getBounty, getLeaderboard, getProfile, getRanking, getFetchTelemetry, resetFetchTelemetry } from './api.js';
import { boardPageView, bountyPageView } from './main.js';

const app = document.getElementById('app');
const telemetryBar = document.getElementById('telemetry');
telemetryBar.querySelector('.telemetry-notes').textContent = '3-file first load · leaderboard/profile/markdown lazy · ETag/304 cache · paginated leaderboard';
const coverState = { page: 0, search: '', feeFilter: 'all', category: 'all', sort: 'deadline', selected: '' };
const leaderboardState = { page: 0, phase: 'dev', handleFilter: '' };
let boardViews, leaderboardView, activeBoardData, activeLeaderboardData, activeSlug = '', activeBounty = {}, route = '';
let renderSequence = 0;

function renderTelemetry() {
  const { requests, cached, notModified } = getFetchTelemetry();
  const stamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  telemetryBar.querySelector('.telemetry-counts').textContent = `${requests} API ${requests === 1 ? 'request' : 'requests'} this view · ${cached} cached · ${notModified} x 304 · ${stamp} UTC`;
}

function renderBoardWithVirtualPaginationAndDOMRecycling(data, page = coverState.page) {
  coverState.page = page;
  const previousRows = [...(app.querySelector('.board-list')?.children || [])];
  app.innerHTML = boardPageView(boardViews, { ...data, ...coverState });
  const nextRows = [...(app.querySelector('.board-list')?.children || [])];
  nextRows.forEach((freshRow, index) => {
    const row = previousRows[index];
    if (!row) return;
    row.className = freshRow.className;
    row.innerHTML = freshRow.innerHTML;
    [...row.attributes].forEach(({ name }) => row.removeAttribute(name));
    [...freshRow.attributes].forEach(({ name, value }) => row.setAttribute(name, value));
    freshRow.replaceWith(row);
  });
  renderTelemetry();
}

function renderCurrentLeaderboard() {
  if (!leaderboardView || !activeLeaderboardData) return;
  app.innerHTML = leaderboardView.leaderboard({ ...activeLeaderboardData, ...leaderboardState }, activeSlug, activeBounty);
  renderTelemetry();
}

async function renderLazyMarkdownOnDemand() {
  const lazy = app.querySelector('.markdown-lazy');
  if (!lazy) return;
  const { renderMarkdown } = await import('./markdown.js');
  if (lazy.isConnected) lazy.innerHTML = renderMarkdown(lazy.dataset.md);
}

async function hashRouterWithLazyMarkdownAndTargetedPageRendering() {
  if (location.hash === '#description' || location.hash === '#rewards') return;
  const sequence = ++renderSequence;
  window.__shotReady = false;
  resetFetchTelemetry();
  route = 'loading';
  app.innerHTML = '<p class="loading-state">Loading live data…</p>';
  const profileMatch = location.hash.match(/^#\/profile\/([^/?]+)/);
  const bountyMatch = location.hash.match(/^#\/bounty\/([^/?]+)/);
  const leaderboardRoute = bountyMatch && /\/leaderboard(?:\?|$)/.test(location.hash);
  try {
    if (profileMatch) {
      route = 'profile';
      const handle = decodeURIComponent(profileMatch[1]);
      const [module, [p, ranking]] = await Promise.all([
        import('./profile.js'), Promise.all([getProfile(handle), getRanking(handle).catch(() => null)]),
      ]);
      if (sequence !== renderSequence) return;
      document.title = `${p.display_name || p.handle || handle} | Editorial Ledger`;
      app.innerHTML = module.profile(p, ranking, handle);
    } else if (bountyMatch && leaderboardRoute) {
      route = 'leaderboard';
      activeSlug = decodeURIComponent(bountyMatch[1]);
      const query = new URLSearchParams(location.hash.split('?')[1] || '');
      leaderboardState.phase = query.get('phase') || 'dev';
      leaderboardState.page = 0;
      leaderboardState.handleFilter = '';
      const [data, bountyData, module] = await Promise.all([
        getLeaderboard(activeSlug, leaderboardState.phase), getBounty(activeSlug), import('./leaderboard.js'),
      ]);
      if (sequence !== renderSequence) return;
      leaderboardView = module;
      activeLeaderboardData = data;
      activeBounty = bountyData;
      document.title = `${bountyData.title} leaderboard | Editorial Ledger`;
      renderCurrentLeaderboard();
    } else if (bountyMatch) {
      route = 'bounty';
      const slug = decodeURIComponent(bountyMatch[1]);
      const [b, module] = await Promise.all([getBounty(slug), import('./views.js')]);
      if (sequence !== renderSequence) return;
      boardViews = module;
      document.title = `${b.title} | Editorial Ledger`;
      app.innerHTML = bountyPageView(boardViews, b);
      await renderLazyMarkdownOnDemand();
    } else {
      route = 'cover';
      const [data, module] = await Promise.all([getBounties(), import('./views.js')]);
      if (sequence !== renderSequence) return;
      activeBoardData = data;
      boardViews = module;
      coverState.page = 0;
      coverState.selected = '';
      document.title = 'Editorial Ledger | make.fun bounties';
      renderBoardWithVirtualPaginationAndDOMRecycling(data);
    }
    if (sequence !== renderSequence) return;
    window.scrollTo(0, 0);
    renderTelemetry();
    window.__shotReady = true;
  } catch (error) {
    if (sequence !== renderSequence) return;
    app.innerHTML = '<h1>Live data unavailable</h1><p>Check your connection and try again.</p><a href="#/">All bounties</a>';
    renderTelemetry();
  }
}

function preserveInputAfterRender(selector, value) {
  const input = app.querySelector(selector);
  if (input) { input.focus(); input.setSelectionRange(value.length, value.length); }
}

app.addEventListener('input', event => {
  if (event.target.matches('[data-search]') && activeBoardData) {
    coverState.search = event.target.value;
    const value = coverState.search;
    renderBoardWithVirtualPaginationAndDOMRecycling(activeBoardData, 0);
    preserveInputAfterRender('[data-search]', value);
  }
  if (event.target.matches('[data-handle-filter]')) {
    leaderboardState.handleFilter = event.target.value;
    const value = leaderboardState.handleFilter;
    renderCurrentLeaderboard();
    preserveInputAfterRender('[data-handle-filter]', value);
  }
});

app.addEventListener('change', event => {
  if (event.target.matches('[data-sort]')) {
    coverState.sort = event.target.value;
    renderBoardWithVirtualPaginationAndDOMRecycling(activeBoardData, 0);
  }
});

app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.select && activeBoardData) {
    coverState.selected = button.dataset.select;
    renderBoardWithVirtualPaginationAndDOMRecycling(activeBoardData);
  } else if (button.dataset.fee && activeBoardData) {
    coverState.feeFilter = button.dataset.fee;
    renderBoardWithVirtualPaginationAndDOMRecycling(activeBoardData, 0);
  } else if (button.dataset.category && activeBoardData) {
    coverState.category = button.dataset.category;
    renderBoardWithVirtualPaginationAndDOMRecycling(activeBoardData, 0);
  } else if (button.hasAttribute('data-page')) {
    const page = Number(button.dataset.page);
    if (route === 'cover') renderBoardWithVirtualPaginationAndDOMRecycling(activeBoardData, page);
    if (route === 'leaderboard') { leaderboardState.page = page; renderCurrentLeaderboard(); }
  } else if (button.dataset.phase) {
    const phase = button.dataset.phase;
    history.replaceState(null, '', `#/bounty/${encodeURIComponent(activeSlug)}/leaderboard?phase=${phase}`);
    hashRouterWithLazyMarkdownAndTargetedPageRendering();
  }
});

window.addEventListener('hashchange', hashRouterWithLazyMarkdownAndTargetedPageRendering);
setInterval(renderTelemetry, 30000);
hashRouterWithLazyMarkdownAndTargetedPageRendering();
