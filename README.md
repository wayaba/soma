# SOMA Frontend

Frontend de SOMA construido con React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js 20.19+ o 22.12+
- pnpm (la versión indicada en `package.json`)

## Desarrollo

```sh
pnpm install
pnpm dev
```

Definí `VITE_REACT_APP_BACKEND_URI` y `VITE_REACT_APP_TIMEOUT_SESSION` en `.env.local` para configurar la API y el tiempo de sesión. Las variables expuestas al navegador deben llevar el prefijo `VITE_` y no deben contener secretos.

## Comprobaciones y build

```sh
pnpm lint
pnpm exec tsc --build
pnpm build
pnpm preview
```

La API del backend está implementada en TypeScript, se ejecuta con Node.js 26 y npm, conserva autenticación y usuarios, y trabaja con las colecciones `users`, `roles`, `lotes`, `telemetria`, `refFases`, `refEstados` y `refMaquinas`. Las rutas están documentadas en Swagger (`/api-docs`); consultar `backend/README.md` para instalar y ejecutar el backend.

Node-RED debe crear `telemetria` como colección Time Series antes de iniciar el backend, tal como indica la especificación. El backend crea los índices declarados sobre `lotes` al conectar; no modifica la configuración de la colección de telemetría.

Las pantallas y rutas de recetas Fab/CIP, alarmas y variables del esquema anterior fueron retiradas del backend.
