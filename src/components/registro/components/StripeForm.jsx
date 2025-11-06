import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import { formatPrice } from '../../../lib/academicPricing';
import styles from '../css/stripeForm.module.css';

const StripeForm = ({ 
  leadId, 
  leadData, 
  academicPriceData = null, 
  isAcademic = false,
  academicRole = null // 🔥 NUEVO: Para determinar price_key
}) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;
  
  // 🔍 Debug: Ver qué academicRole estamos recibiendo
  console.log('🎓 StripeForm recibido - isAcademic:', isAcademic, 'academicRole:', academicRole);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Constantes del evento
  const EVENT_ID = 1; // ID del Congreso Nacional de Amparo
  
  // Calcular monto dinámico (académico o general)
  const finalAmount = academicPriceData && isAcademic 
    ? academicPriceData.finalPrice 
    : 990;
  
  const AMOUNT = finalAmount.toFixed(2);
  const CURRENCY = 'MXN';
  const WEBHOOK_URL = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_stripe_create_order';
  
  // 🔥 Mapear rol académico a price_key
  const getPriceKey = () => {
    if (!isAcademic || !academicRole) {
      return 'precio_lista_congreso'; // Precio general ($990 MXN)
    }
    
    // ✅ NUEVO ESQUEMA: Todos los roles académicos usan el mismo precio ($490 MXN)
    const priceKey = 'precio_academico'; // Todos los académicos → $490 MXN (50% desc)
    console.log('🎯 getPriceKey() - Role:', academicRole, '→ Price Key:', priceKey);
    return priceKey;
  };

  // Handler para iniciar el proceso de pago
  const handlePayment = async () => {
    console.log('🎯 Iniciando proceso de pago con Stripe...');
    setIsProcessing(true);
    setPaymentStatus(null);
    setErrorMessage('');

    try {
      // 1. Validar que tenemos leadId
      if (!leadId) {
        throw new Error(ingles 
          ? 'Customer ID not found. Please complete the registration form first.' 
          : 'ID de cliente no encontrado. Por favor complete el formulario de registro primero.'
        );
      }

      // 2. Construir URLs de éxito y cancelación
      // 🔥 Redirigir según tipo de compra:
      // - ACADÉMICO → /validacion (siempre requiere validación manual)
      // - GENERAL → /confirmacion (pago confirmado inmediatamente)
      const successUrl = isAcademic
        ? `${window.location.origin}/validacion?lead_id=${leadId}&method=stripe&status=pending`
        : `${window.location.origin}/confirmacion?lead_id=${leadId}&method=stripe&status=confirmed`;
      
      const cancelUrl = window.location.href; // Volver a la página actual

      console.log('🔗 Success URL:', successUrl);
      console.log('🎓 isAcademic:', isAcademic, '→ Ruta:', isAcademic ? '/validacion' : '/confirmacion');

      // 3. Construir payload para n8n
      const priceKey = getPriceKey();
      
      // 🔍 Debug: Verificar valores antes de construir payload
      console.log('🎯 Stripe - Valores de pago:', {
        isAcademic,
        academicRole,
        academicPriceData,
        finalAmount: AMOUNT,
        calculatedPriceKey: priceKey
      });
      
      const payload = {
        customer_id: parseInt(leadId),
        event_id: EVENT_ID,
        price_key: priceKey,
        client: 'congreso_nacional',
        msi_periods: 3, // Siempre 3 MSI (según la imagen)
        success_url: successUrl,
        cancel_url: cancelUrl
      };

      console.log('📤 Enviando solicitud a n8n:', payload);

      // 4. Llamar al webhook de n8n
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📬 Respuesta de n8n - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('❌ Error en respuesta de n8n:', errorText);
        throw new Error(ingles 
          ? 'Failed to create payment order. Please try again.' 
          : 'Error al crear la orden de pago. Por favor intente nuevamente.'
        );
      }

      // 5. Parsear respuesta
      const data = await response.json();
      console.log('✅ Respuesta de n8n:', data);

      // 6. Validar respuesta
      if (!data.success || !data.data?.access_url) {
        console.error('❌ Respuesta inválida de n8n:', data);
        throw new Error(data.message || (ingles 
          ? 'Invalid response from payment server.' 
          : 'Respuesta inválida del servidor de pagos.'
        ));
      }

      // 7. Guardar datos en localStorage
      const { order_id, access_url } = data.data;
      
      localStorage.setItem('lastLeadId', leadId.toString());
      localStorage.setItem('lastTransactionId', order_id);
      localStorage.setItem('lastPaymentMethod', 'stripe');
      localStorage.setItem('lastPaymentAmount', AMOUNT); // 🔥 GUARDAR MONTO
      localStorage.setItem('stripeAccessUrl', access_url);
      
      console.log('💾 Datos guardados en localStorage (incluye monto)');
      console.log('🔗 Access URL:', access_url);

      // 8. Redirigir en la MISMA ventana (como PayPal)
      console.log('🔄 Redirigiendo a Stripe Checkout...');
      window.location.href = access_url;

    } catch (error) {
      console.error('❌ Error en el proceso de pago:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || (ingles 
        ? 'An error occurred while processing your payment. Please try again.'
        : 'Ocurrió un error al procesar su pago. Por favor intente nuevamente.'
      ));
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {ingles ? 'Secure Payment' : 'Pago seguro en línea'}
      </h3>
      <p className={styles.description}>
        {ingles 
          ? 'Instant processing. You will receive your confirmation and QR code by email immediately.' 
          : 'Procesamiento instantáneo. Recibirá su confirmación y código QR por email inmediatamente.'}
      </p>
      
      {/* Monto Total */}
      <div className={styles.amountBox}>
        <span className={styles.amountLabel}>
          {ingles ? 'Total amount:' : 'Monto total:'}
        </span>
        <span className={styles.amount}>{formatPrice(finalAmount)}</span>
        
        {/* Badge de descuento académico */}
        {isAcademic && academicPriceData && academicPriceData.discount > 0 && (
          <div className={styles.academicBadge}>
            <span className={styles.academicBadgeIcon}>🎓</span>
            <span className={styles.academicBadgeText}>
              {ingles 
                ? `${academicPriceData.discountPercentage}% Academic Discount Applied` 
                : `${academicPriceData.discountPercentage}% Descuento Académico Aplicado`}
            </span>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className={styles.instructions}>
        <p>
          {ingles 
            ? 'Click the button below to complete your payment securely.' 
            : 'Haga clic en el botón de abajo para completar su pago de forma segura.'}
        </p>
      </div>

      {/* Estados de Pago */}
      {isProcessing && (
        <div className={styles.processingState}>
          <div className={styles.spinner}></div>
          <p>{ingles ? 'Redirecting to secure payment...' : 'Redirigiendo a pago seguro...'}</p>
          <small>{ingles ? 'Please wait' : 'Por favor espere'}</small>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>✕</div>
          <h4>{ingles ? 'Error' : 'Error'}</h4>
          <p>{errorMessage}</p>
          <button 
            className={styles.retryButton}
            onClick={handlePayment}
          >
            {ingles ? 'Try Again' : 'Intentar Nuevamente'}
          </button>
        </div>
      )}

      {/* Botón de Pago */}
      {!isProcessing && paymentStatus === null && (
        <>
          <button 
            className={styles.payButton}
            onClick={handlePayment}
          >
            {ingles ? 'Pay with Card' : 'Pagar con Tarjeta'}
          </button>
          
          {/* Iconos de métodos de pago aceptados */}
          <div className={styles.acceptedCards}>
            <span className={styles.acceptedCardsLabel}>
              {ingles ? 'We accept:' : 'Aceptamos:'}
            </span>
            <div className={styles.cardIcons}>
              {/* Visa */}
              <img 
                src="/image/global/visacard.png" 
                alt="Visa" 
                className={styles.cardIcon}
              />
              
              {/* Mastercard */}
              <img 
                src="/image/global/mastercard.png" 
                alt="Mastercard" 
                className={styles.cardIcon}
              />
              
              {/* American Express */}
              <img 
                src="/image/global/americancard.png" 
                alt="American Express" 
                className={styles.cardIcon}
              />
            </div>
          </div>
        </>
      )}

      {/* Información de Seguridad */}
      <div className={styles.securityInfo}>
        <div className={styles.securityIcon}>🔒</div>
        <small>
          {ingles 
            ? 'Secure payment. Your card information is encrypted and never stored on our servers.' 
            : 'Pago en línea. La información de tu tarjeta está cifrada y nunca se almacena en nuestros servidores.'}
        </small>
      </div>
    </div>
  );
};

export default StripeForm;
