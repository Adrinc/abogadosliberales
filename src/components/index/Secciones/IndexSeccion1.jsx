import React, { useEffect, useState } from "react";
import { isEnglish } from '../../../data/variables';
import { useStore } from '@nanostores/react';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from "../css/indexSec1.module.css";

const IndexSeccion1 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.hero : translationsIndex.es.hero;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className={styles.heroSection}>
      {/* Video de fondo */}
      <video className={styles.heroVideo} loop autoPlay muted playsInline>
        <source src="/videos/hero1.mp4" type="video/mp4" />
      </video>

      {/* Overlay azul → negro */}
      <div className={styles.videoOverlay}></div>

      {/* Contenido central */}
      <div className={styles.heroContainer}>
        <div className={`${styles.heroCard} ${isVisible ? styles.visible : ''}`}>
          
          {/* Badge superior pulsante */}
          <div className={styles.badgeWrapper}>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              {t.badge}
            </div>
          </div>

          {/* Título principal */}
          <h1 className={styles.heroTitle}>
            {t.title}
          </h1>

            {/* Descripción */}
          <p className={styles.heroDescription}>
            {t.description}
          </p>

          {/* Fecha y ubicación */}
          <div className={styles.eventInfo}>
            <div className={styles.infoItem}>
              <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{t.date}</span>
            </div>
          </div>

        

          {/* CTAs */}
          <div className={styles.ctaGroup}>
            <a href="/registro" className={styles.ctaPrimary}>
              <span>{t.ctaPrimary}</span>
              <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a href="/#programa" className={styles.ctaSecondary}>
              <span>{t.ctaSecondary}</span>
            </a>
          </div>

          {/* Precio destacado */}
          <div className={styles.priceTag}>
            <span className={styles.priceLabel}>Entrada general</span>
            <span className={styles.priceAmount}>{t.price}</span>
          </div>

          {/* Trust signals */}
          <div className={styles.trustSignals}>
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>{t.trustSignals.certification}</span>
            </div>
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>{t.trustSignals.attendees}</span>
            </div>
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span>{t.trustSignals.experts}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <span className={styles.scrollText}>
          {ingles ? "Scroll" : "Scroll"}
        </span>
        <div className={styles.scrollIcon}></div>
      </div>
    </section>
  );
};

export default IndexSeccion1;