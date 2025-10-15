import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec9.module.css';

// Componente de mapa dinámico (carga solo en cliente)
const MapComponent = ({ position, venueName }) => {
  const [mapComponents, setMapComponents] = useState(null);
  
  useEffect(() => {
    // Importación dinámica de react-leaflet y leaflet
    const loadMap = async () => {
      try {
        const leafletModule = await import('leaflet');
        const reactLeafletModule = await import('react-leaflet');
        
        // Importar CSS de Leaflet
        await import('leaflet/dist/leaflet.css');
        
        setMapComponents({
          L: leafletModule.default,
          MapContainer: reactLeafletModule.MapContainer,
          TileLayer: reactLeafletModule.TileLayer,
          Marker: reactLeafletModule.Marker,
          Popup: reactLeafletModule.Popup
        });
      } catch (error) {
        console.error('Error cargando el mapa:', error);
      }
    };
    
    loadMap();
  }, []);

  if (!mapComponents) {
    return (
      <div style={{ 
        height: '550px', 
        width: '100%', 
        borderRadius: '16px', 
        background: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4A5568',
        fontSize: '1.125rem',
        fontWeight: '600'
      }}>
        🗺️ Cargando mapa interactivo...
      </div>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Popup } = mapComponents;

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 50px;
          height: 50px;
          background: rgba(238, 203, 0, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(238, 203, 0, 0.6);
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #EECB00, #F4D672);
          border-radius: 50%;
          border: 2px solid #020266;
          box-shadow: 0 4px 12px rgba(238, 203, 0, 0.6);
        "></div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });

  return (
    <MapContainer
      center={position}
      zoom={16}
      scrollWheelZoom={false}
      className={styles.leafletMap}
      style={{ height: '550px', width: '100%', borderRadius: '16px' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={icon}>
        <Popup className={styles.customPopup}>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <strong style={{ color: '#020266', fontSize: '1.125rem' }}>
              {venueName}
            </strong>
            <p style={{ color: '#4A5568', fontSize: '0.9rem', marginTop: '6px' }}>
              📍 Teatro Legaria (IMSS)
            </p>
            <p style={{ color: '#4A5568', fontSize: '0.85rem', marginTop: '4px' }}>
              📅 14-15 Nov 2025 · 09:00-18:00 hrs
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

const IndexSeccion9 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.ubicacion : translationsIndex.es.ubicacion;
  
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Coordenadas del Teatro Legaria (IMSS)
  const venuePosition = [19.45282, -99.19866];

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
              {/* Mapa interactivo con Leaflet (solo cliente) */}
              <MapComponent 
                position={venuePosition}
                venueName={t.venue.name}
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default IndexSeccion9;
