# SOMA — instalación en Windows para una red local sin internet

Esta guía instala SOMA en una PC anfitriona con Windows. Las demás PCs acceden desde un navegador por la LAN. La PC anfitriona debe permanecer encendida y conectada a la red.

> La operación diaria no necesita internet. Para una instalación totalmente offline hay que descargar antes los instaladores y preparar el paquete de dependencias en una PC con internet. No copies el archivo `backend/.env` actual al equipo de instalación: puede contener credenciales reales.

## Qué se instala

- Frontend React/Vite: se compila a archivos estáticos en `dist/`.
- Backend Node.js/Express: API HTTP, por defecto en el puerto `5000`.
- MongoDB: base local `db-soma`.
- Node-RED: origen de telemetría PLC → MongoDB, si se requiere la función de datos en vivo y reportes con mediciones.
- Un servidor web local para publicar el frontend. En esta guía se usa IIS de Windows.

## Versiones y herramientas

| Componente | Versión indicada por este repo | Notas |
| --- | --- | --- |
| Windows | Windows 10/11 de 64 bits | En la PC anfitriona, con permisos de administrador para instalar servicios y reglas de firewall. |
| Node.js | **Node.js 26** para backend; el README de frontend también declara 20.19+ o 22.12+ | Para evitar incompatibilidades entre ambos, usar Node.js 26 x64 para la instalación conjunta. Llevar el instalador `.msi` offline. |
| npm | Incluido con Node.js | Backend usa `backend/package-lock.json`; `npm ci` instala exactamente lo fijado allí. |
| pnpm | **11.1.2**, fijado en el `package.json` raíz | Se usa para el frontend/workspace. Corepack o pnpm deben quedar instalados antes de desconectar internet. |
| MongoDB Server | No hay versión fijada en el repo | Instalar una versión que soporte Time Series Collections y compatible con la versión elegida de Node-RED/MongoDB driver. Descargar el MSI y conservarlo junto con esta guía. |
| Node-RED | No hay versión fijada en el repo | Solo necesario si Node-RED recibe datos de PLC. Preparar previamente Node.js, Node-RED y el paquete `mongodb4` que usa el flujo. |
| IIS | Función de Windows (sin versión separada) | Sirve el build estático del frontend. Se puede usar otro servidor web local si ya existe uno administrado. |
| NSSM | No fijada | Opcional para correr el backend/Node-RED como servicios y arrancarlos automáticamente. Descargar el ejecutable x64 antes de quedar offline. |

Node.js y pnpm están fijados o indicados en los archivos del repo. MongoDB, Node-RED, IIS y NSSM no tienen versión fijada en el repo: anotá las versiones efectivamente instaladas para poder reproducir la instalación y preparar actualizaciones.

## 1. Preparar el paquete antes de ir a la red aislada

Hacer esta preparación en una PC Windows con internet, con una arquitectura igual (x64) y usando el mismo commit/copia del código que se instalará:

1. Copiar el proyecto completo, incluyendo `pnpm-lock.yaml`, `backend/package-lock.json` y `backend/swagger.json`. No incluir `.env` con secretos ni `node_modules` de otra máquina.
2. Descargar los instaladores offline de Node.js 26 x64, MongoDB Server, y (si aplica) Node-RED/dependencias del flujo. Descargar también NSSM si se va a usar.
3. Instalar pnpm 11.1.2 y preparar las dependencias mientras haya internet:

   ```powershell
   corepack enable
   corepack prepare pnpm@11.1.2 --activate
   pnpm install --frozen-lockfile
   Push-Location backend
   npm ci
   Pop-Location
   ```

4. Compilar backend y frontend con la dirección LAN que tendrá la PC anfitriona. Ejemplo: `192.168.1.50` (reemplazar por la IP real reservada):

   ```powershell
   Push-Location backend
   npm run build
   Pop-Location

   $env:VITE_REACT_APP_BACKEND_URI = 'http://192.168.1.50:5000'
   pnpm build
   Remove-Item Env:VITE_REACT_APP_BACKEND_URI
   ```

   El valor Vite queda incorporado al frontend compilado. Si cambia la IP o el puerto, hay que actualizarlo y recompilar.
