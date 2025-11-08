import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/barristaValidationResult.module.css';

const BarristaValidationResult = ({ validationData, onContinue }) => {
  const ingles = useStore(isEnglish);
  
  // Fallback defensivo para traducciones
  const t = (ingles && translationsRegistro.en && translationsRegistro.en.barristaValidator)
    ? translationsRegistro.en.barristaValidator.results
    : (translationsRegistro.es && translationsRegistro.es.barristaValidator)
      ? translationsRegistro.es.barristaValidator.results
      : {};

  // 🚫 CASO 1: Usuario bloqueado
  if (validationData.blocked) {
    return (
      <div className={`${styles.resultCard} ${styles.blocked}`}>
        <div className={styles.iconWrapper}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={styles.icon}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{t.blocked?.title || validationData.message}</h3>
          <p className={styles.message}>{t.blocked?.message || validationData.message}</p>
          
          <div className={styles.contactInfo}>
            <span>📧 {t.blocked?.contactEmail || 'soporte@abogadosliberales.mx'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 🎉 CASO 2: Invitado VIP (Gratis)
  if (validationData.type === 'vip') {
    return (
      <div className={`${styles.resultCard} ${styles.vip}`}>
        <div className={styles.iconWrapper}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={styles.icon}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        <div className={styles.content}>
          <span className={styles.badge}>{t.vip?.badge || 'Acceso VIP'}</span>
          <h3 className={styles.title}>{t.vip?.title || validationData.message}</h3>
          <p className={styles.message}>{t.vip?.message || validationData.message}</p>
          
          <div className={styles.priceWrapper}>
            <span className={styles.priceLabel}>{ingles ? 'Price:' : 'Precio:'}</span>
            <span className={styles.priceFree}>{t.vip?.price || '$0 MXN'}</span>
          </div>

          <button onClick={onContinue} className={styles.buttonContinue}>
            {ingles ? 'Continue Registration' : 'Continuar Registro'}
          </button>
        </div>
      </div>
    );
  }

  // 💼 CASO 3: Barrista Activo/Inactivo
  if (validationData.type === 'barrista_activo') {
    return (
      <div className={`${styles.resultCard} ${styles.barrista}`}>
        <div className={styles.iconWrapper}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={styles.icon}
          >
            {/* Icono de balanza */}
            <path d="M12 3v18" />
            <path d="M5 6h14" />
            <path d="M5 6l-2 8h8l-2-8" />
            <path d="M19 6l-2 8h-8l2-8" />
            <path d="M3 21h18" />
          </svg>
        </div>

        <div className={styles.content}>
          <span className={styles.badge}>{t.barristaActivo?.badge || validationData.description}</span>
          <h3 className={styles.title}>{t.barristaActivo?.title || validationData.message}</h3>
          <p className={styles.message}>{t.barristaActivo?.message || validationData.message}</p>
          
          <div className={styles.priceWrapper}>
            <span className={styles.priceLabel}>{ingles ? 'Price:' : 'Precio:'}</span>
            <span className={styles.price}>{t.barristaActivo?.price || `$${validationData.finalPrice.toLocaleString('es-MX')} MXN`}</span>
          </div>

          <p className={styles.description}>
            {t.barristaActivo?.description || validationData.description}
          </p>

          <button onClick={onContinue} className={styles.buttonContinue}>
            {ingles ? 'Continue to Payment' : 'Continuar a Pago'}
          </button>
        </div>
      </div>
    );
  }

  // 🆕 CASO 4: Barrista Nuevo
  if (validationData.type === 'barrista_nuevo') {
    return (
      <div className={`${styles.resultCard} ${styles.nuevo}`}>
        <div className={styles.iconWrapper}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={styles.icon}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>

        <div className={styles.content}>
          <span className={styles.badge}>{t.barristaNuevo?.badge || validationData.description}</span>
          <h3 className={styles.title}>{t.barristaNuevo?.title || validationData.message}</h3>
          <p className={styles.message}>{t.barristaNuevo?.message || validationData.message}</p>
          
          <div className={styles.priceWrapper}>
            <span className={styles.priceLabel}>{ingles ? 'Price:' : 'Precio:'}</span>
            <span className={styles.price}>{t.barristaNuevo?.price || `$${validationData.finalPrice.toLocaleString('es-MX')} MXN`}</span>
          </div>

          <p className={styles.description}>
            {t.barristaNuevo?.description || validationData.description}
          </p>

          <button onClick={onContinue} className={styles.buttonContinue}>
            {ingles ? 'Continue to Payment' : 'Continuar a Pago'}
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

export default BarristaValidationResult;
