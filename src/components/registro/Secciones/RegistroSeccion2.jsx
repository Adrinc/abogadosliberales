import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import AcademicToggle from '../components/AcademicToggle';
import AcademicStepper from '../components/AcademicStepper';
import FormularioLead from '../components/FormularioLead';
import PayPalIframe from '../components/PayPalIframe';
import IPPayForm from '../components/IPPayForm';
import IPPayTemporaryMessage from '../components/IPPayTemporaryMessage';
import ComprobantePagoForm from '../components/ComprobantePagoForm';
import ResumenRegistro from '../ResumenRegistro';
import styles from '../css/registroSeccion2.module.css';

const RegistroSeccion2 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Estado del lead (datos del participante)
  const [leadData, setLeadData] = useState(null);
  const [leadId, setLeadId] = useState(null);

  // Estado académico
  const [isAcademic, setIsAcademic] = useState(false);
  const [academicData, setAcademicData] = useState(null);
  const [academicPriceData, setAcademicPriceData] = useState(null);

  // Método de pago seleccionado
  const [selectedMethod, setSelectedMethod] = useState('paypal'); // 'paypal' | 'creditCard' | 'bankTransfer'

  // Intersection Observer para animaciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
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

  // Handler cuando se completa el formulario de lead
  const handleLeadSubmit = (data, id) => {
    setLeadData(data);
    setLeadId(id);
  };

  // Handler para el toggle académico
  const handleAcademicToggle = () => {
    setIsAcademic(!isAcademic);
    
    // Si se desactiva, resetear datos académicos
    if (isAcademic) {
      setAcademicData(null);
      setAcademicPriceData(null);
      console.log('Academic mode disabled - clearing academic data');
    }
  };

  // Handler cuando se completa el stepper académico
  const handleAcademicComplete = (data) => {
    console.log('✅ Academic verification completed:', data);
    setAcademicData(data);
    setAcademicPriceData(data.priceData);
  };

  // Handler cuando cambia el precio en tiempo real (stepper step 4)
  const handleAcademicPriceChange = (priceData) => {
    setAcademicPriceData(priceData);
  };

  return (
    <section 
      id="formulario-registro" 
      className={styles.registroSection} 
      ref={sectionRef}
    >
      <div className={styles.container}>
        
        {/* Grid asimétrico: Formulario grande + Resumen sticky */}
        <div className={styles.layout}>
          
          {/* Columna Izquierda: Formularios */}
          <div className={styles.formColumn}>
            
            {/* TOGGLE ACADÉMICO */}
            <div className={`${styles.academicToggleCard} ${isVisible ? styles.fadeInLeft : ''}`}>
              <AcademicToggle 
                isAcademic={isAcademic}
                onToggle={handleAcademicToggle}
              />
            </div>

            {/* STEPPER ACADÉMICO (solo si toggle activo) */}
            {isAcademic && (
              <div className={`${styles.academicStepperCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                <AcademicStepper 
                  onComplete={handleAcademicComplete}
                  onPriceChange={handleAcademicPriceChange}
                />
              </div>
            )}

            {/* PASO 1: Formulario de Lead */}
            <div className={`${styles.formCard} ${isVisible ? styles.fadeInLeft : ''}`}>
              <FormularioLead 
                onSubmit={handleLeadSubmit}
                isCompleted={!!leadData}
              />
            </div>

            {/* PASO 2: Selector de Método de Pago (solo si lead está completo) */}
            {leadData && (
              <>
                <div className={`${styles.paymentMethodsCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      {t.paymentMethods.title}
                    </h2>
                    <p className={styles.sectionSubtitle}>
                      {t.paymentMethods.subtitle}
                    </p>
                  </div>

                  {/* Tabs de métodos de pago */}
                  <div className={styles.tabs}>
                    <button
                      className={`${styles.tab} ${selectedMethod === 'paypal' ? styles.tabActive : ''}`}
                      onClick={() => setSelectedMethod('paypal')}
                    >
                      <div className={styles.tabIcon}>💳</div>
                      <span className={styles.tabLabel}>{t.paymentMethods.tabs.paypal}</span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                    
                    <button
                      className={`${styles.tab} ${selectedMethod === 'creditCard' ? styles.tabActive : ''}`}
                      onClick={() => setSelectedMethod('creditCard')}
                    >
                      <div className={styles.tabIcon}>💰</div>
                      <span className={styles.tabLabel}>{t.paymentMethods.tabs.creditCard}</span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                    
                    <button
                      className={`${styles.tab} ${selectedMethod === 'bankTransfer' ? styles.tabActive : ''}`}
                      onClick={() => setSelectedMethod('bankTransfer')}
                    >
                      <div className={styles.tabIcon}>🏦</div>
                      <span className={styles.tabLabel}>{t.paymentMethods.tabs.bankTransfer}</span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                  </div>
                </div>

                {/* Renderizado condicional según método seleccionado */}
                <div className={`${styles.paymentFormCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.4s' }}>
                  {selectedMethod === 'paypal' && (
                    <PayPalIframe leadId={leadId} leadData={leadData} />
                  )}
                  
                  {selectedMethod === 'creditCard' && (
                    <IPPayTemporaryMessage />
                  )}
                  
                  {selectedMethod === 'bankTransfer' && (
                    <ComprobantePagoForm leadId={leadId} leadData={leadData} />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Columna Derecha: Resumen Sticky */}
          <div className={styles.summaryColumn}>
            <div className={`${styles.summaryCard} ${isVisible ? styles.fadeInRight : ''}`}>
              <ResumenRegistro 
                leadData={leadData}
                selectedPaymentMethod={selectedMethod}
                academicPriceData={academicPriceData}
                isAcademic={isAcademic}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RegistroSeccion2;
