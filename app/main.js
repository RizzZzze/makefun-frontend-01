const manifest='LIGHT • board + bounty + leaderboard + profile • ETag revalidation • pagination + DOM reuse • lazy modules';
async function route(){window.__shotReady=false;try{await (await import('./views.js')).routeView();window.__shotReady=true}catch(e){document.querySelector('#app').textContent='Connection interrupted: '+e.message}}
window.addEventListener('hashchange',route);
window.addEventListener('online',route);
route();

export async function revalidateVisibleCache(){const {etagCache,etagGET}=await import('./api.js');await Promise.all([...etagCache.keys()].map(path=>etagGET(path,true)));(await import('./views.js')).updateLiveTicker()}
window.addEventListener('focus',revalidateVisibleCache);
