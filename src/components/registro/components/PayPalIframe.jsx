import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import { formatPrice } from '../../../lib/academicPricing';
import styles from '../css/paypalIframe.module.css';
import supabase from '../../../lib/supabaseClient';

const PayPalIframe = ({ 
  leadId, 
  leadData, 
  academicPriceData = null, 
  isAcademic = false,
  academicRole = null // 🔥 NUEVO: Para determinar price_key
}) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;
  
  // 🔍 Debug: Ver qué academicRole estamos recibiendo
  
  const paypalContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'error' | 'cancelled'
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [retryKey, setRetryKey] = useState(0); // Key para forzar re-mount

  // Constantes del evento
  const EVENT_ID = 1; // ID del Congreso Nacional de Amparo
  
  // Calcular monto dinámico (académico o general)
  const finalAmount = academicPriceData && isAcademic 
    ? academicPriceData.finalPrice 
    : 990;
  
  const AMOUNT = finalAmount.toFixed(2);
  const CURRENCY = 'MXN';
  const WEBHOOK_URL = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_paypal_payment';
  
  // 🔥 Mapear rol académico a price_key (idéntico a StripeForm)
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

  // Obtener o crear customer en Supabase y devolver customer_id
  const getOrCreateCustomer = async () => {
    try {
      if (leadId) return parseInt(leadId);

      const email = leadData?.email || null;
      if (!email) return null;

      const { data: existing, error: selectError } = await supabase
        .from('customer')
        .select('customer_id')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (selectError) {
      }

      if (existing && existing.customer_id) {
        return existing.customer_id;
      }

      const insertPayload = {
        first_name: leadData?.first_name || null,
        last_name: leadData?.last_name || null,
        email: email,
        mobile_phone: leadData?.mobile_phone || null,
        status: 'pending',
        customer_parent_id: leadData?.customer_parent_id || null,
        customer_category_fk: leadData?.customer_category_fk || null,
        organization_fk: leadData?.organization_fk || null
      };

      const { data: inserted, error: insertError } = await supabase
        .from('customer')
        .insert(insertPayload)
        .select('customer_id')
        .single();

      if (insertError) {
        return null;
      }

      return inserted.customer_id;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    // Cargar PayPal SDK (solo una vez)
    const loadPayPalScript = () => {
      // Si PayPal ya está cargado, inicializar botón directamente
      if (window.paypal) {
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
        // Script ya existe, esperar a que termine de cargar
        if (window.paypal) {
          setIsLoading(false);
          setTimeout(() => {
            initializePayPalButton();
          }, 100);
        } else {
          existingScript.addEventListener('load', () => {
            setIsLoading(false);
            setTimeout(() => {
              initializePayPalButton();
            }, 100);
          });
        }
        return;
      }

      // Crear script nuevo solo si no existe
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AYiTUA_65en3x6x3c0GpJyKUVB4DShID2iGOnPU8JMRPU19bUMHcsFMOFGPGVfmcswpA9GCJqobcL99b&currency=${CURRENCY}&locale=${ingles ? 'en_US' : 'es_MX'}`;
      script.addEventListener('load', () => {
        setIsLoading(false);
        setTimeout(() => {
          initializePayPalButton();
        }, 100);
      });
      script.addEventListener('error', () => {
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
        return;
      }

      if (!paypalContainerRef.current) {
        return;
      }


      // Limpiar contenedor antes de renderizar (evitar duplicados)
      paypalContainerRef.current.innerHTML = '';


      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 45
        },

        // Crear orden de pago
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
          }).then(orderId => {
            return orderId;
          });
        },

        // Aprobar pago
        onApprove: async (data, actions) => {
          setIsProcessing(true);

          try {
            // 1. Intentar capturar con timeout de 15 segundos
            
            const capturePromise = actions.order.capture();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Capture timeout')), 15000)
            );

            let orderDetails;
            try {
              // Race entre captura y timeout
              orderDetails = await Promise.race([capturePromise, timeoutPromise]);
            } catch (captureError) {
              // Si falla la captura (window closed o timeout), usar solo el orderID
              
              // 🔍 Debug: Verificar valores antes de construir payload mínimo
              const calculatedPriceKey = getPriceKey();
                isAcademic,
                academicRole,
                academicPriceData,
                finalAmount: AMOUNT,
                calculatedPriceKey
              });
              
              // Construir payload mínimo con solo orderID
              const webhookPayload = {
                lead_id: parseInt(leadId),
                event_id: EVENT_ID,
                price_key: calculatedPriceKey, // 🔥 Usar el valor calculado explícitamente
                paypal_order_id: data.orderID, // Order ID de PayPal (único campo necesario)
                amount: parseFloat(AMOUNT),
                currency: CURRENCY,
                payer_email: null, // Backend lo obtendrá
                payer_info: null,
                payment_status: 'APPROVED', // Sabemos que fue aprobado
                timestamp: new Date().toISOString(),
                capture_failed: true // Flag para que backend capture manualmente
              };


              // Enviar webhook con datos mínimos
              try {
                // Resolver o crear customer antes de enviar webhook
                const resolvedCustomerId = await getOrCreateCustomer();
                const effectiveLeadId = resolvedCustomerId || (leadId ? parseInt(leadId) : null);
                const minimalPayload = { ...webhookPayload, lead_id: effectiveLeadId };

                const webhookResponse = await fetch(WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(minimalPayload)
                });

              
                if (webhookResponse.ok) {
                  const minimalWebhookData = await webhookResponse.json().catch(() => null); // 🔥 NUEVO: Capturar respuesta
                  
                  // ⏳ Esperar 2 segundos para que la BD se actualice
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  setPaymentStatus('success');
                  setTransactionId(data.orderID);
                  setIsProcessing(false);
                
                  // 💾 Guardar en localStorage como fallback
                  if (effectiveLeadId) {
                    localStorage.setItem('lastLeadId', effectiveLeadId.toString());
                  }
                  if (data.orderID) {
                    localStorage.setItem('lastTransactionId', data.orderID);
                  }
                  
                  // 🔥 NUEVO: Guardar webhook response en localStorage
                  if (minimalWebhookData) {
                    localStorage.setItem('lastWebhookResponse', JSON.stringify(minimalWebhookData));
                  }
                
                  const hasWebhookData = minimalWebhookData ? '&has_webhook=true' : '';
                  window.location.href = `/confirmacion?transaction_id=${data.orderID}&lead_id=${effectiveLeadId || ''}&method=paypal&status=pending_capture${hasWebhookData}`;
                  return; // Salir exitosamente
                }
              } catch (webhookError) {
              }

              // Si llegamos aquí, mostrar error al usuario pero con OrderID
              throw new Error(
                (ingles 
                  ? 'Payment approved but could not be processed. Please contact support with Order ID: ' 
                  : 'Pago aprobado pero no se pudo procesar. Por favor contacte a soporte con Order ID: '
                ) + data.orderID
              );
            }

            // 2. Si la captura fue exitosa, procesar normalmente
            const capture = orderDetails.purchase_units?.[0]?.payments?.captures?.[0];
            const transactionID = capture?.id;
            const paymentAmount = capture?.amount?.value;
            const paymentCurrency = capture?.amount?.currency_code;
            const paymentStatus = capture?.status || orderDetails.status;
            const payerEmail = orderDetails.payer?.email_address;
            const payerName = orderDetails.payer?.name?.given_name + ' ' + orderDetails.payer?.name?.surname;
            const payerId = orderDetails.payer?.payer_id;

              transactionID,
              payerEmail,
              paymentAmount,
              paymentStatus
            });

            if (transactionID) setTransactionId(transactionID);

            // 3. Construir payload completo
            // Resolver o crear customer antes de enviar webhook
            const resolvedCustomerId = await getOrCreateCustomer();
            const effectiveLeadId = resolvedCustomerId || (leadId ? parseInt(leadId) : null);

            // 🔍 Debug: Verificar valores antes de construir payload completo
            const calculatedPriceKey = getPriceKey();
              isAcademic,
              academicRole,
              academicPriceData,
              finalAmount: AMOUNT,
              calculatedPriceKey
            });

            const webhookPayload = {
              lead_id: effectiveLeadId,
              event_id: EVENT_ID,
              price_key: calculatedPriceKey, // 🔥 Usar el valor calculado explícitamente
              paypal_order_id: data.orderID, // Order ID de PayPal (único campo necesario)
              amount: paymentAmount ? parseFloat(paymentAmount) : parseFloat(AMOUNT),
              currency: paymentCurrency || CURRENCY,
              payer_email: payerEmail,
              payer_info: {
                name: payerName,
                email: payerEmail,
                payer_id: payerId
              },
              payment_status: paymentStatus,
              timestamp: new Date().toISOString(),
              capture_failed: false
            };


            // 4. Enviar webhook y esperar confirmación
            let webhookOk = false;
            let webhookData = null; // 🔥 NUEVO: Guardar la respuesta completa
            try {
              const webhookResponse = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload)
              });

              webhookOk = webhookResponse.ok;
              
              if (webhookResponse.ok) {
                webhookData = await webhookResponse.json(); // 🔥 NUEVO: Capturar la respuesta JSON
                
                // ⏳ ESPERAR 2 segundos adicionales para asegurar que la BD se actualice
                await new Promise(resolve => setTimeout(resolve, 2000));
              } else {
                const errorText = await webhookResponse.text().catch(() => '');
              }
            } catch (webErr) {
            }

            // 5. Marcar como exitoso y redirigir
            setPaymentStatus('success');
            setIsProcessing(false);

            // 💾 Guardar en localStorage como fallback
            const txId = transactionID || data.orderID;
            if (effectiveLeadId) {
              localStorage.setItem('lastLeadId', effectiveLeadId.toString());
            }
            if (txId) {
              localStorage.setItem('lastTransactionId', txId);
            }
            
            // 🔥 NUEVO: Guardar método de pago y monto
            localStorage.setItem('lastPaymentMethod', 'paypal');
            localStorage.setItem('lastPaymentAmount', AMOUNT); // 🔥 GUARDAR MONTO
            
            
            // 🔥 NUEVO: Guardar webhook response en localStorage
            if (webhookData) {
              localStorage.setItem('lastWebhookResponse', JSON.stringify(webhookData));
            }

            // Redirigir inmediatamente (ya esperamos arriba)
            const statusParam = webhookOk ? 'confirmed' : 'pending_webhook';
            
            // 🔥 NUEVO: Agregar flag para indicar que hay webhook data disponible
            const hasWebhookData = webhookData ? '&has_webhook=true' : '';
            window.location.href = `/confirmacion?transaction_id=${txId}&lead_id=${effectiveLeadId}&method=paypal&status=${statusParam}${hasWebhookData}`;

          } catch (error) {
            setPaymentStatus('error');
            setErrorMessage(error.message || (ingles 
              ? 'An error occurred while processing your payment. Please contact support.'
              : 'Ocurrió un error al procesar su pago. Por favor contacte a soporte.'
            ));
            setIsProcessing(false);
          }
        },

        // Error en el pago
        onError: (err) => {
          
          // Detectar si es el error de "Window closed"
          const isWindowClosed = err && (
            err.message?.includes('Window closed') || 
            err.toString().includes('Window closed')
          );

          if (isWindowClosed) {
            setPaymentStatus('cancelled');
            setErrorMessage(ingles 
              ? 'The PayPal window was closed. Please try again when ready.'
              : 'La ventana de PayPal fue cerrada. Por favor intente nuevamente cuando esté listo.'
            );
          } else {
            setPaymentStatus('error');
            setErrorMessage(ingles 
              ? 'An error occurred during payment. Please try again.'
              : 'Ocurrió un error durante el pago. Por favor intente nuevamente.'
            );
          }
          
          setIsProcessing(false);
        },

        // Cancelar pago
        onCancel: (data) => {
          setPaymentStatus('cancelled');
          setErrorMessage(ingles 
            ? 'Payment was cancelled. You can try again when ready.'
            : 'El pago fue cancelado. Puede intentar nuevamente cuando esté listo.'
          );
        },

        // Callback cuando se hace clic en el botón
        onClick: (data, actions) => {
          return actions.resolve();
        },

        // Callback cuando el botón está listo
        onInit: (data, actions) => {
        }

      }).render(paypalContainerRef.current).then(() => {
      }).catch((error) => {
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

  {/*     <div className={styles.debugInfo}>
        <small>🔧 Debug: Lead ID = {leadId} | Event ID = {EVENT_ID}</small>
      </div> */}
    </div>
  );
};

export default PayPalIframe;
