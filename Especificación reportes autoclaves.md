# Especificación de Base de Datos: Sistema de Autoclaves SOMA

**Base de datos:** `db-soma`  
**Motor:** MongoDB 5.0+ (Soporte nativo de Time Series Collections)  
**Entorno de ejecución:** Localhost (Convivencia en PC industrial con SCADA y Node-RED)  
**Ingesta de datos:** Node-RED (Driver `mongodb4`) vía S7comm hacia PLCs Siemens S7-1200 (FW 4.1.1)

---

## 1. Arquitectura General y Estrategia de Colecciones

La base de datos desacopla el almacenamiento en dos flujos principales para maximizar la velocidad de ingesta, la compresión en disco y simplificar las consultas desde el stack MERN:

1. **Telemetría de Alta Frecuencia (`telemetria`):** Colección nativa de tipo **Time Series** optimizada para almacenar lecturas periódicas de sensores analógicos (muestreo cada 1-2 segundos) comprimidas por columnas en buckets temporales.
2. **Ciclo de Vida y Transacciones (`lotes`):** Colección estándar orientada a documentos donde cada registro representa un lote de esterilización con sus metadatos y un array cronológico de las etapas transcurridas.
3. **Colecciones Maestras de Referencia (`refFases`, `refEstados`, `refMaquinas`):** Catálogos normalizados para evitar redundancia de texto y permitir al frontend resolver nombres, descripciones y badges de UI dinámicamente.

```
db-soma/
├── telemetria      (Time Series: temp1, temp2, presión, etapa instantánea)
├── lotes           (Documentos estándar: cabecera del lote y array de fases)
├── refFases        (Catálogo: etapas 0 a 8 del PLC)
├── refEstados      (Catálogo: estados del ciclo 0 a 3)
└── refMaquinas     (Catálogo: metadatos de los autoclaves 1 y 2)
```

---

## 2. Definición de Colecciones y Esquemas

### 2.1 Colección `telemetria` (Time Series Collection)

Almacena las mediciones analógicas continuas de ambos autoclaves.

#### Creación obligatoria previa (en `mongosh`):
```javascript
db.createCollection("telemetria", {
  timeseries: {
    timeField: "timestamp",
    metaField: "meta",
    granularity: "seconds"
  }
});
```

#### Esquema del Documento:
```typescript
interface TelemetriaDoc {
  timestamp: Date;              // Fecha/hora de la medición (UTC)
  meta: {
    autoclaveId: number;        // Identificador del equipo (1 o 2)
    loteId: string | null;      // Código del lote activo o null si está detenido/standby
  };
  temp1: number;                // Sensor de temperatura cámara (°C, precisión 0.1)
  temp2: number;                // Sensor de temperatura drenaje/bulto (°C, precisión 0.1)
  presion: number;              // Sensor de presión de cámara (bar, precisión 0.01)
  fase: number;                 // Etapa activa del PLC (0 a 8)
}
```

#### Ejemplo de Documento en Ciclo:
```json
{
  "timestamp": "2026-11-03T14:35:10.000Z",
  "meta": {
    "autoclaveId": 1,
    "loteId": "LOTE-A1-582910"
  },
  "temp1": 134.3,
  "temp2": 134.0,
  "presion": 3.12,
  "fase": 4
}
```

#### Ejemplo de Documento en Standby:
```json
{
  "timestamp": "2026-11-03T16:00:00.000Z",
  "meta": {
    "autoclaveId": 1,
    "loteId": null
  },
  "temp1": 27.8,
  "temp2": 27.2,
  "presion": 0.0,
  "fase": 0
}
```

---

### 2.2 Colección `lotes` (Colección Estándar)

Registra el inicio, fin y trazabilidad de cada ciclo de esterilizado.

#### Esquema del Documento:
```typescript
interface FaseItem {
  faseNum: number;              // Número de etapa (1 a 8)
  inicio: Date;                 // Inicio de la etapa
  fin: Date | null;             // Fin de la etapa (null si la etapa sigue activa)
}

interface LoteDoc {
  _id: ObjectId;                // Autogenerado por MongoDB
  autoclaveId: number;          // 1 o 2
  lote: string;                 // Código identificador único del lote (ej: "LOTE-A1-582910")
  recetaId: number;             // ID de la receta ejecutada en el PLC
  estado: number;               // 1: En curso, 2: Completado, 3: Abortado (ver refEstados)
  faseActual: number;           // Etapa activa en tiempo real (0 cuando finaliza)
  timestampInicio: Date;        // Inicio del lote (arranque de fase 1)
  timestampFin: Date | null;    // Fin del lote (cierre de fase 8)
  fases: FaseItem[];            // Array ordenado de fases ejecutadas
}
```

