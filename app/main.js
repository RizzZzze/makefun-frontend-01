const routes={board:'#/',bounty:'#/bounty/',leaderboard:'#/leaderboard/',profile:'#/profile/'},manifest='Light paper · ETag cache · pagination + DOM node reuse · 30s targeted clock · 9 files';
const views=await import('./views.js');
async function route(){window.__shotReady=false;await views.route(location.hash,loadLeaderboard,loadProfile);window.__shotReady=true}addEventListener('hashchange',route);route();setInterval(()=>views.tick(),30000);

async function loadLeaderboard(){
return import('./leaderboard.js');
}
async function loadProfile(){
return import('./profile.js');
}
