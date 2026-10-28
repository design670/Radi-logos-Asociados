// Ensambla index.html: <head>, header, footer, popups y scripts tomados sin cambios de
// la página de referencia (Unidad Cáncer de Próstata) + el contenido nuevo de src/main.html.
// Equivalente en Node de build.ps1 (genera el mismo archivo).
const fs = require('fs');
const path = require('path');

const here = __dirname;
const ref = fs.readFileSync(path.join(here, 'src/referencia-prostata.html'), 'utf8');
const main = fs.readFileSync(path.join(here, 'src/main.html'), 'utf8');

const iHeader = ref.indexOf('<header');
const iHeaderEnd = ref.indexOf('</header>') + 9;
const iFooter = ref.indexOf('<footer');
const iFooterEnd = ref.indexOf('</footer>') + 9;
const iBody = ref.indexOf('<body');

let head = ref.slice(0, iBody);
let bodyOpen = ref.slice(iBody, iHeader);
let header = ref.slice(iHeader, iHeaderEnd);
const footer = ref.slice(iFooter, iFooterEnd);
let tail = ref.slice(iFooterEnd);

// PowerShell -replace: regex sin distinguir mayúsculas, todas las coincidencias
// ((?s) de .NET equivale a la bandera "s" de JavaScript)
function rx(s, re, to) {
  const dotAll = re.startsWith('(?s)');
  return s.replace(new RegExp(dotAll ? re.slice(4) : re, dotAll ? 'gis' : 'gi'), () => to);
}

// --- <head>: título/SEO de esta página, sin analítica ni CSS propio de la página de próstata
head = rx(head, '(?s)<!-- This site is optimized with the Yoast SEO plugin.*?<!-- / Yoast SEO plugin. -->', [
  '<title>Unidad de Im&aacute;genes Mamarias - Radi&oacute;logos Asociados</title>',
  '\t<meta name="description" content="En Radi&oacute;logos Asociados cuidamos de ti con la tecnolog&iacute;a m&aacute;s avanzada en detecci&oacute;n temprana y diagn&oacute;stico mamario." />',
  '\t<link rel="canonical" href="https://radiologosasociados.com/imagenes-mamarias/" />',
  '\t<meta property="og:locale" content="es_ES" />',
  '\t<meta property="og:type" content="article" />',
  '\t<meta property="og:title" content="Unidad de Im&aacute;genes Mamarias - Radi&oacute;logos Asociados" />',
  '\t<meta property="og:url" content="https://radiologosasociados.com/imagenes-mamarias/" />',
  '\t<meta property="og:site_name" content="Radi&oacute;logos Asociados" />',
  '\t<meta property="og:image" content="https://radiologosasociados.com/wp-content/uploads/2024/06/Screenshot_4-1.png" />',
].join('\n'));
head = rx(head, "<link rel='dns-prefetch' href='//www.googletagmanager.com' />\\s*", '');
head = rx(head, '<!-- Fragmento[^>]*-->\\s*', '');
head = rx(head, '<script id="google_gtagjs-js"[^>]*></script>\\s*', '');
head = rx(head, '(?s)<script id="google_gtagjs-js-after">.*?</script>', '');
head = rx(head, '(?s)<!-- Google tag \\(gtag.js\\) -->.*?</script>\\s*<script>.*?</script>', '');
head = rx(head, "<link rel='stylesheet' id='elementor-post-6087-css'[^>]*>\\s*", '');
head = rx(head, '<link rel="alternate" title="oEmbed[^>]*>\\s*', '');
head = rx(head, '<link rel="alternate" title="JSON"[^>]*>', '');
head = rx(head, "<link rel='shortlink'[^>]*>", '');

bodyOpen = rx(rx(bodyOpen, ' page-id-6087', ''), ' elementor-page elementor-page-6087', '');

// --- Menú: mismo marcado; solo el ítem activo pasa de "Cáncer de Próstata" a "Imágenes Mamarias"
function setActiveItem(html) {
  html = html.replaceAll('current-menu-item page_item page-item-6087 current_page_item menu-item-6173', 'menu-item-6173');
  html = html.replaceAll('href="https://radiologosasociados.com/unidad-cancer-de-prostata/" aria-current="page" class="elementor-sub-item elementor-item-active"', 'href="https://radiologosasociados.com/unidad-cancer-de-prostata/" class="elementor-sub-item"');
  html = html.replaceAll('menu-item-object-page menu-item-3644"><a href="https://radiologosasociados.com/imagenes-mamarias/" class="elementor-sub-item"', 'menu-item-object-page current-menu-item page_item current_page_item menu-item-3644"><a href="https://radiologosasociados.com/imagenes-mamarias/" aria-current="page" class="elementor-sub-item elementor-item-active"');
  return html;
}
header = setActiveItem(header);
tail = setActiveItem(tail);

// --- Scripts finales: sin eventos de Site Kit (analítica)
tail = rx(tail, '(?s)<script id="googlesitekit-events-provider-content-events-js-before">.*?</script>\\s*', '');
tail = rx(tail, '<script id="googlesitekit-events-provider-content-events-js"[^>]*></script>\\s*', '');
tail = tail.replaceAll('"postID":6087', '"postID":0');

// El <main> propio reemplaza al contenedor Elementor de la página
const out = head + bodyOpen + header + '\n' + main + '\n' + footer + tail;
fs.writeFileSync(path.join(here, 'index.html'), out, 'utf8');
console.log(`index.html: ${out.length.toLocaleString('es-CO')} caracteres`);
