# Plan Maestro del Sistema Web Multiempresa para Administración de Clientes y Paquetes

## 1. Resumen ejecutivo

Se desarrollará una plataforma web **multiempresa (multi-tenant)** para negocios que ofrecen servicios de **casillero y compras por internet**, permitiendo que una misma base tecnológica sea usada por múltiples empresas mediante **subdominios independientes**.

Cada empresa tendrá su propio entorno con:

* logo y colores personalizados
* configuración de casillero
* secuencia propia de códigos de cliente
* administradores propios
* clientes finales propios
* paquetes y tracking propios
* correos automáticos propios
* Google Sheets propia o configurable
* notificaciones internas propias

La plataforma tendrá tres roles:

* **Super Admin**: tú o tu equipo, con control global de la plataforma
* **Admin de empresa**: el negocio cliente que administra sus operaciones
* **Cliente final**: la persona que se registra y usa el casillero

La solución se construirá para funcionar bien con **Vercel + Supabase**, usando una arquitectura moderna y compatible con **Next.js**, **Tailwind CSS**, animaciones, toast notifications y branding dinámico por subdominio.

---

## 2. Objetivo del sistema

Crear un sistema web que permita:

1. registrar clientes finales desde una web pública
2. generar automáticamente un número de cliente incremental por empresa
3. dar acceso al cliente final a su dashboard
4. permitir que el admin de cada empresa gestione clientes, paquetes, correos y configuraciones
5. centralizar la administración de múltiples empresas en una sola plataforma
6. sincronizar registros con Google Sheets
7. mostrar tracking de paquetes y estados de tránsito
8. notificar por email y dentro del dashboard
9. personalizar branding por empresa
10. operar desde subdominios distintos para cada cliente negocio

---

## 3. Tipo de negocio objetivo

El sistema está orientado a empresas que ofrecen:

* casilleros internacionales
* compras por internet
* recepción y gestión de paquetes
* seguimiento de envíos
* notificación al cliente cuando el paquete llega a sucursal

---

## 4. Modelo multiempresa (multi-tenant)

La plataforma no será para un solo negocio. Debe poder reutilizarse con múltiples clientes empresa.

### Ejemplos de acceso por subdominio

* `cliente1.tudominio.com`
* `cliente2.tudominio.com`
* `cliente3.tudominio.com`

### Comportamiento esperado

Cuando un usuario entre a un subdominio:

1. el sistema detecta el subdominio
2. identifica la empresa asociada
3. carga logo, colores y textos de esa empresa
4. carga configuración de casillero de esa empresa
5. usa sus plantillas de correo
6. muestra solo sus datos
7. separa completamente clientes, paquetes y admins del resto de empresas

### Aislamiento por tenant

Cada empresa tendrá separados:

* administradores
* clientes finales
* paquetes
* secuencia de cliente
* configuraciones
* branding
* Google Sheets
* notificaciones
* correos
* historial y logs

---

## 5. Roles y permisos

## 5.1 Super Admin

Es el rol global de la plataforma.

Puede:

* crear empresas
* asignar subdominio
* configurar branding
* crear admins de empresa
* activar/desactivar empresas
* ver todas las empresas
* administrar configuraciones globales
* acceder a panel global de soporte y auditoría

## 5.2 Admin de empresa

Es el negocio que usa el sistema.

Puede:

* ver dashboard operativo
* ver y editar clientes finales
* buscar clientes
* gestionar paquetes
* registrar paquetes manualmente o por carga masiva
* marcar paquetes como llegados a sucursal
* editar correo de bienvenida
* editar configuración del casillero
* gestionar notificaciones
* ver historial de paquetes de cada cliente
* reenviar correos
* consultar estado de sincronización con Google Sheets

## 5.3 Cliente final

Es la persona registrada por el formulario.

Puede:

* registrarse
* iniciar sesión
* ver sus datos de casillero
* ver sus paquetes
* rastrear paquetes
* ver barra de progreso del tránsito
* ver notificaciones internas
* cambiar contraseña
* editar solo su nombre

No puede editar:

* correo
* teléfono
* número de cliente
* dirección del casillero
* país/ciudad de configuración
* estados de paquetes

---

## 6. Flujo de registro del cliente final

