# Workflow n8n: Stripe - Crear Orden de Pago
## congreso_nacional_stripe_create_order

---

// Constantes para los tipos de precio
 'precio_prof_estud_pos';
 'precio_estudiante_lic';
'precio_lista_congreso';

## Descripción

Workflow para crear una orden de pago con Stripe y obtener el `access_url`. Este workflow:
1. Recibe el `customer_id` desde el portal web
2. Obtiene datos del cliente y evento
3. Llama al API de Stripe para crear checkout session
4. **Crea un registro pendiente en `event.event_payment` estableciendo la relación `customer_id` ↔ `order_id`**
5. Retorna el `access_url` al portal

---

## Webhook de Entrada

**URL**: `https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_stripe_create_order`

**Método**: `POST`

**Payload de Entrada**:
```json
{
  "customer_id": 123,
  "event_id": 1,
  "price_key": "precio_estudiante_lic",
  "client": "congreso_nacional",
  "msi_periods": 3,
  "success_url": "https://tusitio.com/success",
  "cancel_url": "https://tusitio.com/cancel"
}
```

---

## Flujo de Trabajo (10 Nodos)

### 1. **Webhook** - Recibir Solicitud

- **Tipo**: Webhook
- **Método**: POST

---

### 2. **Function** - Validar Datos

```javascript
const data = $input.first().json.body;

// Campos requeridos
const requiredFields = [
  'customer_id',
  'event_id',
  'price_key',
  'client',
  'success_url',
  'cancel_url'
];

for (const field of requiredFields) {
  if (!data[field]) {
    throw new Error(`Campo requerido faltante: ${field}`);
  }
}

// Valores por defecto
data.msi_periods = data.msi_periods || 3;
data.currency = data.currency || 'MXN';

return [{ json: data }];
```

---

### 3. **Supabase** - Obtener Cliente

- **Tabla**: `public.customer`
- **Filtro**: `customer_id` = `{{ $json.customer_id }}`

---

### 4. **IF** - Cliente Existe?

- **Condición**: `{{ $json.customer_id }}` existe

---

### 5. **Supabase** - Obtener Evento

- **Tabla**: `event.event`
- **Filtro**: `event_id` = `{{ $json.event_id }}`

---

### 6. **IF** - Evento Activo?

- **Condición**: `{{ $json.status }}` = 'Active'

---

### 7. **HTTP Request** - Crear Orden de Pago en Stripe (API Virtalus)

- **Método**: POST
- **URL**: `https://cbl.virtalus.cbluna-dev.com/uapi/payments/stripe`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body (JSON)**:
```json
{
  "gateway": "stripe",
  "environment": "sandbox",
  "client": "{{ $('Function - Validar Datos').first().json.client }}",
  "price_key": "{{ $('Function - Validar Datos').first().json.price_key }}",
  "msi_periods": {{ $('Function - Validar Datos').first().json.msi_periods }},
  "success_url": "{{ $('Function - Validar Datos').first().json.success_url }}",
  "cancel_url": "{{ $('Function - Validar Datos').first().json.cancel_url }}"
}
```

**Ejemplo de Body**:
```json
{
  "gateway": "stripe",
  "environment": "sandbox",
  "client": "congreso_nacional",
  "price_key": "precio_estudiante_lic",
  "msi_periods": 3,
  "success_url": "https://tusitio.com/success",
  "cancel_url": "https://tusitio.com/cancel"
}
```

**Output Real del API** (Array con un objeto):
```json
[
  {
    "status": "success",
    "payment_id": "cs_test_a1sFkDQMlSPWzfPmfJzvnkU8QWVkzGGGEQHBAGD2mOEXNAxSVOUPXzSkdX",
    "redirect_url": "https://checkout.stripe.com/c/pay/cs_test_...",
    "body": {
      "id": "cs_test_a1sFkDQMlSPWzfPmfJzvnkU8QWVkzGGGEQHBAGD2mOEXNAxSVOUPXzSkdX",
      "object": "checkout.session",
      "amount_subtotal": 99500,
      "amount_total": 99500,
      "currency": "mxn",
      "payment_status": "unpaid",
      "status": "open",
      "url": "https://checkout.stripe.com/c/pay/cs_test_...",
      "success_url": "https://tusitio.com/success?session_id={CHECKOUT_SESSION_ID}",
      "cancel_url": "https://tusitio.com/cancel"
    }
  }
]
```

