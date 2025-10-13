import React, { useEffect, useRef, useState } from "react";
import { isEnglish } from '../../../data/variables';
import { useStore } from '@nanostores/react';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from "../css/indexSec3.module.css";

const IndexSeccion3 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.ponentes : translationsIndex.es.ponentes;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: '0px' }
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

  // Determinar el icono del badge según el rol
  const getBadgeIcon = (role) => {
    if (role.includes('Vicepresidente')) return '👔';
    if (role.includes('Comisario')) return '⚖️';
    if (role.includes('Secretario')) return '📋';
    if (role.includes('Patrono')) return '🎖️';
    if (role.includes('Presidente')) return '🏆';
    return '💼';
  };

  const getBadgeText = (role) => {
    if (role.includes('Vicepresidente')) return 'Vicepresidente';
    if (role.includes('Comisario')) return 'Comisario';
    if (role.includes('Secretario')) return 'Secretario';
    if (role.includes('Patrono')) return 'Patrono';
    if (role.includes('Presidente')) return 'Presidente';
    return 'Directivo';
  };

  return (
    <section 
      className={`${styles.section} ${isVisible ? styles.visible : ''}`} 
      ref={sectionRef}
      id="mesa-directiva"
    >
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.label}>{t.label}</div>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.description}>{t.description}</p>
        </div>

        {/* Grid de mesa directiva - 8 personas */}
        <div className={styles.speakersGrid}>
          {t.speakers.map((speaker, index) => (
            <div 
              key={index} 
              className={styles.speakerCard}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Foto con borde dorado */}
              <div className={styles.imageWrapper}>
                <img 
                  src={speaker.image} 
                  alt={speaker.name}
                  className={styles.speakerImage}
                  loading="lazy"
                />
                <div className={styles.imageBorder}></div>
                <div className={styles.imageGlow}></div>
              </div>

              {/* Badge de categoría */}
              <div className={styles.badge}>
                {getBadgeIcon(speaker.role)} {getBadgeText(speaker.role)}
              </div>

              {/* Info del ponente */}
              <div className={styles.speakerInfo}>
                <h3 className={styles.speakerName}>{speaker.name}</h3>
                <p className={styles.speakerRole}>{speaker.role}</p>
                <p className={styles.speakerInstitution}>{speaker.institution}</p>
                
                {/* Topic */}
                <div className={styles.topicTag}>
                  <svg className={styles.topicIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>{speaker.topic}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.ctaWrapper}>
          <a href="#nosotros" className={styles.ctaButton}>
            <span>{t.cta}</span>
            <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};

export default IndexSeccion3;