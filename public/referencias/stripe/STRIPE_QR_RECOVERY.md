# 🎫 Sistema de Recuperación de QR para Stripe

## 📋 Contexto

Cuando un usuario realiza un pago con **Stripe** en el flujo general (no académico), el QR **NO llega desde el webhook de n8n** debido a limitaciones técnicas. 

La solución implementada es **consultar directamente la vista `tickets_with_details`** de Supabase.

---

## 🎯 Vista de Supabase

**Schema**: `event`  
**Vista**: `tickets_with_details`

### Columnas Relevantes:
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `customer_id` | bigint | ID del cliente (filtro principal) |
| `event_id` | bigint | ID del evento (siempre 1 para Congreso) |
| `qr_image_url` | text | **URL del QR** (objetivo principal) |
| `ticket_id` | bigint | ID del ticket generado |
| `qr_code` | text | Código QR en texto |
| `payment_method` | text | Método de pago usado |
| `payment_status` | text | Estado del pago |

---

## 🔄 Flujo Implementado

### **1. Usuario completa pago con Stripe**
```
StripeForm.jsx → Stripe Checkout → success_url → /confirmacion?lead_id=831&method=stripe&status=confirmed
```

### **2. ConfirmacionSeccion.jsx se monta**
```javascript
// Props recibidas:
leadId: 831
paymentMethod: 'stripe'
status: 'confirmed'
transactionId: null (puede estar ausente)
```

### **3. Flujo de recuperación de datos**

#### **Paso 1: Obtener datos del cliente**
```javascript
const { data: customer } = await supabase
  .from('customer')
  .select('*')
  .eq('customer_id', leadId)
  .single();
```

#### **Paso 2: Buscar QR en tickets_with_details** ⭐
```javascript
// 🔥 NUEVO: Solo si método es Stripe y NO hay webhook response
if (paymentMethod === 'stripe' && !localWebhookResponse) {
  const { data: ticketData } = await supabase
    .schema('event')
    .from('tickets_with_details')
    .select('qr_image_url, ticket_id, qr_code, payment_method, payment_status')
    .eq('customer_id', leadId)
    .eq('event_id', 1)
    .order('ticket_created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (ticketData && ticketData.qr_image_url) {
    console.log('✅ QR encontrado:', ticketData.qr_image_url);
    ticketDataFromView = ticketData;
  }
}
```

#### **Paso 3: Construir paymentData desde la vista**
```javascript
const paymentDataFromView = {
  event_payment_id: null,
  amount: parseFloat(localStorage.getItem('lastPaymentAmount')) || 1990,
  currency: 'MXN',
  payment_method: 'stripe',
  status: ticketData.payment_status || 'confirmed',
  response: {
    success: true,
    data: {
      qr_image_url: ticketData.qr_image_url, // 🎫 QR URL
      ticket_id: ticketData.ticket_id,
      qr_code: ticketData.qr_code
    }
  }
};
```

#### **Paso 4: Mostrar QR**
```javascript
// El QR se extrae de paymentData.response.data.qr_image_url
const ticketQRUrl = responseData?.data?.qr_image_url || null;

// Se muestra en el componente:
{ticketQRUrl && (
  <img src={ticketQRUrl} alt="QR Code" className={styles.qrCode} />
)}
```

---

## ⏱️ Sistema de Reintentos

### **Problema**: 
El ticket puede tardar unos segundos en aparecer en la vista después del pago.

### **Solución**: 
Sistema de reintentos automáticos cada 3 segundos.

```javascript
if (!ticketDataFromView && retryCount < 3) {
  console.log(`🔄 Retry ${retryCount + 1}/3 in 3 seconds...`);
  setTimeout(() => setRetryCount(prev => prev + 1), 3000);
  return; // No marcar como cargado
}
```

**Total**: 3 reintentos × 3 segundos = **9 segundos máximo de espera**

---

## 🔍 Logs de Debugging

### **Console logs clave**:
```javascript
🎫 BUSCANDO QR EN VISTA tickets_with_details
💳 Método de pago: stripe
🆔 customer_id: 831
🎯 event_id: 1
🔍 Ejecutando query en tickets_with_details...
✅ TICKET ENCONTRADO en vista: { qr_image_url: "https://...", ... }
🎫 QR URL: https://cloudinary.com/...
```

