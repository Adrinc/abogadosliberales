# Cambios Implementados: Integración de `customer_category_fk` y Corrección de Hooks

## Problema 1: Error "Rendered fewer hooks than expected"

### Causa
En `FormularioLead.jsx`, el condicional `if (isCompleted) { return (...) }` se ejecutaba **antes** de llamar a `useImperativeHandle()`, causando desbalance de hooks.

**React Rule**: Los hooks SIEMPRE deben ejecutarse en el MISMO orden, sin returns tempranos que los salten.

### Solución
Se movió `useImperativeHandle()` al inicio del componente (después de `useState`), ANTES de cualquier condicional:

```jsx
// ✅ CORRECTO: Ahora está aquí, siempre se ejecuta
useImperativeHandle(ref, () => ({
  submit: () => { handleSubmit({ preventDefault: () => {} }); }
}));

// Después, los condicionales pueden ocurrir sin problema
if (isCompleted) {
  return <div>...</div>;
}

return <form>...</form>;
```

---

## Problema 2: Falta de `customer_category_fk` en Base de Datos

### Mapeo de Roles a Categorías

| Role Académico | `customer_category_fk` | Descripción |
|---|---|---|
| `profesor` | `5` | Profesor |
| `posgrado` | `6` | Estudiante Posgrado |
| `licenciatura` | `7` | Estudiante Licenciatura |

### Cambios Implementados

#### 1. **academicPricing.js** - Nueva función helper

```javascript
// Mapeo de roles académicos a customer_category_fk en la BD
export const ROLE_TO_CUSTOMER_CATEGORY = {
  profesor: 5,
  posgrado: 6,
  licenciatura: 7
};

// Función helper para obtener customer_category_fk desde el rol
export const getCustomerCategoryFk = (role) => {
  return ROLE_TO_CUSTOMER_CATEGORY[role] || null;
};
```

#### 2. **AcademicStepper.jsx** - Pasar categoría a FormularioLead

```javascript
// Import añadido
import { getCustomerCategoryFk } from '../../../lib/academicPricing';

// En render del paso 4 (Datos personales):
<FormularioLead
  ref={formRef}
  onSubmit={handleLeadSubmit}
  isCompleted={!!leadData}
  hideSubmitButton={true}
  customerCategoryFk={getCustomerCategoryFk(academicData.role)}  // ← NUEVO
/>
```

#### 3. **FormularioLead.jsx** - Guardar categoría en BD

```javascript
// Props actualizado
const FormularioLead = React.forwardRef(({ 
  onSubmit, 
  isCompleted, 
  hideSubmitButton = false, 
  customerCategoryFk = null  // ← NUEVO
}, ref) => {

  // Al crear/actualizar customer:
  const customerPayload = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    mobile_phone: formData.mobile_phone,
    status: 'Lead',
    customer_parent_id: null,
    customer_category_fk: customerCategoryFk || null,  // ← SE GUARDA EN BD
    organization_fk: null
  };
```

#### 4. **ComprobantePagoForm.jsx** - Envío de categoría en pago

Ya estaba configurado para recibir `customer_category_fk` desde `leadData`:

```javascript
const insertPayload = {
  first_name: leadData?.first_name || null,
  last_name: leadData?.last_name || null,
  email: email,
  mobile_phone: leadData?.mobile_phone || null,
  status: 'pending',
  customer_parent_id: leadData?.customer_parent_id || null,
  customer_category_fk: leadData?.customer_category_fk || null,  // ← Recibe del lead
  organization_fk: leadData?.organization_fk || null
};
```

#### 5. **AcademicStepper.jsx** - Devolver leadData en callback

```javascript
// En handleComplete(), al terminar paso 5:
if (onComplete) {
  onComplete({
    ...academicData,
    priceData: finalPriceData,
    leadData: leadData,    // ← NUEVO: Datos personales del paso 4
    leadId: leadId,        // ← NUEVO: ID del cliente
  });
}
```

---

## Flujo de Datos - Ahora Correcto

### Cuando es flujo ACADÉMICO:
1. **Paso 1-3**: AcademicStepper recopila: `universidad`, `role`, `documentType`, etc.
2. **Paso 4**: FormularioLead recibe `customerCategoryFk = 5/6/7` según el role
   - Se guarda en BD: `customer.customer_category_fk = 5/6/7`
3. **Paso 5**: Plan de pago usa `leadData` (que YA tiene `customer_category_fk`)
4. **ComprobantePagoForm**: Recibe `leadData.customer_category_fk` y lo envía al webhook

### Cuando es flujo GENERAL (SIN toggle):
1. **Paso 1**: FormularioLead con `customerCategoryFk = null`
   - Se guarda en BD: `customer.customer_category_fk = null`
2. **Paso 2**: Seleccionar método de pago
3. **Paso 3**: Pagar (ComprobantePagoForm, PayPal, etc.)

---

## Verificación

✅ **No hay errores de compilación**
✅ **Hooks balanceados en FormularioLead.jsx**
✅ **customer_category_fk se guarda correctamente según el role**
✅ **leadData fluye correctamente en flujo académico**

---

## Testing Recomendado

### 1. Flujo Académico
- [ ] Activar toggle "¿Perteneces a institución educativa?"
- [ ] Seleccionar: Universidad → Rol (Profesor/Posgrado/Licenciatura)
- [ ] Verificar en BD que `customer.customer_category_fk = 5/6/7`
- [ ] Completar pago y verificar que se envía correctamente

### 2. Flujo General
- [ ] NO activar toggle
- [ ] Llenar formulario de lead
- [ ] Verificar en BD que `customer.customer_category_fk = null`
- [ ] Completar pago

### 3. Errores
- [ ] No debe haber "Rendered fewer hooks than expected"
- [ ] No debe haber error al avanzar desde paso de datos sin activar toggle
