# Workflow n8n: Carga de Comprobante de Pago

## Webhook de Entrada

**URL**: `https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_receipt`

**Método**: `POST`

**Payload de Entrada**:
```json
{
  "customer_id": 1,
  "event_id": 1,
  "reference_number": "REF-123456",
  "amount": 150.00,
  "payment_date": "2024-10-15T10:30:00Z",
  "file": {
    "file_name": "receipt_{event_id}_{customer_id}",
    "file_bucket": "event",
    "file_route": "{event_id}/receipts/{customer_id}",
    "file_title": "Comprobante de Pago - Evento {event_id}",
    "file_description": "Comprobante de pago subido por el cliente",
    "metadata_json": {
      "event_id": 1,
      "customer_id": 1,
      "upload_source": "landing_page"
    },
    "media_category_id": 2,
    "file": "base64_encoded_file_content"
  }
}
```

---

## Flujo de Trabajo (Nodes)

### 1. **Webhook** - Recibir Datos
- **Tipo**: Webhook
- **Método**: POST
- **Path**: `/webhook/congreso_nacional_upload_receipt`
- **Responder**: Inmediatamente con 200 OK

**Output**:
```json
{
  "customer_id": 1,
  "event_id": 1,
  "reference_number": "REF-123456",
  "amount": 150.00,
  "payment_date": "2024-10-15T10:30:00Z",
  "file": { ... }
}
```

---

### 2. **Function** - Validar Datos
- **Tipo**: Function Node
- **Código**:
```javascript
const items = $input.all();
const validatedItems = [];

for (const item of items) {
  const data = item.json;
  
  // Validaciones
  if (!data.customer_id) {
    throw new Error('customer_id es requerido');
  }
  
  if (!data.event_id) {
    throw new Error('event_id es requerido');
  }
  
  if (!data.amount || data.amount <= 0) {
    throw new Error('amount debe ser mayor a 0');
  }
  
  if (!data.file || !data.file.file) {
    throw new Error('file (base64) es requerido');
  }
  
  // Validar formato de archivo (opcional)
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const fileType = data.file.file.split(';')[0].split(':')[1];
  
  if (!allowedTypes.includes(fileType)) {
    throw new Error('Tipo de archivo no permitido. Solo JPG, PNG, PDF');
  }
  
  validatedItems.push({
    json: data
  });
}

return validatedItems;
```

---

### 3. **Supabase** - Verificar Cliente Existe
- **Tipo**: Supabase Node
- **Operación**: `Select`
- **Tabla**: `public.customer`
- **Filtros**: 
  - `customer_id` = `{{ $json.customer_id }}`
- **Campos**: `customer_id, first_name, last_name, email, status`

**Output**:
```json
{
  "customer_id": 1,
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "status": "Lead"
}
```

---

### 4. **IF** - Cliente Existe?
- **Tipo**: IF Node
- **Condición**: `{{ $json.customer_id }}` existe (length > 0)
- **True**: Continuar
- **False**: Retornar error 404

---

### 5. **Supabase** - Verificar Evento Existe
- **Tipo**: Supabase Node
- **Operación**: `Select`
- **Tabla**: `event.event`
- **Filtros**: 
  - `event_id` = `{{ $('Webhook').item.json.event_id }}`
- **Campos**: `event_id, name, ticket_price, status`

**Output**:
```json
{
  "event_id": 1,
  "name": "Congreso Nacional 2024",
  "ticket_price": 150.00,
  "status": "Active"
}
```

---

### 6. **IF** - Evento Existe y Está Activo?
- **Tipo**: IF Node
- **Condición**: `{{ $json.event_id }}` existe Y `{{ $json.status }}` = 'Active'
- **True**: Continuar
- **False**: Retornar error 404

---

### 7. **Function** - Preparar Datos para Subproceso de Carga
- **Tipo**: Function Node
- **Código**:
```javascript
const webhookData = $('Webhook').first().json;
const customer = $('Supabase - Verificar Cliente').first().json;
const event = $('Supabase - Verificar Evento').first().json;

const fileData = webhookData.file;
const timestamp = Date.now();

// Preparar payload para el subproceso de carga de archivos
return [{
  json: {
    file_name: `receipt_${event.event_id}_${customer.customer_id}_${timestamp}`,
    file_bucket: fileData.file_bucket || "event",
    file_route: `${event.event_id}/receipts/${customer.customer_id}/receipt_${timestamp}.pdf`,
    file_title: `Comprobante - Evento ${event.name}`,
    file_description: `Comprobante de pago subido por ${customer.first_name} ${customer.last_name}`,
    seconds: "0",
    user_id: null, // O el user_id del sistema si existe
    metadata_json: JSON.stringify({
      event_id: event.event_id,
      event_name: event.name,
      customer_id: customer.customer_id,
      upload_source: "landing_page",
      reference_number: webhookData.reference_number
    }),
    media_category_id: "2", // Categoría de comprobantes
    file: fileData.file, // Base64
    // Datos adicionales para siguiente paso
    _customer_id: customer.customer_id,
    _event_id: event.event_id,
    _reference_number: webhookData.reference_number,
    _amount: webhookData.amount,
    _payment_date: webhookData.payment_date
  }
}];
```

---

