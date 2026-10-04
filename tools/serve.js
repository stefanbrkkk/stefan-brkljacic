import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root, filename);
    if (relative.startsWith('..') || relative.split(path.sep).some(part => part.startsWith('.')) || relative.startsWith('node_modules') || !mime[path.extname(filename)]) {
      response.writeHead(404).end('Not found');
      return;
    }
    const data = await readFile(filename);
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename)], 'Cache-Control': 'no-store' }).end(data);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(4173, '127.0.0.1', () => process.stdout.write('Portfolio preview: http://127.0.0.1:4173\n'));
