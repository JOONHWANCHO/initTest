#!/usr/bin/env node
// 로컬 개발 서버:  npm run dev   (기본 http://localhost:8000, PORT 환경변수로 변경)
import { startServer } from './lib/server.mjs';
const port = Number(process.env.PORT) || 8000;
await startServer({ port, quiet: !process.env.VERBOSE });
console.log(`\n  🍼 아이로그 개발 서버  →  http://localhost:${port}/`);
console.log(`     영어 화면: http://localhost:${port}/?lang=en   일본어: ?lang=ja`);
console.log('     (요청 로그를 보려면 VERBOSE=1 npm run dev)\n');
