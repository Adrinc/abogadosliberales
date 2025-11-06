import React, { useEffect, useState } from 'react';
import styles from '../css/mapComponent.module.css';

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
      <div className={styles.loadingMap}>
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
              📅 22 Nov 2025 · 09:00-18:00 hrs
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

export default MapComponent;
