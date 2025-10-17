# Integración Supabase - Sistema de Registro

## 📋 Resumen

Se ha integrado Supabase en todo el flujo de registro para almacenar clientes (`public.customers`) desde el primer paso del formulario y mantener sincronización en los procesos de pago.

---

## ✅ Componentes Integrados

### 1. **FormularioLead.jsx** (NUEVO ✨)
**Ubicación**: `src/components/registro/components/FormularioLead.jsx`

**Funcionalidad**:
- Al completar el formulario de lead, crea/actualiza el registro en `public.customers`
- Verifica por email si el customer ya existe
- Si existe: actualiza `first_name`, `last_name`, `mobile_phone`, `status`
- Si NO existe: inserta nuevo registro con status `'Lead'`
- Devuelve el `customer_id` real al componente padre (`RegistroSeccion2`)

**Campos guardados**:
```javascript
{
  first_name: string,
  last_name: string,
  email: string,
  mobile_phone: string,
  status: 'Lead',
  customer_parent_id: null,
  customer_category_fk: null,
  organization_fk: null
}
```

**Logs en consola**:
- `📤 Submitting lead to Supabase...`
- `✅ Customer already exists: {customer_id}` (si existe)
- `📥 Inserting new customer: {email}` (si es nuevo)
- `✅ New customer created with ID: {customer_id}`
- `🎉 Lead submission successful!`

---

### 2. **PayPalIframe.jsx**
**Ubicación**: `src/components/registro/components/PayPalIframe.jsx`

**Funcionalidad**:
- Antes de enviar webhook de pago, busca/crea customer en Supabase
- Usa el `customer_id` como `lead_id` en el payload del webhook
- Maneja dos escenarios:
  - **Captura exitosa**: Envía payload completo con datos de PayPal
  - **Captura fallida** (window closed): Envía payload mínimo con `capture_failed: true`

**Payload enviado al webhook**:
```javascript
{
  lead_id: customer_id,              // ID de Supabase
  event_id: 1,
  paypal_order_id: "5O190127...",    // Order ID de PayPal
  amount: 1990.00,
  currency: "MXN",
  payer_email: "cliente@example.com",
  payer_info: { name, email, payer_id },
  payment_status: "COMPLETED",
  timestamp: "2025-10-17T...",
  capture_failed: false
}
```

---

### 3. **ComprobantePagoForm.jsx**
**Ubicación**: `src/components/registro/components/ComprobantePagoForm.jsx`

**Funcionalidad**:
- Antes de subir comprobante, busca/crea customer en Supabase
- Usa el `customer_id` en el payload del webhook
- Payload estructurado con objeto `file` anidado

**Payload enviado al webhook**:
```javascript
{
  customer_id: customer_id,          // ID de Supabase
  event_id: 1,
  reference_number: "REF123456",
  amount: 1990.00,
  payment_date: "2025-10-17T...",
  file: {
    file_name: "receipt_1_123",
    file_bucket: "event",
    file_route: "1/receipts/123",
    file_title: "Comprobante de Pago - Evento 1",
    file_description: "Comprobante subido por el cliente",
    metadata_json: { ... },
    media_category_id: 2,
    file: "iVBORw0KGgo..." // Base64 puro (sin prefijo)
  }
}
```

---

## 🗄️ Estructura de la Tabla `public.customers`

```sql
CREATE TABLE public.customers (
  customer_id BIGSERIAL PRIMARY KEY,          -- Auto-incremental
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,                 -- Email único
  mobile_phone TEXT,
  status TEXT,                                 -- 'Lead', 'Pending', 'Confirmed', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  auth_id UUID,                                -- Puede ser NULL
  organization_fk BIGINT,                      -- FK a organizations (puede ser NULL)
  customer_parent_id BIGINT,                   -- FK a customers (puede ser NULL)
  customer_category_fk BIGINT                  -- FK a customer_categories (puede ser NULL)
);
```

**Índices recomendados**:
```sql
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_status ON public.customers(status);
```

---

## 🔧 Configuración de Supabase

