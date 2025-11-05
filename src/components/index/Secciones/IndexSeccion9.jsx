import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import MapComponent from '../components/MapComponent.jsx';
import styles from '../css/indexSec9.module.css';

const IndexSeccion9 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.ubicacion : translationsIndex.es.ubicacion;
  
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Coordenadas del Teatro Legaria (IMSS)
  const venuePosition = [19.45282, -99.19866];
  
  // Coordenadas del estacionamiento del centro comercial
  const parkingPosition = [19.453280029640993, -99.19760244912051];

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
      id="como-llegar"
    >
      {/* Orb azul inferior derecho (elemento adicional) */}
      <div className={styles.orbBlue}></div>
      
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
                <span className={styles.detailIcon}>📍</span>
                <p className={styles.detailText}>{t.venue.directions}</p>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📅</span>
                <p className={styles.detailText}>
                  <strong>22 de noviembre de 2025</strong>
                </p>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>⏰</span>
                <p className={styles.detailText}>
                  <strong>09:00 – 18:00 hrs</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Columna derecha: Mapa */}
          <div className={styles.mapWrapper}>
            <h3 className={styles.mapTitle}>
              <span className={styles.mapIcon}>🗺️</span>
              {t.mapTitle}
            </h3>
            
            <div className={styles.mapContainer}>
              {/* Mapa interactivo con Leaflet (solo cliente) */}
              <MapComponent 
                position={venuePosition}
                venueName={t.venue.name}
                parkingPosition={parkingPosition}
              />
            </div>

            {/* Nota de estacionamiento */}
            {t.parkingNote && (
              <div className={styles.parkingNote}>
                <span className={styles.parkingIcon}>🅿️</span>
                <p className={styles.parkingText}>{t.parkingNote}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default IndexSeccion9;