**Campos Importantes**:
- `[0].status`: "success"
- `[0].payment_id`: Session ID de Stripe (cs_test_...)
- `[0].redirect_url`: URL para redirigir al checkout
- `[0].body.amount_total`: Monto total en centavos (99500 = $995.00 MXN)
- `[0].body.currency`: Moneda (mxn)
- `[0].body.id`: Session ID (igual que payment_id)

**Nota**: El API retorna un **array** con un objeto. Usar `[0]` para acceder a los datos.

---

### 7.1 **Function** - Extraer Datos del Array (OPCIONAL)

Si prefieres trabajar con un objeto en lugar del array, puedes agregar este nodo:

```javascript
const response = $input.first().json[0];
const validarDatos = $('Function - Validar Datos de Entrada').first().json;

return [{
  json: {
    status: response.status,
    payment_id: response.payment_id,
    redirect_url: response.redirect_url,
    session_id: response.body.id,
    amount_total: response.body.amount_total,
    amount: response.body.amount_total / 100,
    currency: response.body.currency.toUpperCase(),
    payment_status: response.body.payment_status,
    metadata: {
      stripe_payment_id: response.payment_id,
      stripe_session_id: response.body.id,
      stripe_session_url: response.redirect_url,
      customer_id: validarDatos.customer_id,
      event_id: validarDatos.event_id,
      price_key: validarDatos.price_key,
      client: validarDatos.client,
      msi_periods: validarDatos.msi_periods,
      amount_total_cents: response.body.amount_total,
      created_at: new Date().toISOString()
    }
  }
}];
```

**Ventaja**: Simplifica las referencias en nodos posteriores

---

### 8. **Supabase** - Crear Registro Pendiente (PUNTO 4.4)

- **Tipo**: Supabase Node
- **Operación**: `Insert`
- **Tabla**: `event.event_payment`

**Opción A: Si usas el Nodo 7.1 (Recomendado)**
```json
{
  "customer_fk": "{{ $('Function - Extraer Datos').first().json.metadata.customer_id }}",
  "event_fk": "{{ $('Function - Extraer Datos').first().json.metadata.event_id }}",
  "amount": "{{ $('Function - Extraer Datos').first().json.amount }}",
  "currency": "{{ $('Function - Extraer Datos').first().json.currency }}",
  "payment_method": "Stripe",
  "status": "Pending",
  "other_transaction_id": "{{ $('Function - Extraer Datos').first().json.payment_id }}",
  "metadata": "{{ $('Function - Extraer Datos').first().json.metadata }}"
}
```

**Opción B: Sin el Nodo 7.1 (Acceso directo al array)**
```json
{
  "customer_fk": "{{ $('Function - Validar Datos').first().json.customer_id }}",
  "event_fk": "{{ $('Function - Validar Datos').first().json.event_id }}",
  "amount": "{{ $('HTTP Request - Crear Orden de Pago').first().json[0].body.amount_total / 100 }}",
  "currency": "{{ $('HTTP Request - Crear Orden de Pago').first().json[0].body.currency.toUpperCase() }}",
  "payment_method": "Stripe",
  "status": "Pending",
  "other_transaction_id": "{{ $('HTTP Request - Crear Orden de Pago').first().json[0].payment_id }}",
  "metadata": {
    "stripe_payment_id": "{{ $('HTTP Request - Crear Orden de Pago').first().json[0].payment_id }}",
    "stripe_session_id": "{{ $('HTTP Request - Crear Orden de Pago').first().json[0].body.id }}",
    "stripe_session_url": "{{ $('HTTP Request - Crear Orden de Pago').first().json[0].redirect_url }}",
    "customer_id": "{{ $('Function - Validar Datos').first().json.customer_id }}",
    "event_id": "{{ $('Function - Validar Datos').first().json.event_id }}",
    "price_key": "{{ $('Function - Validar Datos').first().json.price_key }}",
    "client": "{{ $('Function - Validar Datos').first().json.client }}",
    "msi_periods": "{{ $('Function - Validar Datos').first().json.msi_periods }}",
    "amount_total_cents": "{{ $('HTTP Request - Crear Orden de Pago').first().json[0].body.amount_total }}",
    "created_at": "{{ new Date().toISOString() }}"
  }
}
```

