/* Servidor estático del build de Vite — sin más dependencia que el SDK de
   Jentry, y opcional. Sirve ./site (o sea
   dist/) en $PORT, que es lo que inyecta deploycloud. Como la app es una SPA,
   cualquier ruta que no sea un archivo devuelve index.html. */
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.resolve(__dirname, process.env.SITE_DIR || 'site');

/* Errores → Jentry, al proyecto que DeployCloud le asigna a la app: en cada
   deploy inyecta SENTRY_DSN, SENTRY_ENVIRONMENT y SENTRY_RELEASE. Sin
   SENTRY_DSN (en local) o sin el SDK, el servidor arranca igual que siempre.
   El SDK se queda también con las excepciones que nadie atrapa: las manda y
   espera a que salgan (hasta 2 s) antes de terminar el proceso. */
let jentry = null;
if (process.env.SENTRY_DSN) {
  try {
    jentry = require('@jentry/sdk');
    jentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'production',
      release: process.env.SENTRY_RELEASE || undefined,
    });
  } catch (err) {
    jentry = null;
    console.warn(`viajes: sin reporte de errores a Jentry (${err.message})`);
  }
}

/* Un error que el servidor atrapó: queda en el log, como siempre, y en Jentry
   con el pedido que lo causó. */
function report(err, req) {
  console.error(`viajes: ${req.method} ${req.url} falló:`, err);
  if (!jentry) return;
  try {
    jentry.setContext('request', { method: req.method, url: req.url });
    jentry.captureException(err);
  } finally {
    jentry.setContext('request', null);
  }
}

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
  stream.on('error', (err) => {
    report(err, req);
    res.destroy();
  });
  stream.pipe(res);
}

async function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed');

  // `GET //` y parecidos no son una URL: es un error del cliente, no nuestro.
  // Antes la excepción quedaba sin atrapar y tiraba abajo el proceso entero.
  let urlPath;
  try {
    urlPath = new URL(req.url, 'http://localhost').pathname;
  } catch {
    return send(res, 400, 'bad request');
  }

  // Health check del deploy: responde antes de tocar el disco.
  if (urlPath === '/healthz') return send(res, 200, 'ok', { 'cache-control': 'no-store' });

  const hit = await resolveFile(urlPath);
  if (hit) return serve(req, res, hit.file, hit.stat, 200);

  // SPA: una ruta sin extensión es navegación del cliente → index.html.
  if (path.extname(urlPath)) return send(res, 404, 'not found');
  const index = path.join(ROOT, 'index.html');
  return serve(req, res, index, await fsp.stat(index), 200);
}

/* Lo que el handler no atrapó (un index.html que falta, un disco que no
   responde) ya no queda como promesa rechazada con el pedido colgado: se
   reporta y se contesta 500. */
const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    report(err, req);
    if (res.headersSent) return res.destroy();
    send(res, 500, 'error interno', { 'cache-control': 'no-store' });
  });
});

server.listen(PORT, () => console.log(`viajes en :${PORT} (root ${ROOT})`));
