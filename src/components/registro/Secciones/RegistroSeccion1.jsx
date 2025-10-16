import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/registroSeccion1.module.css';

const RegistroSeccion1 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerContainer}>
        <div className={styles.bannerContent}>
          
          <div className={styles.bannerLeft}>
            <div className={styles.iconCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3.5 7v5.5c0 5.32 3.36 10.28 8.5 12 5.14-1.72 8.5-6.68 8.5-12V7L12 2z" fill="#EECB00" stroke="#020266" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className={styles.bannerText}>
              <h1 className={styles.bannerTitle}>{t.hero.title}</h1>
              <p className={styles.bannerLema}>¡Que la luz de la razón brille en la justicia!</p>
            </div>
          </div>

          <div className={styles.bannerRight}>
            <div className={styles.priceBox}>
              <span className={styles.priceLabel}>{ingles ? "Investment" : "Inversión"}</span>
              <span className={styles.priceAmount}>$1,990</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistroSeccion1;
