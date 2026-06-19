# Tareas — To-do list (full stack)

Lista de todo lo que hace falta para que esto sea una app completa: frontend + backend + deploy. Marcadas las que ya están hechas.

---

## Frontend

- [x] **Estructura de carpetas** — `index.html` en la raíz, `src/` para componentes, `css/` para estilos.
- [x] **Componentes React** — `app.jsx` (estado global), `sidebar.jsx` (listas), `tasks.jsx` (tareas), `icons.jsx` (íconos SVG).
- [x] **Build con Vite** — se dejó de usar Babel en el navegador (no es apto para producción: transpila en cada carga, sin caché, sin minificación). Ahora `npm run build` genera HTML/CSS/JS optimizados en `dist/`.
- [x] **Módulos ES reales** — los componentes pasaron de `window.Sidebar = ...` (variables globales) a `export`/`import`, que es como se organiza código en cualquier proyecto React real.
- [ ] **Conectar el frontend a Supabase** — hoy `loadState`/`saveState` en `app.jsx` leen/escriben en `localStorage`. Hay que cambiarlos para que hablen con la base de datos (ver Backend).
- [ ] **Manejo de "guardando..." / errores de red** — cuando el guardado depende de internet, conviene mostrar al usuario si algo falló (ej. "no se pudo guardar, revisá tu conexión").

## Backend (Supabase)

- [ ] **Crear cuenta y proyecto en Supabase** (gratis) — vos lo hacés en supabase.com, yo no puedo crear cuentas por vos.
- [ ] **Crear la tabla `app_state`** — una sola fila con `id` fijo (ej. `"main"`) y una columna `data` tipo `jsonb` que guarda todo el estado (listas + tareas) como hoy lo guarda `localStorage`.
- [ ] **Configurar RLS (Row Level Security)** — política que permite leer/escribir *solo* esa fila puntual, para no dejar la base abierta a cualquier cosa aunque la `anon key` esté visible en el HTML (es inevitable en una app 100% frontend).
- [ ] **Pasarme las credenciales** (`Project URL` + `anon public key`) para conectarlas al código.
- [ ] **Instalar `@supabase/supabase-js`** y armar el cliente en el frontend.
- [ ] **Reemplazar `localStorage` por llamadas a Supabase** en `loadState`/`saveState`, dejando `localStorage` como caché para que la app abra rápido y funcione un instante sin internet.

## Deploy

- [x] **Script de deploy** (`npm run deploy`) usando el paquete `gh-pages`, que sube `dist/` a la rama `gh-pages`.
- [ ] **Crear el repo en GitHub** (`todo-list-personal`) y conectar este proyecto local como remoto (`git init`, `git remote add origin ...`).
- [ ] **Primer push** del código a la rama `main`.
- [ ] **Correr `npm run deploy`** y activar GitHub Pages apuntando a la rama `gh-pages` en la configuración del repo.
- [ ] **Probar la URL pública** desde otro dispositivo (tu mamá) para confirmar que carga y que el guardado persiste para ambos.

---

## Para ir aprendiendo

- **Frontend** = lo que se ve y con lo que interactuás (botones, listas, drag&drop). Vive en `src/`.
- **Backend** = donde se guardan los datos de verdad, accesible desde cualquier dispositivo. En este caso es Supabase, una base de datos Postgres con una API ya armada — no escribimos un servidor desde cero.
- **Build** = el paso que convierte el código fuente (JSX, que el navegador no entiende solo) en JS/CSS/HTML planos y optimizados. Lo hace Vite.
- **Deploy** = subir esos archivos finales a un lugar público (GitHub Pages) para que cualquiera con el link los pueda abrir.
