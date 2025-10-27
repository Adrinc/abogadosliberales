import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec9.module.css';

// Componente de mapa dinámico (carga solo en cliente)
const MapComponent = ({ position, venueName, parkingPosition }) => {
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
        height: '360px', 
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

  // Icono del evento (isotipo con borde dorado)
  const venueIcon = L.divIcon({
    className: 'custom-marker-venue',
    html: `
      <div style="
        position: relative;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 60px;
          height: 60px;
          background: rgba(238, 203, 0, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid #EECB00;
          background: white;
          box-shadow: 0 4px 16px rgba(238, 203, 0, 0.6);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img 
            src="/favicon.jpg" 
            alt="Barra Mexicana de Abogados Liberales"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            "
          />
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30]
  });

  // Icono del estacionamiento (P azul prominente)
  const parkingIcon = L.divIcon({
    className: 'custom-marker-parking',
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
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          animation: pulsePark 2.5s infinite;
        "></div>
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          border-radius: 8px;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          color: white;
          font-family: Arial, sans-serif;
        ">
          P
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });

  return (
    <MapContainer
      center={position}
      zoom={17}
      scrollWheelZoom={false}
      className={styles.leafletMap}
      style={{ height: '360px', width: '100%', borderRadius: '16px' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Marcador del evento */}
      <Marker position={position} icon={venueIcon}>
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

      {/* Marcador del estacionamiento */}
      <Marker position={parkingPosition} icon={parkingIcon}>
        <Popup className={styles.customPopup}>
          <div style={{ textAlign: 'center', padding: '10px', maxWidth: '280px' }}>
            <strong style={{ color: '#3B82F6', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              🅿️ Estacionamiento
            </strong>
            
            {/* Imagen del estacionamiento */}
            <div style={{ 
              marginTop: '10px', 
              borderRadius: '10px', 
              overflow: 'hidden',
              border: '2px solid #3B82F6',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
            }}>
              <img 
                src="/image/global/estacionamiento.png" 
                alt="Estacionamiento Centro Comercial"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>

            <p style={{ color: '#4A5568', fontSize: '0.9rem', marginTop: '10px', lineHeight: '1.5' }}>
              Centro Comercial a un costado del evento
            </p>
            <div style={{ 
              marginTop: '10px', 
              padding: '10px 12px', 
              background: 'rgba(238, 203, 0, 0.15)', 
              borderRadius: '8px',
              borderLeft: '3px solid #EECB00'
            }}>
              <p style={{ color: '#020266', fontSize: '0.875rem', fontWeight: '600', margin: '0' }}>
                💰 $15 MXN / 3 horas
              </p>
              <p style={{ color: '#4A5568', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                +$15 por hora adicional
              </p>
            </div>
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