---

## 📊 Comparación: PayPal vs Stripe

| Aspecto | **PayPal** | **Stripe** |
|---------|-----------|-----------|
| **Fuente del QR** | Webhook de n8n → localStorage | Vista `tickets_with_details` |
| **Campo usado** | `response.data.qr_image_url` | `qr_image_url` (vista) |
| **Tiempo de respuesta** | Inmediato (2-3 seg) | Puede tardar hasta 9 seg |
| **Reintentos** | 2 reintentos | 3 reintentos |
| **Fallback** | Query a `event_payment` | Query a vista directamente |

---

## ✅ Casos de Prueba

### **Test 1: Pago Stripe exitoso**
```
1. Ir a /registro
2. Completar formulario (flujo general, NO académico)
3. Seleccionar "Tarjeta de Crédito" (Stripe)
4. Completar pago
5. Verificar redirección a /confirmacion
6. Verificar que aparece el QR (máximo 9 segundos)
```

**Logs esperados**:
```
🎫 BUSCANDO QR EN VISTA tickets_with_details
✅ TICKET ENCONTRADO en vista
🎫 QR URL: https://...
✅ Payment data constructed from view
```

---

### **Test 2: Pago Stripe sin QR inmediato**
```
1. Completar pago Stripe
2. Pantalla de carga aparece
3. Sistema reintenta 3 veces (cada 3 seg)
4. QR aparece cuando el ticket se genera en la vista
```

**Logs esperados**:
```
⚠️ No se encontró ticket en la vista (puede que aún no se haya generado)
🔄 Stripe without ticket - Retry 1/3 in 3 seconds...
🔄 Stripe without ticket - Retry 2/3 in 3 seconds...
✅ TICKET ENCONTRADO en vista (en el reintento)
```

---

### **Test 3: PayPal (no afectado)**
```
1. Pago con PayPal → QR llega desde webhook (como antes)
2. NO se ejecuta la búsqueda en la vista
3. QR se muestra inmediatamente
```

**Logs esperados**:
```
⏭️ Saltando búsqueda en vista (método: paypal, tiene webhook: true)
🎉 Using webhook response from localStorage
```

---

## 🚨 Manejo de Errores

### **Error 1: Vista sin permisos**
```javascript
❌ Error buscando ticket en vista: { code: '42501', message: 'permission denied' }
```
**Solución**: Verificar RLS policies en `tickets_with_details`

### **Error 2: Ticket no existe después de 3 reintentos**
```javascript
⚠️ Stripe payment without ticket - QR may be processing
```
**Solución**: Mostrar mensaje al usuario "Tu QR se enviará por email en los próximos minutos"

### **Error 3: customer_id no encontrado en vista**
```javascript
⚠️ No se encontró ticket en la vista
```
**Solución**: Verificar que el `customer_id` es correcto y que el evento es `event_id=1`

---

## 📌 Notas Importantes

1. **Filtro `event_id=1`**: Hardcoded porque siempre es el Congreso Nacional de Amparo
2. **Order by `ticket_created_at`**: Para obtener el ticket MÁS RECIENTE
3. **`.maybeSingle()`**: Permite que la query devuelva `null` sin error si no hay registros
4. **localStorage como fallback**: Siempre consulta `lastPaymentMethod` para saber si es Stripe
5. **No afecta otros métodos**: PayPal, transferencia bancaria siguen usando webhook

---

## 🔧 Mantenimiento Futuro

### **Si n8n empieza a enviar QR para Stripe**:
1. El webhook response tendrá `qr_image_url`
2. El código detectará `localWebhookResponse` y saltará la búsqueda en la vista
3. No requiere cambios en el código

### **Si cambia la estructura de la vista**:
1. Actualizar la query en línea ~125 de `ConfirmacionSeccion.jsx`
2. Actualizar el mapeo de columnas en línea ~165

---

**Archivo**: `ConfirmacionSeccion.jsx`  
**Líneas clave**: 110-145 (búsqueda en vista), 158-175 (construcción de paymentData)  
**Fecha**: 29 de octubre de 2025  
**Estado**: ✅ Implementado y probado
