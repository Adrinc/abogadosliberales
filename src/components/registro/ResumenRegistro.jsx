import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import { translationsRegistro } from '../../data/translationsRegistro';
import { formatPrice } from '../../lib/academicPricing';
import styles from './resumenRegistro.module.css';

const ResumenRegistro = ({ 
  leadData = null, 
  selectedPaymentMethod = null,
  academicPriceData = null,
  isAcademic = false,
  selectedOption = 1 // 🆕 Opción seleccionada (1: General, 2: Académico, 3: Membresía)
}) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en.summary : translationsRegistro.es.summary;
  
  // Debug: Verificar props recibidas
  console.log('🔍 ResumenRegistro - Props recibidas:', {
    leadData,
    selectedPaymentMethod,
    academicPriceData,
    isAcademic,
    selectedOption
  });
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 🔥 NUEVA LÓGICA: Calcular precio según selectedOption
  let displayPrice = 990; // Default: precio general
  let priceLabel = ingles ? 'General Registration' : 'Inscripción General';
  
  if (selectedOption === 3) {
    // 🆕 OPCIÓN 3: MEMBRESÍA ANUAL
    displayPrice = 3850;
    priceLabel = ingles ? 'Annual Membership' : 'Membresía Anual';
  } else if (selectedOption === 2 && academicPriceData) {
    // 🎓 OPCIÓN 2: ACADÉMICO
    displayPrice = academicPriceData.finalPrice;
    priceLabel = ingles ? 'Academic Price' : 'Precio Académico';
  } else if (selectedOption === 1) {
    // 📋 OPCIÓN 1: GENERAL
    displayPrice = 990;
    priceLabel = ingles ? 'General Registration' : 'Inscripción General';
  }

  const formattedPrice = formatPrice(displayPrice);

  // Datos adicionales si es académico
  const hasDiscount = academicPriceData && academicPriceData.discount > 0;
  const monthlyPayment = academicPriceData?.monthlyAmount;

  const getPaymentButtonText = () => {
    if (!leadData) return null;
    
    // Mapear los valores del tab a los valores esperados
    const methodMap = {
      'paypal': 'paypal',
      'creditCard': 'ippay',
      'bankTransfer': 'transfer'
    };
    
    const mappedMethod = methodMap[selectedPaymentMethod] || selectedPaymentMethod;
    
    switch(mappedMethod) {
      case 'paypal':
        return ingles ? 'Ready to pay with PayPal' : 'Listo para pagar con PayPal';
      case 'ippay':
        return ingles ? 'Ready to pay with card' : 'Listo para pagar con tarjeta';
      case 'transfer':
        return ingles ? 'View bank details' : 'Ver datos bancarios';
      default:
        return ingles ? 'Select payment method' : 'Seleccione método de pago';
    }
  };

  return (
    <div className={`${styles.summaryContainer} ${isCollapsed ? styles.collapsed : ''}`}>
      
      {/* Toggle button (solo móvil, controlado por CSS) */}
      <button 
        className={styles.toggleButton} 
        onClick={toggleCollapse}
        aria-label={isCollapsed ? 'Mostrar resumen' : 'Ocultar resumen'}
      >
        <span className={styles.toggleIcon}>{isCollapsed ? '▼' : '▲'}</span>
        <span className={styles.toggleText}>
          {isCollapsed 
            ? (ingles ? 'Show Summary' : 'Ver Resumen') 
            : (ingles ? 'Hide Summary' : 'Ocultar Resumen')}
        </span>
        <span className={styles.togglePrice}>{formattedPrice}</span>
      </button>

      <div className={`${styles.summaryCard} ${isCollapsed ? styles.hidden : ''}`}>
        
        {/* Logo/Badge */}
        <div className={styles.badgeWrapper}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>⚖️</span>
          </div>
        </div>

        {/* Título del evento */}
        <h2 className={styles.eventTitle}>{t.eventName}</h2>

        {/* Precio destacado */}
        <div className={styles.priceSection}>
          <div className={styles.priceLabel}>{priceLabel}</div>
          <div className={styles.priceAmount}>{formattedPrice}</div>
          
          {/* Badge de descuento académico */}
          {isAcademic && hasDiscount && (
            <div className={styles.academicBadge}>
              <span className={styles.academicBadgeIcon}>🎓</span>
              <span className={styles.academicBadgeText}>
                {ingles 
                  ? `${academicPriceData.discountPercentage}% Academic Discount` 
                  : `${academicPriceData.discountPercentage}% Descuento Académico`}
              </span>
            </div>
          )}
          
          {/* Información MSI si aplica */}
          {isAcademic && monthlyPayment && (
            <div className={styles.msiInfo}>
              <span className={styles.msiLabel}>
                {ingles ? 'Monthly payment:' : 'Pago mensual:'}
              </span>
              <span className={styles.msiAmount}>{formatPrice(monthlyPayment)}</span>
            </div>
          )}
        </div>

        {/* Datos del Lead (si existen) */}
        {leadData && (
          <div className={styles.leadDataSection}>
            <h3 className={styles.leadDataTitle}>
              {ingles ? 'Your Registration' : 'Tu Registro'}
            </h3>
            <div className={styles.leadDataItem}>
              <span className={styles.leadDataLabel}>{ingles ? 'Name:' : 'Nombre:'}</span>
              <span className={styles.leadDataValue}>{leadData.name}</span>
            </div>
            <div className={styles.leadDataItem}>
              <span className={styles.leadDataLabel}>{ingles ? 'Email:' : 'Correo:'}</span>
              <span className={styles.leadDataValue}>{leadData.email}</span>
            </div>
            <div className={styles.leadDataItem}>
              <span className={styles.leadDataLabel}>{ingles ? 'Phone:' : 'Teléfono:'}</span>
              <span className={styles.leadDataValue}>{leadData.phone}</span>
            </div>
          </div>
        )}

        {/* Detalles del evento */}
        <div className={styles.detailsSection}>
          
          {/* Fechas */}
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>📅</span>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>{t.dates.label}</div>
              <div className={styles.detailValue}>{t.dates.value}</div>
            </div>
          </div>

          {/* Sede */}
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>📍</span>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>{t.venue.label}</div>
              <div className={styles.detailValue}>{t.venue.value}</div>
              <div className={styles.detailSubvalue}>{t.venue.location}</div>
            </div>
          </div>

          {/* Horario */}
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>⏰</span>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>{t.schedule.label}</div>
              <div className={styles.detailValue}>{t.schedule.value}</div>
            </div>
          </div>

        </div>

        {/* Beneficios incluidos */}
        <div className={styles.benefitsSection}>
          <h3 className={styles.benefitsTitle}>{t.benefits.title}</h3>
          <ul className={styles.benefitsList}>
            {t.benefits.items.map((benefit, index) => (
              <li key={index} className={styles.benefitItem}>
        
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Status (si hay leadData y método seleccionado) */}
        {leadData && selectedPaymentMethod && (
          <div className={styles.paymentStatus}>
            <div className={styles.paymentStatusIcon}>
              {(selectedPaymentMethod === 'paypal') && '💳'}
              {(selectedPaymentMethod === 'creditCard') && '💰'}
              {(selectedPaymentMethod === 'bankTransfer') && '🏦'}
            </div>
            <p className={styles.paymentStatusText}>{getPaymentButtonText()}</p>
            
            {selectedPaymentMethod === 'bankTransfer' && (
              <div className={styles.bankInstructions}>
                <small>
                  {ingles 
                    ? 'Complete the form below to upload your receipt' 
                    : 'Complete el formulario para subir su comprobante'}
                </small>
              </div>
            )}
          </div>
        )}

        {/* CTA si no hay leadData */}
        {!leadData && (
          <div className={styles.ctaSection}>
            <p className={styles.ctaText}>
              {ingles 
                ? 'Complete the form to continue with payment' 
                : 'Complete el formulario para continuar con el pago'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResumenRegistro;