// barristaPricing.js
// Lógica de pricing y categorización para miembros de la Barra

/**
 * Calcula el precio y categoría según la respuesta del API de validación
 * @param {Object} apiResponse - Respuesta del API /congreso_nacional_search_phone
 * @returns {Object} Datos procesados para el flujo barrista
 */
export const calculateBarristaData = (apiResponse) => {
  // 🚫 CASO 1: Usuario bloqueado (ya compró boleto para este evento)
  if (apiResponse.valid === false) {
    return {
      valid: false,
      blocked: true,
      message: 'Este teléfono ya tiene un registro confirmado para el evento',
      customerCategoryId: null,
      priceKey: null,
      finalPrice: null,
      type: null
    };
  }

  // 🎉 CASO 2: Invitado VIP (acceso gratuito)
  if (apiResponse.valid === true && apiResponse.founded === true && apiResponse.list === 'invitados') {
    return {
      valid: true,
      blocked: false,
      founded: true,
      list: 'invitados',
      message: '¡Eres invitado especial! Tu acceso es GRATUITO',
      customerCategoryId: 8, // VIP
      priceKey: null, // No requiere Stripe
      finalPrice: 0,
      type: 'vip',
      requiresPayment: false,
      icon: '🎉'
    };
  }

  // 💼 CASO 3: Barrista (activo o inactivo)
  if (apiResponse.valid === true && apiResponse.founded === true && apiResponse.list === 'baristas') {
    return {
      valid: true,
      blocked: false,
      founded: true,
      list: 'baristas',
      message: 'Eres miembro de la Barra. Solo pagas la anualidad',
      customerCategoryId: 4, // Miembro Barra
      priceKey: 'price_barrista_anualidad_temp_2025', // 🔥 Temporal - reemplazar con key real
      finalPrice: 3850,
      type: 'barrista_activo',
      requiresPayment: true,
      icon: '⚖️',
      description: 'Anualidad 2do año en adelante'
    };
  }

  // 🆕 CASO 4: Nuevo miembro (nunca ha sido barrista)
  if (apiResponse.valid === true && apiResponse.founded === false) {
    return {
      valid: true,
      blocked: false,
      founded: false,
      list: null,
      message: '¡Bienvenido! Pagas inscripción + anualidad',
      customerCategoryId: 4, // Miembro Barra (mismo que activos)
      priceKey: 'price_barrista_inscripcion_temp_2025', // 🔥 Temporal - reemplazar con key real
      finalPrice: 3850,
      type: 'barrista_nuevo',
      requiresPayment: true,
      icon: '🆕',
      description: 'Inscripción + 1er año'
    };
  }

  // ⚠️ FALLBACK: No debería llegar aquí
  console.error('❌ Respuesta inesperada del API:', apiResponse);
  return {
    valid: false,
    blocked: false,
    message: 'Error al procesar la validación. Intenta nuevamente',
    customerCategoryId: null,
    priceKey: null,
    finalPrice: null,
    type: null
  };
};

/**
 * Valida el formato del teléfono antes de enviar al API
 * @param {string} phone - Número telefónico a validar
 * @returns {Object} { valid: boolean, cleaned: string | null, error: string | null }
 */
export const validatePhoneFormat = (phone) => {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      cleaned: null,
      error: 'El teléfono es obligatorio'
    };
  }

  // Limpiar espacios y guiones
  const cleaned = phone.trim();

  // Validar que tenga formato internacional (+código país)
  const internationalPhoneRegex = /^\+\d{1,4}\s?\d{2,4}\s?\d{3,4}\s?\d{4}$/;
  
  if (!internationalPhoneRegex.test(cleaned)) {
    return {
      valid: false,
      cleaned: null,
      error: 'Formato inválido. Usa formato internacional: +52 55 1234 5678'
    };
  }

  return {
    valid: true,
    cleaned: cleaned,
    error: null
  };
};

/**
 * Normaliza el teléfono para enviar al API (quita espacios)
 * @param {string} phone - Número telefónico
 * @returns {string} Teléfono sin espacios
 */
export const normalizePhone = (phone) => {
  return phone.replace(/\s/g, '');
};

/**
 * Obtiene el nombre legible de la categoría de cliente
 * @param {number} categoryId - ID de customer_category
 * @returns {string} Nombre de la categoría
 */
export const getCategoryName = (categoryId) => {
  const categories = {
    1: 'Cliente Residencial',
    2: 'Cliente Empresarial',
    3: 'Sucursal Empresarial',
    4: 'Miembro Barra',
    5: 'Estudiante Posgrado',
    6: 'Estudiante Licenciatura',
    7: 'Profesor',
    8: 'VIP'
  };

  return categories[categoryId] || 'Desconocido';
};

/**
 * Verifica si una categoría es académica
 * @param {number} categoryId - ID de customer_category
 * @returns {boolean}
 */
export const isAcademicCategory = (categoryId) => {
  return [5, 6, 7].includes(categoryId);
};

/**
 * Verifica si una categoría es barrista
 * @param {number} categoryId - ID de customer_category
 * @returns {boolean}
 */
export const isBarristaCategory = (categoryId) => {
  return [4, 8].includes(categoryId); // 4=Miembro Barra, 8=VIP
};

/**
 * Obtiene el mensaje de redirección según categoría existente
 * @param {number} categoryId - ID de customer_category existente
 * @returns {string} Mensaje para el usuario
 */
export const getCategoryRedirectMessage = (categoryId) => {
  if (isAcademicCategory(categoryId)) {
    return '⚠️ Este teléfono está registrado como académico. Por favor usa el formulario académico.';
  }
  
  if (isBarristaCategory(categoryId)) {
    return '⚠️ Este teléfono está registrado como miembro de la Barra. Por favor usa el formulario de membresías.';
  }
  
  return '⚠️ Este teléfono ya está registrado. Por favor verifica tu categoría.';
};