**Recomendación**: Usar **Opción A** con el Nodo 7.1 para código más limpio y mantenible

**✅ SOLUCIÓN PUNTO 4.4: Establecer Relación customer_id ↔ order_id**

Este nodo resuelve el punto 4.4:

1. **`customer_fk`**: Almacena el `customer_id` (123)
2. **`other_transaction_id`**: Almacena el `order_id` de Stripe retornado por el API de Virtalus
3. **`status`**: "Pending" hasta que se complete el pago
4. **`metadata`**: JSON con toda la información del checkout (price_key, client, msi_periods, etc.)

**Cuando llegue el webhook de Stripe** (paso 7 del flujo general), se buscará:
```sql
SELECT * FROM event.event_payment 
WHERE other_transaction_id = 'cs_test_...'
AND status = 'Pending'
AND payment_method = 'Stripe';
```

Esto retornará el registro con `customer_fk` y `event_fk` para completar el proceso.

---

### 9. **Function** - Preparar Respuesta

```javascript
const stripeResponse = $('HTTP Request - Crear Orden de Pago').first().json[0];
const paymentRecord = $('Supabase - Crear Registro Pendiente').first().json;

return [{
  json: {
    success: true,
    message: "Orden de pago creada exitosamente",
    data: {
      access_url: stripeResponse.redirect_url,
      order_id: stripeResponse.payment_id,
      payment_id: stripeResponse.payment_id,
      session_id: stripeResponse.body.id,
      event_payment_id: paymentRecord.event_payment_id,
      amount: stripeResponse.body.amount_total / 100,
      currency: stripeResponse.body.currency.toUpperCase(),
      status: "pending"
    }
  }
}];
```

**Nota**: Acceder al primer elemento del array con `[0]`

---

### 10. **Respond to Webhook** - Enviar Respuesta

- **Status Code**: 200
- **Body**: `{{ $json }}`

**Respuesta al Portal**:
```json
{
  "success": true,
  "message": "Orden de pago creada exitosamente",
  "data": {
    "access_url": "https://checkout.stripe.com/c/pay/cs_test_a1sFkDQMlSPWzfPmfJzvnkU8QWVkzGGGEQHBAGD2mOEXNAxSVOUPXzSkdX#...",
    "order_id": "cs_test_a1sFkDQMlSPWzfPmfJzvnkU8QWVkzGGGEQHBAGD2mOEXNAxSVOUPXzSkdX",
    "payment_id": "cs_test_a1sFkDQMlSPWzfPmfJzvnkU8QWVkzGGGEQHBAGD2mOEXNAxSVOUPXzSkdX",
    "session_id": "cs_test_a1sFkDQMlSPWzfPmfJzvnkU8QWVkzGGGEQHBAGD2mOEXNAxSVOUPXzSkdX",
    "event_payment_id": 456,
    "amount": 995.00,
    "currency": "MXN",
    "status": "pending"
  }
}
```

---

## Diagrama de Flujo

```
Webhook (customer_id, event_id, price_key, client, msi_periods, success_url, cancel_url)
  ↓
Validar Datos (verifica campos requeridos)
  ↓
Obtener Cliente → [IF] Existe?
  ↓ (True)
Obtener Evento → [IF] Activo?
  ↓ (True)
HTTP Request: API Virtalus Stripe ← ✅ OBTENER access_url y order_id
  ↓ (retorna order_id, access_url, amount, currency)
Supabase: Crear Registro Pendiente ← ✅ PUNTO 4.4: RELACIÓN customer_id ↔ order_id
  ↓ (other_transaction_id = order_id, status = Pending)
Preparar Respuesta
  ↓
Respond to Webhook (200 OK con access_url)
```

---

## Variables de Entorno

