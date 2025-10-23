# Correcciones: Step 5 (Pago) y Navegación Step 4↔5

## Problemas Solucionados

### 1. ✅ Botón "Finalizar verificación" oculto en Step 5

**Antes**: El botón "Finalizar" estaba visible en step 5 y no hacía nada útil.

**Ahora**: 
- Step 5 solo muestra botón "Atrás"
- El botón "Siguiente/Finalizar" se oculta completamente: `{currentStep !== 5 && <button>...}</button>`

---

### 2. ✅ Navegación correcta Step 5 → Step 4

**Problema**:
- Al presionar "Atrás" en step 5, debería volver al formulario (step 4)
- Pero mostraba "Información guardada" en lugar del formulario vacío

**Causa**: 
- `leadData` se mantenía en memoria
- `FormularioLead` seguía en estado "completado" aunque `isCompleted={false}`

**Solución**:
```javascript
// En handlePrevious()
const handlePrevious = () => {
  if (currentStep > 1) {
    // Si venimos del step 5 (pago), limpiar leadData
    if (currentStep === 5) {
      setLeadData(null);      // ← Limpia datos del lead
      setLeadId(null);        // ← Limpia ID del lead
    }
    setCurrentStep(currentStep - 1);
  }
};

// En renderizado de Step 4
<FormularioLead
  key={`form-${leadData ? 'completed' : 'empty'}`}  // ← KEY cambia
  isCompleted={!!leadData}
  {...otrosProps}
/>
```

**Cómo funciona**:
- Cuando `leadData === null`, la `key` cambia a `"form-empty"`
- React **desmonta y vuelve a montar** el componente con sus estados iniciales
- El formulario vuelve a estar vacío ✅

---

## Flujo de Navegación Ahora Correcto

### ✅ Forward (Siguiente)
1. **Step 1** → "Siguiente" → Step 2
2. **Step 2** → "Siguiente" → Step 3
3. **Step 3** → "Siguiente" → Step 4
4. **Step 4** → Completar formulario → Auto-avanza a Step 5
5. **Step 5** → Sin botón "Siguiente" (solo "Atrás")

### ✅ Backward (Atrás)
1. **Step 5** → "Atrás" → Step 4 (formulario vacío) ← AHORA FUNCIONA
2. **Step 4** → "Atrás" → Step 3
3. **Step 3** → "Atrás" → Step 2
4. **Step 2** → "Atrás" → Step 1
5. **Step 1** → Sin botón "Atrás" (es el primero)

---

## Cambios en `AcademicStepper.jsx`

### 1. handlePrevious() - Nueva lógica
```javascript
const handlePrevious = () => {
  if (currentStep > 1) {
    if (currentStep === 5) {
      setLeadData(null);
      setLeadId(null);
    }
    setCurrentStep(currentStep - 1);
  }
};
```

### 2. Navigation Buttons - Botón "Finalizar" oculto en Step 5
```jsx
{/* El botón "Finalizar" se oculta en step 5 */}
{currentStep !== 5 && (
  <button onClick={handleNext} className={styles.btnPrimary}>
    {isSubmitting ? t.messages.completing : t.navigation.next}
  </button>
)}
```

### 3. FormularioLead - Key dinámica
```jsx
<FormularioLead
  key={`form-${leadData ? 'completed' : 'empty'}`}
  ref={formRef}
  onSubmit={handleLeadSubmit}
  isCompleted={!!leadData}
  customerCategoryFk={getCustomerCategoryFk(academicData.role)}
/>
```

---

## Testing

### ✅ Caso 1: Forward completo
1. Activa toggle académico
2. Completa Steps 1-3 (Universidad, Rol, Verificación)
3. Completa Step 4 (Datos personales)
4. **Verificar**: Step 5 solo muestra "Atrás", sin botón "Siguiente" ✅

### ✅ Caso 2: Back desde Step 5
1. En Step 5, presiona "Atrás"
2. **Verificar**: Vuelve a Step 4 con formulario VACÍO (no "Información guardada") ✅
3. Puedes llenar el formulario nuevamente
4. Avanza a Step 5 de nuevo

### ✅ Caso 3: Múltiples idas y venidas
1. Forward → Step 4, llena formulario, Step 5
2. Atrás → Step 4, formulario vacío
3. Llena nuevamente, Step 5
4. **Verificar**: Botones de pago responden correctamente ✅
5. Atrás → Step 4, etc.

---

## Nota Técnica: React Keys

Cuando cambias la `key` de un componente en React:
- **Desmonta** el componente anterior
- **Monta** uno nuevo con la misma key
- Los estados internos se **reinician** al crear la nueva instancia

Por eso funcionaba el "Información guardada" aunque `isCompleted` fuera false: el estado interno de `FormularioLead` conservaba los datos.

Ahora, con la key dinámica, cada vez que `leadData` cambia, React remonta el componente y limpia automáticamente. ✅