### Archivo: `src/lib/supabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL 
  || 'https://cbl-supabase.cbluna-dev.com';

const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

export default supabase;
```

### Variables de Entorno (Opcional)

Crear archivo `.env` en la raíz:

```bash
PUBLIC_SUPABASE_URL=https://cbl-supabase.cbluna-dev.com
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MjM4MDAwLAogICJleHAiOiAxODczMDA0NDAwCn0.qKqYn2vjtHqKqyt1FAghuIjvNsyr9b1ElpVfvJg6zJ4
```

---

## 🧪 Pruebas Locales

### 1. Instalar Dependencias

```powershell
npm install @supabase/supabase-js
```

### 2. Ejecutar Dev Server

```powershell
npm run dev
```

### 3. Probar Flujo Completo

#### **A. Formulario de Lead**

1. Ir a `http://localhost:4321/registro`
2. Completar formulario con:
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - Email: `juan.perez@example.com`
   - Teléfono: `5512345678`
   - Tipo de documento: `INE`
   - Número de documento: `123456789`
3. Click en "Guardar y Continuar"
4. Revisar consola del navegador:
   ```
   📤 Submitting lead to Supabase...
   📥 Inserting new customer: juan.perez@example.com
   ✅ New customer created with ID: 123
   🎉 Lead submission successful!
   ```

