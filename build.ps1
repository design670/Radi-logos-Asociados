# Ensambla index.html: <head>, header, footer, popups y scripts tomados sin cambios de
# la página de referencia (Unidad Cáncer de Próstata) + el contenido nuevo de src/main.html.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$ref  = [IO.File]::ReadAllText("$here\src\referencia-prostata.html")
$main = [IO.File]::ReadAllText("$here\src\main.html")

$iHeader = $ref.IndexOf('<header')
$iHeaderEnd = $ref.IndexOf('</header>') + 9
$iFooter = $ref.IndexOf('<footer')
$iFooterEnd = $ref.IndexOf('</footer>') + 9
$iBody = $ref.IndexOf('<body')

$head   = $ref.Substring(0, $iBody)
$bodyOpen = $ref.Substring($iBody, $iHeader - $iBody)
$header = $ref.Substring($iHeader, $iHeaderEnd - $iHeader)
$footer = $ref.Substring($iFooter, $iFooterEnd - $iFooter)
$tail   = $ref.Substring($iFooterEnd)

# --- <head>: título/SEO de esta página, sin analítica ni CSS propio de la página de próstata
$head = $head -replace '(?s)<!-- This site is optimized with the Yoast SEO plugin.*?<!-- / Yoast SEO plugin. -->', @'
<title>Unidad de Im&aacute;genes Mamarias - Radi&oacute;logos Asociados</title>
	<meta name="description" content="En Radi&oacute;logos Asociados cuidamos de ti con la tecnolog&iacute;a m&aacute;s avanzada en detecci&oacute;n temprana y diagn&oacute;stico mamario." />
	<link rel="canonical" href="https://radiologosasociados.com/imagenes-mamarias/" />
	<meta property="og:locale" content="es_ES" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="Unidad de Im&aacute;genes Mamarias - Radi&oacute;logos Asociados" />
	<meta property="og:url" content="https://radiologosasociados.com/imagenes-mamarias/" />
	<meta property="og:site_name" content="Radi&oacute;logos Asociados" />
	<meta property="og:image" content="https://radiologosasociados.com/wp-content/uploads/2024/06/Screenshot_4-1.png" />
'@
$head = $head -replace "<link rel='dns-prefetch' href='//www.googletagmanager.com' />\s*", ''
$head = $head -replace '<!-- Fragmento[^>]*-->\s*', ''
$head = $head -replace '<script id="google_gtagjs-js"[^>]*></script>\s*', ''
$head = $head -replace '(?s)<script id="google_gtagjs-js-after">.*?</script>', ''
$head = $head -replace '(?s)<!-- Google tag \(gtag.js\) -->.*?</script>\s*<script>.*?</script>', ''
$head = $head -replace "<link rel='stylesheet' id='elementor-post-6087-css'[^>]*>\s*", ''
$head = $head -replace '<link rel="alternate" title="oEmbed[^>]*>\s*', ''
$head = $head -replace '<link rel="alternate" title="JSON"[^>]*>', ''
$head = $head -replace "<link rel='shortlink'[^>]*>", ''

$bodyOpen = $bodyOpen -replace ' page-id-6087', '' -replace ' elementor-page elementor-page-6087', ''

# --- Menú: mismo marcado; solo el ítem activo pasa de "Cáncer de Próstata" a "Imágenes Mamarias"
function Set-ActiveItem([string]$html) {
  $html = $html.Replace('current-menu-item page_item page-item-6087 current_page_item menu-item-6173', 'menu-item-6173')
  $html = $html.Replace('href="https://radiologosasociados.com/unidad-cancer-de-prostata/" aria-current="page" class="elementor-sub-item elementor-item-active"', 'href="https://radiologosasociados.com/unidad-cancer-de-prostata/" class="elementor-sub-item"')
  $html = $html.Replace('menu-item-object-page menu-item-3644"><a href="https://radiologosasociados.com/imagenes-mamarias/" class="elementor-sub-item"', 'menu-item-object-page current-menu-item page_item current_page_item menu-item-3644"><a href="https://radiologosasociados.com/imagenes-mamarias/" aria-current="page" class="elementor-sub-item elementor-item-active"')
  return $html
}
$header = Set-ActiveItem $header
$tail   = Set-ActiveItem $tail

# --- Scripts finales: sin eventos de Site Kit (analítica)
$tail = $tail -replace '(?s)<script id="googlesitekit-events-provider-content-events-js-before">.*?</script>\s*', ''
$tail = $tail -replace '<script id="googlesitekit-events-provider-content-events-js"[^>]*></script>\s*', ''
$tail = $tail.Replace('"postID":6087', '"postID":0')

# El <main> propio reemplaza al contenedor Elementor de la página
$out = $head + $bodyOpen + $header + "`n" + $main + "`n" + $footer + $tail
$enc = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText("$here\index.html", $out, $enc)
"index.html: {0:N0} bytes" -f $out.Length
