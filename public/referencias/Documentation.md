# Sistema de Gestión de Eventos con QR

## Resumen del Sistema
Sistema integral para gestión de eventos que incluye registro de participantes, procesamiento de pagos, generación de códigos QR y validación en tiempo real.

---

## 1. Landing Page (Astro)

### Propósito
Página de registro y pago para participantes del evento.

### Tecnología
- **Framework**: Astro (Static Site Generator)
- **Ventajas**: SEO optimizado, carga rápida, componentes modulares

### Funcionalidades Principales
- **Información del Evento**
  - Descripción, fecha, ubicación, agenda
  - Galería de imágenes/videos
  - Testimonios o speakers destacados
  
- **Formulario de Registro**
  - Datos personales: nombre, email, teléfono, documento de identidad
  - Tipo de entrada (si hay múltiples categorías)
  - Campos personalizados según el evento
  - Validación en tiempo real de campos
  
- **Integración de Pago PayPal**
  - **Iframe de PayPal** para procesamiento seguro
  - Mostrar resumen del pedido antes del pago
  - Manejo de estados: pendiente, procesando, exitoso, fallido
  - Página de confirmación post-pago
  - Callback desde iframe a página principal

- **Integración de Pago IPPAY**
  - Formulario de tarjeta de crédito
  - Validación de campos en cliente
  - Envío seguro a API IPPAY

- **Opción de Comprobante de Pago**
  - Formulario para subir archivo (PDF/JPG/PNG)
  - Validación de tamaño (max 5MB)
  - Campo para número de referencia bancaria
  - Preview del archivo antes de enviar

### Consideraciones Técnicas
- **Framework**: Astro + JavaScript/TypeScript
- **Componentes**: React/Vue/Svelte islands para interactividad
- **Estado**: Vanilla JS o Alpine.js para gestión de estado ligera
- **Validación**: Validación de formularios en cliente y servidor
- **API**: 
  - Supabase REST API para crear leads
  - n8n webhooks para procesar pagos
- **Seguridad**: 
  - HTTPS obligatorio
  - Sanitización de inputs
  - CORS configurado correctamente
  - No exponer API keys en cliente
- **Responsive**: Diseño adaptable a móvil, tablet y desktop
- **SEO**: Meta tags, Open Graph, sitemap.xml
- **Performance**: 
  - Lazy loading de imágenes
  - Minificación de assets
  - CDN para archivos estáticos

### Flujo de Usuario

#### Opción A: Pago con PayPal (Iframe)
1. Usuario visita landing page
2. Completa formulario de registro (se guarda como Lead en Supabase)
3. Selecciona "Pagar con PayPal"
4. Se muestra iframe de PayPal con el monto
5. Usuario completa pago dentro del iframe
6. PayPal procesa el pago
7. Callback desde iframe notifica éxito/fallo
8. JavaScript captura evento y llama webhook n8n con `lead_id` y `paypal_transaction_id`
9. Redirección a página de confirmación

#### Opción B: Pago con IPPAY (Tarjeta)
1. Usuario visita landing page
2. Completa formulario de registro (se guarda como Lead)
3. Selecciona "Pagar con Tarjeta"
4. Ingresa datos de tarjeta en formulario
5. JavaScript envía datos a API IPPAY
6. IPPAY procesa y retorna respuesta
7. Si exitoso, JavaScript llama webhook n8n con `lead_id` y `ippay_transaction_id`
8. Redirección a página de confirmación

#### Opción C: Comprobante de Pago
1. Usuario visita landing page
2. Completa formulario de registro (se guarda como Lead)
3. Selecciona "Subir Comprobante"
4. Sube archivo PDF/JPG/PNG
5. Ingresa número de referencia y monto
6. JavaScript convierte archivo a base64
7. Llama webhook n8n `/upload_receipt` con archivo y datos
8. Redirección a página de "En Validación"

### Estructura de Archivos Astro Sugerida
```
src/
├── pages/
│   ├── index.astro           # Landing page principal
│   ├── confirmacion.astro    # Página de confirmación post-pago
│   └── validacion.astro      # Página para comprobantes en validación
├── components/
│   ├── EventInfo.astro       # Información del evento
│   ├── RegistrationForm.astro # Formulario de registro
│   ├── PayPalIframe.astro    # Componente iframe PayPal
│   ├── IPPayForm.astro       # Formulario IPPAY
│   └── ReceiptUpload.astro   # Subida de comprobante
├── layouts/
│   └── Layout.astro          # Layout base
└── scripts/
    ├── supabase.js           # Cliente Supabase
    ├── payment.js            # Lógica de pagos
    └── validation.js         # Validaciones
```

### Preguntas a Resolver
- ¿Se permite registro sin pago inmediato? Negativo
- ¿Hay límite de entradas disponibles? Solo 1
- ¿Se requiere verificación de email antes del pago? No
- ¿Qué información se muestra en el QR generado? Información del Cliente, ID del Evento, ID de la entrada, ID del QR, fecha de generación, hash de seguridad
- ¿Cómo se maneja el callback del iframe de PayPal? Via postMessage o redirect URL

---

## 2. Procesos de Automatización (n8n)

### Propósito
Orquestar la activación de clientes y generación de QR según el método de pago utilizado.

### Métodos de Pago Soportados

El sistema soporta **3 métodos de pago** diferentes, cada uno con su propio flujo:

1. **PayPal** - Pago en línea automático
2. **IPPAY** - Pago con tarjeta de crédito
3. **Comprobante de Pago** - Transferencia bancaria con validación manual

---

## 2.1. Flujo PayPal (Automático)

### Trigger: Webhook de PayPal o n8n

#### Opción A: Webhook de PayPal
- **Evento**: `PAYMENT.SALE.COMPLETED`
- **Datos recibidos**: 
  - ID de transacción
  - Monto pagado
  - Email del pagador
  - Estado del pago
  - Custom fields (ID del lead)

#### Opción B: Webhook de n8n (desde Astro/JavaScript)
- **Tipo**: `POST`
- **URL**: `https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_paypal_payment`
- **Datos recibidos**: 
  ```json
  {
    "lead_id": 123,
    "event_id": 1,
    "paypal_transaction_id": "PAYID-XXXXXX",
    "amount": 150.00,
    "currency": "USD",
    "payer_email": "cliente@example.com"
  }
  ```
- **Llamado desde**: JavaScript en la landing page tras callback del iframe

### Pasos del Proceso PayPal

1. **Validar Webhook**
   - Verificar firma de PayPal (si viene de PayPal)
   - Validar que el pago sea exitoso
   - Extraer datos relevantes

2. **Registrar Pago en Base de Datos**
   - Insertar en tabla `event.event_payment`
   - Campos: `customer_fk`, `event_fk`, `amount`, `currency`, `payment_method='PayPal'`, `paypal_transaction_id`, `paypal_payer_email`, `status='Completed'`, `response`

3. **Actualizar Lead → Cliente**
   - Buscar lead por `lead_id`
   - Actualizar `status` de 'Lead' a 'Cliente'
   - Timestamp de conversión

4. **Generar Código QR**
   - Llamar función `event.generate_qr_code()`
   - Generar hash con `event.generate_security_hash(customer_id, event_id, qr_code)`
   - Crear imagen QR con librería (qr-image, node-qrcode)
   - Subir imagen a Supabase Storage

5. **Registrar Ticket en Base de Datos**
   - Insertar en tabla `event.ticket`
   - Campos: `qr_code`, `qr_image_url`, `customer_fk`, `event_fk`, `payment_fk`, `security_hash`, `expires_at`
   - Estado inicial: 'Active'

