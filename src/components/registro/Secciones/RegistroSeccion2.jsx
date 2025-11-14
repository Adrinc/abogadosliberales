import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import SelectionCards from '../components/SelectionCards';
import AcademicStepper from '../components/AcademicStepper';
import FormularioLead from '../components/FormularioLead';
import ActiveMemberForm from '../components/ActiveMemberForm';
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
  const [phoneValidationData, setPhoneValidationData] = useState(null);

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
    } else if (selectedOption === 4) {
      localStorage.setItem('lastPaymentAmount', '490.00');
      localStorage.setItem('isAcademicPurchase', 'false');
      localStorage.setItem('isActiveMemberPurchase', 'true');
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

  // Manejar validación de teléfono desde FormularioLead/AcademicStepper
  const handlePhoneValidation = (validationResult) => {
    console.log('📞 Phone validation result received:', validationResult);
    setPhoneValidationData(validationResult);
    
    // Nota: Redirección automática desactivada. 
    // La validación ahora solo bloquea duplicados (valid: false)
  };

  return (
    <section id="formulario-registro" className={styles.registroSection} ref={sectionRef}>
      <div className={styles.container}>
        <SelectionCards 
          selectedOption={selectedOption} 
          onSelectOption={handleSelectOption} 
        />

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
                onPhoneValidation={handlePhoneValidation}
              />
            )}

            {selectedOption === 3 && (
              <>
                <div className={`${styles.formCard} ${isVisible ? styles.fadeInLeft : ''}`}>
                  <FormularioLead
                    onSubmit={handleLeadSubmit}
                    isCompleted={!!leadData}
                    requiresPhoneValidation={true}
                    onPhoneValidation={handlePhoneValidation}
                    customerCategoryFk={4}
                    isMembershipFlow={true}
                  />
                </div>

                {leadData && (
                  <div className={`${styles.paymentFormCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>
                        {ingles ? (
                          <>
                            Membership and Congress Payment
                            <br />
                            <span style={{ fontSize: '0.875em', fontWeight: 600, color: 'var(--al-gold-primary, #EECB00)' }}>
                              (Subject to Approval)
                            </span>
                          </>
                        ) : (
                          <>
                            Pago de Membresía + Congreso
                            <br />
                            <span style={{ fontSize: '0.875em', fontWeight: 600, color: 'var(--al-gold-primary, #EECB00)' }}>
                              (Previa Aprobación)
                            </span>
                          </>
                        )}
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

            {selectedOption === 4 && (
              <>
                <div className={`${styles.formCard} ${isVisible ? styles.fadeInLeft : ''}`}>
                  <ActiveMemberForm
                    onSubmit={handleLeadSubmit}
                    onPhoneValidation={handlePhoneValidation}
                  />
                </div>

                {leadData && (
                  <div className={`${styles.paymentFormCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>
                        {ingles 
                          ? 'Active Member Registration Payment' 
                          : 'Pago de Inscripción - Miembro Activo'}
                      </h2>
                      <p className={styles.sectionSubtitle}>
                        {ingles 
                          ? 'Special rate for active bar members' 
                          : 'Tarifa especial para miembros activos de la barra'}
                      </p>
                    </div>
                    
                    <StripeForm 
                      leadId={leadId} 
                      leadData={leadData}
                      academicPriceData={null}
                      isAcademic={false}
                      academicRole={null}
                      isActiveMember={true}
                      activeMemberPrice={490}
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
