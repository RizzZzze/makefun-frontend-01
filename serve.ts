import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
createServer(async(req,res)=>{try{let p=(req.url||'/').split('?')[0];let data=await readFile(new URL('app'+(p==='/'?'/index.html':p),import.meta.url));res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(data)}catch{res.writeHead(404);res.end()}}).listen(8080);
