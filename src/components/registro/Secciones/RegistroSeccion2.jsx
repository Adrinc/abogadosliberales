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
import StripeForm from '../components/StripeForm'; // ✅ Revertido: Stripe Redirect (temporal)
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

  // Método de pago seleccionado
  const [selectedMethod, setSelectedMethod] = useState('paypal'); // 'paypal' | 'creditCard' | 'bankTransfer'

  // Estado para el flujo académico
  const [isAcademic, setIsAcademic] = useState(false);
  // Guardar el precio académico calculado (si se requiere en otras partes)
  const [academicPriceData, setAcademicPriceData] = useState(null);

  // 🧹 LIMPIEZA: Al montar el componente, limpiar datos de confirmación previos
  useEffect(() => {
    console.log('🧹 Limpiando datos de confirmación previos del localStorage...');
    
    // Lista de claves a limpiar relacionadas con pagos anteriores
    const keysToClean = [
      'lastPaymentAmount',
      'lastPaymentMethod', 
      'lastLeadId',
      'lastTransactionId',
      'stripeAccessUrl',
      'lastWebhookResponse' // 🔥 Esta es la clave que guarda el QR URL
    ];
    
    keysToClean.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`🗑️ Eliminando ${key}:`, value);
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ localStorage limpiado - Listo para nuevo registro');
  }, []); // Solo al montar el componente

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

  return (
    <section
      id="formulario-registro"
      className={styles.registroSection}
      ref={sectionRef}
    >
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Columna Izquierda: Formularios y Stepper */}
          <div className={styles.formColumn}>
            {/* Toggle académico siempre visible */}
            <AcademicToggle
              isAcademic={isAcademic}
              onToggle={() => {
                setIsAcademic(!isAcademic);
                // Limpiar datos del lead al cambiar entre flujos
                setLeadData(null);
                setLeadId(null);
                setAcademicPriceData(null);
                console.log('🧹 Toggle cambiado - Datos limpiados');
              }}
            />

            {isAcademic ? (
              // Si el usuario pertenece a una institución educativa, mostramos el stepper completo
              <AcademicStepper
                onPriceChange={(priceData) => setAcademicPriceData(priceData)}
                onComplete={(data) => {
                  // Guardar datos del lead y cualquier otra información relevante
                  console.log('🎯 onComplete llamado en RegistroSeccion2 con data:', data);
                  if (data) {
                    // Si el stepper nos devuelve datos del lead, almacenarlos localmente
                    if (data.leadData) {
                      console.log('✅ Actualizando leadData:', data.leadData);
                      setLeadData(data.leadData);
                    }
                    if (data.leadId) {
                      console.log('✅ Actualizando leadId:', data.leadId);
                      setLeadId(data.leadId);
                    }
                  }
                }}
                selectedMethod={selectedMethod}
                setSelectedMethod={setSelectedMethod}
              />
            ) : (
              <>
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
                        <h2 className={styles.sectionTitle}>{t.paymentMethods.title}</h2>
                        <p className={styles.sectionSubtitle}>{t.paymentMethods.subtitle}</p>
                      </div>

                      {/* Tabs de métodos de pago */}
                      <div className={styles.tabs}>
                        <button
                          className={`${styles.tab} ${selectedMethod === 'paypal' ? styles.tabActive : ''}`}
                          onClick={() => {
                            setSelectedMethod('paypal');
                            localStorage.setItem('lastPaymentMethod', 'paypal');
                            console.log('🎯 Método seleccionado: paypal (guardado en localStorage)');
                          }}
                        >
                          <div className={styles.tabIcon}>💳</div>
                          <span className={styles.tabLabel}>{t.paymentMethods.tabs.paypal}</span>
                          <div className={styles.tabIndicator}></div>
                        </button>

                        <button
                          className={`${styles.tab} ${selectedMethod === 'creditCard' ? styles.tabActive : ''}`}
                          onClick={() => {
                            setSelectedMethod('creditCard');
                            localStorage.setItem('lastPaymentMethod', 'stripe');
                            console.log('🎯 Método seleccionado: creditCard → stripe (guardado en localStorage)');
                          }}
                        >
                          <div className={styles.tabIcon}>💰</div>
                          <span className={styles.tabLabel}>{t.paymentMethods.tabs.creditCard}</span>
                          <div className={styles.tabIndicator}></div>
                        </button>

                        <button
                          className={`${styles.tab} ${selectedMethod === 'bankTransfer' ? styles.tabActive : ''}`}
                          onClick={() => {
                            setSelectedMethod('bankTransfer');
                            localStorage.setItem('lastPaymentMethod', 'transfer');
                            console.log('🎯 Método seleccionado: bankTransfer → transfer (guardado en localStorage)');
                          }}
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
                        <PayPalIframe 
                          leadId={leadId} 
                          leadData={leadData}
                          academicPriceData={null}
                          isAcademic={false}
                          academicRole={null}
                        />
                      )}
                      {selectedMethod === 'creditCard' && (
                        <StripeForm 
                          leadId={leadId} 
                          leadData={leadData}
                          academicPriceData={null}
                          isAcademic={false}
                          academicRole={null}
                        />
                      )}
                      {selectedMethod === 'bankTransfer' && (
                        <ComprobantePagoForm 
                          leadId={leadId} 
                          leadData={leadData}
                          academicPriceData={null}
                          isAcademic={false}
                          academicRole={null}
                        />
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Columna Derecha: Resumen Sticky (solo cuando no es académico) */}
         {/*  {!isAcademic && ( */}
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
        {/*   )} */}

        </div>
      </div>
    </section>
  );
};

export default RegistroSeccion2;