import React, { useEffect, useRef, useState } from "react";
import { isEnglish } from '../../../data/variables';
import { useStore } from '@nanostores/react';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from "../css/indexSec2.module.css";

const IndexSeccion2 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.sobreEvento : translationsIndex.es.sobreEvento;
  
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px'
      }
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
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        
        {/* Label superior */}
        <div className={`${styles.label} ${isVisible ? styles.fadeInUp : ''}`}>
          {t.label}
        </div>

        {/* Grid asimétrico: imagen + contenido */}
        <div className={styles.grid}>
          
          {/* Columna izquierda: Imagen profesional */}
          <div className={`${styles.imageColumn} ${isVisible ? styles.fadeInLeft : ''}`}>
            <div className={styles.imageWrapper}>
              <img 
                src="/image/global/justicia2.webp" 
                alt="Congreso Nacional de Amparo y Derechos Humanos"
                className={styles.mainImage}
              />
              <div className={styles.imageBorder}></div>
              <div className={styles.imageGlow}></div>
            </div>
            
            {/* Texto destacado sobre la imagen */}
            <div className={styles.highlightBox}>
              <div className={styles.quoteIcon}>💡</div>
              <p className={styles.highlightText}>{t.highlightText}</p>
            </div>
          </div>

          {/* Columna derecha: Contenido */}
          <div className={`${styles.contentColumn} ${isVisible ? styles.fadeInRight : ''}`}>
            
            {/* Título principal */}
            <h2 className={styles.title}>{t.title}</h2>
            
            {/* Descripción */}
            <p className={styles.description}>{t.description}</p>

            {/* 3 bloques con íconos institucionales */}
            <div className={styles.itemsGrid}>
              {t.items.map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.item} ${isVisible ? styles.fadeInUp : ''}`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className={styles.iconWrapper}>
                    <span className={styles.icon}>{item.icon}</span>
                    <div className={styles.iconGlow}></div>
                  </div>
                  <div className={styles.itemContent}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemDescription}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA secundario */}
            <div className={styles.ctaWrapper}>
              <a href="/nosotros" className={styles.ctaButton}>
                <span className={styles.ctaText}>{t.cta}</span>
                <svg className={styles.ctaArrow} width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default IndexSeccion2;