### 8. **Execute Workflow** - Llamar Subproceso de Carga de Archivos
- **Tipo**: Execute Workflow Node
- **Workflow**: `upload_files`
- **Datos de Entrada**:
```json
{
  "file_name": "{{ $json.file_name }}",
  "file_bucket": "{{ $json.file_bucket }}",
  "file_route": "{{ $json.file_route }}",
  "file_title": "{{ $json.file_title }}",
  "file_description": "{{ $json.file_description }}",
  "seconds": "{{ $json.seconds }}",
  "user_id": "{{ $json.user_id }}",
  "metadata_json": "{{ $json.metadata_json }}",
  "media_category_id": "{{ $json.media_category_id }}",
  "file": "{{ $json.file }}"
}
```

**Output del Subproceso**:
```json
{
  "media_file_id": 123,
  "file_url": "https://...",
  "file_name": "receipt_1_1_1697123456.pdf",
  "created_at_timestamp": "2024-10-15T10:30:00Z"
}
```

---

### 9. **Function** - Recuperar Datos Adicionales
- **Tipo**: Function Node
- **Código**:
```javascript
const fileResult = $input.first().json;
const preparedData = $('Function - Preparar Datos').first().json;

return [{
  json: {
    media_file_id: fileResult.media_file_id,
    file_url: fileResult.file_url,
    customer_id: preparedData._customer_id,
    event_id: preparedData._event_id,
    reference_number: preparedData._reference_number,
    amount: preparedData._amount,
    payment_date: preparedData._payment_date
  }
}];
```

---

### 10. **Supabase** - Insertar en public.payment_receipt
- **Tipo**: Supabase Node
- **Operación**: `Insert`
- **Tabla**: `public.payment_receipt`
- **Datos**:
```json
{
  "customer_fk": "{{ $json.customer_id }}",
  "media_file_fk": "{{ $json.media_file_id }}",
  "reference_number": "{{ $json.reference_number }}",
  "amount": "{{ $json.amount }}",
  "payment_date": "{{ $json.payment_date }}",
  "status": "Pending",
  "context": {
    "event_id": "{{ $json.event_id }}",
    "event_name": "{{ $('Supabase - Verificar Evento').item.json.name }}"
  }
}
```

**Output**:
```json
[
  {
    "receipt_id": 2,
    "created_at": "2025-10-15T22:56:18.829674+00:00",
    "customer_fk": 1,
    "media_file_fk": 46,
    "reference_number": "REF-123456",
    "amount": 150,
    "payment_date": "2024-10-15T10:30:00+00:00",
    "status": "Pending",
    "validated_by": null,
    "validated_at": null,
    "validation_notes": null,
    "rejection_reason": null,
    "context": {
      "event_id": 1,
      "event_name": "Congreso Nacional de Litigio Estratégico en Amparo 2025"
    }
  }
]
```

---

### 11. **Supabase** - Actualizar Estado del Cliente
- **Tipo**: Supabase Node
- **Operación**: `Update`
- **Tabla**: `public.customer`
- **Filtros**: 
  - `customer_id` = `{{ $('Function - Recuperar Datos').item.json.customer_id }}`
- **Datos**:
```json
{
  "status": "En Validación"
}
```

---

### 12. **Function** - Preparar Respuesta Final
- **Tipo**: Function Node
- **Código**:
```javascript
const receipt = $('Supabase - Insertar Receipt').first().json;
const recoveredData = $('Function - Recuperar Datos').first().json;

return [{
  json: {
    success: true,
    message: "Comprobante subido exitosamente. En espera de validación.",
    data: {
      receipt_id: receipt.receipt_id,
      status: receipt.status,
      file_url: recoveredData.file_url,
      created_at: receipt.created_at
    }
  }
}];
```

---

### 13. **Respond to Webhook** - Enviar Respuesta
- **Tipo**: Respond to Webhook Node
- **Status Code**: 200
- **Body**: `{{ $json }}`

**Respuesta Final**:
```json
{
  "success": true,
  "message": "Comprobante subido exitosamente. En espera de validación.",
  "data": {
    "receipt_id": 456,
    "status": "Pending",
    "file_url": "https://...",
    "created_at": "2024-10-15T10:30:00Z"
  }
}
```

---

## Manejo de Errores

### Error Node (conectar a todos los nodos)
- **Tipo**: Function Node
- **Código**:
```javascript
const error = $input.first().json.error || $input.first().json;

return [{
  json: {
    success: false,
    error: error.message || 'Error desconocido',
    timestamp: new Date().toISOString()
  }
}];
```

### Respond to Webhook (Error)
- **Status Code**: 400 o 500
- **Body**: `{{ $json }}`

---

## Variables de Entorno Requeridas

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

---

## Diagrama de Flujo (Actualizado - Usando Subproceso)

```
Webhook
  ↓
Validar Datos
  ↓
Verificar Cliente → [IF] Cliente Existe?
  ↓ (True)
Verificar Evento → [IF] Evento Activo?
  ↓ (True)
Preparar Datos para Subproceso
  ↓
Execute Workflow (Subproceso de Carga) ← ✅ REUTILIZA TU SUBPROCESO
  ↓ (retorna media_file_id, file_url)
Recuperar Datos Adicionales
  ↓
Insertar en payment_receipt
  ↓
Actualizar Cliente (status = "En Validación")
  ↓
Preparar Respuesta
  ↓
Respond to Webhook (200 OK)
```

---

## Notas Importantes

1. **Seguridad**: Usar `service_role_key` solo en n8n (backend)
2. **Validación**: Verificar tamaño máximo de archivo (5MB)
3. **Formatos**: Solo permitir PDF, JPG, PNG
4. **Notificaciones**: Agregar nodo para notificar a admins (opcional)
5. **Logs**: Guardar en tabla de logs para auditoría
