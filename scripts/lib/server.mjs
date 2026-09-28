// 의존성 없는 정적 파일 서버 (개발 · E2E 테스트 공용)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC } from './paths.mjs';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2',
};

export function startServer({ port = 8000, root = PUBLIC, quiet = false } = {}) {
  const server = http.createServer((req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = path.join(root, pathname);
      if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }   // 경로 탈출 방지
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 Not Found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    } catch (e) { res.writeHead(500); res.end(String(e)); }
    if (!quiet) console.log(`${req.method} ${req.url}`);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
