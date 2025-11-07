import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec5.module.css';

const IndexSeccion5 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.inscripcion : translationsIndex.es.inscripcion;
  
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handlePrimaryClick = () => {
    // Redirigir a la página de registro
    window.location.href = '/registro';
  };

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      id="inscripcion"
    >
      {/* Orb luminoso azul inferior (pseudo-elemento adicional) */}
      <div className={styles.orbBlue}></div>
      
      {/* Partículas flotantes decorativas */}
      <div className={styles.particles}>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
      </div>
      
      <div className={styles.container}>
        
        {/* Label superior */}
        <div className={styles.labelWrapper}>
          <span className={styles.label}>{t.label}</span>
        </div>

        {/* Título y subtítulo */}
        <div className={styles.headerWrapper}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        {/* Grid 2 columnas balanceadas y elegantes para desktop */}
        <div className={styles.pricingWrapper}>
          
          {/* Columna izquierda - Imagen hero con overlay refinado */}
          <div className={styles.heroImageColumn}>
            <div className={styles.imageWrapper}>
              <img 
                src="/image/backgrounds/bg_banner2.jpg" 
                alt="Congreso Nacional de Amparo y Derechos Humanos"
                className={styles.heroImage}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.overlayContent}>
                  <div className={styles.overlayIconWrapper}>
                    <div className={styles.overlayIcon}>⚖️</div>
                  </div>
                  <h3 className={styles.overlayTitle}>{t.imageOverlay?.title || "Congreso Nacional de Amparo"}</h3>
                  <p className={styles.overlaySubtitle}>{t.imageOverlay?.subtitle || "22 de Noviembre, 2025"}</p>
                  <div className={styles.overlayStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>9</span>
                      <span className={styles.statLabel}>Conferencias</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>9</span>
                      <span className={styles.statLabel}>Expertos</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>1</span>
                      <span className={styles.statLabel}>Día Intenso</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Pricing card */}
          <div className={styles.pricingCard}>

            {/* Badge académico (descuento) */}
            <div className={styles.academicBadgeWrapper}>
              <div className={styles.academicBadge}>
                <svg className={styles.academicIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <span>{t.academicBadge}</span>
              </div>
            </div>

            {/* Precio destacado */}
            <div className={styles.priceWrapper}>
              <div className={styles.priceContainer}>
                <span className={styles.currency}>{t.currency}</span>
                <span className={styles.price}>{t.price}</span>
              </div>
              <p className={styles.priceDescription}>{t.priceDescription}</p>
            </div>

            {/* Lista de beneficios */}
            <div className={styles.includesWrapper}>
              <h3 className={styles.includesTitle}>{t.includes.title}</h3>
              <ul className={styles.includesList}>
                {t.includes.items
                  .filter(item => !item.toLowerCase().includes('coffee') && !item.toLowerCase().includes('café'))
                  .map((item, index) => (
                    <li 
                      key={index} 
                      className={styles.includeItem}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className={styles.checkIcon}>✓</span>
                      <span className={styles.includeText}>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className={styles.ctaWrapper}>
              <button 
                className={styles.ctaPrimary}
                onClick={handlePrimaryClick}
              >
                {t.ctaPrimary}
              </button>
            </div>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>🎓</span>
                <span className={styles.trustText}>Impartido por magistrados</span>
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>⏳</span>
                <span className={styles.trustText}>Cupo limitado</span>
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>🔒</span>
                <span className={styles.trustText}>Pago 100% seguro</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default IndexSeccion5;
