import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/barristaToggle.module.css';

const BarristaToggle = ({ isBarrista, onToggle, isDisabled = false }) => {
  const ingles = useStore(isEnglish);
  
  // Fallback defensivo para traducciones
  const t = (ingles && translationsRegistro.en && translationsRegistro.en.barristaToggle)
    ? translationsRegistro.en.barristaToggle
    : (translationsRegistro.es && translationsRegistro.es.barristaToggle)
      ? translationsRegistro.es.barristaToggle
      : {
          title: ingles ? "Bar Member" : "¿Eres miembro de la Barra?",
          subtitle: ingles 
            ? "Active members, inactive members, or wish to join" 
            : "Miembros activos, inactivos, o deseas unirte",
          activeMessage: ingles 
            ? "Bar member registration enabled" 
            : "Registro de miembro habilitado",
          disabledWarning: ingles
            ? "Cannot combine with academic discount"
            : "No se puede combinar con descuento académico"
        };

  const handleToggleClick = (e) => {
    // Prevenir propagación si se hace clic en el label/input
    e.stopPropagation();
    
    if (isDisabled) {
      alert(t.disabledWarning);
      return;
    }
    
    onToggle();
  };

  return (
    <div 
      className={`${styles.toggleCard} ${isBarrista ? styles.active : ''} ${isDisabled ? styles.disabled : ''}`}
      onClick={handleToggleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleClick(e);
        }
      }}
    >
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
          {/* Icono de balanza de la justicia */}
          <path d="M12 3v18" />
          <path d="M5 6h14" />
          <path d="M5 6l-2 8h8l-2-8" />
          <path d="M19 6l-2 8h-8l2-8" />
          <path d="M3 21h18" />
        </svg>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{t.title}</h3>
        <p className={styles.subtitle}>{t.subtitle}</p>
        
        {isBarrista && (
          <span className={styles.badge}>
            {t.activeMessage}
          </span>
        )}
      </div>

      <label className={styles.switchWrapper} onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={isBarrista}
          onChange={(e) => {
            e.stopPropagation();
            if (!isDisabled) {
              onToggle();
            }
          }}
          disabled={isDisabled}
          className={styles.switchInput}
        />
        <span className={styles.switchSlider}></span>
      </label>
    </div>
  );
};

export default BarristaToggle;
