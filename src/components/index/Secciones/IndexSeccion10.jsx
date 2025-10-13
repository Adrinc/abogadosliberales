import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec10.module.css';

const IndexSeccion10 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.ctaFinal : translationsIndex.es.ctaFinal;
  
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Suscripción registrada: ${email}`);
    setEmail('');
  };

  const scrollToInscripcion = () => {
    // Redirigir a la página de registro
    window.location.href = '/registro';
  };

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      id="cta-final"
    >
      <div className={styles.container}>
        
        {/* Badge pulsante */}
        <div className={styles.badgeWrapper}>
          <span className={styles.badge}>{t.badge}</span>
        </div>

        {/* Título y subtítulo */}
        <div className={styles.headerWrapper}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
          <p className={styles.description}>{t.description}</p>
        </div>

        {/* CTAs principales */}
        <div className={styles.ctaWrapper}>
          <button 
            className={styles.ctaPrimary}
            onClick={scrollToInscripcion}
          >
            {t.ctaPrimary}
            <span className={styles.ctaArrow}>→</span>
          </button>
          
          <a 
            href="https://wa.me/525512345678?text=Hola,%20quiero%20información%20sobre%20el%20Congreso%20de%20Amparo%202025" 
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaSecondary}
          >
            <span className={styles.whatsappIcon}>💬</span>
            {t.ctaSecondary}
          </a>
        </div>

        {/* Trust signals */}
        <div className={styles.trustSignals}>
          <div className={styles.trustSignal}>
            <span className={styles.trustIcon}>⏳</span>
            <span className={styles.trustText}>{t.trustSignals.limitedSeats}</span>
          </div>
          <div className={styles.trustSignal}>
            <span className={styles.trustIcon}>🏆</span>
            <span className={styles.trustText}>{t.trustSignals.officialCert}</span>
          </div>
          <div className={styles.trustSignal}>
            <span className={styles.trustIcon}>🎓</span>
            <span className={styles.trustText}>{t.trustSignals.expertSpeakers}</span>
          </div>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletterWrapper}>
          <h3 className={styles.newsletterTitle}>{t.newsletter.title}</h3>
          <form className={styles.newsletterForm} onSubmit={handleSubmit}>
            <input 
              type="email" 
              className={styles.newsletterInput}
              placeholder={t.newsletter.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.newsletterButton}>
              {t.newsletter.button}
            </button>
          </form>
          <p className={styles.newsletterPrivacy}>{t.newsletter.privacy}</p>
        </div>

      </div>
    </section>
  );
};

export default IndexSeccion10;
