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

  // Mostrar solo los primeros 6 ponentes para la landing
  const featuredSpeakers = t.speakers.slice(0, 6);

  return (
    <section className={`${styles.section} ${isVisible ? styles.visible : ''}`} ref={sectionRef}>
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.label}>{t.label}</div>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.description}>{t.description}</p>
        </div>

        {/* Grid de ponentes */}
        <div className={styles.speakersGrid}>
          {featuredSpeakers.map((speaker, index) => (
            <div 
              key={index} 
              className={styles.speakerCard}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Foto con borde dorado */}
              <div className={styles.imageWrapper}>
                <div className={styles.imagePlaceholder}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className={styles.imageBorder}></div>
                <div className={styles.imageGlow}></div>
              </div>

              {/* Badge de categoría */}
              <div className={styles.badge}>
                {speaker.role.includes('Magistrad') ? '⚖️ Magistrado' : 
                 speaker.role.includes('Doctor') || speaker.role.includes('Dra') ? '🎓 Doctor' :
                 speaker.role.includes('Maestr') || speaker.role.includes('Mtr') ? '📚 Maestro' :
                 '💼 Experto'}
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
          <a href="#programa" className={styles.ctaButton}>
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