6. **Enviar Email de Confirmación**
   - Plantilla con detalles del evento
   - Adjuntar imagen del QR
   - Instrucciones para el día del evento
   - Datos de contacto de soporte

7. **Actualizar Dashboard en Tiempo Real**
   - Supabase Realtime notifica automáticamente al CRM

---

## 2.2. Flujo IPPAY (Automático)

### Trigger: Webhook de n8n
- **Tipo**: `POST`
- **URL**: `https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_ippay_payment`
- **Datos recibidos**:
  ```json
  {
    "lead_id": 123,
    "event_id": 1,
    "credit_card_info": {
      "last_four": "4242",
      "card_type": "Visa",
      "cardholder_name": "Juan Pérez"
    },
    "ippay_transaction_id": "IPP-XXXXXX",
    "amount": 150.00,
    "currency": "USD",
    "approval_code": "123456"
  }
  ```

### Pasos del Proceso IPPAY

1. **Validar Datos**
   - Verificar que `lead_id` y `event_id` existan
   - Validar que el pago fue aprobado

2. **Registrar/Obtener Tarjeta en `public.credit_card`**
   - Verificar si ya existe tarjeta del cliente con mismo `last_four` y `brand`
   - Si no existe, insertar nueva tarjeta: `customer_fk`, `last_four`, `brand`, `type`, `exp_month`, `exp_year`, `token`
   - Obtener `credit_card_id`

3. **Registrar Pago en Base de Datos**
   - Insertar en tabla `event.event_payment`
   - Campos: `customer_fk`, `event_fk`, `amount`, `currency`, `payment_method='IPPAY'`, `ippay_transaction_id`, `ippay_approval_code`, `credit_card_fk`, `status='Completed'`, `response`

4. **Actualizar Lead → Cliente**
   - Actualizar `status` de 'Lead' a 'Cliente'

5. **Generar y Registrar QR usando Subproceso `upload_files`**
   - Generar código QR único (UUID)
   - Crear imagen QR (PNG/SVG en base64)
   - Llamar al workflow `upload_files` con:
     - `file_name`: `qr_{ticket_id}_{timestamp}`
     - `file_bucket`: `event`
     - `file_route`: `{event_id}/qr/{customer_id}/qr_{timestamp}.png`
     - `media_category_id`: `3` (QR codes)
     - `file`: base64 de la imagen QR
   - Obtener `media_file_id` del subproceso
   - Insertar en `event.ticket` con `qr_image_fk`

6. **Enviar Email de Confirmación** (igual que PayPal)

---

## 2.3. Flujo Comprobante de Pago (Manual con Validación)

### Trigger: Webhook de n8n (Subida de Comprobante)
- **Tipo**: `POST`
- **URL**: `https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_receipt`
- **Datos recibidos**:
  ```json
  {
    "lead_id": 123,
    "event_id": 1,
    "receipt_file": "base64_encoded_file_content",
    "file_name": "comprobante_pago.pdf",
    "file_type": "application/pdf",
    "amount": 150.00,
    "reference_number": "REF-123456",
    "payment_date": "2025-10-15T14:30:00Z"
  }
  ```

### Pasos del Proceso Comprobante

1. **Validar Datos**
   - Verificar que `customer_id` y `event_id` existan
   - Validar formato de archivo (PDF, JPG, PNG)
   - Validar tamaño máximo (5MB)

2. **Registrar Archivo usando Subproceso `upload_files`** ⭐
   - Llamar al workflow existente `upload_files` con:
     - `file_name`: `receipt_{event_id}_{customer_id}_{timestamp}`
     - `file_bucket`: `event`
     - `file_route`: `{event_id}/receipts/{customer_id}/receipt_{timestamp}.pdf`
     - `media_category_id`: `2` (comprobantes)
     - `file`: base64
   - El subproceso se encarga de:
     - Decodificar base64
     - Subir a Supabase Storage
     - Insertar en `media_library.media_files`
   - Retorna: `media_file_id`, `file_url`

3. **Registrar Comprobante en Base de Datos**
   - Insertar en tabla `public.payment_receipt` (tabla genérica)
   - Campos: `customer_fk`, `media_file_fk`, `reference_number`, `amount`, `status='Pending'`, `context={'event_id': X, 'event_name': Y}`

4. **Actualizar Cliente → Estado "En Validación"**
   - Actualizar `status` de 'Lead' a 'En Validación'
   - NO convertir a Cliente aún

5. **Notificar al CRM** (Opcional)
   - Crear notificación para administradores
   - Email a equipo de validación (opcional)

6. **Esperar Validación Manual**
   - Admin revisa comprobante en CRM
   - Admin aprueba o rechaza

### Trigger: Webhook de Validación (Desde CRM)
- **Tipo**: `POST`
- **URL**: `https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_validate_receipt`
- **Datos recibidos**:
  ```json
  {
    "receipt_id": 456,
    "lead_id": 123,
    "event_id": 1,
    "validation_status": "approved", // o "rejected"
    "validated_by": "uuid-del-admin",
    "validation_notes": "Comprobante válido, pago verificado"
  }
  ```

### Pasos del Proceso de Validación

#### Si APROBADO:

1. **Actualizar Estado del Comprobante**
   - Actualizar `event.payment_receipt.status` a 'Approved'
   - Registrar `validated_by` y `validated_at`

2. **Registrar Pago en Base de Datos**
   - Insertar en tabla `event.event_payment`
   - Campos: `customer_fk`, `event_fk`, `amount`, `currency`, `payment_method='Bank Transfer'`, `payment_receipt_fk`, `status='Completed'`

3. **Actualizar Lead → Cliente**
   - Actualizar `status` de 'En Validación' a 'Cliente'

4. **Generar y Registrar QR** (usando subproceso `upload_files`)
   - Generar código QR único
   - Crear imagen QR en base64
   - Llamar workflow `upload_files` para subir y registrar
   - Insertar en `event.ticket` con `qr_image_fk`

5. **Enviar Email de Confirmación**
   - Notificar que el pago fue validado
   - Adjuntar QR
   - Instrucciones del evento

#### Si RECHAZADO:

1. **Actualizar Estado del Comprobante**
   - Actualizar `event.payment_receipt.status` a 'Rejected'
   - Registrar motivo de rechazo

2. **Actualizar Lead → "Rechazado"**
   - Actualizar `status` de 'En Validación' a 'Lead' (volver a estado inicial)
   - O crear estado 'Rechazado'

3. **Enviar Email de Notificación**
   - Informar que el comprobante fue rechazado
   - Indicar motivo
   - Instrucciones para reintentar

---

## 2.4. Resumen de Workflows n8n

### Endpoints Requeridos

| Endpoint | Método | Propósito | Automático |
|----------|--------|-----------|------------|
| `/webhook/congreso_nacional_paypal_payment` | POST | Procesar pago PayPal | ✅ Sí |
| `/webhook/congreso_nacional_ippay_payment` | POST | Procesar pago IPPAY | ✅ Sí |
| `/webhook/congreso_nacional_upload_receipt` | POST | Subir comprobante | ⏸️ Requiere validación |
| `/webhook/congreso_nacional_validate_receipt` | POST | Validar/Rechazar comprobante | ✅ Sí (post-validación) |

### Flujo Comparativo

```
PayPal/IPPAY (Automático):
Pago → Registrar → Lead→Cliente → Generar QR → Email ✅

Comprobante (Manual):
Subir → Registrar → Lead→Validación → [Espera Admin]
  ↓ Aprobado                    ↓ Rechazado
  Registrar Pago                Notificar
  Lead→Cliente                  Lead (volver)
  Generar QR                    Email rechazo
  Email ✅
```