1. El visitante entra al sitio del negocio.
2. Toca el botón de registro.
3. Es enviado a una página dedicada con solo el formulario de registro.
4. Completa sus datos.
5. El sistema valida la información.
6. Se genera el código de cliente incremental correspondiente a esa empresa.
7. Se crea el usuario cliente.
8. Se guarda la información en la base de datos.
9. Se envía el correo de bienvenida al cliente.
10. Se envía un correo de notificación al admin de la empresa.
11. Se crea una notificación interna para el cliente.
12. Se sincroniza el registro con Google Sheets.
13. El cliente queda habilitado para iniciar sesión.

---

## 7. Código de cliente incremental por empresa

El sistema debe generar automáticamente un código de cliente incremental por empresa.

### Ejemplo

`MONCHIS 405 X`

### Partes configurables por empresa

* prefijo: `MONCHIS`
* consecutivo: `405`
* sufijo: `X`
* padding opcional: `0001`, `0002`, etc.

### Ejemplos válidos

* `MONCHIS 405 X`
* `BOX 001`
* `CARGO-0007`
* `USA 102`

### Reglas

* el consecutivo es independiente por empresa
* el código debe ser único dentro de cada empresa
* el número debe generarse con lógica transaccional en base de datos para evitar duplicados

---

## 8. Dashboard del admin de empresa

## 8.1 Resumen principal

Debe mostrar:

* total de clientes
* clientes registrados hoy/mes
* total de paquetes
* paquetes en tránsito
* paquetes llegados a sucursal
* notificaciones recientes
* últimos registros

## 8.2 Lista de clientes

Debe incluir:

* paginación de 15 clientes por página
* búsqueda por nombre, correo, teléfono y número de cliente
* filtros por fecha y estado
* edición de cliente

### Campos sugeridos

* número de cliente
* nombre
* correo
* teléfono
* fecha de registro
* estado
* acciones

## 8.3 Edición de cliente

El admin puede editar:

* nombre
* correo
* teléfono
* dirección
* ciudad
* país
* código postal
* estado del cliente
* notas internas

Además puede:

* resetear contraseña
* reenviar correo de bienvenida
* ver paquetes del cliente
* ver historial de actividad

## 8.4 Configuración del casillero

Debe poder editar:

* dirección
* ciudad / estado / código postal
* país
* teléfono

Ejemplo:

* `6315 NW 99TH AVE`
* `DORAL, FL 33178`
* `United States`
* `+1 7866185090`

## 8.5 Editor del correo de bienvenida

Debe permitir editar:

* asunto
* cuerpo HTML o editor enriquecido
* variables dinámicas

### Variables sugeridas

* `{{nombre}}`
* `{{codigo_cliente}}`
* `{{direccion_casillero}}`
* `{{ciudad_estado_postal}}`
* `{{pais}}`
* `{{telefono}}`
* `{{empresa}}`

## 8.6 Gestión de paquetes

El admin debe poder:

* crear paquete manualmente
* asociarlo a un cliente
* guardar número de seguimiento
* indicar courier
* registrar descripción
* actualizar estado
* marcar paquete como llegado a sucursal
* enviar notificación al cliente
* importar paquetes por CSV/Excel en fase posterior

### Campos del paquete

* cliente
* tracking number
* courier
* descripción
* estado interno
* estado de tracking
* última actualización
* fecha de creación
* fecha llegada a sucursal
* notas internas

---

## 9. Dashboard del cliente final

## 9.1 Inicio

La portada debe mostrar en primer bloque:

* código de cliente
* dirección del casillero
* ciudad / estado / código postal
* país
* teléfono

Además, mostrar cards para:

* rastrear paquete
* mis paquetes
* notificaciones
* editar nombre

## 9.2 Menú lateral

Opciones:

* inicio
* rastrear paquete
* mis paquetes
* notificaciones
* mi perfil
* cambiar contraseña
* cerrar sesión

## 9.3 Mis paquetes

Debe mostrar la lista de paquetes del cliente:

* tracking number
* courier
* estado actual
* fecha de registro
* última actualización
* ver detalle

## 9.4 Barra de progreso de paquete

La barra de progreso puede mapear estados a una línea visual:

