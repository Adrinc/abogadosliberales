import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec7.module.css';

const IndexSeccion7 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.sobreBarra : translationsIndex.es.sobreBarra;
  
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

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      id="sobre-barra"
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
          
          {/* Lema en latín */}
          <div className={styles.mottoWrapper}>
            <span className={styles.mottoIcon}>✨</span>
            <p className={styles.mottoLatin}>{t.mottoLatin}</p>
            <span className={styles.mottoIcon}>✨</span>
          </div>
          
          <p className={styles.motto}>{t.motto}</p>
        </div>

        {/* Descripción */}
        <div className={styles.descriptionWrapper}>
          <p className={styles.description}>{t.description}</p>
        </div>

        {/* Grid de pilares */}
        <div className={styles.pillarsGrid}>
          {t.pillars.map((pillar, index) => (
            <div 
              key={index} 
              className={styles.pillarCard}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.pillarIconWrapper}>
                <span className={styles.pillarIcon}>{pillar.icon}</span>
              </div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDescription}>{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.ctaWrapper}>
          <a href={t.ctaLink} className={styles.cta}>
            {t.cta}
            <span className={styles.ctaArrow}>→</span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default IndexSeccion7;
