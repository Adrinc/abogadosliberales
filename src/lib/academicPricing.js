/**
 * SISTEMA DE PRECIOS ACADÉMICOS - UNAM/UVM/UAM
 * 
 * Reglas de negocio:
 * - Precio general: $990 MXN
 * - Profesor/Posgrado: $490 MXN (50% desc)
 * - Estudiante Licenciatura: $250 MXN (75% desc)
 * - Paquete 11 (Profesor/Posgrado): $4,900 MXN | 3/6/12 MSI
 * 
 * Mapeo a customer_category_fk:
 * 5 → Profesor
 * 6 → Estudiante Posgrado
 * 7 → Estudiante Licenciatura
 * 
 * Mapeo a price_key (backend/Stripe):
 * - precio_lista_congreso: $990 MXN (entrada general)
 * - precio_prof_estud_pos: $490 MXN (profesor/posgrado - personal académico)
 * - precio_estudiante_lic: $250 MXN (estudiante licenciatura)
 * - precio_mem_anual_congreso: $3,850 MXN (membresía anual de la barra)
 */

// Precios base
export const PRICES = {
  GENERAL: 990,
  ACADEMICO: 490, // Profesor y Posgrado (50% desc)
  LICENCIATURA: 250, // Estudiante Licenciatura (75% desc)
  PAQUETE_11: 4900 // 11 entradas académicas: $490 × 10 = $4,900 (la 11ª gratis)
};

// Mapeo de roles académicos a customer_category_fk en la BD
export const ROLE_TO_CUSTOMER_CATEGORY = {
  profesor: 5,        // Profesor
  posgrado: 6,        // Estudiante Posgrado
  licenciatura: 7     // Estudiante Licenciatura
};

// Función helper para obtener customer_category_fk desde el rol
export const getCustomerCategoryFk = (role) => {
  return ROLE_TO_CUSTOMER_CATEGORY[role] || null;
};

// Configuración MSI por rol
export const MSI_CONFIG = {
  ACADEMICO: {
    availableMonths: [3],
    3: 163.33 // $490 / 3 = $163.33/mes (profesor/posgrado)
  },
  LICENCIATURA: {
    availableMonths: [3],
    3: 83.33 // $250 / 3 = $83.33/mes (licenciatura)
  },
  PAQUETE_11: {
    availableMonths: [3, 6, 12],
    3: 1633.33,  // $4,900 / 3
    6: 816.67,   // $4,900 / 6
    12: 408.33   // $4,900 / 12
  }
};

// Universidades válidas
export const VALID_UNIVERSITIES = ['UNAM', 'UVM', 'UAM'];

// Roles académicos
export const ACADEMIC_ROLES = {
  PROFESOR: 'profesor',
  POSGRADO: 'posgrado',
  LICENCIATURA: 'licenciatura'
};

/**
 * Calcula el precio final y opciones MSI según datos académicos
 * 
 * @param {Object} academicData - Datos de elegibilidad académica
 * @param {boolean} academicData.isAcademic - Si pertenece a institución
 * @param {string} academicData.university - UNAM | UVM | UAM
 * @param {string} academicData.role - profesor | posgrado | licenciatura
 * @param {string} academicData.paymentPlan - single | msi3 | msi6 | msi12
 * @param {boolean} academicData.isPaquete11 - Si eligió paquete grupal
 * 
 * @returns {Object} { finalPrice, basePrice, discount, msiOptions, monthlyAmount, savings }
 */
