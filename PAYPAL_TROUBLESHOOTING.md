# 🐛 Troubleshooting PayPal - Solución Aplicada

## Problema Reportado

**Síntoma**: El iframe de PayPal no se muestra al cargar la página, y al cambiar entre tabs muestra "Cargando PayPal..." indefinidamente.

---

## 🔍 Diagnóstico

### Causas Identificadas:

1. **Script duplicado**: El `useEffect` de React ejecutaba `loadPayPalScript()` cada vez que se cambiaba de tab, añadiendo múltiples scripts de PayPal al DOM.

2. **Cleanup agresivo**: El `return` del `useEffect` removía completamente el script de PayPal del DOM, causando que se perdiera el SDK al cambiar de tab.

3. **Botones duplicados**: Al volver a la tab de PayPal, se intentaba renderizar botones sobre botones existentes sin limpiar el contenedor.

---

## ✅ Soluciones Implementadas

### 1. **Verificación de Script Existente**

**Antes**:
```javascript
const loadPayPalScript = () => {
  if (window.paypal) {
    initializePayPalButton();
    return;
  }

  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=...`;
  // ...
  document.body.appendChild(script);
};
```

**Después**:
```javascript
const loadPayPalScript = () => {
  // 1. Si PayPal ya está cargado, usar directamente@
  if (window.paypal) {
    setIsLoading(false);
    initializePayPalButton();
    return;
  }

  // 2. Si el script ya existe en el DOM, esperar a que cargue
  const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
  if (existingScript) {
    if (window.paypal) {
      setIsLoading(false);
      initializePayPalButton();
    } else {
      existingScript.addEventListener('load', () => {
        setIsLoading(false);
        initializePayPalButton();
      });
    }
    return;
  }

  // 3. Solo crear script nuevo si NO existe
  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=...`;
  // ...
  document.body.appendChild(script);
};
```

**Beneficio**: Evita scripts duplicados y reutiliza el SDK ya cargado.

---

### 2. **Cleanup No Destructivo**

**Antes**:
```javascript
return () => {
  const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
  if (existingScript) {
    existingScript.remove(); // ❌ Remueve el script completamente
  }
};
```

**Después**:
```javascript
return () => {
  // Solo limpiar contenedor de botones, NO el script
  if (paypalContainerRef.current) {
    paypalContainerRef.current.innerHTML = '';
  }
};
```

**Beneficio**: El SDK de PayPal persiste en memoria entre cambios de tab.

---

### 3. **Limpieza de Contenedor Antes de Renderizar**

**Antes**:
```javascript
const initializePayPalButton = () => {
  if (!window.paypal || !paypalContainerRef.current) return;

  window.paypal.Buttons({
    // ...
  }).render(paypalContainerRef.current);
};
```

**Después**:
```javascript
const initializePayPalButton = () => {
  if (!window.paypal || !paypalContainerRef.current) {
    console.log('PayPal not ready:', { paypal: !!window.paypal, container: !!paypalContainerRef.current });
    return;
  }

  // Limpiar contenedor antes de renderizar (evitar duplicados)
  paypalContainerRef.current.innerHTML = '';

  console.log('Initializing PayPal button...');

  window.paypal.Buttons({
    // ...
  }).render(paypalContainerRef.current).then(() => {
    console.log('PayPal button rendered successfully');
  }).catch((error) => {
    console.error('Error rendering PayPal button:', error);
    setPaymentStatus('error');
    // ...
  });
};
```

**Beneficio**: Previene botones duplicados y añade logs para debugging.

---

## 🧪 Cómo Verificar que Funciona

### Paso 1: Ejecutar Dev Server
```powershell
npm run dev
```

### Paso 2: Abrir Consola del Navegador
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña **Console**

### Paso 3: Navegar a la Página de Registro
- Llena el formulario de datos personales
- Haz clic en "Continuar"

### Paso 4: Verificar Logs en Consola

**Logs esperados (exitoso)**:
```
PayPal not ready: {paypal: false, container: true}
Initializing PayPal button...
PayPal button rendered successfully
```

**Logs de error (si algo falla)**:
```
PayPal not ready: {paypal: false, container: false}
Error rendering PayPal button: [error details]
```

### Paso 5: Probar Cambio de Tabs

1. **Ir a tab "PayPal"** → Debe mostrar botones de PayPal
2. **Ir a tab "Tarjeta"** → Cambiar de tab
3. **Volver a tab "PayPal"** → Los botones deben **reaparecer inmediatamente** sin "Cargando..."

**Comportamiento esperado**:
- ✅ Primera carga: "Cargando PayPal..." (2-3 segundos) → Botones aparecen
- ✅ Cambios posteriores entre tabs: Botones aparecen **instantáneamente** (sin mensaje de carga)

---

## 🐞 Si Aún No Funciona

### Verificar Red/CORS

El script de PayPal debe cargar desde:
```
https://www.paypal.com/sdk/js?client-id=AWc8tEOJfCnQv2IX4DlIkHCYX4u6jxdQFICl8JlV-sMGSqkRbK_2o10dufkhJvbT-vWYj9NsxDQDHqZd&currency=MXN&locale=es_MX
```

**En la pestaña Network del navegador**:
1. Busca el archivo `js?client-id=...`
2. Verifica que el **Status** sea `200 OK`
3. Si es `404` o `403`, el Client ID está mal
4. Si es `CORS error`, hay un problema de red/firewall

### Verificar Client ID

El Client ID configurado es:
```
AWc8tEOJfCnQv2IX4DlIkHCYX4u6jxdQFICl8JlV-sMGSqkRbK_2o10dufkhJvbT-vWYj9NsxDQDHqZd
```

**Verificar en PayPal Developer**:
1. Ve a https://developer.paypal.com/dashboard/
2. Apps & Credentials → Sandbox
3. Confirma que el Client ID coincida exactamente

### Limpiar Caché del Navegador

Si el problema persiste:
1. `Ctrl+Shift+Delete` → Limpiar caché
2. O modo incógnito (`Ctrl+Shift+N`)

---

## 📋 Checklist Final

- [ ] Script de PayPal se carga solo una vez
- [ ] `window.paypal` está disponible después de la carga
- [ ] Botones de PayPal se renderizan correctamente
- [ ] Al cambiar de tab a "Tarjeta" y volver a "PayPal", los botones reaparecen instantáneamente
- [ ] No hay errores en la consola del navegador
- [ ] Network tab muestra `js?client-id=...` con status `200 OK`

---

## 🎯 Siguiente Paso

Si todo funciona:
1. **Probar el flujo completo** con cuenta Sandbox de PayPal
2. **Crear página de confirmación** (`/confirmacion.astro`)
3. **Continuar con FASE 5** (IPPAY - formulario de tarjeta)

---

**Nota sobre el Webhook n8n**:
El webhook `https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_paypal_payment` **NO afecta** la carga del botón de PayPal. Solo se llama **después** de que el pago sea exitoso. Si el botón no aparece, el problema es con el SDK de PayPal, no con el webhook.

---

**Fecha de corrección**: 16 de octubre de 2025  
**Archivos modificados**: `PayPalIframe.jsx`  
**Estado**: ✅ Listo para testing
