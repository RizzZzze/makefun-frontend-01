// A make.fun frontend: the board of open bounties and a page for each, on hash routes.
//
//   #/                the board
//   #/bounty/<slug>   one bounty
//
// window.__shotReady is false while a page loads and true once its data is on screen, so a
// screenshot script knows when to capture.

import { getBounties, getBounty, getLeaderboard, getProfile, getRanking } from './api.js';
import { board, bounty, leaderboard, profile as profileView } from './views.js';

const app = document.getElementById('app');

async function render() {
 try {
  window.__shotReady = false;
  app.innerHTML = '<p>Loading…</p>';
  const match = location.hash.match(/^#\/bounty\/([^/]+)/);
  const profile = location.hash.match(/^#\/profile\/([^/]+)/);
  if (profile) {
    const handle=decodeURIComponent(profile[1]); const [p,r]=await Promise.all([getProfile(handle),getRanking(handle).catch(()=>null)]);
    app.innerHTML = profileView(p,r,handle);
  } else if (match && location.hash.endsWith('/leaderboard')) {
    const data = await getLeaderboard(decodeURIComponent(match[1]));
    app.innerHTML = leaderboard(data,decodeURIComponent(match[1]));
  } else if (match) {
    const b = await getBounty(decodeURIComponent(match[1]));
    document.title = `${b.title} | make.fun bounties`;
    app.innerHTML = bounty(b);
  } else {
    document.title = 'make.fun bounties';
    const data = await getBounties();
    app.innerHTML = board(data);
    app.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => {
      app.innerHTML = board({ ...data, page: Number(button.dataset.page) });
    }));
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
 } catch (error) { app.innerHTML = '<h1>Unable to load live data</h1><p>Please check your connection and try again.</p><a href="#/">All bounties</a>'; }
}

window.addEventListener('hashchange', render);
render();
