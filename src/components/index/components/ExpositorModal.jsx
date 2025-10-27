import React, { useEffect, useState } from 'react';
import { isEnglish } from '../../../data/variables';
import { useStore } from '@nanostores/react';
import { translationsExpositores } from '../../../data/translationsExpositores';
import styles from '../css/expositorModal.module.css';

const ExpositorModal = ({ expositor, onClose }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsExpositores.en.modal : translationsExpositores.es.modal;
  const expositorData = ingles ? translationsExpositores.en[expositor.id] : translationsExpositores.es[expositor.id];
  const [isClosing, setIsClosing] = useState(false);

  // Función para manejar el cierre con fade-out
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Duración del fade-out (igual a la animación CSS)
  };

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!expositorData) return null;

  return (
    <div 
      className={`${styles.modalOverlay} ${isClosing ? styles.fadeOut : ''}`} 
      onClick={handleClose}
    >
      <div 
        className={`${styles.modalContainer} ${isClosing ? styles.slideDown : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Botón cerrar */}
        <button className={styles.closeButton} onClick={handleClose} aria-label={t.closeButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header con imagen y nombre */}
        <div className={styles.modalHeader}>
          <div className={styles.imageWrapper}>
            <img 
              src={expositorData.image} 
              alt={expositorData.name}
              className={styles.expositorImage}
            />
            <div className={styles.imageGlow}></div>
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.expositorName}>{expositorData.name}</h2>
            <p className={styles.expositorTitle}>{expositorData.title}</p>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className={styles.modalContent}>
          
          {/* Formación y Experiencia */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              {t.formacionTitle}
            </h3>
            <ul className={styles.list}>
              {expositorData.formacion.map((item, index) => (
                <li key={index} className={styles.listItem}>
                  <div className={styles.bulletPoint}></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiencia Profesional */}
          {expositorData.experiencia && expositorData.experiencia.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                {ingles ? 'Professional Experience' : 'Experiencia Profesional'}
              </h3>
              <ul className={styles.list}>
                {expositorData.experiencia.map((item, index) => (
                  <li key={index} className={styles.listItem}>
                    <div className={styles.bulletPoint}></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ámbito Profesional */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              {t.ambitoTitle}
            </h3>
            <ul className={styles.list}>
              {expositorData.ambito.map((item, index) => (
                <li key={index} className={styles.listItem}>
                  <div className={styles.bulletPoint}></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ExpositorModal;
