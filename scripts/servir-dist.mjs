// Servidor estático mínimo com fallback de SPA (o mesmo "try_files $uri /index.html" do Nginx), para testar o dist/.
// Uso: node scripts/servir-dist.mjs dist   → http://localhost:5173
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const raiz = process.argv[2] ?? 'dist';
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  const caminho = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([\/])+/, '');
  let arquivo = join(raiz, caminho);
  try { if (!(await stat(arquivo)).isFile()) throw 0; } catch { arquivo = join(raiz, 'index.html'); }
  res.writeHead(200, { 'Content-Type': tipos[extname(arquivo)] ?? 'application/octet-stream' });
  res.end(await readFile(arquivo));
}).listen(5173, () => console.log('dist em http://localhost:5173'));
