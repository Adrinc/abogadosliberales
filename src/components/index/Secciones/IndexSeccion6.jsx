import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec6.module.css';

const IndexSeccion6 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.testimonios : translationsIndex.es.testimonios;
  
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate testimonials cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTestimonial((prev) => (prev + 1) % t.testimonials.length);
        setIsTransitioning(false);
      }, 500); // Duración del fade-out
    }, 7000); // Cambio cada 5 segundos

    return () => clearInterval(interval);
  }, [t.testimonials.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Autoplay del video cuando la sección es visible
            setTimeout(() => {
              setPlayingVideo(true);
            }, 800); // Delay de 800ms para que el usuario vea la animación
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

  // Mapeo de imágenes reales de testimonios
  const testimonialImages = [
    '/image/testimonials/laura_testimonio.png',   // María -> Laura
    '/image/testimonials/carlos_testimonio.png',  // Carlos -> Carlos
    '/image/testimonials/ana_testimonio.png'     // Ana -> Ana
  ];

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <span 
        key={index} 
        className={`${styles.star} ${index < rating ? styles.filled : ''}`}
      >
        ★
      </span>
    ));
  };

  // Testimonio actual para el carrusel
  const currentTestimonialData = t.testimonials[currentTestimonial];
  const testimonialImage = testimonialImages[currentTestimonial];

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      id="testimonios"
    >
      {/* Orb central luminoso (elemento adicional) */}
      <div className={styles.orbCenter}></div>
      
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

        {/* Grid 2 columnas: Carrusel (izq) + Video (der) */}
        <div className={styles.twoColumnGrid}>
          
          {/* COLUMNA IZQUIERDA: Carrusel de testimonios */}
          <div className={styles.carouselWrapper}>
            <div className={`${styles.testimonialCard} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}>
              {/* Quote icon decorativo */}
              <div className={styles.quoteIcon}>"</div>

              {/* Avatar y info */}
              <div className={styles.testimonialHeader}>
                <div className={styles.avatarWrapper}>
                  <img 
                    src={testimonialImage} 
                    alt={currentTestimonialData.name}
                    className={styles.avatar}
                  />
                </div>
                
                <div className={styles.testimonialInfo}>
                  <h3 className={styles.testimonialName}>{currentTestimonialData.name}</h3>
                  <p className={styles.testimonialRole}>{currentTestimonialData.role}</p>
                  <p className={styles.testimonialLocation}>📍 {currentTestimonialData.location}</p>
                </div>
              </div>

              {/* Texto del testimonio */}
              <p className={styles.testimonialText}>{currentTestimonialData.text}</p>

              {/* Rating con estrellas */}
              <div className={styles.ratingWrapper}>
                {renderStars(currentTestimonialData.rating)}
              </div>
            </div>

            {/* Indicadores del carrusel */}
            <div className={styles.carouselIndicators}>
              {t.testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentTestimonial ? styles.active : ''}`}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentTestimonial(index);
                      setIsTransitioning(false);
                    }, 500);
                  }}
                  aria-label={`Ver testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: Video */}
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              {!playingVideo ? (
                <div className={styles.videoThumbnail}>
                  {/* Placeholder de thumbnail */}
                  <div className={styles.thumbnailOverlay}>
                    <button 
                      className={styles.playButton}
                      onClick={() => setPlayingVideo(true)}
                      aria-label="Reproducir video"
                    >
                      <svg 
                        className={styles.playIcon} 
                        viewBox="0 0 100 100" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="50" cy="50" r="48" fill="rgba(238, 203, 0, 0.95)" stroke="#FFFFFF" strokeWidth="3"/>
                        <polygon points="40,30 70,50 40,70" fill="#020266"/>
                      </svg>
                    </button>
                    
                    <div className={styles.videoBadge}>
                      <span className={styles.badgeIcon}>▶</span>
                      <span>Highlights del Congreso 2024</span>
                    </div>
                  </div>

                  {/* Fondo decorativo para thumbnail */}
                  <div className={styles.thumbnailBackground}>
                    <svg viewBox="0 0 450 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <linearGradient id="videoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#020266" />
                          <stop offset="50%" stopColor="#05054F" />
                          <stop offset="100%" stopColor="#0B0B2B" />
                        </linearGradient>
                      </defs>
                      <rect width="450" height="800" fill="url(#videoGradient)"/>
                      
                      {/* Elementos decorativos */}
                      <circle cx="225" cy="150" r="80" fill="rgba(238, 203, 0, 0.1)"/>
                      <circle cx="225" cy="650" r="100" fill="rgba(238, 203, 0, 0.08)"/>
                      <rect x="125" y="350" width="200" height="100" fill="rgba(255, 255, 255, 0.05)" rx="12"/>
                      
                      {/* Texto decorativo */}
                      <text x="225" y="400" fontSize="28" fill="rgba(255, 255, 255, 0.8)" textAnchor="middle" fontWeight="700">
                        Congreso 2024
                      </text>
                      <text x="225" y="435" fontSize="18" fill="rgba(238, 203, 0, 0.9)" textAnchor="middle">
                        Abogados Liberales
                      </text>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className={styles.videoIframe}>
                  {/* Video de Facebook - formato vertical con autoplay */}
                  <iframe
                    src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1363765995300224%2F&show_text=false&width=267&t=0&autoplay=1"
                    style={{ border: 'none', width: '100%', height: '100%' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    loading="lazy"
                    title="Video del Congreso 2024 - Abogados Liberales"
                  ></iframe>
                </div>
              )}
            </div>
          </div>

        </div>
        {/* Fin del grid de 2 columnas */}

      </div>
    </section>
  );
};

export default IndexSeccion6;
