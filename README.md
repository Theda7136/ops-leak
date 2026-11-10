OpsLeak

Aplicación de inteligencia operacional para equipos de campo, servicios y logística. Centraliza reportes diarios, compara los costos de material con el presupuesto de los proyectos y utiliza Grok (xAI) para identificar cuellos de botella y proponer acciones.

La interfaz está en español y utiliza un tablero de tema oscuro. El proyecto está en desarrollo: existen bloqueos de compilación y funciones pendientes descritos en [Estado actual](#estado-actual-y-limitaciones).

## Contenido

- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Instalación local](#instalación-local)
- [Configuración](#configuración)
- [Uso](#uso)
- [Reglas del tablero](#reglas-del-tablero)
- [Integración con Grok](#integración-con-grok)
- [Modelo de datos](#modelo-de-datos)
- [Arquitectura](#arquitectura)
- [Comandos](#comandos)
- [Validación](#validación)
- [Despliegue](#despliegue)
- [Solución de problemas](#solución-de-problemas)
- [Estado actual y limitaciones](#estado-actual-y-limitaciones)

## Funcionalidades

- **Tablero ejecutivo:** presupuesto de la cartera, costos acumulados, proyectos en riesgo y cantidad de alertas críticas.
- **Seguimiento presupuestario:** consumo del presupuesto por proyecto, cliente, estado y fechas previstas.
- **Reportes de campo:** proyecto, fecha, supervisor, horas invertidas, costos de material y notas en texto libre.
- **Análisis con IA:** resumen de la jornada, severidad, tipo de cuello de botella y acción recomendada.
- **Cambio de estado:** un proyecto activo pasa a estar en riesgo cuando el análisis genera una alerta moderada o crítica.
- **Persistencia ante fallos de IA:** el reporte se guarda antes de consultar Grok y se conserva si el análisis falla.
- **Formulario de alta de proyectos:** disponible en la interfaz, pero pendiente de completar los campos de fecha exigidos por la base de datos.

No hay carga de audio ni transcripción implementada. Las notas se introducen como texto.

## Tecnologías

Versiones declaradas en `package.json`; las resoluciones exactas están en `package-lock.json`.

| Capa | Tecnología |
| --- | --- |
| Aplicación | Next.js 15.5, App Router y Server Actions |
| Interfaz | React 19.1 y TypeScript 5.9 con modo estricto |
| Estilos | Tailwind CSS 3.4, componentes de UI locales y Lucide |
| Formularios | React Hook Form, Zod y resolvers |
| Persistencia | Prisma 6 y SQLite |
| IA | Grok mediante el SDK `openai` 4.104, dirigido a la API de xAI |
| Datos iniciales | Script TypeScript ejecutado con `tsx` |

**Base de datos efectiva:** `prisma/schema.prisma` utiliza SQLite con `url = "file:./dev.db"`. Aunque `.env.example`, algunos mensajes y `.cursorrules.md` mencionan PostgreSQL, esa no es la conexión activa del código actual.

## Instalación local

### Requisitos

- Node.js y npm compatibles con las dependencias del proyecto. No se fija una versión mediante `engines` ni un archivo de versión. La revisión local se realizó con Node.js 24.18.0 y npm 11.16.0; esto no equivale a una validación completa de ejecución.
- Acceso a las dependencias de npm durante la instalación.
- Una clave de xAI para generar alertas. Sin ella, el flujo implementado conserva los reportes, pero no genera su análisis.
- Permisos de escritura sobre `prisma/dev.db` y su directorio.

### 1. Instalar dependencias

Desde la raíz del repositorio:

```sh
npm ci
```

El script `postinstall` genera Prisma Client automáticamente.

### 2. Crear el archivo de entorno

Si todavía no existe `.env`, copia el ejemplo. No sobrescribas una configuración existente.

PowerShell:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Bash:

```sh
test -f .env || cp .env.example .env
```

Configura `XAI_API_KEY` y, si corresponde, `GROK_MODEL`. Consulta [Configuración](#configuración) para entender el comportamiento de `DATABASE_URL`.

### 3. Preparar la base local

```sh
npm run db:generate
npm run db:push
npm run db:seed
```

`db:push` sincroniza el esquema con SQLite; no crea un historial de migraciones. Revisa los cambios antes de ejecutarlo sobre una base con datos que quieras conservar.

El seed crea dos proyectos de demostración:

| Proyecto | Cliente | Presupuesto | Estado |
| --- | --- | ---: | --- |
| Torre Residencial Norte | Inmobiliaria Altura | 100000 | `ACTIVE` |
| Nave Industrial Pacífico | Logística Pacífico | 240000 | `AT_RISK` |

No crea reportes ni alertas. Si encuentra un proyecto con el mismo nombre, actualiza sus datos, incluido el estado; no debe tratarse como una carga inocua sobre datos reales.

### 4. Iniciar desarrollo

```sh
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige a `/dashboard`.

**Antes de considerar la instalación funcional**, resuelve los bloqueos de código descritos en [Estado actual](#estado-actual-y-limitaciones). Estos comandos documentan el procedimiento del proyecto; no garantizan que la revisión actual compile sin cambios.

## Configuración

| Variable | Uso actual | Valor de referencia |
| --- | --- | --- |
| `XAI_API_KEY` | Credencial del servidor para analizar reportes con xAI | Clave propia; nunca incluirla en el repositorio |
| `GROK_MODEL` | Modelo enviado a la API | `grok-3` si la variable no está definida |
| `DATABASE_URL` | Aparece en el ejemplo, pero el esquema SQLite actual no la lee | El ejemplo contiene una URL de PostgreSQL |

Configuración mínima para IA:

```dotenv
XAI_API_KEY="tu_clave_de_xai"
GROK_MODEL="grok-3"
```

El modelo debe estar disponible para la cuenta utilizada. El valor por defecto describe el código, no garantiza disponibilidad del servicio. Una cadena vacía en `GROK_MODEL` no activa el valor por defecto.

Para usar PostgreSQL se requiere cambiar el proveedor y la URL del datasource en `prisma/schema.prisma`, regenerar Prisma Client y preparar el esquema y los datos de destino. Cambiar únicamente `.env` no migra la aplicación ni los datos de SQLite.

La moneda de presentación está fijada en `USD` mediante `DISPLAY_CURRENCY` en `types/index.ts`. El formato utiliza `es-ES` y muestra importes sin decimales. Cambiar esa constante solo cambia la presentación; no convierte importes ni añade soporte multimoneda.

## Uso

### Rutas

| Ruta | Función |
| --- | --- |
| `/` | Redirección al tablero |
| `/dashboard` | KPIs, ejecución presupuestaria y alertas |
| `/reports/new` | Registro de una jornada |
| `/projects/new` | Formulario de proyecto, actualmente incompleto |

### Registrar una jornada

1. Prepara proyectos mediante el seed en una base de desarrollo.
2. Abre **Nuevo reporte**.
3. Selecciona un proyecto activo o en riesgo. Los completados no admiten reportes.
4. Introduce fecha, supervisor, horas, costos y notas de la jornada.
5. Pulsa **Registrar reporte** y espera a que termine la petición.
6. Revisa el tablero: los costos se acumulan y, si el análisis tiene éxito, aparece una nueva alerta.

Ejemplo de nota:

> El proveedor entregó el cemento tres horas tarde. Cuatro operarios estuvieron sin actividad durante la espera. Se reprogramó el vaciado para mañana y se necesita confirmar el transporte antes de las 7:00.

Validaciones principales: notas de al menos 10 caracteres, nombre de supervisor de al menos 2 caracteres, horas y costos no negativos y una fecha con formato `AAAA-MM-DD`. El servidor comprueba que el proyecto exista y no esté completado.

## Reglas del tablero

| Indicador | Cálculo |
| --- | --- |
| Presupuesto total | Suma de presupuestos de todos los proyectos, incluidos los completados |
| Ejecutado | Suma de `materialCosts` de todos los reportes |
| Porcentaje ejecutado | Costos de material / presupuesto |
| Proyectos en riesgo | Cantidad de proyectos con estado `AT_RISK` |
| Alertas críticas | Cantidad total de alertas `CRITICAL`, sin filtro temporal ni resolución |

El consumo presupuestario se muestra en verde por debajo del 85 %, en ámbar desde el 85 % y en rojo desde el 100 %. Si no hay presupuesto positivo, el porcentaje se considera desconocido. La barra visual se limita al 100 %, aunque el porcentaje mostrado puede superarlo.

La lista de proyectos en curso incluye `ACTIVE` y `AT_RISK`. El feed contiene todas las alertas, de más reciente a más antigua, sin paginación.

El ejecutado contempla únicamente materiales: las horas registradas no se convierten en costos, y las estimaciones de sobrecosto de Grok no se suman al presupuesto. Las barras representan consumo presupuestario, no avance físico de la obra. Alcanzar un umbral de presupuesto cambia el color, pero no cambia por sí mismo el estado del proyecto.

## Integración con Grok

El flujo está implementado en `lib/reports.ts` y `lib/grok.ts`:

```text
Formulario → Server Action → Validación → Guardado del reporte en SQLite
                                       → Consulta a Grok → Validación del JSON
                                       → Guardado de alerta → Actualización del estado
                                       → Revalidación del tablero
```

La petición usa `https://api.x.ai/v1`, Chat Completions, temperatura `0.2` y `response_format: { type: "json_object" }`. La clave permanece en el servidor.

Se envían a xAI las notas, el nombre del proyecto y del cliente, el estado, el presupuesto, los costos acumulados de reportes anteriores, las horas y los costos de material de la jornada.

Ejemplo ilustrativo del contrato de respuesta, validado con Zod:

```json
{
  "summary": "La entrega tardía de cemento interrumpió el trabajo de la cuadrilla.",
  "hoursLost": 12,
  "costImpact": 0,
  "severity": "MEDIUM",
  "bottleneckType": "MATERIAL_DELAY",
  "actionRecommended": "Confirmar la entrega y el transporte antes de iniciar la siguiente jornada."
}
```

- Severidades: `LOW`, `MEDIUM`, `CRITICAL`.
- Cuellos de botella: `MATERIAL_DELAY`, `EQUIPMENT_FAILURE`, `LABOR_IDLE`, `WEATHER`, `OTHER`.
- Todo análisis válido crea una alerta, incluso con severidad `LOW`.
- Una alerta `MEDIUM` o `CRITICAL` cambia un proyecto `ACTIVE` a `AT_RISK`. No existe retorno automático a `ACTIVE`.
- `hoursLost` y `costImpact` se validan, pero actualmente no se guardan ni se muestran.

Si falta la clave, la petición falla o el JSON no cumple el esquema, el reporte ya guardado se conserva. El servidor devuelve éxito con una advertencia, pero el formulario redirige al tablero sin mostrar ese mensaje. No existe un mecanismo de reanálisis implementado.

## Modelo de datos

Definido en `prisma/schema.prisma`:

| Modelo | Campos principales |
| --- | --- |
| `Project` | `id`, `name`, `clientName`, `totalBudget`, `startDate`, `estimatedEndDate`, `status` |
| `DailyReport` | `id`, `projectId`, `date`, `rawContent`, `hoursLogged`, `materialCosts`, `supervisorName` |
| `OperationalAlert` | `id`, `projectId`, `severity`, `bottleneckType`, `summary`, `actionRecommended`, `createdAt` |

Un proyecto tiene múltiples reportes y alertas. Ambas relaciones tienen eliminación en cascada. No existe una relación directa entre una alerta y el reporte que originó su análisis.

Los identificadores se generan con `cuid()`. Hay índices por estado del proyecto, proyecto y fecha del reporte, proyecto y severidad de alerta, y fecha de creación de alerta. Los importes y las horas se almacenan como `Float`.

La fecha del reporte se construye a las `12:00:00 UTC` del día elegido. La fecha de una alerta corresponde al momento de su creación.

## Arquitectura

```text
app/
  layout.tsx                  Layout, fuente y metadatos
  page.tsx                    Redirección inicial
  globals.css                 Estilos globales
  dashboard/page.tsx          Tablero ejecutivo
  projects/new/page.tsx       Alta de proyectos
  reports/new/page.tsx        Pantalla de reporte
  actions/reports.ts          Server Action para reportes
  actions.ts                  Formulario duplicado; contiene JSX en archivo .ts
components/
  dashboard/                  KPIs, proyectos y feed de alertas
  layout/                     Navegación y contenedor de la aplicación
  reports/report-form.tsx     Formulario de cliente
  ui/                         Componentes visuales compartidos
lib/
  dashboard.ts                Consultas y agregaciones del tablero
  reports.ts                  Validación y registro de jornadas
  grok.ts                     Cliente xAI y contrato de análisis
  prisma.ts                   Instancia compartida de Prisma Client
  format.ts                   Importes, porcentajes y fechas
  utils.ts                    Utilidades de estilos
prisma/
  schema.prisma               Modelos y datasource SQLite
  seed.ts                     Proyectos de demostración
  dev.db                      Base local presente en el proyecto
types/index.ts                Tipos, enumeraciones, etiquetas y moneda
```

Las páginas del tablero y de reportes son dinámicas y consultan la base en el servidor. El formulario interactivo utiliza React Hook Form y llama a una Server Action. No se exponen endpoints REST propios en esta revisión.

## Comandos

| Comando | Propósito |
| --- | --- |
| `npm ci` | Instalar las versiones del lockfile; ejecuta `postinstall` |
| `npm run dev` | Iniciar Next.js en desarrollo |
| `npm run build` | Crear una compilación de producción |
| `npm start` | Servir una compilación de producción existente |
| `npm run lint` | Ejecutar el script actual `next lint` |
| `npm run db:generate` | Regenerar Prisma Client |
| `npm run db:push` | Sincronizar el esquema con la base |
| `npm run db:seed` | Crear o actualizar proyectos de demostración |
| `npx prisma validate` | Validar el esquema Prisma |
| `npx tsc --noEmit --incremental false` | Revisar TypeScript sin emitir archivos |

## Validación

No hay una suite de pruebas automatizadas ni un script `test` configurado. Para revisar cambios, valida el esquema, ejecuta TypeScript, lint y build; después comprueba manualmente el flujo afectado.

En la revisión que acompaña este README, `prisma validate` confirmó que el esquema es válido. TypeScript y lint fallaron en `app/actions.ts`: contiene JSX, pero su extensión es `.ts`. No se ejecutó una compilación de producción ni una consulta real a xAI.

Una vez corregidos los bloqueos, comprueba en una base de desarrollo:

1. Carga del tablero con los proyectos del seed.
2. Registro de una jornada y aumento del costo ejecutado.
3. Conservación del reporte cuando falla la integración de IA.
4. Generación de una alerta con una clave y un modelo válidos.
5. Cambio de `ACTIVE` a `AT_RISK` ante un análisis moderado o crítico.

La severidad depende de la respuesta del modelo; una prueba reproducible de esa transición requiere controlar la respuesta de IA.

## Despliegue

El repositorio no incluye configuración de contenedores, pipeline de CI/CD ni historial de migraciones. Antes de desplegar, deben resolverse los bloqueos de compilación y alta de proyectos.

El procedimiento previsto para un servidor Node.js, después de preparar la base y el entorno, es:

```sh
npm ci
npm run db:generate
npm run build
npm start
```

La compilación usa `next/font/google` para obtener Inter y puede necesitar conectividad a Google Fonts. La base SQLite requiere almacenamiento persistente y escribible; un disco efímero no conserva reportes entre despliegues. No ejecutes el seed automáticamente sobre datos operativos.

No hay autenticación ni separación por organización. Para una publicación con datos reales se debe implementar control de acceso y definir el tratamiento de los datos enviados a xAI. `.env` está ignorado por Git; `prisma/dev.db` no lo está en la configuración actual y debe revisarse antes de compartir el repositorio.

## Solución de problemas

| Síntoma | Causa o siguiente comprobación |
| --- | --- |
| TypeScript muestra errores de JSX o de sintaxis en `app/actions.ts` | El archivo contiene JSX con extensión `.ts`; hay que resolver la duplicación o usar una estructura y extensión adecuadas |
| No se puede crear un proyecto | El alta omite `startDate` y `estimatedEndDate`, obligatorios y sin valores por defecto en Prisma |
| El tablero no puede leer datos | Comprueba el archivo SQLite, permisos, esquema sincronizado y Prisma Client generado; el mensaje sobre `DATABASE_URL` no refleja el datasource actual |
| No aparecen proyectos en el formulario | No hay proyectos no completados o falló la consulta; usa el seed solo en desarrollo y revisa los logs |
| Se guarda el reporte, pero no aparece alerta | Comprueba `XAI_API_KEY`, el modelo, conectividad y el contrato de respuesta; el formulario no muestra la advertencia del servidor |
| Cambiar `DATABASE_URL` no cambia la base | La URL está fijada en `schema.prisma` |
| Prisma informa tablas inexistentes o un cliente desactualizado | Revisa la base seleccionada y ejecuta `db:generate` y `db:push` según corresponda |
| La compilación falla al cargar Inter | Comprueba el acceso a Google Fonts o prepara una fuente local como cambio de implementación |
| Lint avisa sobre `next lint` o falla por configuración | El script usa `next lint`, y el proyecto combina ESLint 9 con `.eslintrc.json`; revisa su compatibilidad al actualizar la configuración |

## Estado actual y limitaciones

### Bloqueos y discrepancias encontrados

- `app/actions.ts` contiene JSX en un archivo `.ts` y bloquea la comprobación de TypeScript.
- Tanto ese archivo como `app/projects/new/page.tsx` crean proyectos sin las fechas requeridas por el esquema.
- El proveedor real es SQLite; el ejemplo de entorno y varios mensajes todavía hacen referencia a PostgreSQL.
- El mensaje de guardado sin análisis no se presenta al usuario tras enviar el reporte.

### Alcance pendiente

- Autenticación, roles y aislamiento entre organizaciones.
- Edición, cierre y eliminación de proyectos desde la interfaz.
- Historial detallado, edición o eliminación de reportes.
- Resolución de alertas, filtros, paginación y notificaciones externas.
- Persistencia de horas perdidas y sobrecostos estimados por IA.
- Reanálisis de reportes y procesamiento en segundo plano.
- Transacción conjunta entre reporte, alerta y cambio de estado: actualmente las escrituras son separadas y pueden quedar parcialmente completadas.
- Prevención de duplicados al reenviar un reporte.
- Carga de archivos, audio, transcripción y exportaciones.
- Pruebas automatizadas y un proceso de migración y despliegue reproducible.

## Contribuciones y licencia

Para contribuir, separa lógica de negocio en `lib/`, componentes en `components/` y rutas en `app/`. Mantén los tipos compartidos en `types/`, valida entradas en el servidor y actualiza esta documentación cuando cambie el comportamiento o la configuración.

No se incluye un archivo `LICENSE`. `package.json` marca el paquete como privado; esto no define por sí mismo una licencia de uso o distribución.
