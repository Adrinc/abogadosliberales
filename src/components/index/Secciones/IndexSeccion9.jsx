import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec9.module.css';

const IndexSeccion9 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.ubicacion : translationsIndex.es.ubicacion;
  
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
      id="ubicacion"
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

        {/* Grid principal */}
        <div className={styles.mainGrid}>
          
          {/* Columna izquierda: Información del venue */}
          <div className={styles.venueInfo}>
            <h3 className={styles.venueTitle}>
              <span className={styles.venueIcon}>📍</span>
              {t.venue.name}
            </h3>
            
            <div className={styles.venueDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>🏢</span>
                <p className={styles.detailText}>{t.venue.address}</p>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>🚇</span>
                <p className={styles.detailText}>{t.venue.directions}</p>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📅</span>
                <p className={styles.detailText}>
                  <strong>14–15 de noviembre de 2025</strong>
                </p>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>⏰</span>
                <p className={styles.detailText}>
                  <strong>09:00 – 18:00 hrs</strong> (ambos días)
                </p>
              </div>
            </div>

            {/* Hoteles recomendados */}
            {t.hotels && t.hotels.length > 0 && (
              <div className={styles.hotelsSection}>
                <h4 className={styles.hotelsTitle}>
                  <span className={styles.hotelIcon}>🏨</span>
                  {t.hotelsTitle}
                </h4>
                <ul className={styles.hotelsList}>
                  {t.hotels.map((hotel, index) => (
                    <li key={index} className={styles.hotelItem}>
                      <strong>{hotel.name}</strong>
                      <span className={styles.hotelDistance}>{hotel.distance}</span>
                      <span className={styles.hotelPrice}>{hotel.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Columna derecha: Mapa */}
          <div className={styles.mapWrapper}>
            <h3 className={styles.mapTitle}>
              <span className={styles.mapIcon}>🗺️</span>
              {t.mapTitle}
            </h3>
            
            <div className={styles.mapContainer}>
              {/* Placeholder de mapa SVG */}
              <svg 
                className={styles.mapPlaceholder} 
                viewBox="0 0 600 400" 
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </linearGradient>
                </defs>
                
                {/* Fondo */}
                <rect width="600" height="400" fill="url(#mapGradient)"/>
                
                {/* Calles decorativas */}
                <line x1="0" y1="150" x2="600" y2="150" stroke="#CBD5E0" strokeWidth="3"/>
                <line x1="0" y1="250" x2="600" y2="250" stroke="#CBD5E0" strokeWidth="3"/>
                <line x1="200" y1="0" x2="200" y2="400" stroke="#CBD5E0" strokeWidth="3"/>
                <line x1="400" y1="0" x2="400" y2="400" stroke="#CBD5E0" strokeWidth="3"/>
                
                {/* Bloques decorativos */}
                <rect x="50" y="50" width="120" height="80" fill="#E2E8F0" rx="4"/>
                <rect x="430" y="50" width="120" height="80" fill="#E2E8F0" rx="4"/>
                <rect x="50" y="270" width="120" height="80" fill="#E2E8F0" rx="4"/>
                <rect x="430" y="270" width="120" height="80" fill="#E2E8F0" rx="4"/>
                
                {/* Marcador principal (venue) */}
                <circle cx="300" cy="200" r="50" fill="rgba(238, 203, 0, 0.3)"/>
                <circle cx="300" cy="200" r="30" fill="rgba(238, 203, 0, 0.5)"/>
                <circle cx="300" cy="200" r="15" fill="#EECB00"/>
                <path 
                  d="M 300 185 L 300 215 M 285 200 L 315 200" 
                  stroke="#020266" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                
                {/* Texto del venue */}
                <text 
                  x="300" 
                  y="240" 
                  fontSize="16" 
                  fontWeight="700" 
                  fill="#020266" 
                  textAnchor="middle"
                >
                  Sede del Congreso
                </text>
                
                {/* Indicador Metro */}
                <circle cx="250" cy="150" r="12" fill="#FF6B35"/>
                <text x="250" y="135" fontSize="12" fontWeight="600" fill="#1A202C" textAnchor="middle">
                  M
                </text>
              </svg>

              {/* Nota para reemplazar con iframe real */}
              <div className={styles.mapNote}>
                <p>
                  💡 <strong>Nota:</strong> Mapa interactivo disponible próximamente. 
                  Por ahora, usa la dirección arriba para ubicar la sede en Google Maps.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default IndexSeccion9;
