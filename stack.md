# Stack

## Actual

- **React 18** (UMD, vía CDN) — sin build step.
- **Babel Standalone** — transpila el JSX directo en el navegador (`<script type="text/babel">` en `index.html`).
- **CSS plano** (`css/styles.css`) — sin preprocesador ni framework.
- **localStorage** — persistencia del estado (`om_todo_state_v1`) y tema (`om_todo_theme_v1`), por navegador/dispositivo.
- **GitHub Pages** — hosting estático.

## Estructura

```
index.html       # entry point, JSX inline + carga de React/Babel por CDN
css/styles.css
src/             # fuente de referencia de los componentes (no se carga en runtime)
  app.jsx
  tasks.jsx
  sidebar.jsx
  icons.jsx
```

## Planeado

- **Supabase** (Postgres + API) — reemplaza `localStorage` como fuente de verdad para tener persistencia entre dispositivos. Una sola fila compartida (`app_state`), sin autenticación, para uso entre vos y otra persona sin login. `localStorage` queda como caché/fallback offline.