### Consideraciones Técnicas
- **Idempotencia**: Manejar webhooks duplicados
- **Reintentos**: Lógica de retry en caso de fallos
- **Logging**: Registrar cada paso para debugging
- **Alertas**: Notificar errores críticos (Slack, email, etc.)
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: 
  - Supabase Storage gestionado por `media_library.media_files` vía workflow `upload_files`
  - Bucket: `event` (contiene QRs y comprobantes organizados por carpetas)
- **APIs**: n8n para workflows y endpoints alternos
- **Seguridad**: 
  - Validar tamaño de archivos (max 5MB)
  - Validar tipos MIME permitidos
  - Sanitizar nombres de archivos
  - Generar nombres únicos para evitar colisiones

### Preguntas a Resolver
- ¿Qué pasa si el webhook falla? ¿Hay un proceso manual de recuperación?
- ¿Se genera un QR por pago o por persona (en caso de compras múltiples)? Al solo permitir pagar una entrada(a una persona osea al cliente) solo se generará 1 qr
- ¿El QR tiene fecha de expiración? Por el tiempo que dure el evento
- ¿Qué nivel de seguridad requiere el QR (encriptación, firma digital)? Por definir 

---

## 3. CRM (Flutter Web)

### Propósito
Panel administrativo para gestionar leads, clientes, pagos y QRs.

### Módulos Principales

#### Dashboard Principal
- **Métricas en Tiempo Real**
  - Total de leads
  - Tasa de conversión (leads → clientes)
  - Ingresos totales
  - QRs generados vs escaneados
  - Gráficos de tendencias

#### Gestión de Leads
- **Lista de Leads**
  - Tabla con filtros y búsqueda
  - Estados: Lead, En Validación, Cliente, Rechazado
  - Acciones: editar, eliminar, convertir manualmente
  - **Estado "En Validación"**: Leads que subieron comprobante pendiente
  
- **Detalle de Lead**
  - Información completa del formulario
  - Historial de interacciones
  - Notas del equipo de ventas

#### Gestión de Clientes
- **Lista de Clientes**
  - Filtros: por fecha, tipo de entrada, estado de QR
  - Búsqueda por nombre, email, ID
  
- **Detalle de Cliente**
  - Datos personales
  - Información de pago
  - QR asociado (visualización)
  - Estado de escaneo
  - Historial de actividad

#### Gestión de Pagos
- **Lista de Transacciones**
  - Método de pago: PayPal, IPPAY, Transferencia
  - ID de transacción (PayPal/IPPAY)
  - Monto, fecha, estado
  - Cliente asociado
  - Filtros por método de pago y exportación a CSV/Excel
  
- **Reconciliación**
  - Comparar con reportes de PayPal/IPPAY
  - Identificar pagos sin QR generado
  - Reenviar emails de confirmación

#### Validación de Comprobantes 🆕
- **Lista de Comprobantes Pendientes**
  - Notificación en tiempo real de nuevos comprobantes
  - Badge con contador de pendientes
  - Filtros: Pendiente, Aprobado, Rechazado
  - Ordenar por fecha de subida
  
- **Detalle de Comprobante**
  - Visualizador de archivo (PDF/Imagen) desde `media_library.media_files`
  - Datos del cliente y evento
  - Monto declarado y número de referencia
  - Fecha de pago declarada
  - Metadata del archivo (tamaño, tipo MIME, fecha de subida)
  - Historial de acciones
  
- **Acciones de Validación**
  - **Aprobar**: 
    - Botón verde "Aprobar Comprobante"
    - Campo opcional para notas
    - Confirma y ejecuta workflow n8n
    - Genera QR automáticamente
    - Envía email al cliente
  - **Rechazar**:
    - Botón rojo "Rechazar Comprobante"
    - Campo obligatorio para motivo de rechazo
    - Confirma y ejecuta workflow n8n
    - Envía email al cliente con motivo
  - **Ver Historial**: Quién validó/rechazó y cuándo

#### Gestión de QRs
- **Lista de QRs**
  - Estado: generado, escaneado, expirado
  - Fecha de generación y escaneo
  - Cliente asociado
  
- **Acciones**
  - Regenerar QR (en caso de pérdida)
  - Invalidar QR (por fraude o reembolso)
  - Descargar QR individual o masivo
  - Ver historial de escaneos

#### Reportes y Exportación
- **Reportes Predefinidos**
  - Ventas por día/semana/mes
  - Asistencia esperada vs real
  - Análisis de conversión
  
- **Exportación**
  - CSV, Excel, PDF
  - Filtros personalizados

### Consideraciones Técnicas
- **Framework**: Flutter Web
- **Autenticación**: Sistema de login seguro (Supabase Auth con JWT)
- **Roles**: Sistema de permisos basado en tabla `user_profile` y `role`
- **API**: Supabase REST API + n8n para lógica compleja
- **Tiempo Real**: Supabase Realtime para actualizaciones en vivo
- **Responsive**: Adaptable a diferentes resoluciones

### Preguntas a Resolver
- ¿Cuántos usuarios administradores habrá? Ilimitados por el momento
- ¿Se requiere sistema de permisos granular? **Aclaración**: Permisos granulares = control detallado de qué puede hacer cada rol (ej: Admin puede todo, Operador solo ver/escanear, Vendedor solo crear leads). **Respuesta**: Por definir según roles necesarios
- ¿El CRM debe permitir editar datos de clientes post-pago? No
- ¿Se necesita integración con otras herramientas (email marketing, etc.)? Por definir

---

## 4. Aplicación Móvil de Escaneo (Flutter)

### Propósito
Validar QRs en el punto de entrada del evento.

### Funcionalidades Principales

#### Escaneo de QR
- **Cámara en Tiempo Real**
  - Detección automática de QR
  - Feedback visual (marco, guías)
  - Soporte para códigos dañados o borrosos
  
- **Validación Instantánea**
  - Consulta a API en tiempo real
  - Verificar que el QR existe en el sistema
  - Verificar que no ha sido escaneado previamente
  - Verificar que no está expirado o invalidado

#### Respuestas Visuales
- **QR Válido (Primera vez)**
  - Pantalla verde con ✓
  - Datos del participante: nombre, tipo de entrada
  - Sonido de confirmación
  - Registrar timestamp de entrada
  
- **QR Ya Escaneado**
  - Pantalla amarilla/naranja con ⚠️
  - Mostrar cuándo fue escaneado previamente
  - Datos del participante
  - Opción de permitir reingreso (configurable)
  
- **QR Inválido**
  - Pantalla roja con ✗
  - Mensaje: "QR no registrado" o "QR invalidado"
  - Alertar al personal de seguridad
  
- **Sin Conexión**
  - Modo offline con caché local
  - Sincronización posterior
  - Indicador visual de estado de conexión

#### Funcionalidades Adicionales
- **Historial de Escaneos**
  - Lista de QRs escaneados en la sesión
  - Filtros por estado
  - Búsqueda manual por nombre o ID
  
- **Búsqueda Manual**
  - Ingresar código QR manualmente
  - Buscar por nombre o email del cliente
  - Útil si el QR no escanea correctamente
  
- **Estadísticas en Tiempo Real**
  - Total escaneados en la sesión
  - Tasa de escaneo por hora
  - Alertas de duplicados

- **Autenticación de Operador**
  - Login para personal autorizado
  - Registro de quién escaneó cada QR
  - Cierre de sesión automático

### Consideraciones Técnicas
- **Framework**: Flutter (iOS y Android)
- **Escáner QR**: mobile_scanner o qr_code_scanner
- **API**: Supabase REST API + n8n endpoints para validación
- **Offline**: No requerido - solo modo online
- **Seguridad**: Posiblemente sin autenticación (por definir), HTTPS obligatorio
- **Performance**: Escaneo rápido (<1 segundo)
- **UX**: Interfaz simple y clara para uso bajo presión

