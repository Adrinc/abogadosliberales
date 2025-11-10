import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import SelectionCards from '../components/SelectionCards';
import AcademicStepper from '../components/AcademicStepper';
import FormularioLead from '../components/FormularioLead';
import StripeForm from '../components/StripeForm';
import ResumenRegistro from '../ResumenRegistro';
import styles from '../css/registroSeccion2.module.css';

const RegistroSeccion2 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(1);
  const [leadData, setLeadData] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [academicPriceData, setAcademicPriceData] = useState(null);
  const [phoneValidationData, setPhoneValidationData] = useState(null); // 🆕 Para recibir datos de validación
  const [isRedirecting, setIsRedirecting] = useState(false); // 🆕 Para mostrar mensaje de redirección

  useEffect(() => {
    const referrer = document.referrer;
    const comesFromConfirmation = referrer.includes('/confirmacion') || referrer.includes('/validacion');
    
    if (comesFromConfirmation) {
      return;
    }
    
    const keysToClean = ['lastPaymentAmount', 'lastPaymentMethod', 'lastLeadId', 'lastTransactionId', 'stripeAccessUrl', 'lastWebhookResponse', 'isAcademicPurchase'];
    keysToClean.forEach(key => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    setLeadData(null);
    setLeadId(null);
    setAcademicPriceData(null);
    
    if (selectedOption === 1) {
      localStorage.setItem('lastPaymentAmount', '990.00');
      localStorage.setItem('isAcademicPurchase', 'false');
    } else if (selectedOption === 2) {
      localStorage.setItem('isAcademicPurchase', 'true');
    } else if (selectedOption === 3) {
      localStorage.setItem('lastPaymentAmount', '3850.00');
      localStorage.setItem('isAcademicPurchase', 'false');
    }
  }, [selectedOption]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
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

  const handleLeadSubmit = (data, id) => {
    setLeadData(data);
    setLeadId(id);
  };

  const handleSelectOption = (optionId) => {
    setSelectedOption(optionId);
  };

  // 🆕 NUEVO: Manejar validación de teléfono desde FormularioLead
  const handlePhoneValidation = (validationResult) => {
    console.log('📞 Phone validation result received:', validationResult);
    
    setPhoneValidationData(validationResult);
    
    // Si detecta que es barista, redirigir automáticamente a opción 3
    if (validationResult?.status === 'redirect_barista') {
      console.log('🔄 Redirecting to Membership option (3)...');
      
      // Mostrar mensaje de redirección
      setIsRedirecting(true);
      
      // Limpiar datos previos
      setLeadData(null);
      setLeadId(null);
      
      // Cambiar a opción 3 después de un pequeño delay para que el usuario vea el mensaje
      setTimeout(() => {
        setSelectedOption(3);
        setIsRedirecting(false);
      }, 3000); // 3 segundos para leer el mensaje
    }
  };

  return (
    <section id="formulario-registro" className={styles.registroSection} ref={sectionRef}>
      <div className={styles.container}>
        <SelectionCards 
          selectedOption={selectedOption} 
          onSelectOption={handleSelectOption} 
        />

        {/* 🆕 Banner de redirección cuando detecta barista */}
        {isRedirecting && (
          <div className={styles.redirectBanner}>
            <div className={styles.redirectIcon}>⚖️</div>
            <div className={styles.redirectContent}>
              <h3 className={styles.redirectTitle}>
                {ingles ? 'Bar Member Detected' : 'Miembro de la Barra Detectado'}
              </h3>
              <p className={styles.redirectText}>
                {ingles 
                  ? 'Redirecting you to the Membership registration option...' 
                  : 'Redirigiendo a la opción de Membresía...'}
              </p>
            </div>
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.formColumn}>
            
            {selectedOption === 1 && (
              <>
                <div className={`${styles.formCard} ${isVisible ? styles.fadeInLeft : ''}`}>
                  <FormularioLead
                    onSubmit={handleLeadSubmit}
                    isCompleted={!!leadData}
                    requiresPhoneValidation={true}
                    onPhoneValidation={handlePhoneValidation}
                  />
                </div>

                {leadData && (
                  <div className={`${styles.paymentFormCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>{t.paymentMethods?.title || 'Datos de Pago'}</h2>
                      <p className={styles.sectionSubtitle}>{t.paymentMethods?.subtitle || 'Complete los datos de su tarjeta de forma segura'}</p>
                    </div>
                    
                    <StripeForm 
                      leadId={leadId} 
                      leadData={leadData}
                      academicPriceData={null}
                      isAcademic={false}
                      academicRole={null}
                    />
                  </div>
                )}
              </>
            )}

            {selectedOption === 2 && (
              <AcademicStepper
                onPriceChange={(priceData) => setAcademicPriceData(priceData)}
                onComplete={(data) => {
                  if (data) {
                    if (data.leadData) setLeadData(data.leadData);
                    if (data.leadId) setLeadId(data.leadId);
                  }
                }}
              />
            )}

            {selectedOption === 3 && (
              <>
                <div className={`${styles.formCard} ${isVisible ? styles.fadeInLeft : ''}`}>
                  <FormularioLead
                    onSubmit={handleLeadSubmit}
                    isCompleted={!!leadData}
                    requiresPhoneValidation={false}
                    customerCategoryFk={4}
                  />
                </div>

                {leadData && (
                  <div className={`${styles.paymentFormCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>
                        {ingles ? 'Membership Payment' : 'Pago de Membresía'}
                      </h2>
                      <p className={styles.sectionSubtitle}>
                        {ingles 
                          ? 'Subscribe to the annual membership and access exclusive benefits' 
                          : 'Suscríbete a la membresía anual y accede a beneficios exclusivos'}
                      </p>
                    </div>
                    
                    <StripeForm 
                      leadId={leadId} 
                      leadData={leadData}
                      academicPriceData={null}
                      isAcademic={false}
                      academicRole={null}
                      isMembership={true}
                      membershipPrice={3850}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.summaryColumn}>
            <div className={`${styles.summaryCard} ${isVisible ? styles.fadeInRight : ''}`}>
              <ResumenRegistro
                leadData={leadData}
                selectedPaymentMethod="creditCard"
                academicPriceData={academicPriceData}
                isAcademic={selectedOption === 2}
                selectedOption={selectedOption}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RegistroSeccion2;
