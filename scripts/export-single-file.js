#!/usr/bin/env node
// Packs the whole app into ONE .html file that opens with a double-click — no website needed,
// like the original arabic-alphabet-app.html. Pages, code, recordings and photos are all inside.
//
//   node scripts/export-single-file.js [output.html]      (default: alsama-arabic-app.html)
//
// The live website (Vercel) does not use this file. What doesn't work in the single file:
// sending registrations to Alsama and the emails (they need the website); everything else works.
// Progress is saved in the browser, separately from the website's progress.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || 'alsama-arabic-app.html');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ---- 1. JavaScript modules → one script -------------------------------------------
// Each module becomes an async function; imports become lookups in a small module table.
const modules = new Map(); // 'js/app.js' → code
function addModule(file) {
  if (modules.has(file)) return;
  modules.set(file, null);
  let src = read(file);
  const exportsList = [];
  src = src.replace(/^import \* as (\w+) from '([^']+)';$/gm, (_, name, spec) => {
    const dep = path.posix.join(path.posix.dirname(file), spec);
    addModule(dep);
    return `const ${name} = await __load('${dep}');`;
  });
  src = src.replace(/^import \{([^}]+)\} from '([^']+)';$/gm, (_, names, spec) => {
    const dep = path.posix.join(path.posix.dirname(file), spec);
    addModule(dep);
    return `const {${names.replace(/(\w+) as (\w+)/g, '$1: $2')}} = await __load('${dep}');`;
  });
  src = src.replace(/^export (async function|function|const|class) (\w+)/gm, (_, kind, name) => {
    exportsList.push(name);
    return `${kind} ${name}`;
  });
  if (/^\s*(import|export)\s/m.test(src)) throw new Error(`Unsupported import/export in ${file}`);
  modules.set(file, `__def('${file}', async () => {\n${src}\nreturn { ${exportsList.join(', ')} };\n});`);
}
addModule('js/app.js');

// ---- 2. Assets (recordings, photos, JSON) as data: URLs --------------------------------
const MIME = { '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json' };
const manifest = JSON.parse(read('assets/audio/manifest.json'));
const files = new Set(['assets/audio/manifest.json', 'assets/stickers/stickers.json']);
Object.values(manifest).forEach(v => files.add('assets/' + v));
for (const dir of ['assets/images', 'assets/stickers', 'assets/logo']) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) if (MIME[path.extname(f).toLowerCase()]) files.add(`${dir}/${f}`);
}
const assets = {};
for (const f of [...files].sort()) {
  const type = MIME[path.extname(f).toLowerCase()];
  assets[f] = `data:${type};base64,${fs.readFileSync(path.join(ROOT, f)).toString('base64')}`;
}

// ---- 3. Glue: serve assets from memory, then start the app ------------------------------
const runtime = `
const __ASSETS = ${JSON.stringify(assets)};
const __asset = url => {
  const key = String(url).replace(/^(\\.\\/|\\/)/, '').split('?')[0];
  return __ASSETS[key] || __ASSETS[decodeURI(key)] || null;
};
// fetch('assets/…') reads from the packed files; anything else (e.g. api/register) goes to the network.
const __fetch = window.fetch.bind(window);
window.fetch = (url, opts) => {
  const data = typeof url === 'string' && __asset(url);
  return data ? __fetch(data) : __fetch(url, opts);
};
// new Audio('assets/…') and <img src="assets/…"> use the packed files too.
const __Audio = window.Audio;
window.Audio = function (src) { return new __Audio(src && (__asset(src) || src)); };
const __fixImages = root => root.querySelectorAll('img[src^="assets/"]').forEach(img => {
  const data = __asset(img.getAttribute('src'));
  if (data) img.src = data;
});
new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => {
  if (n.nodeType !== 1) return;
  if (n.matches('img[src^="assets/"]')) __fixImages(n.parentNode || n);
  else __fixImages(n);
}))).observe(document.documentElement, { childList: true, subtree: true });
__fixImages(document);

const __defs = {}, __cache = {};
const __def = (name, fn) => { __defs[name] = fn; };
const __load = name => (__cache[name] ||= __defs[name]());
${[...modules.values()].join('\n\n')}
__load('js/app.js').catch(e => {
  console.error(e);
  document.getElementById('app').innerHTML = '<p style="padding:24px">Sorry, the app could not start: ' + e.message + '</p>';
});
`;

// ---- 4. Page -------------------------------------------------------------------------
let html = read('index.html')
  .replace('<link rel="stylesheet" href="css/styles.css">', () => `<style>\n${read('css/styles.css')}\n</style>`)
  .replace('<script type="module" src="js/app.js"></script>', '')
  .replace('</body>', () => `<script>\n(async () => {\n${runtime}\n})();\n</script>\n</body>`);
html = html.replace(/(src|href)="(assets\/[^"]+)"/g, (m, attr, p) => (assets[p] ? `${attr}="${assets[p]}"` : m));

fs.writeFileSync(out, html);
console.log(`Wrote ${out} — ${(fs.statSync(out).size / 1e6).toFixed(1)} MB, ${modules.size} modules, ${files.size} files`);