### Flujo de Escaneo
1. Operador abre app y hace login
2. Activa cámara de escaneo
3. Participante muestra QR
4. App escanea y envía código a API
5. API valida y responde con estado
6. App muestra resultado visual y sonoro
7. Si es válido, registra entrada en BD
8. Operador permite el paso

### Preguntas a Resolver
- ¿Se permite reingreso al evento? Por definir
- ¿Cuántos dispositivos de escaneo se usarán simultáneamente? Por definir
- ¿Qué hacer en caso de pérdida de conexión durante el evento? Restringir escaneo y mostrar mensaje de sin conexión
- ¿Se requiere modo offline completo o solo caché temporal? Solo modo online
- ¿Se necesita imprimir badges o tickets físicos tras el escaneo? Negativo

---

## 5. Arquitectura del Sistema

### Backend/API
- **Base de Datos**: Supabase (PostgreSQL)
- **Backend Logic**: n8n para workflows y endpoints personalizados
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Endpoints Principales**:
  - Supabase REST API:
    - `POST /rest/v1/customer` - Crear lead desde landing page (esquema public)
    - `GET /rest/v1/customer` - Listar clientes (CRM)
    - `GET /rest/v1/payment` - Listar pagos
    - `GET /rest/v1/event` - Listar eventos (esquema event)
    - `GET /rest/v1/ticket` - Listar tickets (esquema event)
    - `GET /rest/v1/tickets_with_details` - Vista completa de tickets (esquema event)
  - n8n Webhooks:
    - `POST /webhook/congreso_nacional_paypal_events` - Recibir notificación de pago
    - `GET /webhook/qr/validate/:code` - Validar QR (app móvil)
    - `POST /webhook/qr/scan` - Registrar escaneo

### Modelos de Datos (Basados en Supabase)

#### Customer (Lead/Cliente)
```
customer_id, created_at, first_name, last_name, status,
email, mobile_phone, auth_id, organization_fk, customer_parent_id,
customer_category_fk, document_type, document_number, company, job_title
```
**Nota**: El campo `status` puede ser:
- **'Lead'**: Registrado pero sin pago
- **'En Validación'**: Subió comprobante, esperando aprobación
- **'Cliente'**: Pago confirmado (PayPal/IPPAY automático o comprobante aprobado)
- **'Rechazado'**: Comprobante rechazado (opcional, puede volver a 'Lead')

#### Event_Payment (Pago de Eventos) 🆕
```
event_payment_id, created_at, customer_fk, event_fk, amount, currency,
payment_method, status, paypal_transaction_id, paypal_payer_email,
ippay_transaction_id, ippay_approval_code, credit_card_fk,
payment_receipt_fk, response, error_message, metadata
```
**Nota**: 
- Esta tabla reemplaza la necesidad de modificar `public.payment` para eventos
- `credit_card_fk` referencia a `public.credit_card` (reutiliza tabla existente)

#### Event (Evento)
```
event_id, created_at, name, description, start_date, end_date, timezone,
location, max_attendees, current_attendees, ticket_price, status,
organization_fk, assets, metadata
```
**Nota**: `timezone` usa formato IANA (ej: `America/Mexico_City`, `America/New_York`, `UTC`)

#### Ticket (QR)
```
ticket_id, created_at, qr_code, qr_image_fk, customer_fk, event_fk,
event_payment_fk, status, scanned_at, scanned_by, security_hash,
expires_at, metadata
```
**Nota**: 
- Referencia a `event.event_payment` (no a `public.payment`)
- `qr_image_fk` referencia a `media_library.media_files` (imagen del QR)

#### Scan_Log (Historial de escaneos)
```
scan_log_id, created_at, ticket_fk, scanned_by, scan_result,
device_info, location_info, notes
```

#### Payment_Receipt (Comprobantes de pago) - Tabla Genérica en `public`
```
receipt_id, created_at, customer_fk, media_file_fk,
reference_number, amount, payment_date, status, validated_by,
validated_at, validation_notes, rejection_reason, context
```
**Nota**: 
- Estados: 'Pending', 'Approved', 'Rejected'
- El archivo se guarda en `media_library.media_files` con `media_category_fk=2`
- `context` (JSONB): Flexible para eventos, servicios, facturas, etc.
  - Para eventos: `{"event_id": 1, "event_name": "Congreso 2024"}`
  - Para servicios: `{"service_id": 5, "service_name": "Consultoría"}`

### Infraestructura
- **Hosting**: 
  - Landing page: Vercel, Netlify, Cloudflare Pages (ideal para Astro)
  - Base de Datos: Supabase Cloud
  - n8n: https://u-n8n.virtalus.cbluna-dev.com (ya configurado)
  - CRM: Web hosting (Vercel/Netlify)
  
- **Storage**: 
  - Supabase Storage (gestionado por `media_library.media_files` vía workflow `upload_files`)
    - Bucket: `event`
    - Estructura de carpetas:
      - `{event_id}/qr/{customer_id}/` - Imágenes QR (`media_category_fk=3`)
      - `{event_id}/receipts/{customer_id}/` - Comprobantes (`media_category_fk=2`)
- **Email**: SendGrid, Mailgun, AWS SES (integrado desde n8n)
- **Monitoring**: Sentry, LogRocket, Supabase Dashboard

### Seguridad
- HTTPS en todas las comunicaciones
- Validación de webhooks de PayPal (firma digital)
- Autenticación JWT para CRM (Supabase Auth)
- App móvil: posiblemente sin autenticación (por definir)
- Rate limiting en Supabase y n8n
- Row Level Security (RLS) en Supabase
- Sanitización de inputs
- Encriptación de datos sensibles
- Backups automáticos de Supabase

---

## 6. Flujos Completos del Sistema

### 6.1. Flujo PayPal/IPPAY (Automático)

1. **Usuario visita landing page** → Se registra como Lead
2. **Usuario selecciona método de pago** → PayPal o Tarjeta (IPPAY)
3. **Pago procesado** → Envía datos a webhook n8n
4. **n8n recibe webhook** → Valida y extrae datos
5. **n8n registra pago** → Inserta en tabla `event.event_payment`
6. **n8n actualiza BD** → Lead → Cliente
7. **n8n genera QR** → Crea código único e imagen en base64
8. **n8n llama `upload_files`** → Sube imagen y registra en `media_library.media_files`
9. **n8n registra ticket** → Guarda en `event.ticket` con `qr_image_fk`
10. **n8n envía email** → Cliente recibe QR
10. **CRM se actualiza** → Admin ve nuevo cliente (Realtime)
11. **Día del evento** → Operador escanea QR
12. **App valida QR** → Consulta API n8n
13. **API verifica** → QR válido y no escaneado
14. **API registra entrada** → Marca como escaneado + log en `scan_log`
15. **App muestra confirmación** → Participante ingresa
16. **CRM actualiza stats** → Dashboard en tiempo real

### 6.2. Flujo Comprobante de Pago (Manual)

1. **Usuario visita landing page** → Se registra como Lead
2. **Usuario selecciona "Comprobante de Pago"** → Sube archivo
3. **Flutter envía comprobante** → Webhook n8n `/upload_receipt`
4. **n8n valida archivo** → Tamaño, tipo, formato
5. **n8n sube a Storage** → Bucket `payment-receipts`
6. **n8n registra comprobante** → Inserta en `event.payment_receipt` (status='Pending')
7. **n8n actualiza Lead** → Status 'Lead' → 'En Validación'
8. **CRM notifica admin** → Nueva validación pendiente
9. **Admin revisa en CRM** → Ve comprobante y datos
10. **Admin aprueba/rechaza** → CRM llama webhook `/validate_receipt`

