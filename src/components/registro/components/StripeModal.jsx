import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import { formatPrice } from '../../../lib/academicPricing';
import styles from '../css/stripeModal.module.css';

/**
 * StripeModal - Componente de pago con Stripe usando SDK embebido
 * 
 * Flujo similar a PayPal:
 * 1. Usuario click en "Pagar con Tarjeta"
 * 2. Se abre modal con formulario Stripe embebido
 * 3. Usuario completa pago → Modal se cierra automáticamente
 * 4. Animación "Procesando..." → Webhook a n8n
 * 5. Navega a /confirmacion con transaction_id
 * 
 * @param {number} leadId - ID del customer en Supabase
 * @param {Object} leadData - Datos completos del lead
 * @param {Object} academicPriceData - Datos de precio académico (si aplica)
 * @param {boolean} isAcademic - Si el usuario tiene descuento académico
 * @param {string} academicRole - Rol académico: 'profesor' | 'posgrado' | 'licenciatura'
 */
const StripeModal = ({ 
  leadId, 
  leadData, 
  academicPriceData = null, 
  isAcademic = false,
  academicRole = null
}) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [elements, setElements] = useState(null); // 🔥 NUEVO: Instancia de Stripe Elements

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
    
    // ✅ NUEVO ESQUEMA: Licenciatura tiene precio especial ($250), otros roles $490
    if (academicRole === 'licenciatura') {
      const priceKey = 'precio_estudiante_licenciatura'; // Licenciatura → $250 MXN (75% desc)
      return priceKey;
    }
    
    const priceKey = 'precio_academico'; // Profesor/Posgrado → $490 MXN (50% desc)
    return priceKey;
  };

  // 1️⃣ Cargar Stripe.js SDK
  useEffect(() => {
    const loadStripeSDK = async () => {
      // Si ya está cargado, no volver a cargar
      if (window.Stripe) {
        setStripeLoaded(true);
        setIsLoading(false);
        return;
      }

      // Verificar si el script ya está en el DOM
      const existingScript = document.querySelector('script[src*="js.stripe.com/v3"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setStripeLoaded(true);
          setIsLoading(false);
        });
        return;
      }

      // Cargar script dinámicamente
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        setStripeLoaded(true);
        setIsLoading(false);
      };
      script.onerror = () => {
        setErrorMessage(ingles 
          ? 'Failed to load payment system. Please refresh the page.' 
          : 'Error al cargar el sistema de pago. Por favor recarga la página.');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    loadStripeSDK();
  }, [ingles]);

  // 2️⃣ Montar Stripe Payment Element cuando tengamos stripe y clientSecret
  useEffect(() => {
    if (!stripe || !clientSecret || elements) return;


    const appearance = {
      theme: 'stripe',
      variables: {
        colorPrimary: '#020266', // Azul institucional
        colorBackground: '#ffffff',
        colorText: '#1A202C',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      }
    };

    const elementsInstance = stripe.elements({
      clientSecret,
      appearance
    });

    const paymentElement = elementsInstance.create('payment');
    paymentElement.mount('#payment-element');

    setElements(elementsInstance);


    // Cleanup al desmontar
    return () => {
      if (paymentElement) {
        paymentElement.unmount();
      }
    };
  }, [stripe, clientSecret]);

  // 3️⃣ Crear PaymentIntent en n8n y obtener clientSecret
  const initializePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus(null);
    setErrorMessage('');

    try {
      // Validar leadId
      if (!leadId) {
        throw new Error(ingles 
          ? 'Customer ID not found. Please complete the registration form first.' 
          : 'ID de cliente no encontrado. Por favor complete el formulario de registro primero.'
        );
      }

      // Construir payload para n8n
      const priceKey = getPriceKey();
      
      const payload = {
        customer_id: parseInt(leadId),
        event_id: EVENT_ID,
        price_key: priceKey,
        client: 'congreso_nacional',
        msi_periods: 3,
        mode: 'embedded' // 🔥 NUEVO: Indicar que queremos modo embebido (no redirect)
      };


      // Llamar al webhook de n8n (debe devolver clientSecret en vez de access_url)
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });


      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(ingles 
          ? 'Failed to create payment order. Please try again.' 
          : 'Error al crear la orden de pago. Por favor intente nuevamente.'
        );
      }

      const data = await response.json();

      // Validar respuesta (debe incluir client_secret)
      if (!data.success || !data.data?.client_secret) {
        throw new Error(data.message || (ingles 
          ? 'Invalid response from payment server.' 
          : 'Respuesta inválida del servidor de pagos.'
        ));
      }

      const { client_secret, order_id } = data.data;
      setClientSecret(client_secret);

      // Guardar en localStorage
      localStorage.setItem('lastLeadId', leadId.toString());
      localStorage.setItem('lastTransactionId', order_id);
      localStorage.setItem('lastPaymentMethod', 'stripe');
      localStorage.setItem('lastPaymentAmount', AMOUNT); // 🔥 GUARDAR MONTO
      

      // Inicializar Stripe
      const stripeInstance = window.Stripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);

      setIsProcessing(false);

    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error.message || (ingles 
        ? 'An error occurred while initializing payment.' 
        : 'Ocurrió un error al inicializar el pago.'
      ));
      setIsProcessing(false);
    }
  };

  // 4️⃣ Procesar pago con Stripe Elements
  const handlePayment = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirmar pago usando elements (nueva API)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmacion?lead_id=${leadId}&method=stripe&status=confirmed`,
        },
        redirect: 'if_required' // 🔥 NO redirigir, manejar en cliente
      });

      if (error) {
        setPaymentStatus('error');
        setErrorMessage(error.message || (ingles 
          ? 'Payment failed. Please try again.' 
          : 'Pago fallido. Por favor intente nuevamente.'
        ));
        setIsProcessing(false);
        return;
      }

      
      // Guardar response en localStorage
      const webhookResponse = {
        success: true,
        data: {
          payment_id: paymentIntent.id,
          payment_status: 'Completed',
          stripe_transaction_id: paymentIntent.id,
          amount: finalAmount,
          currency: CURRENCY,
          created_at: new Date().toISOString()
        }
      };
      
      localStorage.setItem('lastWebhookResponse', JSON.stringify(webhookResponse));
      
      // Mostrar estado de éxito
      setPaymentStatus('success');
      
      // Esperar 2 segundos para mostrar mensaje y luego navegar
      setTimeout(() => {
        window.location.href = `/confirmacion?transaction_id=${paymentIntent.id}&lead_id=${leadId}&method=stripe&status=confirmed`;
      }, 2000);

    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error.message || (ingles 
        ? 'Unexpected error processing payment.' 
        : 'Error inesperado al procesar el pago.'
      ));
      setIsProcessing(false);
    }
  };

  // Renderizar estado de carga inicial
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>{ingles ? 'Loading payment system...' : 'Cargando sistema de pago...'}</p>
        </div>
      </div>
    );
  }

  // Renderizar botón de inicialización (antes de crear PaymentIntent)
  if (!clientSecret) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          {ingles ? 'Secure Payment with Stripe' : 'Pago seguro con Stripe'}
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

        {/* Estado de error */}
        {paymentStatus === 'error' && (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>✕</div>
            <h4>{ingles ? 'Error' : 'Error'}</h4>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Botón de inicialización */}
        <button 
          className={styles.payButton}
          onClick={initializePayment}
          disabled={isProcessing}
        >
          {isProcessing 
            ? (ingles ? 'Initializing...' : 'Inicializando...') 
            : (ingles ? 'Pay with Card' : 'Pagar con Tarjeta')}
        </button>

        {/* Información de Seguridad */}
        <div className={styles.securityInfo}>
          <div className={styles.securityIcon}>🔒</div>
          <small>
            {ingles 
              ? 'Secure payment powered by Stripe. Your card information is encrypted and never stored on our servers.' 
              : 'Pago seguro con Stripe. La información de tu tarjeta está cifrada y nunca se almacena en nuestros servidores.'}
          </small>
        </div>
      </div>
    );
  }

  // Renderizar formulario de pago (Stripe Elements)
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {ingles ? 'Complete Your Payment' : 'Complete su Pago'}
      </h3>

      {/* Estado de éxito */}
      {paymentStatus === 'success' && (
        <div className={styles.successState}>
          <div className={styles.successIcon}>✓</div>
          <h4>{ingles ? 'Payment Successful!' : '¡Pago Exitoso!'}</h4>
          <p>{ingles ? 'Redirecting to confirmation...' : 'Redirigiendo a confirmación...'}</p>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* Estado de error */}
      {paymentStatus === 'error' && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>✕</div>
          <h4>{ingles ? 'Error' : 'Error'}</h4>
          <p>{errorMessage}</p>
          <button 
            className={styles.retryButton}
            onClick={() => {
              setPaymentStatus(null);
              setErrorMessage('');
            }}
          >
            {ingles ? 'Try Again' : 'Intentar Nuevamente'}
          </button>
        </div>
      )}

      {/* Formulario de pago (oculto mientras se procesa o si hay éxito/error) */}
      {!isProcessing && paymentStatus === null && (
        <form onSubmit={handlePayment} className={styles.paymentForm}>
          {/* Aquí iría el Stripe Payment Element */}
          <div id="payment-element" className={styles.stripeElement}>
            {/* Stripe montará aquí el formulario de tarjeta */}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!stripe || !elements || isProcessing}
          >
            {ingles ? 'Pay Now' : 'Pagar Ahora'}
          </button>
        </form>
      )}

      {/* Estado de procesamiento */}
      {isProcessing && paymentStatus === null && (
        <div className={styles.processingState}>
          <div className={styles.spinner}></div>
          <p>{ingles ? 'Processing payment...' : 'Procesando pago...'}</p>
          <small>{ingles ? 'Please wait' : 'Por favor espere'}</small>
        </div>
      )}
    </div>
  );
};

export default StripeModal;