1. Registrado
2. En tránsito
3. En centro logístico / aduana
4. Llegó a sucursal
5. Entregado al cliente

---

## 10. Tracking de paquetes

El sistema de tracking a integrar es 17TRACK.

### Fase 1 recomendada

Integrar mediante:

* widget oficial
* branded tracking page
* enlace embebido o experiencia integrada básica

### Fase 2 recomendada

Integrar mediante:

* API oficial de 17TRACK
* consulta server-side
* almacenamiento de eventos de tracking
* actualización de estados y barra de progreso

### Nota de arquitectura

No se recomienda depender de la web móvil como base de integración. Es preferible usar widget, branded page o API oficial.

---

## 11. Sistema de notificaciones

Debe existir en dos canales:

## 11.1 Notificaciones por email

Eventos mínimos:

1. Registro del cliente

   * email al cliente
   * email al admin de la empresa

2. Paquete llegó a sucursal

   * email al cliente

3. Opcionales para fase posterior

   * paquete registrado
   * paquete actualizado
   * paquete listo para retiro
   * cambio de contraseña

## 11.2 Notificaciones internas en dashboard

El cliente debe tener una sección visible para consultar notificaciones.

### Ejemplos

* tu registro fue completado
* tu paquete fue registrado
* tu paquete llegó a la sucursal
* tus datos fueron actualizados
* tu contraseña fue cambiada

### Campos sugeridos

* título
* mensaje
* tipo
* leído / no leído
* fecha
* enlace relacionado

---

## 12. Integración con Google Sheets

Además de guardar el registro en la base de datos, cada nuevo cliente debe enviarse a una Google Sheet.

### Objetivo

* respaldo operativo
* visibilidad rápida
* continuidad con el flujo actual del negocio

### Flujo

Cuando un cliente se registra:

1. se guarda en base de datos
2. se genera el código
3. se crea usuario
4. se envían correos
5. se crea notificación
6. se agrega una fila en Google Sheets

### Columnas sugeridas

* fecha de registro
* número de cliente
* nombre
* apellido
* nombre completo
* correo
* teléfono
* dirección
* ciudad
* país
* código postal
* estado
* id interno
* observaciones
* empresa

### Regla técnica importante

La base de datos es la fuente principal. Google Sheets debe actuar como espejo operativo o respaldo visual, no como fuente maestra.

### Por empresa

Cada tenant debe poder tener:

* Google Spreadsheet ID
* nombre de hoja
* estado de sincronización

### Manejo de errores

Si falla el envío a Google Sheets:

* el registro principal no debe fallar
* el sistema debe guardar el evento como pendiente o error
* debe existir reintento manual o automático

---

## 13. Branding y personalización por empresa

Cada empresa debe poder personalizar como mínimo:

* logo
* favicon
* nombre comercial
* color primario
* color secundario
* color de acento
* título del login
* textos básicos del sistema
* plantilla de correo
* datos del casillero

### Implementación visual sugerida

Usar CSS variables y Tailwind CSS para aplicar branding dinámico por tenant.

Ejemplo conceptual:

```css
:root {
  --tenant-primary: #2563eb;
  --tenant-secondary: #f97316;
  --tenant-accent: #0f172a;
}
```

Y en la interfaz usar esas variables mediante utilidades compatibles.

---

## 14. UI/UX del sistema

La interfaz debe ser moderna, responsive y coherente tanto para admin como para cliente.

### Tecnologías y experiencia deseada

* Tailwind CSS
* componentes reutilizables
* diseño responsive
* animaciones suaves
* toast notifications
* loaders y estados vacíos
* tablas limpias y legibles
* cards y paneles visuales

### Librerías recomendadas

* **Tailwind CSS** para estilos
* **shadcn/ui** para componentes
* **Framer Motion** para animaciones
* **Sonner** para toast notifications
* **TanStack Table** para tablas del admin
* **React Hook Form + Zod** para formularios

### Animaciones sugeridas

* fade in en cards
* slide al abrir menú lateral
* hover sutil en botones
* skeleton loaders
* transición en modales
* animación de barra de progreso

### Toasts sugeridos

#### Admin

* cliente actualizado
* paquete creado
* correo reenviado
* configuración guardada
* error de sincronización