#### Si APROBADO:
11. **n8n actualiza comprobante** → Status 'Pending' → 'Approved'
12. **n8n registra pago** → Inserta en tabla `event.event_payment`
13. **n8n actualiza Lead** → 'En Validación' → 'Cliente'
14. **n8n genera QR** → Igual que flujo automático
15. **n8n envía email** → Cliente recibe QR + confirmación
16. **Continuar con flujo normal** → Escaneo en evento

#### Si RECHAZADO:
11. **n8n actualiza comprobante** → Status 'Pending' → 'Rejected'
12. **n8n actualiza Lead** → 'En Validación' → 'Lead' (volver)
13. **n8n envía email** → Notifica rechazo + motivo
14. **Usuario puede reintentar** → Subir nuevo comprobante

---

## 7. Próximos Pasos

### Fase 1: Planificación y Diseño
- [ ] Definir esquema completo de base de datos
- [ ] Diseñar mockups de landing page
- [ ] Diseñar mockups de CRM
- [ ] Diseñar mockups de app móvil
- [ ] Definir estructura de API (endpoints y contratos)

### Fase 2: Desarrollo Backend
- [ ] Configurar base de datos
- [ ] Desarrollar API REST
- [ ] Implementar autenticación
- [ ] Crear workflow de n8n
- [ ] Integrar PayPal webhook

### Fase 3: Desarrollo Frontend
- [ ] Landing page en Flutter Web
- [ ] Integración de PayPal en landing
- [ ] CRM en Flutter
- [ ] App móvil de escaneo

### Fase 4: Testing
- [ ] Pruebas unitarias de API
- [ ] Pruebas de integración con PayPal
- [ ] Pruebas de flujo completo
- [ ] Pruebas de carga y performance
- [ ] Pruebas de seguridad

### Fase 5: Despliegue
- [ ] Deploy de backend
- [ ] Deploy de landing page
- [ ] Deploy de CRM
- [ ] Publicar app móvil (TestFlight/Play Store)
- [ ] Configurar monitoreo y alertas

---

## 8. Preguntas Críticas Pendientes

1. **Modelo de Negocio**
   - ¿Cuántos eventos se gestionarán? ¿Uno o múltiples?
   - ¿Hay diferentes tipos de entradas con precios distintos?
   - ¿Se permiten descuentos o códigos promocionales?

2. **Escalabilidad**
   - ¿Cuántos participantes se esperan por evento?
   - ¿Cuántos escaneos simultáneos en el pico del evento?

3. **Funcionalidades Avanzadas**
   - ¿Se requiere check-in/check-out?
   - ¿Se necesita integración con sistemas de badges?
   - ¿Se envían recordatorios por email/SMS?

4. **Soporte y Mantenimiento**
   - ¿Quién dará soporte técnico durante el evento?
   - ¿Hay plan de contingencia si falla el sistema?

5. **Datos y Privacidad**
   - ¿Cumplimiento con GDPR u otras regulaciones?
   - ¿Política de retención de datos?
   - ¿Consentimiento para uso de datos?



---

## 9. Esquema de Base de Datos Propuesto

### Esquema Nuevo: `event`

**Se creó un esquema separado llamado `event` para todas las tablas relacionadas con eventos.**

### Tablas Nuevas Requeridas

Basándome en las tablas existentes de Supabase, necesitamos agregar las siguientes tablas en el esquema `event`:

#### Tabla: `event.event`
```sql
create table event.event (
  event_id bigint generated by default as identity,
  created_at timestamp with time zone not null default now(),
  name text not null,
  description text null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  timezone text not null default 'America/Mexico_City', -- Zona horaria IANA
  location text null,
  max_attendees integer null,
  current_attendees integer default 0,
  ticket_price numeric(10,2) not null,
  status text not null default 'Active'::text, -- Active, Completed, Cancelled
  organization_fk bigint not null,
  assets jsonb null, -- imágenes, videos del evento
  metadata jsonb null, -- agenda, speakers, etc.
  constraint event_pkey primary key (event_id),
  constraint event_organization_fk_fkey foreign key (organization_fk) 
    references public.organization (organization_id) on delete cascade
) tablespace pg_default;
```

**Nota**: El campo `timezone` permite manejar eventos en diferentes zonas horarias usando el formato IANA (ej: `America/Mexico_City`, `America/New_York`, `Europe/Madrid`, `UTC`)

#### Tabla: `event.ticket` (QR)
```sql
create table event.ticket (
  ticket_id bigint generated by default as identity,
  created_at timestamp with time zone not null default now(),
  qr_code text not null unique,
  qr_image_fk bigint null, -- referencia a media_library.media_files
  customer_fk bigint not null,
  event_fk bigint not null,
  event_payment_fk bigint not null,
  status text not null default 'Active',
  scanned_at timestamp with time zone null,
  scanned_by uuid null,
  security_hash text not null,
  expires_at timestamp with time zone null,
  metadata jsonb null,
  constraint ticket_pkey primary key (ticket_id),
  constraint ticket_qr_code_key unique (qr_code),
  constraint ticket_customer_fk_fkey foreign key (customer_fk) 
    references public.customer (customer_id) on delete cascade,
  constraint ticket_event_fk_fkey foreign key (event_fk) 
    references event.event (event_id) on delete cascade,
  constraint ticket_event_payment_fk_fkey foreign key (event_payment_fk) 
    references event.event_payment (event_payment_id) on delete cascade,
  constraint ticket_qr_image_fk_fkey foreign key (qr_image_fk) 
    references media_library.media_files (media_file_id) on delete set null,
  constraint ticket_scanned_by_fkey foreign key (scanned_by) 
    references public.user_profile (user_profile_id)
) tablespace pg_default;

create index idx_ticket_qr_code on event.ticket using btree (qr_code);
create index idx_ticket_customer on event.ticket using btree (customer_fk);
create index idx_ticket_event on event.ticket using btree (event_fk);
create index idx_ticket_status on event.ticket using btree (status);
create index idx_ticket_event_payment on event.ticket using btree (event_payment_fk);
create index idx_ticket_qr_image on event.ticket using btree (qr_image_fk);
```

**Nota**: La imagen QR se gestiona en `media_library.media_files`

#### Tabla: `event.scan_log` (Historial de escaneos)
```sql
create table event.scan_log (
  scan_log_id bigint generated by default as identity,
  created_at timestamp with time zone not null default now(),
  ticket_fk bigint not null,
  scanned_by uuid not null, -- user_profile_id del operador
  scan_result text not null, -- Success, AlreadyScanned, Invalid, Expired
  device_info jsonb null, -- información del dispositivo que escaneó
  location_info jsonb null, -- GPS si está disponible
  notes text null,
  constraint scan_log_pkey primary key (scan_log_id),
  constraint scan_log_ticket_fk_fkey foreign key (ticket_fk) 
    references event.ticket (ticket_id) on delete cascade,
  constraint scan_log_scanned_by_fkey foreign key (scanned_by) 
    references public.user_profile (user_profile_id)
) tablespace pg_default;

create index idx_scan_log_ticket on event.scan_log using btree (ticket_fk);
create index idx_scan_log_created_at on event.scan_log using btree (created_at);
```

