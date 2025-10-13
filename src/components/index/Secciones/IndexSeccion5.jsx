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
    // Scroll a datos bancarios
    const paymentSection = document.getElementById('payment-info');
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      id="inscripcion"
    >
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

        {/* Grid 2 columnas: Datos de pago (izq) + Pricing card (der) */}
        <div className={styles.twoColumnGrid}>
          
          {/* COLUMNA IZQUIERDA: Información de pago */}
          <div className={styles.paymentInfoCard} id="payment-info">
            <h3 className={styles.paymentTitle}>
              <span className={styles.paymentIcon}>�</span>
              {t.paymentInfo.title}
            </h3>
            
            <div className={styles.paymentDetails}>
              <div className={styles.paymentRow}>
                <span className={styles.paymentLabel}>Banco:</span>
                <span className={styles.paymentValue}>{t.paymentInfo.bank}</span>
              </div>
              
              <div className={styles.paymentRow}>
                <span className={styles.paymentLabel}>CLABE:</span>
                <div className={styles.clabeWrapper}>
                  <span className={styles.paymentValue}>{t.paymentInfo.clabe}</span>
                  <button 
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText(t.paymentInfo.clabe);
                      alert('CLABE copiada al portapapeles');
                    }}
                    title="Copiar CLABE"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className={styles.paymentRow}>
                <span className={styles.paymentLabel}>Nombre de la cuenta:</span>
                <span className={styles.paymentValue}>{t.paymentInfo.accountName}</span>
              </div>
            </div>

            <div className={styles.instructionsBox}>
              <p className={styles.instructions}>
                <strong>📧 {t.paymentInfo.instructions}</strong>
              </p>
              <p className={styles.note}>
                <strong>⚠️ Importante:</strong> {t.paymentInfo.note}
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: Card principal de pricing */}
          <div className={styles.pricingCard}>
            
            {/* Badge de descuento */}
            <div className={styles.badgeDiscount}>
              <span className={styles.badgeIcon}>�</span>
              <span>{t.badgeDiscount}</span>
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
                {t.includes.items.map((item, index) => (
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
                <span className={styles.ctaArrow}>→</span>
              </button>
              <a 
                href="mailto:congreso@abogadosliberales.mx?subject=Consulta descuento grupos" 
                className={styles.ctaSecondary}
              >
                {t.ctaSecondary}
              </a>
            </div>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>🏆</span>
                <span className={styles.trustText}>Certificado oficial</span>
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>🎓</span>
                <span className={styles.trustText}>Avalado por magistrados</span>
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>⏳</span>
                <span className={styles.trustText}>Cupo limitado: 250 asistentes</span>
              </div>
            </div>
          </div>

        </div>
        {/* Fin del grid de 2 columnas */}

      </div>
    </section>
  );
};

export default IndexSeccion5;