5. **Verificar en Supabase**:
   - Ir a [https://cbl-supabase.cbluna-dev.com](https://cbl-supabase.cbluna-dev.com)
   - Table Editor → `public.customers`
   - Buscar por email: `juan.perez@example.com`
   - Confirmar que existe el registro con `status = 'Lead'`

#### **B. Pago con PayPal (Sandbox)**

1. Seleccionar tab "PayPal"
2. Click en botón "Pay with PayPal"
3. Usar cuenta sandbox:
   - Email: `sb-buyer@personal.example.com`
   - Password: `12345678`
4. Completar pago
5. Revisar consola:
   ```
   🔎 Looking up customer by email in Supabase: juan.perez@example.com
   ✅ Found existing customer_id: 123
   🎉 Payment approved! Order ID: 5O190127TN364715T
   💳 Capturing order details...
   📦 Order details captured
   📤 Sending webhook to n8n
   ✅ Webhook processed successfully
   ```

6. **Verificar webhook recibido en n8n**:
   - Payload debe incluir `lead_id: 123` (customer_id de Supabase)

#### **C. Subida de Comprobante Bancario**

1. Seleccionar tab "Transferencia Bancaria"
2. Subir archivo PDF/JPG/PNG (comprobante de prueba)
3. Ingresar:
   - Número de referencia: `REF123456`
   - Fecha de pago: `2025-10-15`
4. Click en "Subir Comprobante"
5. Revisar consola:
   ```
   📤 Starting receipt upload process...
   🔎 Looking up customer by email in Supabase: juan.perez@example.com
   ✅ Found existing customer_id: 123
   🔄 Converting file to base64...
   ✅ File converted to base64
   📤 Sending to webhook
   ✅ Webhook response: 200
   🎉 Receipt uploaded successfully!
   ```

6. **Verificar webhook recibido**:
   - Payload debe incluir `customer_id: 123`
   - Campo `file.file` debe ser base64 puro (sin `data:image/png;base64,`)

---

## 🔍 Troubleshooting

### Error: "Failed to create customer"

**Causa**: Problema de conexión con Supabase o permisos RLS.

**Solución**:
1. Verificar que `SUPABASE_URL` y `SUPABASE_ANON_KEY` sean correctas
2. Revisar políticas RLS en Supabase:
   ```sql
   -- Permitir INSERT público en customers
   CREATE POLICY "Allow public insert" ON public.customers
     FOR INSERT TO anon
     WITH CHECK (true);
   
   -- Permitir SELECT público en customers
   CREATE POLICY "Allow public select" ON public.customers
     FOR SELECT TO anon
     USING (true);
   
   -- Permitir UPDATE público en customers
   CREATE POLICY "Allow public update" ON public.customers
     FOR UPDATE TO anon
     USING (true);
   ```

### Error: "Customer already exists"

**Causa**: Email duplicado.

**Comportamiento esperado**: El sistema actualiza el customer existente en lugar de fallar.

**Verificar**:
- Log en consola debe mostrar: `✅ Customer already exists: {customer_id}`
- No debe mostrar error

### Error: "Email is not unique"

**Causa**: Violación de constraint `UNIQUE` en campo `email`.

**Solución**:
- El código ya maneja esto con `maybeSingle()` y verifica existencia antes de insertar
- Si persiste, revisar que la columna `email` tenga constraint `UNIQUE`:
  ```sql
  ALTER TABLE public.customers ADD CONSTRAINT customers_email_unique UNIQUE (email);
  ```

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO INICIA REGISTRO                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         PASO 1: FormularioLead.jsx                          │
│  • Usuario completa formulario (nombre, email, teléfono)    │
│  • handleSubmit()                                            │
│    ├─ Busca customer por email en Supabase                  │
│    ├─ Si existe: actualiza datos                            │
│    └─ Si NO existe: inserta nuevo customer                  │
│  • Devuelve customer_id al padre                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         PASO 2: Selector de Método de Pago                  │
│  • Usuario elige: PayPal | Tarjeta (IPPAY) | Transferencia │
└────────────────────────────┬────────────────────────────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌───────────────┐
    │   PayPal   │  │   IPPAY    │  │ Transferencia │
    └──────┬─────┘  └──────┬─────┘  └───────┬───────┘
           │                │                 │
           ▼                ▼                 ▼
    ┌────────────┐  ┌────────────┐  ┌───────────────┐
    │ PayPalIf.. │  │ IPPayForm  │  │ Comprobante.. │
    │            │  │            │  │               │
    │ • Verifica │  │ • Verifica │  │ • Verifica    │
    │   customer │  │   customer │  │   customer    │
    │ • Paga     │  │ • Paga     │  │ • Sube archivo│
    │ • Webhook  │  │ • Webhook  │  │ • Webhook     │
    │   con      │  │   con      │  │   con         │
    │   lead_id  │  │   lead_id  │  │   customer_id │
    └────────────┘  └────────────┘  └───────────────┘
           │                │                 │
           └────────────────┴─────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Webhook n8n (Backend Processing)                │
│  • Recibe payload con lead_id/customer_id                   │
│  • Procesa pago/comprobante                                 │
│  • Actualiza tablas:                                        │
│    - public.payment_receipt                                 │
│    - public.customers (status → 'Pending' o 'Confirmed')    │
│    - media.media_file (si es comprobante)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Confirmación/Validación                         │
│  • Redirect a /confirmacion (PayPal/IPPAY)                  │
│  • Redirect a /validacion (Transferencia)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas Importantes

1. **Manejo de Errores**: Todos los componentes continúan funcionando incluso si Supabase falla (envían webhook con `lead_id: null`).

2. **Email como Clave Única**: El sistema usa email para identificar customers. Si un usuario vuelve a registrarse con el mismo email, se actualizan sus datos.

3. **Status del Customer**:
   - `'Lead'` - Completó formulario inicial
   - `'Pending'` - Pago procesado, esperando confirmación
   - `'Confirmed'` - Pago confirmado por admin
   - `'En Validación'` - Subió comprobante, esperando revisión

4. **Base64 sin Prefijo**: El comprobante se envía como base64 puro (sin `data:image/png;base64,`).

5. **PayPal Order ID**: Se envía solo `paypal_order_id` (no `paypal_transaction_id`). El backend puede usar la Orders API de PayPal para obtener detalles adicionales.

---

## 🚀 Próximos Pasos

- [ ] Configurar políticas RLS en Supabase para producción
- [ ] Añadir validación de email única en frontend
- [ ] Implementar notificaciones por email al crear customer
- [ ] Añadir logging a servicio externo (Sentry, LogRocket)
- [ ] Testing end-to-end del flujo completo

---

**Documentación generada**: 17 de octubre de 2025  
**Versión**: 1.0
