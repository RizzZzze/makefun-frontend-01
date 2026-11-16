// A tiny static server for local development only (Node 22, standard library only): it serves app/ at the site
// root and screenshots/ under /screenshots, so `node serve.ts` then http://localhost:8080 opens the frontend as a
// static host would. Not part of the entry: the program that hands the app in is main.ts.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT ?? 8080);
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

/** Which root a request path reads from, and refuses a path that climbs out of it. */
function locate(urlPath: string): { root: string; rel: string } | null {
  const path = decodeURIComponent(urlPath.split('?')[0]!.split('#')[0]!);
  const under = (root: string, rel: string): { root: string; rel: string } | null => {
    const clean = normalize(rel).replace(/^([.][.][/\\])+/, '');
    if (clean === '' || clean.startsWith('..') || clean.includes(`..${sep}`)) return null;
    return { root, rel: clean };
  };
  if (path === '/' || path === '') return { root: 'app', rel: 'index.html' };
  if (path.startsWith('/screenshots/')) return under('screenshots', path.slice('/screenshots/'.length));
  return under('app', path.replace(/^\/+/, ''));
}

createServer(async (req, res) => {
  const found = locate(req.url ?? '/');
  if (found === null) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('forbidden');
    return;
  }
  let file = join(here, found.root, found.rel);
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'content-length': body.length }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
  }
}).listen(port, () => console.log(`make.fun frontend on http://localhost:${port}`));