5. Confirmar que existen `backend/dist/server.js` y `dist/index.html`. Guardar los instaladores, el código y las carpetas de dependencias en un medio local aprobado. Para máxima reproducibilidad, construir un instalador/paquete de despliegue que incluya solo los artefactos requeridos. No confiar en que `pnpm install` o `npm ci` puedan descargar paquetes en la red aislada.

> Alternativa: se puede hacer la compilación directamente en la PC anfitriona si se transfieren también `node_modules` compatibles, pero es más simple y repetible llevar los artefactos ya compilados. No compilar en otra plataforma y trasladar `node_modules` de Windows/Linux entre sí.

## 2. Preparar la red

1. Asignar a la anfitriona IP fija o una **reserva DHCP** en el router. En los ejemplos se usa `192.168.1.50`.
2. Confirmar que las otras PCs pueden hacer ping o alcanzar la anfitriona por la red local.
3. Reservar los puertos TCP `80` (IIS) y `5000` (API), verificando que no los use otro software/SCADA.
4. La conexión a MongoDB queda local a la anfitriona; no abrir `27017` a la red salvo que exista una necesidad explícita y una política de acceso definida.

## 3. Instalar y configurar MongoDB

1. Instalar MongoDB Server desde el MSI preparado y dejar el servicio con inicio automático.
2. Mantener MongoDB escuchando solo en `127.0.0.1` si el backend corre en la misma PC. No hace falta exponerlo a las PCs cliente.
3. Usar base `db-soma`. El backend crea índices de `lotes` al iniciar.
4. Si Node-RED va a guardar mediciones, crear `telemetria` como **Time Series Collection** antes de iniciar la ingesta. En `mongosh` local:

   ```javascript
   use db-soma
   db.createCollection('telemetria', {
     timeseries: {
       timeField: 'timestamp',
       metaField: 'meta',
       granularity: 'seconds'
     }
   })
   ```

   La configuración `timeField`, `metaField` y los nombres/estructura de los campos deben coincidir con el flujo de Node-RED y con `backend/app/models/autoclave.model.ts`. Revisarlos juntos antes de cargar datos reales. No crear una colección Time Series duplicada si ya existe.
5. Definir backup periódico de `db-soma` y comprobar que puede restaurarse. La especificación del repo recomienda limitar la caché WiredTiger en una PC que también ejecuta SCADA; ajustar ese límite según la RAM disponible y la carga real.

## 4. Configurar el backend

En la anfitriona, crear `backend/.env` (no compartirlo con las PCs cliente). Ejemplo:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/db-soma
PORT=5000
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_LARGO_Y_ALEATORIO
```

Generar un secreto aleatorio, por ejemplo desde PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Mantener ese valor privado y respaldarlo de forma segura: cambiarlo invalida tokens existentes. El código tiene un secreto por defecto si `JWT_SECRET` falta; no dejar ese valor por defecto en producción.

Si preparaste dependencias en la misma PC:

```powershell
Set-Location C:\SOMA\backend
npm run build
npm start
```

Si ya trasladás `backend/dist` y dependencias Windows compatibles, arrancar con `npm start`. Comprobar en la anfitriona `http://127.0.0.1:5000/` y `http://127.0.0.1:5000/api-docs`.

La primera ejecución crea roles y, solo si no existen usuarios, crea `admin` con clave inicial `admin`. Cambiarla inmediatamente si la aplicación lo permite. Si no permite cambiarla, crear un procedimiento administrativo controlado antes de poner el sistema en uso.

## 5. Publicar el frontend con IIS

1. En “Activar o desactivar las características de Windows”, habilitar **Internet Information Services → World Wide Web Services → Common HTTP Features → Static Content** y la consola de administración.
2. Copiar el contenido de `dist/` a, por ejemplo, `C:\inetpub\wwwroot\soma`.
3. En IIS Manager, crear un sitio llamado `SOMA`, apuntando a esa carpeta y ligado al puerto `80` (HTTP) en la IP de la anfitriona, o a “All Unassigned” si no hay conflicto.
4. Como la app usa `BrowserRouter`, configurar fallback a `index.html` para las rutas del frontend (IIS URL Rewrite con regla SPA, si está instalado). Sin ese fallback, recargar directamente una ruta interna puede responder 404.
5. Desde la anfitriona abrir `http://127.0.0.1/`. Desde otra PC abrir `http://192.168.1.50/`.