```env
# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (para webhook de confirmación)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Nota**: No se requiere `STRIPE_SECRET_KEY` en este workflow porque el API de Virtalus maneja la autenticación con Stripe internamente.

---

## Punto 4.4: Solución Detallada

### Problema
Necesitamos establecer una relación entre `customer_id` y `order_id` para que cuando Stripe envíe el webhook de confirmación, podamos encontrar al cliente.

### Solución
Crear un registro en `event.event_payment` con:

| Campo | Valor | Propósito |
|-------|-------|----------|
| `customer_fk` | 123 | Relación con cliente |
| `event_fk` | 1 | Relación con evento |
| `other_transaction_id` | cs_test_... | **order_id de Stripe** |
| `status` | Pending | Pago no completado |
| `metadata` | JSON | Info adicional |

### Búsqueda en Webhook de Confirmación

Cuando Stripe envíe `checkout.session.completed` con `data.object.id`:

```sql
SELECT 
  event_payment_id,
  customer_fk,
  event_fk,
  amount,
  currency
FROM event.event_payment
WHERE other_transaction_id = '{{ $json.data.object.id }}'
  AND status = 'Pending'
  AND payment_method = 'Stripe';
```

Esto retorna el registro con toda la información del cliente y evento.

---

## Notas Importantes

1. ✅ **API Virtalus**: Usar `https://cbl.virtalus.cbluna-dev.com/uapi/payments/stripe`
2. ✅ **Campo Actualizado**: Usar `other_transaction_id` (no `ippay_transaction_id`)
3. ✅ **Relación Establecida**: En el nodo 8, antes de retornar el access_url
4. ✅ **Status Pending**: El registro queda pendiente hasta confirmación
5. ⚠️ **Expiración**: Stripe sessions expiran en 24 horas
6. ✅ **Metadata**: Almacena info adicional en JSON (price_key, client, msi_periods)
7. ✅ **Parámetros Requeridos**: customer_id, event_id, price_key, client, success_url, cancel_url
8. ✅ **Parámetros Opcionales**: msi_periods (default: 3), currency (default: MXN)
9. ✅ **Environment**: El API maneja sandbox/production internamente
10. ✅ **Monto**: El API de Virtalus retorna el monto basado en el price_key

---

**Total de Nodos**: 10  
**Tiempo Estimado**: 2-3 segundos  
**Dependencias**:
- API Virtalus Stripe (`https://cbl.virtalus.cbluna-dev.com/uapi/payments/stripe`)
- Supabase (tabla `event.event_payment`)

---

## Integración con Portal Web

### Paso 1-3: Formulario y Registro de Cliente

```javascript
// 1. Usuario llena formulario de información personal
const formData = {
  first_name: "Juan",
  last_name: "Pérez",
  email: "juan@example.com",
  mobile_phone: "+52 55 1234 5678"
};

// 2. Insertar registro en Supabase
const { data: customer, error } = await supabase
  .from('customer')
  .insert({
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    mobile_phone: formData.mobile_phone,
    status: 'Lead'
  })
  .select()
  .single();

const customerId = customer.customer_id; // Genera customer_id
```

### Paso 4: Usuario Selecciona "Pago con Tarjeta"

```javascript
// 3. Usuario selecciona método de pago "Tarjeta"
async function pagarConTarjeta(customerId, eventId) {
  try {
    // 4. Llamar webhook de n8n
    const response = await fetch('https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_stripe_create_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        event_id: eventId,
        price_key: "precio_estudiante_lic",
        client: "congreso_nacional",
        msi_periods: 3,
        success_url: "https://tusitio.com/success",
        cancel_url: "https://tusitio.com/cancel"
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 5. Abrir popup con access_url
      abrirPopupStripe(result.data.access_url);
    } else {
      alert('Error al crear orden de pago');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}
```

### Paso 5: Abrir Popup con Stripe Checkout

```javascript
// 5. Abrir popup con el access_url
function abrirPopupStripe(accessUrl) {
  const stripeWindow = window.open(
    accessUrl,
    'stripe-checkout',
    'width=600,height=800,scrollbars=yes,resizable=yes'
  );
  
  // Opcional: Monitorear si el popup se cierra
  const checkPopup = setInterval(() => {
    if (stripeWindow.closed) {
      clearInterval(checkPopup);
      // Verificar estado del pago
      verificarEstadoPago();
    }
  }, 1000);
}
```

### Paso 6-7: Stripe Completa Transacción y Envía Webhook

```javascript
// 6. Usuario completa el pago en el popup de Stripe
// 7. Stripe envía webhook a n8n con evento "checkout.session.completed"
// Este webhook será manejado por el segundo workflow (próximo a documentar)
```

---

**Siguiente**: Webhook de confirmación `checkout.session.completed`
