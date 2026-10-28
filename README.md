# Rediseño — Unidad de Imágenes Mamarias

Propuesta de rediseño para https://radiologosasociados.com/imagenes-mamarias/

- `index.html` — página final, lista para abrir o servir.
- `src/main.html` — contenido, estilos y scripts de la página (aquí se edita).
- `src/referencia-prostata.html` — copia de la página de Cáncer de Próstata; de ella se toman sin cambios el header, el footer, los popups y los scripts del sitio.
- `assets/hero-imagenes-mamarias.jpg` — imagen del hero (generada con Kling; original PNG sin marca de agua al lado). Al montar en WordPress, subirla a la biblioteca de medios y actualizar la ruta en `src/main.html`.
- `build.js` / `build.ps1` — unen ambas partes y generan `index.html` (mismo resultado; usar cualquiera).
- `server.js` — servidor local para previsualizar en http://localhost:5175

## Regenerar la página después de editar

```
node build.js
```

(o `powershell -File build.ps1` si la ejecución de scripts está habilitada)

## Generar imágenes con Kling

`scripts/kling.js` usa la API oficial de Kling y guarda el resultado en `assets/`. Las llaves van en `.env` (plantilla en `.env.example`; `.env` no se sube a git).

```
node scripts/kling.js "prompt" --out assets/nombre.png --ratio 16:9 --resolution 2k
```

Opciones: `--n` (1–9), `--model` (kling-v3 / kling-v2-1), `--neg` (prompt negativo), `--image` + `--ref subject|face` (imagen de referencia).

## Previsualizar

```
node server.js
```
