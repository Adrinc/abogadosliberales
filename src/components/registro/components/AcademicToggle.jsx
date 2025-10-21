import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/academicToggle.module.css';

const AcademicToggle = ({ isAcademic, onToggle }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en.academicToggle : translationsRegistro.es.academicToggle;

  return (
    <div className={styles.toggleContainer}>
      <div className={styles.toggleCard}>
        
        {/* Lado izquierdo: Icono + Texto */}
        <div className={styles.toggleContent}>
          <div className={styles.iconWrapper}>
            <svg 
              className={styles.icon} 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          
          <div className={styles.textWrapper}>
            <h3 className={styles.title}>{t.title}</h3>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
        </div>

        {/* Lado derecho: Toggle Switch */}
        <div className={styles.switchWrapper}>
          <button
            type="button"
            role="switch"
            aria-checked={isAcademic}
            onClick={onToggle}
            className={`${styles.switchButton} ${isAcademic ? styles.switchActive : ''}`}
          >
            <span className={styles.switchTrack}>
              <span className={styles.switchThumb}></span>
            </span>
          </button>
          
          <span className={styles.switchLabel}>
            {isAcademic 
              ? (ingles ? 'Yes' : 'Sí') 
              : (ingles ? 'No' : 'No')}
          </span>
        </div>

      </div>

      {/* Badge informativo (cuando está activado) */}
      {isAcademic && (
        <div className={styles.infoBadge}>
          <svg 
            className={styles.infoBadgeIcon} 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" 
              fill="currentColor"
            />
            <path 
              d="M10 14l-2-2 1.5-1.5L10 11l4-4 1.5 1.5L10 14z" 
              fill="white"
            />
          </svg>
          <span className={styles.infoBadgeText}>{t.activeMessage}</span>
        </div>
      )}
    </div>
  );
};

export default AcademicToggle;
