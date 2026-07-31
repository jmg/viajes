/* Servidor estático del build de Vite — sin dependencias. Sirve ./site (o sea
   dist/) en $PORT, que es lo que inyecta deploycloud. Como la app es una SPA,
   cualquier ruta que no sea un archivo devuelve index.html. */
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.resolve(__dirname, process.env.SITE_DIR || 'site');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

/* Resuelve la URL a un archivo dentro de ROOT, o null si se escapa del root
   (../ codificado incluido) o si no existe. */
async function resolveFile(urlPath) {
  let rel;
  try {
    rel = decodeURIComponent(urlPath);
  } catch {
    return null; // %-encoding roto
  }
  let file = path.resolve(ROOT, `.${path.posix.normalize(rel)}`);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return null;
  try {
    const st = await fsp.stat(file);
    if (st.isDirectory()) {
      file = path.join(file, 'index.html');
      return { file, stat: await fsp.stat(file) };
    }
    return { file, stat: st };
  } catch {
    return null;
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

function serve(req, res, file, stat, status) {
  const ext = path.extname(file).toLowerCase();
  const etag = `W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
  // Vite hashea los assets, así que /assets/* es inmutable; el HTML, nunca.
  const immutable = file.includes(`${path.sep}assets${path.sep}`);
  const headers = {
    'content-type': TYPES[ext] || 'application/octet-stream',
    'content-length': stat.size,
    etag,
    'last-modified': stat.mtime.toUTCString(),
    'cache-control': ext === '.html' ? 'no-cache' : immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
  };

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { etag, 'cache-control': headers['cache-control'] });
    return res.end();
  }

  res.writeHead(status, headers);
  if (req.method === 'HEAD') return res.end();

  const stream = fs.createReadStream(file);
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed');

  const urlPath = new URL(req.url, 'http://localhost').pathname;

  // Health check del deploy: responde antes de tocar el disco.
  if (urlPath === '/healthz') return send(res, 200, 'ok', { 'cache-control': 'no-store' });

  const hit = await resolveFile(urlPath);
  if (hit) return serve(req, res, hit.file, hit.stat, 200);

  // SPA: una ruta sin extensión es navegación del cliente → index.html.
  if (path.extname(urlPath)) return send(res, 404, 'not found');
  const index = path.join(ROOT, 'index.html');
  return serve(req, res, index, await fsp.stat(index), 200);
});

server.listen(PORT, () => console.log(`viajes en :${PORT} (root ${ROOT})`));
