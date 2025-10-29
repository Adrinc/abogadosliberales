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
  console.log('🎓 PayPalIframe recibido - isAcademic:', isAcademic, 'academicRole:', academicRole);
  
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
    : 1990;
  
  const AMOUNT = finalAmount.toFixed(2);
  const CURRENCY = 'MXN';
  const WEBHOOK_URL = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_paypal_payment';
  
  // 🔥 Mapear rol académico a price_key (idéntico a StripeForm)
  const getPriceKey = () => {
    if (!isAcademic || !academicRole) {
      return 'precio_lista_congreso'; // Precio general ($1,990 MXN)
    }
    
    // ✅ Mapeo CORRECTO según especificación del backend:
    const roleMapping = {
      'profesor': 'precio_prof_estud_pos',      // Profesor/Personal Educativo → $1,692 MXN
      'posgrado': 'precio_prof_estud_pos',      // Estudiante de Posgrado → $1,692 MXN
      'licenciatura': 'precio_estudiante_lic',  // Estudiante de Licenciatura → $995 MXN
    };
    
    const priceKey = roleMapping[academicRole] || 'precio_lista_congreso';
    console.log('🎯 PayPal getPriceKey() - Role:', academicRole, '→ Price Key:', priceKey);
    return priceKey;
  };

  // Obtener o crear customer en Supabase y devolver customer_id
  const getOrCreateCustomer = async () => {
    try {
      if (leadId) return parseInt(leadId);

      const email = leadData?.email || null;
      if (!email) return null;

      console.log('🔎 Looking up customer by email in Supabase:', email);
      const { data: existing, error: selectError } = await supabase
        .from('customer')
        .select('customer_id')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.warn('⚠️ Supabase select error (non-fatal):', selectError.message || selectError);
      }

      if (existing && existing.customer_id) {
        console.log('✅ Found existing customer_id:', existing.customer_id);
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

      console.log('📥 Inserting new customer in Supabase:', { email });
      const { data: inserted, error: insertError } = await supabase
        .from('customer')
        .insert(insertPayload)
        .select('customer_id')
        .single();

      if (insertError) {
        console.warn('⚠️ Supabase insert error (continuing without lead_id):', insertError.message || insertError);
        return null;
      }

      console.log('✅ New customer created with customer_id:', inserted.customer_id);
      return inserted.customer_id;
    } catch (err) {
      console.error('❌ Unexpected Supabase error:', err);
      return null;
    }
  };

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
      script.src = `https://www.paypal.com/sdk/js?client-id=AYiTUA_65en3x6x3c0GpJyKUVB4DShID2iGOnPU8JMRPU19bUMHcsFMOFGPGVfmcswpA9GCJqobcL99b&currency=${CURRENCY}&locale=${ingles ? 'en_US' : 'es_MX'}`;
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

        // Crear orden de pago
        createOrder: (data, actions) => {
          console.log('📋 Creating PayPal order...', { leadId, eventId: EVENT_ID, amount: AMOUNT });
          
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
            console.log('✅ PayPal order created successfully:', orderId);
            return orderId;
          });
        },

        // Aprobar pago
        onApprove: async (data, actions) => {
          console.log('🎉 Payment approved! Order ID:', data.orderID);
          setIsProcessing(true);

          try {
            // 1. Intentar capturar con timeout de 15 segundos
            console.log('💳 Capturing order details via PayPal API...');
            
            const capturePromise = actions.order.capture();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Capture timeout')), 15000)
            );

            let orderDetails;
            try {
              // Race entre captura y timeout
              orderDetails = await Promise.race([capturePromise, timeoutPromise]);
              console.log('📦 Order details captured:', orderDetails);
            } catch (captureError) {
              // Si falla la captura (window closed o timeout), usar solo el orderID
              console.warn('⚠️ Capture failed, but order was approved:', captureError.message);
              console.log('📋 Using orderID only for webhook:', data.orderID);
              
              // 🔍 Debug: Verificar valores antes de construir payload mínimo
              const calculatedPriceKey = getPriceKey();
              console.log('🎯 PayPal (minimal) - Valores de pago:', {
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

              console.log('📤 Sending minimal webhook to n8n:', webhookPayload);

              // Enviar webhook con datos mínimos
              try {
                // Resolver o crear customer antes de enviar webhook
                const resolvedCustomerId = await getOrCreateCustomer();
                const effectiveLeadId = resolvedCustomerId || (leadId ? parseInt(leadId) : null);
                const minimalPayload = { ...webhookPayload, lead_id: effectiveLeadId };

                console.log('📤 Sending minimal webhook with lead_id:', effectiveLeadId);
                const webhookResponse = await fetch(WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(minimalPayload)
                });

                console.log('Webhook response status:', webhookResponse.status);
              
                if (webhookResponse.ok) {
                  const minimalWebhookData = await webhookResponse.json().catch(() => null); // 🔥 NUEVO: Capturar respuesta
                  console.log('✅ Webhook processed successfully (minimal data):', minimalWebhookData);
                  
                  // ⏳ Esperar 2 segundos para que la BD se actualice
                  console.log('⏳ Waiting for database to update...');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  setPaymentStatus('success');
                  setTransactionId(data.orderID);
                  setIsProcessing(false);
                
                  // 💾 Guardar en localStorage como fallback
                  if (effectiveLeadId) {
                    localStorage.setItem('lastLeadId', effectiveLeadId.toString());
                    console.log('💾 Saved leadId to localStorage:', effectiveLeadId);
                  }
                  if (data.orderID) {
                    localStorage.setItem('lastTransactionId', data.orderID);
                    console.log('💾 Saved transactionId to localStorage:', data.orderID);
                  }
                  
                  // 🔥 NUEVO: Guardar webhook response en localStorage
                  if (minimalWebhookData) {
                    localStorage.setItem('lastWebhookResponse', JSON.stringify(minimalWebhookData));
                    console.log('💾 Saved minimal webhook response to localStorage');
                  }
                
                  console.log('🔄 Redirecting to confirmation page...');
                  const hasWebhookData = minimalWebhookData ? '&has_webhook=true' : '';
                  window.location.href = `/confirmacion?transaction_id=${data.orderID}&lead_id=${effectiveLeadId || ''}&method=paypal&status=pending_capture${hasWebhookData}`;
                  return; // Salir exitosamente
                }
              } catch (webhookError) {
                console.error('❌ Webhook failed:', webhookError);
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

            console.log('✅ Payment captured successfully:', {
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
            console.log('🎯 PayPal (full) - Valores de pago:', {
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

            console.log('📤 Sending webhook to n8n:', webhookPayload);

            // 4. Enviar webhook y esperar confirmación
            let webhookOk = false;
            let webhookData = null; // 🔥 NUEVO: Guardar la respuesta completa
            try {
              console.log('📤 Sending webhook to n8n and waiting for response...');
              const webhookResponse = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload)
              });

              console.log('📬 Webhook response status:', webhookResponse.status);
              webhookOk = webhookResponse.ok;
              
              if (webhookResponse.ok) {
                webhookData = await webhookResponse.json(); // 🔥 NUEVO: Capturar la respuesta JSON
                console.log('✅ Webhook processed successfully:', webhookData);
                
                // ⏳ ESPERAR 2 segundos adicionales para asegurar que la BD se actualice
                console.log('⏳ Waiting for database to update...');
                await new Promise(resolve => setTimeout(resolve, 2000));
              } else {
                const errorText = await webhookResponse.text().catch(() => '');
                console.error('❌ Webhook error:', errorText);
              }
            } catch (webErr) {
              console.warn('⚠️ Webhook not reachable or failed:', webErr);
            }

            // 5. Marcar como exitoso y redirigir
            setPaymentStatus('success');
            setIsProcessing(false);
            console.log('🎉 Payment completed successfully, redirecting...');

            // 💾 Guardar en localStorage como fallback
            const txId = transactionID || data.orderID;
            if (effectiveLeadId) {
              localStorage.setItem('lastLeadId', effectiveLeadId.toString());
              console.log('💾 Saved leadId to localStorage:', effectiveLeadId);
            }
            if (txId) {
              localStorage.setItem('lastTransactionId', txId);
              console.log('💾 Saved transactionId to localStorage:', txId);
            }
            
            // 🔥 NUEVO: Guardar método de pago
            localStorage.setItem('lastPaymentMethod', 'paypal');
            console.log('💾 Saved payment method to localStorage: paypal');
            
            // 🔥 NUEVO: Guardar webhook response en localStorage
            if (webhookData) {
              localStorage.setItem('lastWebhookResponse', JSON.stringify(webhookData));
              console.log('💾 Saved webhook response to localStorage');
            }

            // Redirigir inmediatamente (ya esperamos arriba)
            const statusParam = webhookOk ? 'confirmed' : 'pending_webhook';
            console.log('🔄 Redirecting to confirmation page...');
            
            // 🔥 NUEVO: Agregar flag para indicar que hay webhook data disponible
            const hasWebhookData = webhookData ? '&has_webhook=true' : '';
            window.location.href = `/confirmacion?transaction_id=${txId}&lead_id=${effectiveLeadId}&method=paypal&status=${statusParam}${hasWebhookData}`;

          } catch (error) {
            console.error('❌ Error during PayPal approval handling:', error);
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
          console.error('❌ PayPal error:', err);
          console.error('Error type:', typeof err);
          console.error('Error details:', JSON.stringify(err, null, 2));
          
          // Detectar si es el error de "Window closed"
          const isWindowClosed = err && (
            err.message?.includes('Window closed') || 
            err.toString().includes('Window closed')
          );

          if (isWindowClosed) {
            console.warn('⚠️ User closed PayPal window before completing payment');
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
          console.log('⚠️ Payment cancelled by user:', data);
          console.log('Order ID:', data.orderID);
          setPaymentStatus('cancelled');
          setErrorMessage(ingles 
            ? 'Payment was cancelled. You can try again when ready.'
            : 'El pago fue cancelado. Puede intentar nuevamente cuando esté listo.'
          );
        },

        // Callback cuando se hace clic en el botón
        onClick: (data, actions) => {
          console.log('👆 PayPal button clicked:', data);
          return actions.resolve();
        },

        // Callback cuando el botón está listo
        onInit: (data, actions) => {
          console.log('🚀 PayPal button initialized');
        }

      }).render(paypalContainerRef.current).then(() => {
        console.log('✅ PayPal button rendered successfully');
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