#### Tabla: `public.payment_receipt` (Comprobantes de pago - GENÉRICA)
```sql
-- NOTA: Tabla genérica en public, reutilizable para eventos, servicios, facturas, etc.
-- Los archivos se guardan en media_library.media_files
-- Esta tabla solo guarda la metadata de validación
create table public.payment_receipt (
  receipt_id bigint generated by default as identity,
  created_at timestamp with time zone not null default now(),
  customer_fk bigint not null,
  media_file_fk bigint not null, -- referencia a media_library.media_files
  reference_number text null, -- número de referencia del banco
  amount numeric(10,2) not null,
  payment_date timestamp with time zone null,
  status text not null default 'Pending', -- Pending, Approved, Rejected
  validated_by uuid null, -- user_profile_id del admin que validó
  validated_at timestamp with time zone null,
  validation_notes text null,
  rejection_reason text null,
  context jsonb null, -- Contexto flexible: {event_id, service_id, invoice_number, etc.}
  constraint payment_receipt_pkey primary key (receipt_id),
  constraint payment_receipt_customer_fk_fkey foreign key (customer_fk) 
    references public.customer (customer_id) on delete cascade,
  constraint payment_receipt_media_file_fk_fkey foreign key (media_file_fk) 
    references media_library.media_files (media_file_id) on delete cascade,
  constraint payment_receipt_validated_by_fkey foreign key (validated_by) 
    references public.user_profile (user_profile_id)
) tablespace pg_default;

create index idx_payment_receipt_customer on public.payment_receipt using btree (customer_fk);
create index idx_payment_receipt_status on public.payment_receipt using btree (status);
create index idx_payment_receipt_created_at on public.payment_receipt using btree (created_at);
create index idx_payment_receipt_media_file on public.payment_receipt using btree (media_file_fk);
create index idx_payment_receipt_context on public.payment_receipt using gin (context); -- GIN para JSONB
```

**Ventajas de esta tabla genérica**:
- ✅ Reutilizable para eventos, servicios, facturas, etc.
- ✅ Campo `context` (JSONB) flexible para cualquier contexto
- ✅ No requiere crear tablas separadas por tipo de comprobante
- ✅ Índice GIN en `context` para queries eficientes

**Ejemplos de uso del campo `context`**:
```json
// Para eventos
{"event_id": 1, "event_name": "Congreso 2024"}

// Para servicios
{"service_id": 5, "service_name": "Consultoría", "invoice_number": "INV-001"}

// Para facturas
{"invoice_id": 123, "invoice_number": "INV-2024-001"}
```

### ⚠️ NO SE MODIFICAN TABLAS EXISTENTES

**IMPORTANTE**: Este diseño NO requiere modificar ninguna tabla del esquema `public`.

En lugar de modificar `public.payment`, se creó **`event.event_payment`** que es autocontenida y tiene todos los campos necesarios para los 3 métodos de pago.

#### Tabla `event.event_payment` (Nueva - Reemplaza modificaciones a public.payment)
```sql
create table event.event_payment (
  event_payment_id bigint generated by default as identity,
  created_at timestamp with time zone not null default now(),
  customer_fk bigint not null,
  event_fk bigint not null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  payment_method text not null, -- PayPal, IPPAY, Bank Transfer
  status text not null default 'Pending',
  -- PayPal fields
  paypal_transaction_id text null,
  paypal_payer_email text null,
  -- IPPAY fields
  ippay_transaction_id text null,
  ippay_approval_code text null,
  credit_card_fk bigint null, -- referencia a public.credit_card
  -- Bank Transfer fields
  payment_receipt_fk bigint null,
  -- Metadata
  response jsonb null,
  error_message text null,
  metadata jsonb null,
  constraint event_payment_pkey primary key (event_payment_id),
  constraint event_payment_customer_fk_fkey foreign key (customer_fk) 
    references public.customer (customer_id) on delete cascade,
  constraint event_payment_event_fk_fkey foreign key (event_fk) 
    references event.event (event_id) on delete cascade,
  constraint event_payment_credit_card_fk_fkey foreign key (credit_card_fk) 
    references public.credit_card (credit_card_id) on delete set null
);
```

### Relaciones del Sistema

```
public.organization (1) ----< (N) event.event
public.customer (1) ----< (N) event.event_payment
public.customer (1) ----< (N) public.payment_receipt
public.credit_card (1) ----< (N) event.event_payment
event.event (1) ----< (N) event.event_payment
event.event_payment (1) ---- (1) event.ticket
public.payment_receipt (1) ---- (0..1) event.event_payment
event.ticket (1) ----< (N) event.scan_log
public.user_profile (1) ----< (N) event.scan_log (como escaneador)
public.user_profile (1) ----< (N) public.payment_receipt (como validador)
media_library.media_files (1) ---- (1) public.payment_receipt (archivo del comprobante)
media_library.media_files (1) ----< (N) event.ticket (imagen QR)
```

**Nota**: 
- El esquema `event` es autocontenido (excepto `payment_receipt` que es genérica en `public`)
- Los archivos de comprobantes se gestionan en `media_library.media_files`
- `public.payment_receipt` es reutilizable para eventos, servicios, facturas, etc.

### Vistas Útiles

#### Vista: `event.tickets_with_details`
```sql
create or replace view event.tickets_with_details as
select
  t.ticket_id,
  t.qr_code,
  t.qr_image_url,
  t.status as ticket_status,
  t.scanned_at,
  t.created_at as ticket_created_at,
  -- Datos del cliente
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email,
  c.mobile_phone,
  c.status as customer_status,
  -- Datos del evento
  e.event_id,
  e.name as event_name,
  e.start_date as event_start,
  e.end_date as event_end,
  e.location as event_location,
  -- Datos del pago
  p.payment_id,
  p.paypal_transaction_id,
  p.created_at as payment_date,
  p.response as payment_response,
  -- Datos del operador que escaneó
  up.first_name as scanned_by_first_name,
  up.last_name as scanned_by_last_name
from
  event.ticket t
  join public.customer c on t.customer_fk = c.customer_id
  join event.event e on t.event_fk = e.event_id
  join public.payment p on t.payment_fk = p.payment_id
  left join public.user_profile up on t.scanned_by = up.user_profile_id;
```

### Row Level Security (RLS) Policies

```sql
-- Habilitar RLS en las tablas nuevas del esquema event
alter table event.event enable row level security;
alter table event.ticket enable row level security;
alter table event.scan_log enable row level security;

-- Policy: Los usuarios autenticados pueden ver eventos activos
create policy "Eventos públicos visibles para todos"
  on event.event for select
  using (status = 'Active');

-- Policy: Solo admins pueden crear/editar eventos
create policy "Solo admins pueden gestionar eventos"
  on event.event for all
  using (
    exists (
      select 1 from public.user_profile up
      join public.role r on up.role_fk = r.role_id
      where up.user_profile_id = auth.uid()
      and r.name = 'Admin'
    )
  );

-- Policy: Los usuarios pueden ver sus propios tickets
create policy "Usuarios ven sus propios tickets"
  on event.ticket for select
  using (
    customer_fk in (
      select customer_id from public.customer
      where auth_id = auth.uid()
    )
  );

-- Policy: Operadores pueden escanear tickets
create policy "Operadores pueden escanear tickets"
  on event.ticket for update
  using (
    exists (
      select 1 from public.user_profile up
      where up.user_profile_id = auth.uid()
    )
  );
```

### Resumen de Estructura de Esquemas

#### Esquema `public` (Tablas existentes - SIN MODIFICACIONES)
- ✅ `customer` - Leads y Clientes (se usa tal cual está)
- ✅ `organization` - Organizaciones
- ✅ `user_profile` - Perfiles de usuarios del sistema
- ✅ `role` - Roles y permisos
- ✅ `payment` - Pagos (NO se modifica, eventos usan event.event_payment)
- ✅ `media_library.media_files` - Archivos multimedia

