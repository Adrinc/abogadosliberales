import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import AcademicToggle from '../components/AcademicToggle';
import AcademicStepper from '../components/AcademicStepper';
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
                console.log('🔄 Toggle cambiado - Datos de lead limpiados');
                // El precio se actualizará automáticamente por el useEffect de isAcademic
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
                // 🚫 selectedMethod YA NO SE USA - Solo Stripe ahora
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