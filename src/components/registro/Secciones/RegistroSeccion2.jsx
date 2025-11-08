import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import AcademicToggle from '../components/AcademicToggle';
import AcademicStepper from '../components/AcademicStepper';
import BarristaToggle from '../components/BarristaToggle'; // 🆕 Toggle Barrista
import BarristaPhoneValidator from '../components/BarristaPhoneValidator'; // 🆕 Validador de teléfono
import BarristaValidationResult from '../components/BarristaValidationResult'; // 🆕 Resultado de validación
import FormularioLead from '../components/FormularioLead';
import StripeForm from '../components/StripeForm'; // ✅ Stripe ÚNICO método de pago
// 🚫 DESHABILITADO: ComprobantePagoForm (transferencia bancaria ya no se usa)
// import ComprobantePagoForm from '../components/ComprobantePagoForm';
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

  // 🚫 MÉTODO DE PAGO: Solo Stripe ahora (bankTransfer y PayPal deshabilitados)
  // const [selectedMethod, setSelectedMethod] = useState('creditCard'); // YA NO SE USA - Solo Stripe

  // Estado para el flujo académico
  const [isAcademic, setIsAcademic] = useState(false);
  // Guardar el precio académico calculado (si se requiere en otras partes)
  const [academicPriceData, setAcademicPriceData] = useState(null);

  // 🆕 Estado para el flujo barrista
  const [isBarrista, setIsBarrista] = useState(false);
  const [barristaValidation, setBarristaValidation] = useState(null);
  const [barristaPriceData, setBarristaPriceData] = useState(null);
  const [showBarristaForm, setShowBarristaForm] = useState(false);

  // 🧹 LIMPIEZA INTELIGENTE: Solo limpiar si NO venimos de confirmación
  useEffect(() => {
    // Detectar si venimos de una página de confirmación
    const referrer = document.referrer;
    const comesFromConfirmation = referrer.includes('/confirmacion') || referrer.includes('/validacion');
    
    console.log('🔍 RegistroSeccion2 mounted - Referrer:', referrer);
    console.log('🔍 Comes from confirmation?:', comesFromConfirmation);
    
    if (comesFromConfirmation) {
      console.log('⏭️ Usuario viene de confirmación - NO limpiar localStorage (permite ver datos)');
      return; // No limpiar si viene de confirmación
    }
    
    // Si NO viene de confirmación, limpiar todo para nuevo registro
    console.log('🧹 Usuario viene de otra página - Limpiando localStorage para nuevo registro...');
    
    const keysToClean = [
      'lastPaymentAmount',
      'lastPaymentMethod', 
      'lastLeadId',
      'lastTransactionId',
      'stripeAccessUrl',
      'lastWebhookResponse', // 🔥 Esta es la clave que guarda el QR URL
      'isAcademicPurchase' // 🎓 Estado de compra académica
    ];
    
    keysToClean.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`🗑️ Eliminando ${key}:`, value);
        localStorage.removeItem(key);
      }
    });
    
    // 💰 Establecer precio inicial para flujo general (nuevo registro)
    if (!isAcademic) {
      localStorage.setItem('lastPaymentAmount', '990.00');
      console.log('💰 Nuevo registro - Precio general establecido: 990.00');
    }
    
    console.log('✅ localStorage limpiado - Listo para nuevo registro');
  }, []); // Solo al montar el componente

  // 💰 ACTUALIZAR PRECIO: Cuando cambia el toggle académico
  useEffect(() => {
    // Solo actualizar si NO venimos de confirmación
    const referrer = document.referrer;
    const comesFromConfirmation = referrer.includes('/confirmacion') || referrer.includes('/validacion');
    
    if (comesFromConfirmation) {
      console.log('⏭️ Viene de confirmación - NO actualizar precio automáticamente');
      return;
    }
    
    // 🎓 GUARDAR ESTADO ACADÉMICO en localStorage
    localStorage.setItem('isAcademicPurchase', isAcademic ? 'true' : 'false');
    console.log('🎓 Estado académico guardado:', isAcademic);
    
    if (!isAcademic) {
      localStorage.setItem('lastPaymentAmount', '990.00');
      console.log('💰 Toggle a flujo general - Monto actualizado: 990.00');
    } else {
      // En flujo académico, el precio se calculará en el stepper
      console.log('🎓 Toggle a flujo académico - Precio se calculará al seleccionar rol');
    }
  }, [isAcademic]); // Se ejecuta cuando cambia isAcademic

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

  // 🆕 Handlers para flujo Barrista
  const handleBarristaToggle = () => {
    if (isAcademic) {
      alert(ingles 
        ? '⚠️ Cannot combine academic and bar member discounts. Please disable academic mode first.' 
        : '⚠️ No se pueden combinar descuentos académicos con membresía. Desactiva el modo académico primero.'
      );
      return;
    }
    
    const newBarristaState = !isBarrista;
    setIsBarrista(newBarristaState);
    
    // Limpiar datos al cambiar toggle
    if (newBarristaState) {
      setLeadData(null);
      setLeadId(null);
      setBarristaValidation(null);
      setBarristaPriceData(null);
      setShowBarristaForm(false);
      console.log('🔄 Toggle Barrista activado - Datos limpiados');
    } else {
      // Si se desactiva, limpiar TODO el flujo barrista
      setBarristaValidation(null);
      setBarristaPriceData(null);
      setShowBarristaForm(false);
      setLeadData(null);
      setLeadId(null);
      console.log('🔄 Toggle Barrista desactivado - Volviendo a flujo general');
    }
  };

  const handleAcademicToggle = () => {
    if (isBarrista) {
      alert(ingles 
        ? '⚠️ Cannot combine bar member and academic discounts. Please disable bar member mode first.' 
        : '⚠️ No se pueden combinar membresía con descuentos académicos. Desactiva el modo barrista primero.'
      );
      return;
    }
    
    setIsAcademic(!isAcademic);
    // Limpiar datos del lead al cambiar entre flujos
    setLeadData(null);
    setLeadId(null);
    setAcademicPriceData(null);
    console.log('🔄 Toggle académico cambiado - Datos de lead limpiados');
  };

  const handleBarristaValidationComplete = (validationResult) => {
    console.log('✅ Validación completa:', validationResult);
    setBarristaValidation(validationResult);
    
    // Guardar precio en estado
    setBarristaPriceData({
      finalPrice: validationResult.finalPrice,
      priceKey: validationResult.priceKey,
      type: validationResult.type,
      customerCategoryId: validationResult.customerCategoryId
    });

    // Si es VIP (precio $0), no requiere pago
    if (validationResult.type === 'vip') {
      console.log('🎉 Usuario VIP - No requiere pago');
      setShowBarristaForm(true); // Mostrar form para capturar datos (sin pago)
    } else {
      console.log('💰 Usuario requiere pago:', validationResult.finalPrice);
    }
  };

  const handleBarristaValidationError = (errorResult) => {
    console.error('❌ Error en validación:', errorResult);
    setBarristaValidation(errorResult);
    setShowBarristaForm(false);
  };

  const handleBarristaResultContinue = () => {
    console.log('➡️ Continuar con formulario barrista');
    setShowBarristaForm(true);
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
              onToggle={handleAcademicToggle}
            />

            {/* 🆕 Toggle Barrista siempre visible */}
            <BarristaToggle
              isBarrista={isBarrista}
              onToggle={handleBarristaToggle}
              isDisabled={isAcademic}
            />

            {/* 🔀 FLUJO CONDICIONAL: Académico, Barrista o General */}
            {isAcademic ? (
              // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              // 🎓 FLUJO ACADÉMICO (4 pasos)
              // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              <AcademicStepper
                onPriceChange={(priceData) => setAcademicPriceData(priceData)}
                onComplete={(data) => {
                  console.log('🎯 onComplete llamado en RegistroSeccion2 con data:', data);
                  if (data) {
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
              />
            ) : isBarrista ? (
              // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              // ⚖️ FLUJO BARRISTA (Validación → Form → Pago)
              // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              <>
                {/* PASO 1: Validador de Teléfono */}
                {!barristaValidation && (
                  <div className={`${styles.formCard} ${isVisible ? styles.fadeInLeft : ''}`}>
                    <BarristaPhoneValidator
                      onValidationComplete={handleBarristaValidationComplete}
                      onValidationError={handleBarristaValidationError}
                    />
                  </div>
                )}

                {/* PASO 2: Resultado de Validación */}
                {barristaValidation && !barristaValidation.blocked && (
                  <BarristaValidationResult
                    validationData={barristaValidation}
                    onContinue={handleBarristaResultContinue}
                  />
                )}

                {/* PASO 3: Formulario de Lead (si validación OK y continuó) */}
                {showBarristaForm && barristaValidation && !barristaValidation.blocked && (
                  <div className={`${styles.formCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                    <FormularioLead
                      onSubmit={handleLeadSubmit}
                      isCompleted={!!leadData}
                      prefilledPhone={barristaValidation.phone}
                      customerCategoryFk={barristaValidation.customerCategoryId}
                      isBarristaFlow={true}
                      rfcRequired={true}
                    />
                  </div>
                )}

                {/* PASO 4: Pago con Stripe (solo si NO es VIP y lead completo) */}
                {showBarristaForm && leadData && barristaValidation && barristaValidation.requiresPayment && (
                  <div className={`${styles.paymentFormCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.4s' }}>
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
                      isBarrista={true}
                      barristaPriceKey={barristaPriceData?.priceKey}
                      barristaPrice={barristaPriceData?.finalPrice}
                      barristaType={barristaPriceData?.type}
                    />
                  </div>
                )}
              </>
            ) : (
              // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              // 📋 FLUJO GENERAL (Form → Pago)
              // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              <>
                {/* PASO 1: Formulario de Lead */}
                <div className={`${styles.formCard} ${isVisible ? styles.fadeInLeft : ''}`}>
                  <FormularioLead
                    onSubmit={handleLeadSubmit}
                    isCompleted={!!leadData}
                  />
                </div>

                {/* PASO 2: Formulario de Pago con Stripe (solo si lead está completo) */}
                {/* 🚫 SELECTOR DE MÉTODOS DESHABILITADO - Solo Stripe ahora */}
                {leadData && (
                  <div className={`${styles.paymentFormCard} ${styles.fadeInLeft}`} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>{t.paymentMethods?.title || 'Datos de Pago'}</h2>
                      <p className={styles.sectionSubtitle}>{t.paymentMethods?.subtitle || 'Complete los datos de su tarjeta de forma segura'}</p>
                    </div>
                    
                    {/* Solo StripeForm - sin selector de métodos */}
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
          </div>

          {/* Columna Derecha: Resumen Sticky (solo cuando no es académico) */}
         {/*  {!isAcademic && ( */}
            <div className={styles.summaryColumn}>
              <div className={`${styles.summaryCard} ${isVisible ? styles.fadeInRight : ''}`}>
                <ResumenRegistro
                  leadData={leadData}
                  selectedPaymentMethod="creditCard" // 🚫 Hardcoded - Solo Stripe ahora
                  academicPriceData={academicPriceData}
                  isAcademic={isAcademic}
                  barristaPriceData={barristaPriceData} // 🆕 Datos de precio barrista
                  isBarrista={isBarrista} // 🆕 Flag de flujo barrista
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