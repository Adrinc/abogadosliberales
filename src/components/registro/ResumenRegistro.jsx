import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import { translationsRegistro } from '../../data/translationsRegistro';
import styles from './resumenRegistro.module.css';

const ResumenRegistro = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en.summary : translationsRegistro.es.summary;

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryCard}>
        
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
          <div className={styles.priceLabel}>{t.price.label}</div>
          <div className={styles.priceAmount}>{t.price.amount}</div>
          <div className={styles.priceNote}>{t.price.note}</div>
        </div>

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
                <span className={styles.checkIcon}>✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ResumenRegistro;