#### Cliente

* nombre actualizado
* contraseña cambiada
* notificación leída
* tracking consultado
* error de carga

---

## 15. Acceso y autenticación

### 15.1 Cliente final

* login con correo y contraseña
* puede cambiar contraseña
* puede editar solo su nombre

### 15.2 Admin de empresa

* login privado de la empresa
* acceso solo a datos de su tenant

### 15.3 Super Admin

* acceso global a toda la plataforma

### Regla multi-tenant de login

La autenticación debe considerar:

* subdominio actual
* usuario
* rol
* pertenencia al tenant

---

## 16. Arquitectura técnica recomendada

## Stack recomendado

* **Frontend y app fullstack:** Next.js
* **Deployment:** Vercel
* **Base de datos:** Supabase Postgres
* **Auth:** Supabase Auth
* **Storage:** Supabase Storage
* **Estilos:** Tailwind CSS
* **Componentes:** shadcn/ui
* **Animaciones:** Framer Motion
* **Toasts:** Sonner
* **Validación:** Zod + React Hook Form
* **Correos:** Resend o proveedor SMTP/API externo
* **Google Sheets:** Google Sheets API
* **Tracking:** 17TRACK widget/API

### Por qué este stack

Porque encaja naturalmente con:

* despliegue en Vercel
* base de datos Postgres administrada
* frontend moderno
* subdominios y branding dinámico
* panel admin y cliente
* desarrollo rápido del MVP

---

## 17. Opciones de base de datos y deployment con planes gratis razonables

## 17.1 Base de datos

### Opción principal: Supabase

Ventajas:

* Postgres administrado
* Auth integrado
* Storage integrado
* APIs
* buen free plan para MVP
* ideal para Next.js

### Opción secundaria: Neon

Ventajas:

* Postgres serverless
* buena experiencia para desarrollo
* alternativa muy sólida si se quiere Postgres puro

### Opción menos prioritaria: Cloudflare D1

Ventajas:

* free tier interesante
* útil para arquitectura edge

Desventaja:

* no es Postgres
* menos conveniente para este sistema

## 17.2 Deployment

### Opción principal de frontend/app: Vercel

Ventajas:

* ideal para Next.js
* despliegue sencillo desde Git
* previews por rama
* buen plan gratis
* soporte natural para subdominios

### Opción secundaria para backend adicional o servicios auxiliares: Render

Ventajas:

* sirve para pruebas y servicios auxiliares
* útil para jobs o APIs separadas si hiciera falta

Limitaciones del free plan:

* servicios se duermen por inactividad
* Postgres gratis no es ideal para producción real

### Opción secundaria: Railway

Ventajas:

* despliegue rápido
* cómodo para prototipos

Observación:

* menos atractivo como free plan prolongado que Vercel + Supabase

## 17.3 Recomendación final de infraestructura

### Recomendación principal

* **Vercel** para la app
* **Supabase** para DB, Auth y Storage

### Recomendación ampliada

* Vercel para frontend/app
* Supabase para DB/Auth/Storage
* Resend para emails
* Google Sheets API para sincronización
* 17TRACK widget/API para tracking

---

## 18. Estructura funcional de pantallas

## Público

* `/`
* `/registro`
* `/login`
* `/recuperar-password`

## Cliente final

* `/dashboard`
* `/rastrear`
* `/mis-paquetes`
* `/mis-paquetes/[id]`
* `/notificaciones`
* `/perfil`
* `/cambiar-password`

## Admin de empresa

* `/admin`
* `/admin/clientes`
* `/admin/clientes/[id]`
* `/admin/paquetes`
* `/admin/paquetes/[id]`
* `/admin/notificaciones`
* `/admin/configuracion/casillero`
* `/admin/configuracion/correos`
* `/admin/configuracion/branding`
* `/admin/configuracion/google-sheets`

## Super Admin

* `/super-admin`
* `/super-admin/tenants`
* `/super-admin/tenants/nuevo`
* `/super-admin/tenants/[id]`
* `/super-admin/usuarios`
* `/super-admin/logs`

---

## 19. Modelo de datos propuesto

## Tabla `tenants`

