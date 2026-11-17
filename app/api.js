export const etagCache=new Map(),stats={requests:0,reused:0,revalidated:0,etag:0};
export async function get(path){stats.requests++;const old=etagCache.get(path),headers={};if(old?.tag){headers['If-None-Match']=old.tag;stats.etag++}const r=await fetch('https://make.fun/api/'+path,{headers});if(r.status===304){stats.revalidated++;stats.reused++;return old.data}const data=await r.json();etagCache.set(path,{data,tag:r.headers.get('ETag')});return data}
export function reset(){for(const k in stats)stats[k]=0}
