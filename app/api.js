export const etagCache=new Map(), counters={requests:0,hits:0,notModified:0};
export async function etagGET(path,revalidate=false){let old=etagCache.get(path);if(old&&!revalidate){counters.hits++;return old.data}counters.requests++;let r=await fetch('https://make.fun/api/'+path,{headers:old?{'If-None-Match':old.etag}:{}});if(r.status===304){counters.notModified++;return old.data}if(!r.ok)throw Error(r.status);let data=await r.json();etagCache.set(path,{data,etag:r.headers.get('ETag')});return data}
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money=n=>'$'+Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