* id
* name
* slug
* subdomain
* logo_url
* favicon_url
* primary_color
* secondary_color
* accent_color
* login_title
* support_email
* is_active
* created_at
* updated_at

## Tabla `tenant_settings`

* id
* tenant_id
* client_code_prefix
* client_code_suffix
* current_sequence
* sequence_padding
* locker_address_line_1
* locker_city_state_postal
* locker_country
* locker_phone
* welcome_email_subject
* welcome_email_template_html
* google_sheet_id
* google_sheet_name
* tracking_provider
* tracking_config_json
* created_at
* updated_at

## Tabla `users`

* id
* tenant_id
* email
* password_hash o auth_provider_id
* role (`super_admin`, `admin`, `client`)
* is_active
* last_login_at
* created_at
* updated_at

## Tabla `profiles`

* id
* user_id
* tenant_id
* full_name
* phone
* avatar_url
* created_at
* updated_at

## Tabla `clients`

* id
* tenant_id
* user_id
* client_code
* sequence_number
* first_name
* last_name
* full_name
* phone
* country
* city
* address_line_1
* postal_code
* notes
* registered_at
* created_at
* updated_at

## Tabla `packages`

* id
* tenant_id
* client_id
* tracking_number
* courier_code
* courier_name
* description
* internal_status
* tracking_status
* tracking_substatus
* last_tracking_event
* last_tracking_at
* arrived_at_branch_at
* delivered_to_customer_at
* notes
* created_at
* updated_at

## Tabla `package_events`

* id
* tenant_id
* package_id
* event_code
* event_title
* event_description
* event_location
* event_time
* raw_payload_json
* created_at

## Tabla `notifications`

* id
* tenant_id
* user_id
* type
* title
* message
* is_read
* related_entity_type
* related_entity_id
* created_at
* read_at

## Tabla `email_logs`

* id
* tenant_id
* to_email
* subject
* template_key
* status
* payload_json
* sent_at
* error_message

## Tabla `google_sheets_sync_logs`

* id
* tenant_id
* entity_type
* entity_id
* action
* payload_json
* sync_status
* error_message
* retry_count
* synced_at
* created_at

## Tabla `audit_logs`

* id
* tenant_id
* user_id
* action
* entity_type
* entity_id
* before_json
* after_json
* created_at

---

## 20. Reglas de negocio clave

1. Todo registro operativo pertenece a un tenant.
2. El subdominio determina el tenant activo.
3. Cada empresa tiene branding propio.
4. Cada empresa tiene secuencia propia de cliente.
5. El código de cliente debe ser único por empresa.
6. El admin de empresa solo ve sus datos.
7. El cliente final solo ve su propia información.
8. El cliente final solo puede editar su nombre.
9. El cliente puede cambiar contraseña.
10. El admin puede editar el registro completo del cliente.
11. Al marcar un paquete como llegado a sucursal se debe:

    * guardar el cambio
    * crear notificación interna
    * enviar email al cliente
12. El registro debe sincronizarse con Google Sheets sin comprometer el guardado principal.
13. Debe existir trazabilidad básica de cambios administrativos.

---

## 21. Seguridad mínima requerida

* contraseñas seguras
* validación backend de formularios
* separación estricta por tenant
* control por roles
* sanitización del HTML de correos
* auditoría de acciones sensibles
* protección contra acceso entre tenants
* variables sensibles en servidor
* backups periódicos de base de datos
* no exponer claves de APIs en frontend

---

## 22. Fases de desarrollo

## Fase 1 - MVP funcional

* estructura multi-tenant por subdominio
* creación de tenants desde super admin
* branding básico por empresa
* registro de clientes
* login cliente/admin
* generación de código incremental por tenant
* dashboard admin básico
* dashboard cliente básico
* listado de clientes con paginación de 15
* edición de clientes
* configuración de casillero
* editor de correo de bienvenida
* sincronización con Google Sheets
* notificaciones internas
* email de bienvenida y email al admin
* listado manual de paquetes
* card de rastrear paquete
* tracking integrado por widget o branded page

## Fase 2 - Operación avanzada

* integración API 17TRACK
* guardado de eventos de tracking
* barra de progreso automática
* importación masiva de paquetes
* filtros avanzados
* historial de auditoría ampliado
* panel mejorado de notificaciones
* reintentos automáticos de sync con Sheets

