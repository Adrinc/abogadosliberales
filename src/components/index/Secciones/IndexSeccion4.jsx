import React, { useEffect, useRef, useState } from "react";
import { isEnglish } from '../../../data/variables';
import { useStore } from '@nanostores/react';
import { translationsIndex } from '../../../data/translationsIndex';
import { translationsExpositores } from '../../../data/translationsExpositores';
import ExpositorModal from '../components/ExpositorModal';
import styles from "../css/indexSec4.module.css";

const IndexSeccion4 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.programa : translationsIndex.es.programa;
  const [isVisible, setIsVisible] = useState(false);
  const [selectedExpositor, setSelectedExpositor] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px' }
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


  // Función para obtener el ícono según el tipo de actividad
  const getActivityIcon = (type) => {
    if (type.includes('Conferencia')) return '🎤';
    if (type.includes('Panel')) return '💬';
    if (type.includes('Taller')) return '🎓';
    if (type.includes('Intermedio')) return '☕';
    if (type.includes('Q&A')) return '❓';
    if (type.includes('protocolar')) return '🏛️';
    return '📋';
  };

  const currentDayData = t.days.day1;

  return (
    <section 
      id="programa"
      className={`${styles.section} ${isVisible ? styles.visible : ''}`} 
      ref={sectionRef}
    >
      {/* Borde decorativo superior dorado */}
      <div className={styles.topBorder}>
        <div className={styles.borderLine}></div>
        <div className={styles.borderGlow}></div>
      </div>

      <div className={styles.container}>
        
        {/* Fila 1: Label centrado en el tope */}
        <div className={styles.topLabelRow}>
          <div className={styles.label}>{t.label}</div>
        </div>

        {/* Fila 2: Grid con 2 columnas */}
        <div className={styles.contentGrid}>
          
          {/* Columna izquierda: Header + Tabs + CTA */}
          <div className={styles.leftColumn}>
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>{t.title}</h2>
              <p className={styles.description}>{t.description}</p>
            </div>

            {/* CTA */}
            <div className={styles.ctaWrapperInline}>
              <a href="/registro" className={styles.ctaButton}>
                <span>{t.cta}</span>
                <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>

        {/* Columna derecha: Timeline de sesiones */}
        <div className={styles.timeline}>
          <div className={styles.timelineWrapper}>
            <h3 className={styles.dayTitle}>{currentDayData.title}</h3>
            
            <div className={styles.sessionsContainer}>
              {currentDayData.sessions.map((session, index) => (
              <div 
                key={index} 
                className={`${styles.sessionCard} ${session.type.includes('Intermedio') ? styles.intermedio : ''}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Línea conectora */}
                {index < currentDayData.sessions.length - 1 && (
                  <div className={styles.connector}></div>
                )}

                {/* Dot del timeline */}
                <div className={styles.timelineDot}>
                  <div className={styles.dotInner}></div>
                </div>

                {/* Contenido de la sesión (tarjeta blanca) */}
                <div className={styles.sessionContent}>
                  
                  {/* Grid: Imagen/Icono | Contenido DENTRO de la tarjeta */}
                  <div className={styles.sessionGrid}>
                    
                    {/* Columna izquierda: SIEMPRE visible (imagen O ícono) */}
                    {session.expositorId ? (
                      // CON expositor: mostrar imagen + botón
                      <div className={styles.expositorColumn}>
                        <img 
                          src={ingles ? translationsExpositores.en[session.expositorId]?.image : translationsExpositores.es[session.expositorId]?.image}
                          alt={session.speaker}
                          className={styles.expositorImage}
                        />
                        <button 
                          className={styles.viewProfileBtnCompact}
                          onClick={() => setSelectedExpositor(session)}
                          title={ingles ? translationsExpositores.en.modal.viewDetails : translationsExpositores.es.modal.viewDetails}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                          <span className={styles.labelprofile}>{ingles ? 'See resume' : 'Ver curriculum'}</span>
                        </button>
                      </div>
                    ) : (
                      // SIN expositor: mostrar ícono grande
                      <div className={styles.iconColumn}>
                        <div className={styles.activityIconLarge}>
                          {getActivityIcon(session.type)}
                        </div>
                      </div>
                    )}

                    {/* Columna derecha: Info de la sesión */}
                    <div className={styles.sessionInfo}>
                      
                      {/* Hora */}
                      <div className={styles.sessionTime}>
                        <svg className={styles.clockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{session.time}</span>
                      </div>

                      {/* Main info */}
                      <div className={styles.sessionMain}>
                        <div className={styles.sessionHeader}>
                          <div className={styles.sessionTitleGroup}>
                            <h4 className={styles.sessionTitle}>{session.title}</h4>
                            <div className={styles.sessionMeta}>
                              <span className={styles.sessionType}>{session.type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Speaker name */}
                        {session.speaker && (
                          <div className={styles.speakerNameWrapper}>
                            <svg className={styles.speakerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className={styles.speakerName}>{session.speaker}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        </div>

        {/* CTA al final (visible solo en móvil) */}
        <div className={styles.ctaWrapper}>
          <a href="#inscripcion" className={styles.ctaButton}>
            <span>{t.cta}</span>
            <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

      </div>

      {/* Borde decorativo inferior dorado */}
      <div className={styles.bottomBorder}>
        <div className={styles.borderLine}></div>
        <div className={styles.borderGlow}></div>
      </div>

      {/* Modal de expositor */}
      {selectedExpositor && selectedExpositor.expositorId && (
        <ExpositorModal 
          expositor={{ id: selectedExpositor.expositorId }}
          onClose={() => setSelectedExpositor(null)}
        />
      )}
    </section>
  );
};

export default IndexSeccion4;
