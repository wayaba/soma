# SOMA Backend

API Node.js 26 y TypeScript para autenticación, usuarios y reportes de autoclaves.

## Requisitos

- Node.js 26
- npm
- MongoDB con la base `db-soma`; `telemetria` debe estar creada como colección Time Series por Node-RED.

## Instalación y ejecución

```sh
npm install
npm run build
npm start
```

`npm run build` compila TypeScript con chequeo estricto de tipos. `npm run typecheck` ejecuta el mismo chequeo sin emitir archivos. Para desarrollo, `npm run dev` compila y reinicia el servidor al cambiar el JavaScript compilado. `npm run watch` recompila al cambiar TypeScript.

Configurar `MONGODB_URI`, `PORT` y opcionalmente `JWT_SECRET` en `backend/.env`. La interfaz interactiva de Swagger UI está en `/api-docs`; el documento OpenAPI JSON está en `/api-docs.json`.

Las fuentes TypeScript se compilan en `dist/`. No editar manualmente esa carpeta.

## Inicialización de MongoDB

- `database.ts` carga `.env` y abre la conexión.
- `app/database/initializeApp.ts` coordina la inicialización posterior a la conexión.
- `app/database/initializeDatabase.ts` crea los índices de `lotes`.
- `app/database/seeds/seedAuth.ts` asegura los roles de autenticación y crea el usuario `admin` inicial solo si `users` está vacía.