export function calculateAcademicPrice(academicData = {}) {
  // Si no es académico, retornar precio general
  if (!academicData.isAcademic) {
    return {
      finalPrice: PRICES.GENERAL,
      basePrice: PRICES.GENERAL,
      discount: 0,
      discountPercentage: 0,
      msiOptions: [],
      monthlyAmount: null,
      savings: 0,
      isAcademic: false
    };
  }

  // Validar universidad
  if (!VALID_UNIVERSITIES.includes(academicData.university)) {
    throw new Error(`Universidad inválida: ${academicData.university}. Debe ser UNAM, UVM o UAM.`);
  }

  // Determinar precio base según rol
  let basePrice = PRICES.GENERAL;
  let finalPrice = PRICES.GENERAL;
  let msiConfig = null;
  let roleKey = null;

  // Paquete 11 tiene prioridad
  if (academicData.isPaquete11) {
    basePrice = PRICES.GENERAL * 11; // $10,890 (11 × $990)
    finalPrice = PRICES.PAQUETE_11;  // $4,900 (11 × $490, paga 10)
    msiConfig = MSI_CONFIG.PAQUETE_11;
    roleKey = 'PAQUETE_11';
  } 
  // Cualquier rol académico - precios diferenciados
  else if (academicData.role === ACADEMIC_ROLES.LICENCIATURA) {
    basePrice = PRICES.GENERAL;  // $990
    finalPrice = PRICES.LICENCIATURA; // $250 (75% desc)
    msiConfig = MSI_CONFIG.LICENCIATURA;
    roleKey = 'LICENCIATURA';
  }
  else if (
    academicData.role === ACADEMIC_ROLES.PROFESOR || 
    academicData.role === ACADEMIC_ROLES.POSGRADO
  ) {
    basePrice = PRICES.GENERAL;  // $990
    finalPrice = PRICES.ACADEMICO; // $490 (50% desc)
    msiConfig = MSI_CONFIG.ACADEMICO;
    roleKey = 'ACADEMICO';
  }
  else {
    throw new Error(`Rol inválido: ${academicData.role}`);
  }

  // Calcular descuento
  const discount = basePrice - finalPrice;
  const discountPercentage = Math.round((discount / basePrice) * 100);

  // Calcular monto mensual si hay plan MSI
  let monthlyAmount = null;
  if (academicData.paymentPlan && academicData.paymentPlan.startsWith('msi')) {
    const months = parseInt(academicData.paymentPlan.replace('msi', ''));
    
    if (msiConfig && msiConfig.availableMonths.includes(months)) {
      monthlyAmount = msiConfig[months];
    }
  }

  return {
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    basePrice: parseFloat(basePrice.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    discountPercentage,
    msiOptions: msiConfig ? msiConfig.availableMonths : [],
    monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount.toFixed(2)) : null,
    savings: parseFloat(discount.toFixed(2)),
    isAcademic: true,
    roleKey,
    university: academicData.university
  };
}

/**
 * Obtiene las opciones MSI disponibles para un rol
 * 
 * @param {string} role - profesor | posgrado | licenciatura
 * @param {boolean} isPaquete11 - Si es paquete grupal
 * @returns {Array<Object>} Array con { months, monthlyAmount }
 */
export function getMSIOptions(role, isPaquete11 = false) {
  let config = null;

  if (isPaquete11) {
    config = MSI_CONFIG.PAQUETE_11;
  } else if (role === ACADEMIC_ROLES.LICENCIATURA) {
    config = MSI_CONFIG.LICENCIATURA;
  } else {
    // Profesor y Posgrado
    config = MSI_CONFIG.ACADEMICO;
  }

  if (!config) return [];

  return config.availableMonths.map(months => ({
    months,
    monthlyAmount: config[months],
    label: `${months} MSI`,
    description: `$${config[months].toFixed(2)}/mes`
  }));
}

/**
 * Valida si un usuario puede acceder al paquete de 11
 * Todos los roles académicos pueden acceder
 * 
 * @param {string} role - Rol académico
 * @returns {boolean}
 */
export function canAccessPaquete11(role) {
  return (
    role === ACADEMIC_ROLES.PROFESOR || 
    role === ACADEMIC_ROLES.POSGRADO || 
    role === ACADEMIC_ROLES.LICENCIATURA
  );
}

/**
 * Formatea precio en MXN
 * 
 * @param {number} amount - Cantidad
 * @returns {string} Precio formateado ($990.00 MXN)
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Genera resumen de precio para mostrar al usuario
 * 
 * @param {Object} priceData - Resultado de calculateAcademicPrice()
 * @returns {Object} Texto listo para mostrar
 */
export function getPriceSummary(priceData) {
  if (!priceData.isAcademic) {
    return {
      title: 'Precio General',
      amount: formatPrice(priceData.finalPrice),
      badge: null,
      description: 'Congreso Nacional de Amparo y Derechos Humanos 2025'
    };
  }

  const badge = priceData.discountPercentage > 0 
    ? `−${priceData.discountPercentage}% descuento académico`
    : null;

  let description = `Precio académico ${priceData.university}`;
  
  if (priceData.monthlyAmount) {
    const months = priceData.msiOptions.find(m => 
      MSI_CONFIG[priceData.roleKey][m] === priceData.monthlyAmount
    );
    description += ` • ${formatPrice(priceData.monthlyAmount)}/mes a ${months} MSI`;
  }

  return {
    title: priceData.roleKey === 'PAQUETE_11' ? 'Paquete 11 Participantes' : 'Precio Académico',
    amount: formatPrice(priceData.finalPrice),
    badge,
    description,
    savings: priceData.savings > 0 ? `Ahorras ${formatPrice(priceData.savings)}` : null
  };
}