#### Esquema `event` (Nuevas tablas para el sistema de eventos - AUTOCONTENIDO)
- 🆕 `event.event` - Eventos
- 🆕 `event.event_payment` - Pagos de eventos (PayPal, IPPAY, Bank Transfer)
- 🆕 `event.payment_receipt` - Comprobantes de pago para validación
- 🆕 `event.ticket` - Tickets/QRs (referencia a event.event_payment)
- 🆕 `event.scan_log` - Historial de escaneos
- 🆕 `event.tickets_with_details` - Vista con información completa

#### Ventajas de usar esquema separado `event` (autocontenido):
1. **Organización**: Separación lógica de funcionalidades
2. **Permisos**: Más fácil gestionar RLS por esquema
3. **Escalabilidad**: Facilita agregar más tablas relacionadas con eventos
4. **Mantenimiento**: Código más limpio y modular
5. **Migración**: Más fácil exportar/importar solo datos de eventos
6. **⚠️ Sin modificaciones**: NO requiere modificar tablas existentes de `public`
7. **Independencia**: Sistema de eventos funciona de forma autónoma

---

## 10. Tablas Existentes en Supabase

### Tablas actualmente creadas

```sql
create table
  public.customer (
    customer_id bigint generated by default as identity,
    created_at timestamp with time zone not null default now(),
    first_name text not null,
    last_name text not null,
    status text not null default 'Lead'::text,
    email text null,
    mobile_phone text null,
    auth_id uuid null,
    organization_fk bigint null,
    customer_parent_id bigint null,
    customer_category_fk bigint null,
    constraint customer_pkey primary key (customer_id),
    constraint customer_auth_id_key unique (auth_id),
    constraint customer_email_key unique (email),
    constraint public_customer_auth_id_fkey foreign key (auth_id) references auth.users (id) on delete cascade,
    constraint public_customer_customer_category_fk_fkey foreign key (customer_category_fk) references customer_category (customer_category_id),
    constraint public_customer_organization_fk_fkey foreign key (organization_fk) references organization (organization_id)
  ) tablespace pg_default;

create table
  public.organization (
    organization_id bigint generated by default as identity,
    name text not null,
    description text null,
    created_at timestamp without time zone null default current_timestamp,
    updated_at timestamp without time zone null default current_timestamp,
    assets jsonb null,
    organization_parent_id bigint null,
    constraint organization_pkey primary key (organization_id)
  ) tablespace pg_default;

create table
  public.user_profile (
    user_profile_id uuid not null,
    created_at timestamp with time zone not null default now(),
    first_name text not null,
    last_name text not null,
    role_fk bigint not null,
    sequential_id bigint generated by default as identity,
    image text null,
    mobile_phone text null,
    status text not null default 'Active'::text,
    organization_fk bigint null,
    theme_fk bigint null,
    theme_scheme text null,
    department_fk bigint null,
    constraint user_profile_pkey primary key (user_profile_id),
    constraint public_user_profile_department_fk_fkey foreign key (department_fk) references department (department_id),
    constraint public_user_profile_organization_fk_fkey foreign key (organization_fk) references organization (organization_id),
    constraint public_user_profile_theme_fk_fkey foreign key (theme_fk) references theme (id),
    constraint public_user_profile_user_profile_id_fkey foreign key (user_profile_id) references auth.users (id) on delete cascade,
    constraint user_profile_role_fk_fkey foreign key (role_fk) references role (role_id)
  ) tablespace pg_default;

create index if not exists idx_user_profile_department on public.user_profile using btree (department_fk) tablespace pg_default;

create view
  public.users as
select
  u.id,
  u.email,
  up.user_profile_id,
  up.created_at,
  up.first_name,
  up.last_name,
  up.role_fk,
  up.sequential_id,
  up.image,
  up.mobile_phone,
  up.status,
  json_build_object(
    'role_id',
    r.role_id,
    'name',
    r.name,
    'permissions',
    r.permissions
  ) as role,
  up.organization_fk as organization_id,
  d.department_id,
  d.name as department_name,
  d.description as department_description,
  (
    select
      json_build_object(
        'device_type',
        us.device_type,
        'device_name',
        us.device_name,
        'device_os',
        us.device_os,
        'browser',
        us.browser,
        'last_login',
        us.login_timestamp
      ) as json_build_object
    from
      user_session us
    where
      us.user_profile_id = up.user_profile_id
    order by
      us.login_timestamp desc
    limit
      1
  ) as last_device_info,
  e.employee_id
from
  auth.users u
  join user_profile up on u.id = up.user_profile_id
  join role r on up.role_fk = r.role_id
  left join department d on up.department_fk = d.department_id
  left join employee e on u.id = e.auth_id;

  create table
  media_library.media_files (
    media_file_id bigint generated by default as identity,
    file_name text not null,
    title text null,
    file_description text null,
    file_type text not null,
    mime_type text not null,
    file_extension text null,
    file_size_bytes bigint not null,
    file_url text not null,
    storage_path text not null,
    created_at_timestamp timestamp with time zone not null default now(),
    updated_at_timestamp timestamp with time zone not null default now(),
    uploaded_by_user_id uuid null,
    is_public_file boolean null default false,
    metadata_json jsonb null default '{}'::jsonb,
    seconds bigint null,
    media_category_fk bigint null,
    constraint media_files_pkey primary key (media_file_id),
    constraint media_files_file_url_key unique (file_url),
    constraint media_files_uploaded_by_user_id_fkey foreign key (uploaded_by_user_id) references auth.users (id),
    constraint media_library_media_files_media_category_fk_fkey foreign key (media_category_fk) references media_library.media_categories (media_categories_id)
  ) tablespace pg_default;

create table
  public.payment (
    payment_id bigint generated by default as identity,
    created_at timestamp with time zone not null default now(),
    action_code text null,
    approval text null,
    response text not null,
    type text not null default 'Credit Card'::text,
    error_message text null,
    ippay_transaction_id text null,
    credit_card_fk bigint null,
    customer_transaction_fk bigint null,
    customer_fk bigint not null,
    paypal_transaction_id text null,
    transaction_type text null,
    stripe_transaction_id text null,
    constraint ippay_transaction_pkey primary key (payment_id),
    constraint public_payment_credit_card_fk_fkey foreign key (credit_card_fk) references credit_card (credit_card_id),
    constraint public_payment_customer_fk_fkey foreign key (customer_fk) references customer (customer_id) on delete cascade,
    constraint public_payment_customer_transaction_fk_fkey foreign key (customer_transaction_fk) references customer_transaction (transaction_id)
  ) tablespace pg_default;

create table
  public.role (
    role_id bigint generated by default as identity,
    created_at timestamp with time zone not null default now(),
    name text not null,
    permissions jsonb null,
    organization_fk bigint not null,
    menu_package_fk bigint null,
    constraint role_pkey primary key (role_id),
    constraint public_role_menu_package_fk_fkey foreign key (menu_package_fk) references menu_package (menu_package_id),
    constraint public_role_organization_fk_fkey foreign key (organization_fk) references organization (organization_id)
  ) tablespace pg_default;
```

---

## 11. Resumen de Decisiones Técnicas

### ✅ Confirmado

