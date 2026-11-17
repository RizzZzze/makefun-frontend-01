import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const types={html:'text/html',js:'text/javascript',css:'text/css'};
createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;const f=p==='/'?'index.html':p.slice(1);if(f.includes('..'))throw 0;res.setHeader('Content-Type',types[f.split('.').pop()]||'text/plain');res.end(await readFile(new URL('app/'+f,import.meta.url)));}catch{res.statusCode=404;res.end();}}).listen(8080);