#### Índices recomendados para `lotes`:
```javascript
// Para listados rápidos en el frontend por máquina ordenados por fecha
db.lotes.createIndex({ autoclaveId: 1, timestampInicio: -1 });

// Para filtrar ciclos activos rápidamente
db.lotes.createIndex({ autoclaveId: 1, estado: 1 });

// Búsqueda directa por código de lote
db.lotes.createIndex({ lote: 1 }, { unique: true });
```

#### Ejemplo de Documento Completo:
```json
{
  "_id": { "$oid": "6727c9b2a1e8432a5df10001" },
  "autoclaveId": 1,
  "lote": "LOTE-A1-582910",
  "recetaId": 1,
  "estado": 2,
  "faseActual": 0,
  "timestampInicio": "2026-11-03T14:00:00.000Z",
  "timestampFin": "2026-11-03T14:48:30.000Z",
  "fases": [
    { "faseNum": 1, "inicio": "2026-11-03T14:00:00.000Z", "fin": "2026-11-03T14:04:00.000Z" },
    { "faseNum": 2, "inicio": "2026-11-03T14:04:00.000Z", "fin": "2026-11-03T14:10:00.000Z" },
    { "faseNum": 3, "inicio": "2026-11-03T14:10:00.000Z", "fin": "2026-11-03T14:22:00.000Z" },
    { "faseNum": 4, "inicio": "2026-11-03T14:22:00.000Z", "fin": "2026-11-03T14:37:00.000Z" },
    { "faseNum": 5, "inicio": "2026-11-03T14:37:00.000Z", "fin": "2026-11-03T14:41:00.000Z" },
    { "faseNum": 6, "inicio": "2026-11-03T14:41:00.000Z", "fin": "2026-11-03T14:45:00.000Z" },
    { "faseNum": 7, "inicio": "2026-11-03T14:45:00.000Z", "fin": "2026-11-03T14:47:00.000Z" },
    { "faseNum": 8, "inicio": "2026-11-03T14:47:00.000Z", "fin": "2026-11-03T14:48:30.000Z" }
  ]
}
```

---

## 3. Colecciones de Catálogo y Referencia

### 3.1 Colección `refFases`
Mapeo directo con las variables internas del PLC Siemens S7-1200:

| `_id` / `faseNum` | `nombre` | `activo` | Descripción funcional en el ciclo |
| :---: | :--- | :---: | :--- |
| **0** | Detenido | `false` | Equipo en reposo / Standby |
| **1** | Vacío | `true` | Extracción de aire inicial de cámara (-0.8 bar) |
| **2** | Vapor | `true` | Inyección y purga de vapor |
| **3** | Calentando | `true` | Cierre de venteos y presurización hacia setpoint |
| **4** | Esterilizando | `true` | Meseta crítica de mantenimiento (134 °C / 3.1 bar) |
| **5** | Descargando | `true` | Despresurización hacia el escape/condensador |
| **6** | Secando | `true` | Vacío secundario para secado de paquetes |
| **7** | Aireando | `true` | Ingreso de aire filtrado para igualación atmosférica |
| **8** | Finalizando | `true` | Desbloqueo y aviso de ciclo terminado |

#### JSON para importación:
```json
[
  { "_id": 0, "faseNum": 0, "nombre": "Detenido", "activo": false },
  { "_id": 1, "faseNum": 1, "nombre": "Vacío", "activo": true },
  { "_id": 2, "faseNum": 2, "nombre": "Vapor", "activo": true },
  { "_id": 3, "faseNum": 3, "nombre": "Calentando", "activo": true },
  { "_id": 4, "faseNum": 4, "nombre": "Esterilizando", "activo": true },
  { "_id": 5, "faseNum": 5, "nombre": "Descargando", "activo": true },
  { "_id": 6, "faseNum": 6, "nombre": "Secando", "activo": true },
  { "_id": 7, "faseNum": 7, "nombre": "Aireando", "activo": true },
  { "_id": 8, "faseNum": 8, "nombre": "Finalizando", "activo": true }
]
```

---

### 3.2 Colección `refEstados`
Estados posibles del ciclo de vida del lote con códigos cromáticos para la UI en React:

```json
[
  {
    "_id": 0,
    "estadoId": 0,
    "codigo": "DETENIDO",
    "nombre": "Detenido / Standby",
    "descripcion": "Autoclave sin ciclo activo",
    "color": "#6B7280"
  },
  {
    "_id": 1,
    "estadoId": 1,
    "codigo": "EN_CURSO",
    "nombre": "En Curso",
    "descripcion": "Ciclo de esterilización en ejecución activa",
    "color": "#3B82F6"
  },
  {
    "_id": 2,
    "estadoId": 2,
    "codigo": "COMPLETADO",
    "nombre": "Completado",
    "descripcion": "Ciclo culminado de forma normal y aprobado",
    "color": "#10B981"
  },
  {
    "_id": 3,
    "estadoId": 3,
    "codigo": "ABORTADO",
    "nombre": "Abortado",
    "descripcion": "Ciclo cancelado por operador, alarma o parada de emergencia",
    "color": "#EF4444"
  }
]
```

