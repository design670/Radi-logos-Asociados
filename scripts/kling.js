// Genera imágenes con la API oficial de Kling y las guarda en assets/.
// Lee las llaves desde .env (KLING_API_KEY, o KLING_ACCESS_KEY + KLING_SECRET_KEY). Sin dependencias externas.
//
// Uso:
//   node scripts/kling.js "prompt" --out assets/nombre.png [opciones]
//
// Opciones:
//   --out <ruta>         archivo de salida (con n > 1 se numera: nombre-1.png, nombre-2.png…)
//   --ratio <r>          16:9 (defecto), 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9
//   --n <num>            cantidad de imágenes, 1 a 9 (defecto 1)
//   --model <m>          kling-v3 (defecto) o kling-v2-1
//   --resolution <r>     1k (defecto) o 2k
//   --neg <texto>        prompt negativo (no se admite junto con --image)
//   --image <ruta|url>   imagen de referencia (jpg/png, máx. 10 MB)
//   --ref <tipo>         subject o face (requiere --image)
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const API = 'https://api-singapore.klingai.com';
const root = path.join(__dirname, '..');

function loadEnv() {
  const file = path.join(root, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function parseArgs(argv) {
  const opts = { ratio: '16:9', n: 1, model: 'kling-v3', resolution: '1k' };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) opts[a.slice(2)] = argv[++i];
    else rest.push(a);
  }
  opts.prompt = rest.join(' ');
  return opts;
}

function readImage(src) {
  if (/^https?:\/\//.test(src)) return src;
  return fs.readFileSync(path.resolve(src)).toString('base64');
}

// Kling acepta una API Key directa o un JWT (HS256) firmado con Access Key + Secret Key
function token() {
  const { KLING_API_KEY, KLING_ACCESS_KEY, KLING_SECRET_KEY } = process.env;
  if (KLING_API_KEY) return KLING_API_KEY;
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ iss: KLING_ACCESS_KEY, exp: now + 1800, nbf: now - 5 })}`;
  const sig = crypto.createHmac('sha256', KLING_SECRET_KEY).update(unsigned).digest('base64url');
  return `${unsigned}.${sig}`;
}

async function call(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.code !== 0) {
    throw new Error(`Kling respondió ${res.status} (código ${json.code}): ${json.message || 'sin mensaje'}`);
  }
  return json.data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  loadEnv();
  const o = parseArgs(process.argv.slice(2));
  if (!o.prompt || !o.out) {
    console.error('Uso: node scripts/kling.js "prompt" --out assets/nombre.png [--ratio 16:9] [--n 1] [--resolution 2k]');
    process.exit(1);
  }
  const env = process.env;
  if (!env.KLING_API_KEY && !(env.KLING_ACCESS_KEY && env.KLING_SECRET_KEY)) {
    console.error('Faltan las llaves de Kling. Pega en .env tu KLING_API_KEY, o bien KLING_ACCESS_KEY y KLING_SECRET_KEY.');
    process.exit(1);
  }

  const body = { model_name: o.model, prompt: o.prompt, n: Number(o.n), aspect_ratio: o.ratio, resolution: o.resolution };
  if (o.neg) body.negative_prompt = o.neg;
  if (o.image) body.image = readImage(o.image);
  if (o.ref) body.image_reference = o.ref;

  const task = await call('POST', '/v1/images/generations', body);
  console.log(`Tarea creada: ${task.task_id}. Esperando resultado…`);

  let data;
  for (let i = 0; i < 120; i++) {
    await sleep(5000);
    data = await call('GET', `/v1/images/generations/${task.task_id}`);
    if (data.task_status === 'succeed') break;
    if (data.task_status === 'failed') throw new Error(`La tarea falló: ${data.task_status_msg || 'sin detalle'}`);
    process.stdout.write('.');
  }
  if (data.task_status !== 'succeed') throw new Error('Se agotó el tiempo de espera (10 min).');
  console.log('');

  const images = data.task_result.images;
  const out = path.resolve(root, o.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ext = path.extname(out);
  for (const img of images) {
    const file = images.length > 1 ? out.slice(0, -ext.length || undefined) + `-${img.index + 1}` + ext : out;
    const res = await fetch(img.url);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`Guardada: ${path.relative(root, file)}`);
  }
  if (data.final_unit_deduction) console.log(`Unidades consumidas: ${data.final_unit_deduction}`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
