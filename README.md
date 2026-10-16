# Rediseño — Unidad de Imágenes Mamarias

Propuesta de rediseño para https://radiologosasociados.com/imagenes-mamarias/

- `index.html` — página final, lista para abrir o servir.
- `src/main.html` — contenido, estilos y scripts de la página (aquí se edita).
- `src/referencia-prostata.html` — copia de la página de Cáncer de Próstata; de ella se toman sin cambios el header, el footer, los popups y los scripts del sitio.
- `assets/hero-imagenes-mamarias.jpg` — imagen del hero (generada con Kling; original PNG sin marca de agua al lado). Al montar en WordPress, subirla a la biblioteca de medios y actualizar la ruta en `src/main.html`.
- `build.ps1` — une ambas partes y genera `index.html`.
- `server.js` — servidor local para previsualizar en http://localhost:5175

## Regenerar la página después de editar

```
powershell -File build.ps1
```

## Previsualizar

```
node server.js
```