1. **Base de Datos**: Supabase (PostgreSQL)
2. **Workflows/APIs**: n8n (https://u-n8n.virtalus.cbluna-dev.com)
3. **Landing Page**: Astro (Static Site Generator)
4. **CRM**: Flutter Web (no desktop)
5. **App Móvil**: Flutter (iOS/Android) - Solo modo online
6. **Límite de entradas**: 1 entrada por pago
7. **Verificación de email**: No requerida antes del pago
8. **Edición post-pago**: No permitida
9. **Modo offline**: No requerido
10. **Badges físicos**: No requeridos
11. **Reingreso**: Por definir

### 🔄 Pendiente de Confirmar

1. **Integración PayPal**: 
   - ⏳ Verificando si `flutter_paypal_payment` tiene callback `onSuccess`
   - **Opción A**: Si tiene `onSuccess` → Llamar webhook n8n directamente desde Flutter
   - **Opción B**: Si no tiene `onSuccess` → Usar webhook de PayPal y buscar lead por email

2. **Autenticación App Móvil**: Posiblemente sin autenticación (por definir)

3. **Seguridad del QR**: Nivel de encriptación/firma digital (por definir)

4. **Sistema de permisos**: Definir roles específicos necesarios

5. **Modelo de negocio**:
   - ¿Un evento o múltiples eventos?
   - ¿Tipos de entradas con precios diferentes?
   - ¿Códigos promocionales/descuentos?

6. **Escalabilidad**:
   - ¿Cuántos participantes esperados?
   - ¿Cuántos dispositivos de escaneo simultáneos?

### 📋 Contenido del QR Confirmado

El QR contendrá:
- Información del Cliente
- ID del Evento
- ID de la entrada (ticket_id)
- ID del QR (qr_code UUID)
- Fecha de generación
- Hash de seguridad

---

## 12. Plan de Acción Inmediato

### Paso 1: Verificar Integración PayPal ✅ URGENTE
```bash
# Investigar flutter_paypal_payment
# Verificar si tiene callback onSuccess con datos de transacción
# Documentar qué datos devuelve en caso exitoso
```

### Paso 2: Crear Tablas en Supabase

**📄 Archivo SQL completo disponible: `supabase_setup_event_only.sql`**

⚠️ **IMPORTANTE**: Este script **NO modifica ninguna tabla existente** de `public`

Este archivo contiene:
- ✅ Creación del esquema `event`
- ✅ 5 tablas nuevas en esquema `event` (autocontenidas)
- ✅ 1 vista con joins completos
- ✅ Políticas RLS completas (15 policies)
- ✅ Funciones auxiliares (generar QR, hash de seguridad)
- ✅ Triggers (actualizar contador de asistentes)
- ✅ Comentarios en todas las tablas y columnas
- ✅ Queries de verificación

**Instrucciones:**
1. Abrir Supabase Dashboard → SQL Editor
2. Copiar y pegar el contenido de `supabase_setup_event_only.sql`
3. Ejecutar el script completo
4. Verificar que no hay errores
5. Revisar las tablas creadas en el esquema `event`

**Resumen de lo que crea el script:**
```
Esquema event (AUTOCONTENIDO):
├── Tablas:
│   ├── event.event (Eventos)
│   ├── event.event_payment (Pagos - PayPal/IPPAY/Transfer)
│   ├── event.payment_receipt (Comprobantes)
│   ├── event.ticket (Tickets/QRs)
│   └── event.scan_log (Historial de escaneos)
├── Vistas:
│   └── event.tickets_with_details
├── Funciones:
│   ├── event.generate_qr_code()
│   ├── event.generate_security_hash()
│   └── event.update_event_attendees()
├── Triggers:
│   └── trigger_update_attendees
└── RLS Policies: 15 políticas de seguridad

⚠️ Esquema public:
└── SIN MODIFICACIONES (se usa tal cual está)
```

### Paso 3: Configurar n8n Workflow
1. Crear workflow "Congreso Nacional - PayPal Payment"
2. Configurar webhook endpoint: `/webhook/congreso_nacional_paypal_events`
3. Implementar pasos:
   - Validar datos recibidos
   - Buscar/actualizar customer (Lead → Cliente)
   - Generar QR code (UUID)
   - Generar imagen QR en base64
   - Llamar workflow `upload_files` para subir y registrar
   - Insertar registro en tabla ticket con `qr_image_fk`
   - Enviar email con QR adjunto

### Paso 4: Desarrollar Landing Page (Astro)
1. Crear proyecto Astro (`npm create astro@latest`)
2. Configurar Supabase client en JavaScript
3. Implementar formulario de registro
4. Integrar iframe de PayPal:
   - Configurar PayPal SDK
   - Manejar eventos postMessage del iframe
   - Capturar transaction_id
5. Implementar formulario IPPAY (tarjeta de crédito)
6. Implementar subida de comprobantes con preview
7. Conectar con Supabase para crear Lead
8. Implementar callbacks de pago exitoso
9. Llamar webhooks n8n según método de pago
10. Crear páginas de confirmación y validación

### Paso 5: Desarrollar CRM (Flutter Web)
1. Crear proyecto Flutter Web
2. Implementar autenticación con Supabase Auth
3. Crear módulos:
   - Dashboard con métricas
   - Gestión de Leads
   - Gestión de Clientes
   - Gestión de Pagos
   - Gestión de Tickets/QRs
4. Implementar Supabase Realtime para actualizaciones

### Paso 6: Desarrollar App Móvil de Escaneo
1. Crear proyecto Flutter (iOS/Android)
2. Implementar escáner QR con `mobile_scanner`
3. Conectar con n8n endpoint de validación
4. Implementar pantallas de resultado (válido/duplicado/inválido)
5. Agregar historial de escaneos
6. Implementar manejo de errores de conexión

---

## 13. Preguntas Críticas para Resolver ANTES de Desarrollar

### Prioridad Alta 🔴

1. **¿Cuántos eventos se gestionarán?**
   - Si es solo 1 evento: Simplificar, hardcodear event_id
   - Si son múltiples: Necesitamos módulo de gestión de eventos en CRM

2. **¿Hay diferentes tipos de entradas?**
   - Si sí: Agregar campo `ticket_type` y precios variables
   - Si no: Precio fijo por evento

3. **¿Qué hacer si el webhook de PayPal falla?**
   - ¿Proceso manual de recuperación?
   - ¿Reintento automático?
   - ¿Notificación al admin?

4. **¿Se permite reingreso al evento?**
   - Si sí: No marcar como "ya escaneado" permanentemente
   - Si no: Bloquear después del primer escaneo

### Prioridad Media 🟡

5. **¿Cuántos participantes esperados?**
   - Afecta: Capacidad de servidor, plan de Supabase, performance

6. **¿Cuántos dispositivos de escaneo simultáneos?**
   - Afecta: Rate limiting, concurrencia de base de datos

7. **¿Se necesita autenticación en app móvil?**
   - Si sí: Implementar login con Supabase Auth
   - Si no: Endpoint público (con rate limiting estricto)

8. **¿Nivel de seguridad del QR?**
   - Básico: Solo UUID
   - Medio: UUID + hash SHA256
   - Alto: UUID + firma digital con clave privada

### Prioridad Baja 🟢

9. **¿Se envían recordatorios por email/SMS?**
   - Si sí: Configurar workflow n8n adicional

10. **¿Se necesitan códigos promocionales?**
    - Si sí: Crear tabla `promo_codes` y lógica de descuentos

---

## 14. Estimación de Tiempo de Desarrollo

| Componente | Tiempo Estimado | Prioridad | Notas |
|------------|----------------|-----------|-------|
| Configuración Supabase (tablas, RLS) | 4-6 horas | Alta | Ejecutar supabase_setup.sql |
| Workflows n8n (3 métodos de pago) | 12-16 horas | Alta | PayPal, IPPAY, Comprobante |
| Landing Page Astro | 12-20 horas | Alta | Más rápido que Flutter Web |
| CRM Flutter Web | 40-60 horas | Media | Incluye módulo validación |
| App Móvil de Escaneo | 16-24 horas | Alta | - |
| Testing e integración | 16-24 horas | Alta | - |
| **TOTAL** | **100-150 horas** | - | - |

**Nota**: Estimación para 1 desarrollador. Se puede paralelizar con equipo.