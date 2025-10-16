import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/paypalIframe.module.css';

const PayPalIframe = ({ leadId, leadData }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;
  
  const paypalContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'error' | 'cancelled'
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [retryKey, setRetryKey] = useState(0); // Key para forzar re-mount

  // Constantes del evento
  const EVENT_ID = 1; // ID del Congreso Nacional de Amparo
  const AMOUNT = '1990.00'; // MXN
  const CURRENCY = 'MXN';
  const WEBHOOK_URL = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_paypal_payment';

  useEffect(() => {
    // Cargar PayPal SDK (solo una vez)
    const loadPayPalScript = () => {
      // Si PayPal ya está cargado, inicializar botón directamente
      if (window.paypal) {
        console.log('PayPal SDK already loaded');
        setIsLoading(false);
        // Usar setTimeout para asegurar que el DOM está listo
        setTimeout(() => {
          initializePayPalButton();
        }, 100);
        return;
      }

      // Verificar si el script ya está en el DOM (evitar duplicados)
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        console.log('PayPal script found in DOM, waiting for load...');
        // Script ya existe, esperar a que termine de cargar
        if (window.paypal) {
          setIsLoading(false);
          setTimeout(() => {
            initializePayPalButton();
          }, 100);
        } else {
          existingScript.addEventListener('load', () => {
            console.log('PayPal script loaded from existing script');
            setIsLoading(false);
            setTimeout(() => {
              initializePayPalButton();
            }, 100);
          });
        }
        return;
      }

      // Crear script nuevo solo si no existe
      console.log('Loading PayPal SDK...');
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AWc8tEOJfCnQv2IX4DlIkHCYX4u6jxdQFICl8JlV-sMGSqkRbK_2o10dufkhJvbT-vWYj9NsxDQDHqZd&currency=${CURRENCY}&locale=${ingles ? 'en_US' : 'es_MX'}`;
      script.addEventListener('load', () => {
        console.log('PayPal SDK loaded successfully');
        setIsLoading(false);
        setTimeout(() => {
          initializePayPalButton();
        }, 100);
      });
      script.addEventListener('error', () => {
        console.error('Failed to load PayPal SDK');
        setIsLoading(false);
        setPaymentStatus('error');
        setErrorMessage(ingles 
          ? 'Failed to load PayPal. Please refresh the page.' 
          : 'Error al cargar PayPal. Por favor recargue la página.'
        );
      });
      document.body.appendChild(script);
    };

    const initializePayPalButton = () => {
      if (!window.paypal) {
        console.error('PayPal SDK not available');
        return;
      }

      if (!paypalContainerRef.current) {
        console.error('PayPal container ref not available');
        return;
      }

      console.log('✓ PayPal SDK ready');
      console.log('✓ Container ready');

      // Limpiar contenedor antes de renderizar (evitar duplicados)
      paypalContainerRef.current.innerHTML = '';

      console.log('Initializing PayPal button...');

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 45
        },

        // Crear orden de pago@
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: CURRENCY,
                value: AMOUNT
              },
              description: ingles 
                ? 'National Congress on Amparo and Human Rights 2025 - Registration'
                : 'Congreso Nacional de Amparo y Derechos Humanos 2025 - Registro',
              custom_id: `${leadId}`, // Pasar lead_id para tracking
              invoice_id: `CONGRESO-${EVENT_ID}-${leadId}-${Date.now()}`
            }],
            application_context: {
              brand_name: 'Barra Mexicana de Abogados Liberales',
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },

        // Aprobar pago
        onApprove: async (data, actions) => {
          setIsProcessing(true);
          
          try {
            // Capturar detalles del pago
            const orderDetails = await actions.order.capture();
            const transactionID = orderDetails.purchase_units[0].payments.captures[0].id;
            const payerEmail = orderDetails.payer.email_address;
            const paymentAmount = orderDetails.purchase_units[0].payments.captures[0].amount.value;

            setTransactionId(transactionID);

            // Llamar webhook n8n para procesar el pago
            const webhookPayload = {
              lead_id: parseInt(leadId),
              event_id: EVENT_ID,
              paypal_transaction_id: transactionID,
              amount: parseFloat(paymentAmount),
              currency: CURRENCY,
              payer_email: payerEmail,
              order_id: data.orderID,
              payer_info: {
                name: orderDetails.payer.name.given_name + ' ' + orderDetails.payer.name.surname,
                email: payerEmail,
                payer_id: orderDetails.payer.payer_id
              },
              payment_status: orderDetails.status,
              timestamp: new Date().toISOString()
            };

            const webhookResponse = await fetch(WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(webhookPayload)
            });

            if (!webhookResponse.ok) {
              throw new Error(`Webhook error: ${webhookResponse.status}`);
            }

            // Éxito
            setPaymentStatus('success');
            setIsProcessing(false);

            // Redirigir después de 3 segundos
            setTimeout(() => {
              window.location.href = `/confirmacion?transaction_id=${transactionID}&lead_id=${leadId}&method=paypal&status=confirmed`;
            }, 3000);

          } catch (error) {
            console.error('Error processing payment:', error);
            setPaymentStatus('error');
            setErrorMessage(ingles 
              ? 'Payment was successful, but there was an error processing your registration. Please contact support with your transaction ID.'
              : 'El pago se realizó correctamente, pero hubo un error al procesar su registro. Por favor contacte a soporte con su ID de transacción.'
            );
            setIsProcessing(false);
          }
        },

        // Error en el pago
        onError: (err) => {
          console.error('PayPal error:', err);
          setPaymentStatus('error');
          setErrorMessage(ingles 
            ? 'An error occurred during payment. Please try again.'
            : 'Ocurrió un error durante el pago. Por favor intente nuevamente.'
          );
          setIsProcessing(false);
        },

        // Cancelar pago
        onCancel: (data) => {
          console.log('Payment cancelled:', data);
          setPaymentStatus('cancelled');
          setErrorMessage(ingles 
            ? 'Payment was cancelled. You can try again when ready.'
            : 'El pago fue cancelado. Puede intentar nuevamente cuando esté listo.'
          );
        }

      }).render(paypalContainerRef.current).then(() => {
        console.log('PayPal button rendered successfully');
      }).catch((error) => {
        console.error('Error rendering PayPal button:', error);
        setIsLoading(false);
        setPaymentStatus('error');
        setErrorMessage(ingles 
          ? 'Failed to render PayPal button. Please refresh the page.' 
          : 'Error al renderizar el botón de PayPal. Por favor recargue la página.'
        );
      });
    };

    loadPayPalScript();

    // Cleanup: NO remover el script para que persista entre cambios de tab
    return () => {
      // Limpieza del contenedor de botones solamente (no del script)
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = '';
      }
    };
  }, [leadId, ingles, retryKey]);

  // Función para resetear el estado y volver a intentar
  const handleRetry = () => {
    console.log('Retrying payment...');
    setPaymentStatus(null);
    setErrorMessage('');
    setTransactionId('');
    setIsProcessing(false);
    setRetryKey(prev => prev + 1); // Forzar re-mount del useEffect
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t.paypal.title}</h3>
      <p className={styles.description}>{t.paypal.description}</p>
      
      <div className={styles.amountBox}>
        <span className={styles.amountLabel}>{ingles ? 'Total amount:' : 'Monto total:'}</span>
        <span className={styles.amount}>{t.paypal.amount}</span>
      </div>

      <div className={styles.instructions}>
        <p>{t.paypal.instructions}</p>
      </div>

      {/* Estados de Pago */}
      {isLoading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>{ingles ? 'Loading PayPal...' : 'Cargando PayPal...'}</p>
        </div>
      )}

      {isProcessing && (
        <div className={styles.processingState}>
          <div className={styles.spinner}></div>
          <p>{ingles ? 'Processing payment...' : 'Procesando pago...'}</p>
          <small>{ingles ? 'Please do not close this window' : 'Por favor no cierre esta ventana'}</small>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className={styles.successState}>
          <div className={styles.successIcon}>✓</div>
          <h4>{ingles ? 'Payment successful!' : '¡Pago exitoso!'}</h4>
          <p>{ingles ? 'Redirecting to confirmation...' : 'Redirigiendo a confirmación...'}</p>
          {transactionId && (
            <small className={styles.transactionId}>
              {ingles ? 'Transaction ID:' : 'ID de transacción:'} {transactionId}
            </small>
          )}
        </div>
      )}

      {(paymentStatus === 'error' || paymentStatus === 'cancelled') && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>✕</div>
          <h4>{ingles ? 'Error' : 'Error'}</h4>
          <p>{errorMessage}</p>
          {transactionId && (
            <small className={styles.transactionId}>
              {ingles ? 'Transaction ID:' : 'ID de transacción:'} {transactionId}
            </small>
          )}
          <button 
            className={styles.retryButton}
            onClick={handleRetry}
          >
            {ingles ? 'Try Again' : 'Intentar Nuevamente'}
          </button>
        </div>
      )}

      {/* Contenedor de botones PayPal */}
      {!isLoading && !isProcessing && paymentStatus === null && (
        <div ref={paypalContainerRef} className={styles.paypalButtonContainer}></div>
      )}

      <div className={styles.debugInfo}>
        <small>🔧 Debug: Lead ID = {leadId} | Event ID = {EVENT_ID}</small>
      </div>
    </div>
  );
};

export default PayPalIframe;