## Fase 3 - Escalado

* reportes
* exportaciones
* métricas por tenant
* multi-sucursal
* más branding configurable
* automatizaciones adicionales
* posible PWA o app móvil

---

## 23. Estructura técnica sugerida del proyecto Next.js

```txt
src/
  app/
    (public)/
      page.tsx
      login/page.tsx
      registro/page.tsx
    (client)/
      dashboard/page.tsx
      rastrear/page.tsx
      mis-paquetes/page.tsx
      notificaciones/page.tsx
      perfil/page.tsx
      cambiar-password/page.tsx
    (admin)/
      admin/page.tsx
      admin/clientes/page.tsx
      admin/clientes/[id]/page.tsx
      admin/paquetes/page.tsx
      admin/configuracion/page.tsx
    (super-admin)/
      super-admin/page.tsx
      super-admin/tenants/page.tsx
      super-admin/tenants/[id]/page.tsx
    api/
      auth/
      clients/
      packages/
      notifications/
      tracking/
      google-sheets/
      webhooks/
  components/
  lib/
    supabase/
    tenant/
    auth/
    tracking/
    mail/
    sheets/
  hooks/
  types/
  styles/
  middleware.ts
```

---

## 24. Orden de desarrollo

A continuación se define una orden clara para iniciar el proyecto.

### Orden general

Desarrollar una plataforma web multiempresa para negocios de casillero y compras por internet, compatible con Vercel y Supabase, con acceso por subdominio para cada empresa, branding personalizado por tenant, panel de super admin, panel de admin de empresa y panel de cliente final.

La plataforma debe permitir el registro de clientes finales desde formulario público, generación automática de código de cliente incremental por empresa, login de clientes y admins, gestión de clientes, gestión de paquetes, tracking de paquetes, notificaciones internas, correos automáticos y sincronización de registros con Google Sheets.

Cada tenant debe tener configuración propia de:

* logo
* colores
* datos de casillero
* secuencia de numeración de clientes
* plantilla de correo de bienvenida
* admins propios
* Google Sheet propia

### Stack base obligatorio

* Next.js
* Supabase
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Sonner
* React Hook Form
* Zod
* despliegue en Vercel

### Requerimientos funcionales obligatorios

1. Multi-tenant por subdominio.
2. Panel de super admin para crear y configurar empresas.
3. Panel admin por empresa para clientes, paquetes, branding, casillero, correo y Google Sheets.
4. Panel cliente con datos de casillero, rastreo, paquetes y notificaciones.
5. Registro público por tenant.
6. Login por tenant.
7. Código de cliente incremental por tenant.
8. Paginación de clientes: 15 por página.
9. Cliente final solo puede editar su nombre y cambiar contraseña.
10. Admin puede editar datos completos del cliente.
11. Sincronización automática a Google Sheets al registrar cliente.
12. Envío de email al cliente y al admin cuando se registra un cliente.
13. Envío de email al cliente cuando el paquete llega a sucursal.
14. Sistema de notificaciones visibles en dashboard.
15. UI moderna con Tailwind, animaciones y toast notifications.
16. Preparar integración con 17TRACK mediante widget y luego API.

### Prioridad de implementación

#### Prioridad 1

* multitenancy
* auth
* branding por subdominio
* registro de cliente
* código incremental
* dashboards base

#### Prioridad 2

* Google Sheets
* correos
* notificaciones
* gestión de paquetes

#### Prioridad 3

* tracking avanzado
* auditoría
* importaciones
* mejoras visuales avanzadas

---

## 25. Conclusión

El sistema propuesto no es solo un formulario con login, sino una **plataforma operativa multiempresa** reutilizable, con enfoque white-label básico, preparada para venderse o usarse con múltiples clientes negocio desde una sola base tecnológica.

La combinación **Next.js + Supabase + Vercel** es la más coherente con los requisitos planteados, especialmente por la necesidad de:

* planes gratis razonables para MVP
* frontend moderno
* subdominios por tenant
* branding dinámico
* panel admin/cliente
* rapidez de despliegue y mantenimiento

Este documento sirve como base para:

* desarrollo
* cotización
* estimación
* división por fases
* definición técnica del MVP