El backend habilita CORS de manera abierta en la configuración actual, por lo que no requiere una lista de orígenes para esta topología. El firewall sigue siendo el control de acceso de red. En una futura puesta en producción conviene restringir CORS al sitio local.

## 6. Node-RED (si se usa telemetría)

1. Instalar Node-RED y el flujo del proyecto en la anfitriona. Preparar offline sus módulos contribuidos; el flujo depende del nodo MongoDB `mongodb4` según la especificación.
2. Configurar el flujo para escribir en MongoDB local `db-soma`, colección `telemetria` y demás colecciones/formatos esperados por el backend.
3. Verificar primero que se reciben y almacenan muestras; luego consultar la pantalla de autoclaves y un reporte de lote.
4. El orden de arranque debe ser MongoDB → Node-RED y backend. El backend falla al iniciar si MongoDB no está disponible.

Si Node-RED o el PLC no forman parte de esta instalación, se puede omitir este componente; las vistas que dependen de telemetría no mostrarán datos hasta que la colección se alimente.

## 7. Firewall de Windows y acceso desde la LAN

En Windows Defender Firewall, crear reglas de entrada TCP para:

- Puerto `80`: IIS/frontend.
- Puerto `5000`: API backend.

Aplicarlas solo al perfil **Privado** y, si la política lo permite, limitar el ámbito a la subred local. No abrir MongoDB `27017` a la LAN. Marcar la red de la planta como privada únicamente si corresponde a la política de la organización.

Desde una PC cliente, probar:

```powershell
Test-NetConnection 192.168.1.50 -Port 80
Test-NetConnection 192.168.1.50 -Port 5000
```

Luego navegar a `http://192.168.1.50/`, iniciar sesión y revisar las pantallas/reportes necesarios. Reemplazar la IP de ejemplo por la real.

## 8. Arranque automático y recuperación

La especificación del repo recomienda NSSM para registrar backend y Node-RED como servicios. Configurar sus ejecutables, directorio de trabajo y variables/archivos de entorno; poner inicio automático retrasado si ayuda a esperar a MongoDB. MongoDB ya debe estar como servicio. Confirmar que IIS inicia automáticamente.

Después de configurar servicios, reiniciar la anfitriona y verificar que MongoDB, backend, Node-RED (si aplica) e IIS estén activos sin abrir una consola interactiva. Revisar logs y realizar un backup/restauración de prueba antes de liberar el uso.

## Lista de verificación de entrega

- [ ] IP fija/reservada y anotada.
- [ ] Versiones de Windows, Node.js, pnpm, MongoDB y Node-RED anotadas.
- [ ] Instaladores y dependencias disponibles offline.
- [ ] `backend/.env` local creado, con URI local y `JWT_SECRET` propio.
- [ ] Base `db-soma` accesible; `telemetria` Time Series creada si corresponde.
- [ ] Backend responde en `http://127.0.0.1:5000/`.
- [ ] Frontend compilado con la IP/URL de API correcta y publicado en IIS.
- [ ] Reglas firewall limitadas a LAN/perfil privado; MongoDB no expuesto.
- [ ] Login y reportes comprobados desde al menos una PC cliente.
- [ ] Servicios sobreviven a un reinicio de la anfitriona.
- [ ] Backup y procedimiento de restauración documentados.

## Referencias del repositorio

- `backend/README.md`: ejecución del API y requisitos de MongoDB.
- `backend/Especificación reportes autoclaves.md`: Time Series, Node-RED, recursos y persistencia de servicios.
- `backend/app/models/autoclave.model.ts`: esquema que consume el backend.
- `package.json` y `pnpm-lock.yaml`: versiones y dependencias del frontend/workspace.
- `backend/package.json` y `backend/package-lock.json`: dependencias del backend.