---

### 3.3 Colección `refMaquinas`
Identificación física de los dos autoclaves instalados en planta:

```json
[
  {
    "_id": 1,
    "autoclaveId": 1,
    "codigo": "AUTOCLAVE-01",
    "nombre": "Autoclave N° 1",
    "descripcion": "Esterilizador a vapor saturado - Línea A",
    "activo": true
  },
  {
    "_id": 2,
    "autoclaveId": 2,
    "codigo": "AUTOCLAVE-02",
    "nombre": "Autoclave N° 2",
    "descripcion": "Esterilizador a vapor saturado - Línea B",
    "activo": true
  }
]
```

---

## 4. Consultas Clave para el Backend en Express / Node.js

### 4.1 Obtener los puntos de telemetría para graficar la curva de un lote

Gracias a que `meta.loteId` está indexado dentro del `metaField` de la serie temporal, no es necesario hacer filtros complejos de rangos de fechas:

```javascript
// GET /api/lotes/:loteId/curva
app.get('/api/lotes/:loteId/curva', async (req, res) => {
  try {
    const { loteId } = req.params;

    const puntos = await db.collection('telemetria').find(
      { 'meta.loteId': loteId },
      {
        projection: {
          timestamp: 1,
          temp1: 1,
          temp2: 1,
          presion: 1,
          fase: 1,
          _id: 0
        },
        sort: { timestamp: 1 }
      }
    ).toArray();

    res.json(puntos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener curva de telemetría' });
  }
});
```

---

### 4.2 Obtener el estado actual en vivo de ambas máquinas

Para alimentar el panel de control o SCADA web en el dashboard principal:

```javascript
// GET /api/autoclaves/estado-actual
app.get('/api/autoclaves/estado-actual', async (req, res) => {
  try {
    // Busca los lotes activos (estado = 1) para autoclave 1 y 2
    const lotesActivos = await db.collection('lotes').find({ estado: 1 }).toArray();

    // Consulta la última muestra instantánea de cada autoclave
    const telemetriaActual = await Promise.all([1, 2].map(async (id) => {
      const ultimoPunto = await db.collection('telemetria')
        .find({ 'meta.autoclaveId': id })
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
      return ultimoPunto[0] || null;
    }));

    res.json({
      lotesActivos,
      telemetriaActual
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar estado en vivo' });
  }
});
```

---

### 4.3 Generar reporte consolidado del lote con duración por fase

Para armar la tabla del PDF o la vista detallada del lote:

```javascript
// GET /api/lotes/:loteId/reporte
app.get('/api/lotes/:loteId/reporte', async (req, res) => {
  try {
    const { loteId } = req.params;

    // 1. Cabecera y fases del lote
    const loteDoc = await db.collection('lotes').findOne({ lote: loteId });
    if (!loteDoc) return res.status(404).json({ error: 'Lote no encontrado' });

    // 2. Cálculo de duraciones por fase (en segundos)
    const fasesConDuracion = loteDoc.fases.map(f => {
      const ms = f.fin ? (new Date(f.fin) - new Date(f.inicio)) : null;
      return {
        faseNum: f.faseNum,
        inicio: f.inicio,
        fin: f.fin,
        duracionSeg: ms ? Math.round(ms / 1000) : null
      };
    });

    // 3. Métricas estadísticas del lote calculadas sobre la Time Series
    const [metricas] = await db.collection('telemetria').aggregate([
      { $match: { 'meta.loteId': loteId } },
      {
        $group: {
          _id: null,
          tempMaxCamara: { $max: "$temp1" },
          tempMinMeseta: {
            $min: {
              $cond: [{ $eq: ["$fase", 4] }, "$temp1", null]
            }
          },
          presionMax: { $max: "$presion" },
          muestrasTotal: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json({
      cabecera: loteDoc,
      fases: fasesConDuracion,
      metricas: metricas || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al consolidar reporte del lote' });
  }
});
```

---

## 5. Notas Técnicas de Despliegue y Recursos en la PC del SCADA

1. **Límite de memoria WiredTiger:** Dado que la máquina local ejecuta simultáneamente el software SCADA, se debe limitar la memoria RAM máxima que puede reservar MongoDB agregando al archivo `mongod.conf`:
   ```yaml
   storage:
     wiredTiger:
       engineConfig:
         cacheSizeGB: 1.0
   ```
2. **Timezone:** Todas las fechas y marcas temporales se insertan y consultan estrictamente en formato **UTC (`ISO 8601`)**. La conversión a hora local (ej. UTC-3) se resuelve directamente en la capa de presentación de React.
3. **Persistencia de Servicios:** Tanto Node-RED como el backend de Express deben estar configurados como servicios automáticos del sistema utilizando **NSSM** para garantizar el reinicio desatendido ante cortes de suministro eléctrico.