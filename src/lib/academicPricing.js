/**
 * SISTEMA DE PRECIOS ACADÉMICOS - UNAM/UVM/UAM
 * 
 * Reglas de negocio:
 * - Precio general: $1,990 MXN
 * - Profesor/Posgrado: $1,692 MXN (15% desc) | 3 MSI → $564/mes
 * - Estudiante Licenciatura: $995 MXN (50% desc) | 3 MSI → $331.67/mes
 * - Paquete 11 (Profesor/Posgrado): $16,915 MXN | 3/6/12 MSI
 * 
 * Mapeo a customer_category_fk:
 * 5 → Profesor
 * 6 → Estudiante Posgrado
 * 7 → Estudiante Licenciatura
 * 
 * Mapeo a price_key (backend):
 * - precio_lista_congreso: $1,990 MXN (general)
 * - precio_prof_estud_pos: $1,692 MXN (profesor + posgrado)
 * - precio_estudiante_lic: $995 MXN (licenciatura)
 */

// Precios base
export const PRICES = {
  GENERAL: 1990,
  PROFESOR_POSGRADO: 1692, // ✅ Redondeado de 1691.50 a 1692
  LICENCIATURA: 995,
  PAQUETE_11: 16915
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
  PROFESOR_POSGRADO: {
    availableMonths: [3],
    3: 564 // $1,692 / 3 = $564/mes (redondeado)
  },
  LICENCIATURA: {
    availableMonths: [3],
    3: 331.67 // $995 / 3 = $331.67/mes
  },
  PAQUETE_11: {
    availableMonths: [3, 6, 12],
    3: 5638.33,
    6: 2819.17,
    12: 1409.58
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
    basePrice = PRICES.GENERAL * 11; // $21,890
    finalPrice = PRICES.PAQUETE_11;
    msiConfig = MSI_CONFIG.PAQUETE_11;
    roleKey = 'PAQUETE_11';
  } 
  // Profesor o Posgrado
  else if (
    academicData.role === ACADEMIC_ROLES.PROFESOR || 
    academicData.role === ACADEMIC_ROLES.POSGRADO
  ) {
    basePrice = PRICES.GENERAL;
    finalPrice = PRICES.PROFESOR_POSGRADO;
    msiConfig = MSI_CONFIG.PROFESOR_POSGRADO;
    roleKey = 'PROFESOR_POSGRADO';
  } 
  // Estudiante de Licenciatura
  else if (academicData.role === ACADEMIC_ROLES.LICENCIATURA) {
    basePrice = PRICES.GENERAL;
    finalPrice = PRICES.LICENCIATURA;
    msiConfig = MSI_CONFIG.LICENCIATURA;
    roleKey = 'LICENCIATURA';
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
  } else if (role === ACADEMIC_ROLES.PROFESOR || role === ACADEMIC_ROLES.POSGRADO) {
    config = MSI_CONFIG.PROFESOR_POSGRADO;
  } else if (role === ACADEMIC_ROLES.LICENCIATURA) {
    config = MSI_CONFIG.LICENCIATURA;
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
 * Solo profesores y posgrado
 * 
 * @param {string} role - Rol académico
 * @returns {boolean}
 */
export function canAccessPaquete11(role) {
  return role === ACADEMIC_ROLES.PROFESOR || role === ACADEMIC_ROLES.POSGRADO;
}

/**
 * Formatea precio en MXN
 * 
 * @param {number} amount - Cantidad
 * @returns {string} Precio formateado ($1,990.00 MXN)
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
