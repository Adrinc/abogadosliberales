import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import supabase from '../../lib/supabaseClient';
import styles from './confirmacion.module.css';
// 🚫 TEMPORAL: DebugPanel comentado para deploy - Descomentar para debugging
// import DebugPanel from './DebugPanel.jsx';

const ConfirmacionSeccion = ({ transactionId, leadId, paymentMethod, status, hasData }) => {
  const ingles = useStore(isEnglish);
  
  // Estados para datos del cliente y pago
  const [customerData, setCustomerData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [webhookResponseFromStorage, setWebhookResponseFromStorage] = useState(null); // 🔥 NUEVO
  const [manualRetryTrigger, setManualRetryTrigger] = useState(0); // 🔄 Para botón de reintentar manual

  // Cargar datos del cliente y pago desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 ConfirmacionSeccion - Starting fetchData...');
      console.log('📋 Props received:', { 
        hasData, 
        leadId, 
        transactionId, 
        paymentMethod, 
        status 
      });

      // 🚨 FALLBACK RADICAL: Si no hay leadId, intentar obtenerlo de localStorage
      let effectiveLeadId = leadId;
      let effectiveTransactionId = transactionId;
      let localWebhookResponse = null; // 🔥 Variable local para el webhook response

      console.log('═══════════════════════════════════════════');
      console.log('🔍 VERIFICACIÓN DE PARÁMETROS INICIALES');
      console.log('═══════════════════════════════════════════');
      console.log('📋 leadId (prop):', leadId, typeof leadId);
      console.log('📋 transactionId (prop):', transactionId, typeof transactionId);
      console.log('📋 paymentMethod (prop):', paymentMethod);
      console.log('📋 status (prop):', status);
      console.log('═══════════════════════════════════════════');

      // 🔥 NUEVO: Intentar obtener webhook response de localStorage PRIMERO
      try {
        const storedWebhookResponse = localStorage.getItem('lastWebhookResponse');
        if (storedWebhookResponse) {
          localWebhookResponse = JSON.parse(storedWebhookResponse);
          setWebhookResponseFromStorage(localWebhookResponse); // Guardar en estado
          console.log('✅ Found webhook response in localStorage:', localWebhookResponse);
        } else {
          console.log('⚠️ No webhook response found in localStorage');
        }
      } catch (e) {
        console.error('❌ Error parsing webhook response from localStorage:', e);
      }

      if (!leadId || !transactionId) {
        console.warn('⚠️ Missing params in URL, checking localStorage...');
        console.log('🔍 leadId missing?:', !leadId);
        console.log('🔍 transactionId missing?:', !transactionId);
        
        const storedLeadId = localStorage.getItem('lastLeadId');
        const storedTransactionId = localStorage.getItem('lastTransactionId');
        
        if (storedLeadId) {
          effectiveLeadId = parseInt(storedLeadId, 10);
          console.log('✅ Recovered leadId from localStorage:', effectiveLeadId);
        }
        
        if (storedTransactionId) {
          effectiveTransactionId = storedTransactionId;
          console.log('✅ Recovered transactionId from localStorage:', effectiveTransactionId);
        }
      }

      if (!effectiveLeadId) {
        console.error('❌ No leadId available (URL or localStorage)');
        setIsLoading(false);
        setError('no_lead_id');
        return;
      }

      try {
        console.log('📥 Fetching customer data for leadId:', effectiveLeadId, 'Type:', typeof effectiveLeadId);
        
        // 1. Obtener datos del cliente (effectiveLeadId ya es número)
        const customerQuery = supabase
          .from('customer')
          .select('customer_id, first_name, last_name, email, mobile_phone, status')
          .eq('customer_id', effectiveLeadId);

        console.log('🔍 Customer query:', customerQuery);

        const { data: customer, error: customerError } = await customerQuery.single();

        console.log('📊 Customer query result:', { customer, error: customerError });

        if (customerError) {
          console.error('❌ Error fetching customer:', customerError);
          console.error('❌ Error details:', JSON.stringify(customerError, null, 2));
          setError('customer');
          setIsLoading(false);
          return;
        }

        console.log('✅ Customer data loaded:', customer);
        setCustomerData(customer);

        // 🎓 DETECTAR SI ES COMPRA ACADÉMICA
        const isAcademicPurchase = localStorage.getItem('isAcademicPurchase') === 'true';
        // 💳 DETECTAR MÉTODO DE PAGO
        const paymentMethod = localStorage.getItem('lastPaymentMethod') || 'unknown';
        
        console.log('═══════════════════════════════════════════');
        console.log('🎓 VERIFICACIÓN DE TIPO DE COMPRA Y MÉTODO DE PAGO');
        console.log('═══════════════════════════════════════════');
        console.log('🎓 isAcademicPurchase:', isAcademicPurchase);
        console.log('� paymentMethod:', paymentMethod);
        console.log('�📋 localStorage.getItem("isAcademicPurchase"):', localStorage.getItem('isAcademicPurchase'));
        console.log('📋 localStorage.getItem("lastPaymentMethod"):', localStorage.getItem('lastPaymentMethod'));
        console.log('═══════════════════════════════════════════');

        // 🔥 REGLA: QR solo para compras GENERALES (NO académicas) pagadas con STRIPE
        // ✅ Mostrar QR: isAcademicPurchase === false && paymentMethod === 'stripe'
        // ❌ NO mostrar QR: isAcademicPurchase === true || paymentMethod !== 'stripe'
        const shouldSearchForQR = !isAcademicPurchase && paymentMethod === 'stripe';
        
        console.log('═══════════════════════════════════════════');
        console.log('🔍 DECISIÓN DE BÚSQUEDA DE QR');
        console.log('═══════════════════════════════════════════');
        console.log('✅ shouldSearchForQR:', shouldSearchForQR);
        if (!shouldSearchForQR) {
          if (isAcademicPurchase) {
            console.log('⏭️ Razón: Compra académica (NO se genera QR)');
          } else if (paymentMethod !== 'stripe') {
            console.log('⏭️ Razón: Método de pago no es Stripe (método:', paymentMethod, ')');
            console.log('⏭️ Transferencia bancaria: Debe esperar validación manual en CRM');
          }
        } else {
          console.log('✅ Razón: Compra general + Pago con Stripe → Buscar QR');
        }
        console.log('═══════════════════════════════════════════');

        // 🔥 BÚSQUEDA DE QR EN VISTA tickets_with_details
        // ⚠️ SOLO para: Compras NO académicas (general) + Pagadas con Stripe
        let ticketDataFromView = null;
        
        if (shouldSearchForQR) {
          // 🎫 FLUJO GENERAL: Buscar QR
          console.log('═══════════════════════════════════════════');
          console.log('🎫 BUSCANDO QR EN VISTA tickets_with_details (FLUJO GENERAL)');
          console.log('═══════════════════════════════════════════');
          console.log('🆔 customer_id (ID de registro):', effectiveLeadId);
          console.log('🎯 event_id: 1');
          
          try {
            console.log('🔍 Ejecutando query en tickets_with_details...');
            
            const { data: ticketData, error: ticketError } = await supabase
              .schema('event')
              .from('tickets_with_details')
              .select('qr_image_url, ticket_id, qr_code, payment_method, payment_status')
              .eq('customer_id', effectiveLeadId)
              .eq('event_id', 1)
              .order('ticket_created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (ticketError) {
              console.error('❌ Error buscando ticket en vista:', ticketError);
            } else if (ticketData && ticketData.qr_image_url) {
              console.log('✅ TICKET ENCONTRADO en vista:', ticketData);
              console.log('🎫 QR URL:', ticketData.qr_image_url);
              ticketDataFromView = ticketData;
            } else {
              console.log('⚠️ No se encontró ticket en la vista (puede que aún no se haya generado)');
            }
          } catch (err) {
            console.error('❌ Error inesperado buscando ticket:', err);
          }
          console.log('═══════════════════════════════════════════');
        } else {
          // 🎓 FLUJO SIN QR: Compra académica O transferencia bancaria
          console.log('═══════════════════════════════════════════');
          if (isAcademicPurchase) {
            console.log('🎓 COMPRA ACADÉMICA DETECTADA');
          } else {
            console.log('🏦 TRANSFERENCIA BANCARIA DETECTADA');
          }
          console.log('═══════════════════════════════════════════');
          console.log('⏭️ Saltando búsqueda de QR (no aplica para este tipo de compra/pago)');
          console.log('✅ Continuando con flujo de confirmación sin QR');
          console.log('═══════════════════════════════════════════');
        }

        // 🔄 RETRY LÓGICA: Si NO tenemos ticket y aún hay reintentos disponibles, ESPERAR
        // ⚠️ SOLO para compras que DEBERÍAN tener QR (general + Stripe)
        // 🚀 MEJORADO: 5 intentos × 4 segundos = 20 segundos máximo (mejor para conexiones lentas)
        if (shouldSearchForQR && !ticketDataFromView && retryCount < 5) {
          console.log('⏳ Ticket no encontrado aún - Reintentando...');
          console.log(`🔄 Retry ${retryCount + 1}/5: Will check again in 4 seconds...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 4000);
          return; // ⚠️ CRÍTICO: Salir SIN setear paymentData ni marcar isLoading=false
        }

        // 2. Obtener datos del pago desde event.event_payment
        // 🔥 PRIORIDAD DE FUENTES (solo después de agotar retries o encontrar ticket):
        // 1. ticketDataFromView (búsqueda directa por customer_id) - TIENE QR
        // 2. localWebhookResponse (respuesta de webhook en localStorage) - PUEDE tener QR
        // 3. Supabase event_payment (fallback histórico) - NO tiene QR
        
        if (ticketDataFromView) {
          // 🎫 CASO 1: Tenemos datos del ticket desde la vista (MEJOR FUENTE)
          console.log('🎫 Using ticket data from view (PRIORIDAD 1)');
          
          const paymentDataFromView = {
            event_payment_id: null,
            amount: parseFloat(localStorage.getItem('lastPaymentAmount')) || 990,
            currency: 'MXN',
            payment_method: ticketDataFromView.payment_method || localStorage.getItem('lastPaymentMethod') || 'unknown',
            status: ticketDataFromView.payment_status || 'confirmed',
            created_at: new Date().toISOString(),
            response: {
              success: true,
              data: {
                qr_image_url: ticketDataFromView.qr_image_url,
                ticket_id: ticketDataFromView.ticket_id,
                qr_code: ticketDataFromView.qr_code
              }
            },
            paypal_transaction_id: null,
            stripe_transaction_id: effectiveTransactionId,
            other_transaction_id: null
          };
          
          console.log('✅ Payment data constructed from view:', paymentDataFromView);
          setPaymentData(paymentDataFromView);
        } else if (localWebhookResponse && localWebhookResponse.data) {
          // 🎉 CASO 2: Webhook response en localStorage (PRIORIDAD 2)
          console.log('� Using webhook response from localStorage - SKIPPING Supabase query');
          console.log('🎫 Webhook data available:', localWebhookResponse);
          
          // 🔥 LEER el método de pago REAL desde localStorage
          const storedPaymentMethod = localStorage.getItem('lastPaymentMethod') || 'paypal';
          console.log('💾 Método de pago desde localStorage:', storedPaymentMethod);
          
          // Construir un objeto paymentData compatible desde el webhook response
          const paymentDataFromWebhook = {
            event_payment_id: localWebhookResponse.data.payment_id,
            amount: 990, // Por ahora hardcoded, pero podría venir del webhook
            currency: 'MXN',
            payment_method: storedPaymentMethod, // 🔥 USAR EL MÉTODO REAL, NO HARDCODEAR
            status: localWebhookResponse.data.payment_status,
            created_at: localWebhookResponse.data.created_at,
            response: localWebhookResponse, // 🔥 El response completo del webhook
            paypal_transaction_id: localWebhookResponse.data.paypal_transaction_id,
            stripe_transaction_id: null,
            other_transaction_id: null
          };
          
          console.log('✅ Payment data constructed from webhook:', paymentDataFromWebhook);
          setPaymentData(paymentDataFromWebhook);
        } else if (effectiveTransactionId) {
          console.log('📥 Fetching payment data from Supabase (fallback)...');
          console.log('📋 Search params:', { 
            leadId: effectiveLeadId, 
            transactionId: effectiveTransactionId, 
            paymentMethod 
          });
          
          let paymentQuery = supabase
            .schema('event')
            .from('event_payment')
            .select('event_payment_id, amount, currency, payment_method, status, created_at, response, paypal_transaction_id, stripe_transaction_id, other_transaction_id, transfer_reference_number')
            .eq('customer_fk', effectiveLeadId)
            .order('created_at', { ascending: false })
            .limit(1);

          console.log('🔍 Base payment query created');

          // Filtrar por tipo de transacción según el método
          if (paymentMethod === 'paypal' && effectiveTransactionId) {
            console.log('🔍 Adding PayPal transaction filter:', effectiveTransactionId);
            paymentQuery = paymentQuery.eq('paypal_transaction_id', effectiveTransactionId);
          } else if (paymentMethod === 'ippay' && effectiveTransactionId) {
            console.log('🔍 Adding IPPay transaction filter:', effectiveTransactionId);
            paymentQuery = paymentQuery.eq('ippay_transaction_id', effectiveTransactionId);
          }

          console.log('🔍 Executing payment query...');
          const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

          console.log('📊 Payment query result:', { payment, error: paymentError });

          if (paymentError) {
            console.warn('⚠️ Error fetching payment (non-fatal):', paymentError);
          } else if (payment) {
            console.log('✅ Payment data loaded from Supabase (fallback):', payment);
            console.log('🔍 FULL payment object from DB:', JSON.stringify(payment, null, 2));
            setPaymentData(payment);
          } else {
            console.log('ℹ️ No payment record found (webhook may be processing)');
            console.warn('⚠️ No ticket or payment found after retries - Showing page without QR');
          }
        }

        // ✅ Solo llegamos aquí si:
        // 1. Tenemos ticket de la vista (con QR), O
        // 2. Ya agotamos los 3 reintentos (mostrar sin QR)
        console.log('🏁 Finalizando carga - Estado:', {
          hasTicket: !!ticketDataFromView,
          hasPaymentData: !!paymentData,
          retryCount,
          willShowQR: !!ticketDataFromView || !!(paymentData?.response?.data?.qr_image_url)
        });
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Unexpected error loading data:', err);
        setError('unexpected');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [leadId, transactionId, paymentMethod, retryCount, manualRetryTrigger]); // 🔄 Agregar manualRetryTrigger

  // 🧹 LIMPIEZA INTELIGENTE: Al desmontar, limpiar SOLO si NO vamos a /registro
  useEffect(() => {
    return () => {
      // Pequeño delay para permitir que la navegación se complete
      setTimeout(() => {
        const currentPath = window.location.pathname;
        console.log('🔍 Usuario saliendo de confirmación - Current path:', currentPath);
        
        if (currentPath.includes('/registro')) {
          console.log('⏭️ Usuario volvió a /registro - Mantener datos para posible revisión');
          return; // NO limpiar si va a registro
        }
        
        console.log('🧹 Usuario fue a otra página - Limpiando localStorage...');
        
        const keysToClean = [
          'lastPaymentAmount',
          'lastPaymentMethod', 
          'lastLeadId',
          'lastTransactionId',
          'stripeAccessUrl',
          'lastWebhookResponse', // 🔥 Limpiar QR URL
          'isAcademicPurchase' // 🎓 Estado de compra académica
        ];
        
        keysToClean.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            console.log(`🗑️ Cleanup - Eliminando ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        console.log('✅ Cleanup completado - localStorage limpio');
      }, 100); // Pequeño delay de 100ms
    };
  }, []); // Solo al desmontar

  // Pantalla de error: no se pudo recuperar leadId ni de URL ni de localStorage
  if (error === 'no_lead_id') {
    return (
      <div className={styles.container}>
        {/* 🚫 TEMPORAL: DebugPanel comentado para deploy */}
        {/* <DebugPanel 
          hasData={hasData}
          leadId={leadId}
          transactionId={transactionId}
          paymentMethod={paymentMethod}
          status={status}
          isLoading={isLoading}
          error={error}
          customerData={customerData}
          paymentData={paymentData}
          retryCount={retryCount}
          actualPaymentMethod="not computed yet"
        /> */}
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1 className={styles.errorTitle}>
            {ingles ? 'Invalid Access' : 'Acceso Inválido'}
          </h1>
          <p className={styles.errorText}>
            {ingles 
              ? 'No registration data found. Please complete the registration form first.' 
              : 'No se encontraron datos de registro. Por favor complete el formulario de registro primero.'}
          </p>
          <a href="/registro" className={styles.ctaButton}>
            {ingles ? 'Go to Registration' : 'Ir a Registro'}
          </a>
        </div>
      </div>
    );
  }

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className={styles.container}>
        {/* 🚫 TEMPORAL: DebugPanel comentado para deploy */}
        {/* <DebugPanel 
          hasData={hasData}
          leadId={leadId}
          transactionId={transactionId}
          paymentMethod={paymentMethod}
          status={status}
          isLoading={isLoading}
          error={error}
          customerData={customerData}
          paymentData={paymentData}
          retryCount={retryCount}
          actualPaymentMethod="not computed yet"
        /> */}
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <h2 className={styles.loadingTitle}>
            {ingles ? 'Loading your registration...' : 'Cargando tu registro...'}
          </h2>
          <p className={styles.loadingText}>
            {ingles ? 'Please wait a moment' : 'Por favor espera un momento'}
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de error: no se encontró al cliente
  if (error === 'customer' || !customerData) {
    return (
      <div className={styles.container}>
        {/* 🚫 TEMPORAL: DebugPanel comentado para deploy */}
        {/* <DebugPanel 
          hasData={hasData}
          leadId={leadId}
          transactionId={transactionId}
          paymentMethod={paymentMethod}
          status={status}
          isLoading={isLoading}
          error={error}
          customerData={customerData}
          paymentData={paymentData}
          retryCount={retryCount}
          actualPaymentMethod="not computed yet"
        /> */}
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>❌</div>
          <h1 className={styles.errorTitle}>
            {ingles ? 'Customer Not Found' : 'Cliente No Encontrado'}
          </h1>
          <p className={styles.errorText}>
            {ingles 
              ? 'We could not find your registration data. Please contact support.' 
              : 'No pudimos encontrar tus datos de registro. Por favor contacta a soporte.'}
          </p>
          <p className={styles.errorDetail}>
            {ingles ? 'Registration ID:' : 'ID de Registro:'} <strong>{leadId}</strong>
          </p>
          <a href="/contacto" className={styles.ctaButton}>
            {ingles ? 'Contact Support' : 'Contactar Soporte'}
          </a>
        </div>
      </div>
    );
  }

  // 🐛 LOG: Verificar TODO el objeto paymentData
  console.log('═══════════════════════════════════════════');
  console.log('💳 ANÁLISIS COMPLETO DEL PAYMENT DATA');
  console.log('═══════════════════════════════════════════');
  console.log('💳 Full paymentData:', JSON.stringify(paymentData, null, 2));
  console.log('💳 paymentData exists?:', !!paymentData);
  console.log('💳 paymentData.amount:', paymentData?.amount);
  console.log('💳 paymentData.currency:', paymentData?.currency);
  console.log('💳 paymentData.payment_method:', paymentData?.payment_method);
  console.log('💳 paymentData.event_payment_id:', paymentData?.event_payment_id);
  console.log('💳 paymentData.response exists?:', !!paymentData?.response);
  console.log('═══════════════════════════════════════════');

  // Calcular monto a mostrar
  // 🔥 PRIORIDAD: localStorage > paymentData > default (990)
  const storedAmount = localStorage.getItem('lastPaymentAmount');
  
  console.log('═══════════════════════════════════════════');
  console.log('💰 ANÁLISIS DETALLADO DEL MONTO A MOSTRAR');
  console.log('═══════════════════════════════════════════');
  console.log('💾 localStorage.getItem("lastPaymentAmount"):', storedAmount);
  console.log('📦 paymentData?.amount:', paymentData?.amount);
  console.log('🔢 typeof storedAmount:', typeof storedAmount);
  console.log('🔢 parseFloat(storedAmount):', storedAmount ? parseFloat(storedAmount) : null);
  console.log('═══════════════════════════════════════════');
  
  const displayAmount = storedAmount 
    ? parseFloat(storedAmount) 
    : (paymentData?.amount || 990);
  const displayCurrency = paymentData?.currency || 'MXN';
  
  console.log('💰 Cálculo de monto a mostrar:', {
    storedAmount,
    paymentDataAmount: paymentData?.amount,
    finalDisplayAmount: displayAmount,
    displayCurrency
  });
  console.log('✅ Monto FINAL a mostrar:', displayAmount, displayCurrency);
  console.log('═══════════════════════════════════════════');
  
  // 🔍 LOG: Analizar método de pago
  console.log('═══════════════════════════════════════════');
  console.log('💳 ANÁLISIS DEL PAYMENT METHOD');
  console.log('═══════════════════════════════════════════');
  console.log('💳 paymentData?.payment_method:', paymentData?.payment_method);
  console.log('💳 paymentMethod (from URL):', paymentMethod);
  console.log('💳 effectiveTransactionId:', transactionId);
  
  // 🔥 PRIORIDAD 1: localStorage (donde se guarda al seleccionar)
  const storedPaymentMethod = localStorage.getItem('lastPaymentMethod');
  console.log('💾 localStorage.getItem("lastPaymentMethod"):', storedPaymentMethod);
  console.log('═══════════════════════════════════════════');
  
  // Obtener método de pago con múltiples fallbacks
  // PRIORIDAD: localStorage > paymentData.payment_method > URL > detección automática
  let actualPaymentMethod = 'unknown';
  
  if (storedPaymentMethod) {
    actualPaymentMethod = storedPaymentMethod.toLowerCase();
    console.log('✅ Using payment_method from localStorage (PRIORIDAD 1):', actualPaymentMethod);
  } else if (paymentData?.payment_method) {
    actualPaymentMethod = paymentData.payment_method.toLowerCase();
    console.log('✅ Using payment_method from DB (PRIORIDAD 2):', actualPaymentMethod);
  } else if (paymentMethod && paymentMethod !== 'unknown') {
    actualPaymentMethod = paymentMethod.toLowerCase();
    console.log('⚠️ Using payment_method from URL (PRIORIDAD 3):', actualPaymentMethod);
  } else if (paymentData?.paypal_transaction_id) {
    actualPaymentMethod = 'paypal';
    console.log('🔍 Detected PayPal from paypal_transaction_id');
  } else if (paymentData?.stripe_transaction_id || paymentData?.other_transaction_id) {
    actualPaymentMethod = 'stripe';
    console.log('🔍 Detected Stripe from stripe_transaction_id or other_transaction_id');
  } else {
    console.warn('❌ Could not determine payment method - showing as unknown');
  }
  
  // 🔥 NORMALIZACIÓN: Convertir 'creditCard' a 'stripe' para consistencia
  if (actualPaymentMethod === 'creditcard' || actualPaymentMethod === 'credit_card') {
    actualPaymentMethod = 'stripe';
    console.log('🔄 Normalized creditCard → stripe');
  }
  
  // 🔥 NORMALIZACIÓN: Convertir 'banktransfer' a 'transfer' para consistencia
  if (actualPaymentMethod === 'banktransfer' || actualPaymentMethod === 'bank_transfer') {
    actualPaymentMethod = 'transfer';
    console.log('🔄 Normalized bankTransfer → transfer');
  }
  
  console.log('🎯 FINAL actualPaymentMethod:', actualPaymentMethod);
  
  // Extraer datos del response (webhook de n8n)
  // 🔥 PRIORIDAD: Usar paymentData.response (que puede venir del webhook o de Supabase)
  const webhookResponse = paymentData?.response || {};
  
  console.log('═══════════════════════════════════════════');
  console.log('🔍 FUENTE DEL WEBHOOK RESPONSE');
  console.log('═══════════════════════════════════════════');
  console.log('💾 webhookResponse source:', paymentData?.response ? 
    (webhookResponseFromStorage ? 'localStorage (webhook direct)' : 'Supabase (fallback)') 
    : 'NOT AVAILABLE');
  console.log('═══════════════════════════════════════════');
  
  // 🐛 LOG DETALLADO: Verificar estructura COMPLETA del response
  console.log('═══════════════════════════════════════════');
  console.log('🎫 ANÁLISIS COMPLETO DEL RESPONSE DEL WEBHOOK');
  console.log('═══════════════════════════════════════════');
  console.log('🎫 Full webhookResponse:', JSON.stringify(webhookResponse, null, 2));
  console.log('🎫 Type of webhookResponse:', typeof webhookResponse);
  console.log('🎫 Is Array?:', Array.isArray(webhookResponse));
  console.log('🎫 Has .data property?:', 'data' in webhookResponse);
  console.log('🎫 Has .qr_image_url property?:', 'qr_image_url' in webhookResponse);
  
  if (webhookResponse && typeof webhookResponse === 'object') {
    console.log('🔑 All keys in webhookResponse:', Object.keys(webhookResponse));
  }
  
  // Manejar diferentes estructuras del response:
  // Caso 1: response = { success: true, data: { qr_image_url: "..." } }
  // Caso 2: response = { qr_image_url: "..." } (data directamente)
  // Caso 3: response como string JSON que necesita parsearse
  
  let responseData = webhookResponse;
  
  // Si es un string, intentar parsear
  if (typeof webhookResponse === 'string') {
    try {
      responseData = JSON.parse(webhookResponse);
      console.log('🔄 Response parseado desde string:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.error('❌ Error parseando response:', e);
    }
  }
  
  console.log('🎫 responseData después de procesamiento:', JSON.stringify(responseData, null, 2));
  
  // Intentar extraer de diferentes ubicaciones
  const ticketQRUrl = 
    responseData?.data?.qr_image_url ||           // Caso 1: response.data.qr_image_url
    responseData?.qr_image_url ||                 // Caso 2: response.qr_image_url
    null;
    
  const ticketId = 
    responseData?.data?.qr_code ||                // Caso 1: response.data.qr_code
    responseData?.data?.ticket_id ||              // Caso 1: response.data.ticket_id
    responseData?.qr_code ||                      // Caso 2: response.qr_code
    responseData?.ticket_id ||                    // Caso 2: response.ticket_id
    null;
  
  console.log('🎯 RESULTADO FINAL:');
  console.log('🎫 Extracted ticketQRUrl:', ticketQRUrl);
  console.log('🎫 Extracted ticketId:', ticketId);
  console.log('═══════════════════════════════════════════');
  
  // 🎫 LOG adicional: Mostrar todas las claves disponibles en el response
  if (responseData && typeof responseData === 'object') {
    console.log('🔑 Keys available in responseData:', Object.keys(responseData));
    if (responseData.data) {
      console.log('🔑 Keys available in responseData.data:', Object.keys(responseData.data));
    }
  }

  const isConfirmed = status === 'confirmed';
  const isPending = status === 'pending';
  
  // 🎓 LEER ESTADO ACADÉMICO para condicionales de renderizado
  const isAcademicPurchase = localStorage.getItem('isAcademicPurchase') === 'true';
  console.log('🎓 Renderizado - isAcademicPurchase:', isAcademicPurchase);

  return (
    <div className={styles.container}>
      {/* Debug Panel - Siempre visible en la esquina superior derecha */}
      {/* 🚫 TEMPORAL: Comentado para deploy - Descomentar para debugging */}
      {/* <DebugPanel 
        hasData={hasData}
        leadId={leadId}
        transactionId={transactionId}
        paymentMethod={paymentMethod}
        status={status}
        isLoading={isLoading}
        error={error}
        customerData={customerData}
        paymentData={paymentData}
        retryCount={retryCount}
        actualPaymentMethod={actualPaymentMethod}
        webhookResponse={webhookResponse}
        ticketQRUrl={ticketQRUrl}
        ticketId={ticketId}
      /> */}
      
      <div className={styles.confirmationCard}>
        
        {/* Success/Pending Icon */}
        <div className={`${styles.statusIcon} ${isPending ? styles.pending : styles.confirmed}`}>
          {isConfirmed && '✓'}
          {isPending && '⏳'}
        </div>

        {/* Title */}
        <h1 className={styles.title}>
          {isConfirmed && (ingles ? 'Registration Confirmed!' : '¡Registro Confirmado!')}
          {isPending && (ingles ? 'Registration Received!' : '¡Registro Recibido!')}
        </h1>

        {/* Subtitle con correo de confirmación */}
        <p className={styles.subtitle}>
          {isConfirmed && (ingles 
            ? 'Your payment has been processed successfully' 
            : 'Tu pago ha sido procesado exitosamente')}
          {isPending && (ingles 
            ? 'Your payment receipt is under review' 
            : 'Tu comprobante de pago está en revisión')}
        </p>

        <p className={styles.emailNotice}>
          {ingles 
            ? `A confirmation email has been sent to: ` 
            : `Se ha enviado un correo de confirmación a: `}
          <strong>{customerData.email}</strong>
        </p>

        {/* Participant Details */}
        <div className={styles.participantBox}>
          <h3 className={styles.participantTitle}>
            {ingles ? 'Participant Information' : 'Información del Participante'}
          </h3>
          <div className={styles.participantDetails}>
            <div className={styles.participantRow}>
              <span className={styles.participantLabel}>
                {ingles ? 'Name:' : 'Nombre:'}
              </span>
              <span className={styles.participantValue}>
                {customerData.first_name} {customerData.last_name}
              </span>
            </div>
            <div className={styles.participantRow}>
              <span className={styles.participantLabel}>
                {ingles ? 'Email:' : 'Correo:'}
              </span>
              <span className={styles.participantValue}>{customerData.email}</span>
            </div>
            {customerData.mobile_phone && (
              <div className={styles.participantRow}>
                <span className={styles.participantLabel}>
                  {ingles ? 'Phone:' : 'Teléfono:'}
                </span>
                <span className={styles.participantValue}>{customerData.mobile_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Details */}
        <div className={styles.detailsBox}>
          <h3 className={styles.detailsTitle}>
            {ingles ? 'Payment Details' : 'Detalles del Pago'}
          </h3>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {ingles ? 'Amount Paid:' : 'Monto Pagado:'}
            </span>
            <span className={styles.detailValue}>
              ${displayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {displayCurrency}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {ingles ? 'Registration ID:' : 'ID de Registro:'}
            </span>
            <span className={styles.detailValue}>
              {customerData?.customer_id || paymentData?.event_payment_id || leadId || 'N/A'}
            </span>
          </div>

          {transactionId && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {actualPaymentMethod === 'paypal' && (ingles ? 'PayPal Transaction:' : 'Transacción PayPal:')}
                {actualPaymentMethod === 'stripe' && (ingles ? 'Stripe Transaction:' : 'Transacción Stripe:')}
                {actualPaymentMethod === 'transfer' && (ingles ? 'Reference Number:' : 'Número de Referencia:')}
                {(!actualPaymentMethod || actualPaymentMethod === 'unknown') && (ingles ? 'Transaction ID:' : 'ID de Transacción:')}
              </span>
              <span className={styles.detailValue}>{transactionId}</span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {ingles ? 'Payment Method:' : 'Método de Pago:'}
            </span>
            <span className={styles.detailValue}>
              {actualPaymentMethod === 'paypal' && 'PayPal'}
              {actualPaymentMethod === 'stripe' && (ingles ? 'Credit/Debit Card (Stripe)' : 'Tarjeta de Crédito/Débito (Stripe)')}
              {actualPaymentMethod === 'transfer' && (ingles ? 'Bank Transfer' : 'Transferencia Bancaria')}
              {(!actualPaymentMethod || actualPaymentMethod === 'unknown') && (ingles ? 'Unknown' : 'Desconocido')}
            </span>
          </div>

          {paymentData?.created_at && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {ingles ? 'Payment Date:' : 'Fecha de Pago:'}
              </span>
              <span className={styles.detailValue}>
                {new Date(paymentData.created_at).toLocaleDateString(ingles ? 'en-US' : 'es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className={styles.eventBox}>
          <h2 className={styles.eventTitle}>
            {ingles 
              ? 'National Congress on Amparo and Human Rights 2025' 
              : 'Congreso Nacional de Amparo y Derechos Humanos 2025'}
          </h2>
          
          <div className={styles.eventDetails}>
            <div className={styles.eventDetailItem}>
              <span className={styles.eventIcon}>📅</span>
              <span>{ingles ? 'November 22, 2025' : '22 de Noviembre, 2025'}</span>
            </div>
            <div className={styles.eventDetailItem}>
              <span className={styles.eventIcon}>📍</span>
              <span>
                {ingles 
                  ? 'World Trade Center, Mexico City' 
                  : 'World Trade Center, Ciudad de México'}
              </span>
            </div>
            <div className={styles.eventDetailItem}>
              <span className={styles.eventIcon}>⏰</span>
              <span>{ingles ? '8:00 AM – 6:00 PM' : '8:00 AM – 6:00 PM'}</span>
            </div>
          </div>
        </div>

        {/* QR Code / Ticket +*/}
        {ticketQRUrl && (
          <div className={styles.ticketBox}>
            <h3 className={styles.ticketTitle}>
              {ingles ? 'Your Access QR Code' : 'Tu Código QR de Acceso'}
            </h3>
            <p className={styles.ticketSubtitle}>
              {ingles 
                ? 'Present this QR code at the event entrance' 
                : 'Presenta este código QR en la entrada del evento'}
            </p>
            <div className={styles.qrContainer}>
              <img 
                src={ticketQRUrl} 
                alt={ingles ? 'Event Access QR Code' : 'Código QR de Acceso al Evento'} 
                className={styles.qrImage}
              />
              {ticketId && (
                <p className={styles.ticketId}>
                  {ingles ? 'Ticket ID:' : 'ID de Boleto:'} <strong>{ticketId}</strong>
                </p>
              )}
            </div>
            <p className={styles.qrNotice}>
              {ingles 
                ? '💾 Save this image or take a screenshot for easy access' 
                : '💾 Guarda esta imagen o toma una captura de pantalla para fácil acceso'}
            </p>
          </div>
        )}

        {/* 🔄 Botón de Reintentar si NO hay QR después de agotar intentos automáticos */}
        {/* ⚠️ SOLO para compras que DEBERÍAN tener QR: General (NO académica) + Stripe */}
        {!isAcademicPurchase && paymentData?.payment_method === 'stripe' && !ticketQRUrl && retryCount >= 5 && (
          <div className={styles.retryBox}>
            <div className={styles.retryIcon}>⏳</div>
            <h3 className={styles.retryTitle}>
              {ingles ? 'QR Code Being Generated' : 'Generando Código QR'}
            </h3>
            <p className={styles.retryText}>
              {ingles 
                ? 'Your QR code is being processed. This usually takes a few moments.' 
                : 'Tu código QR está siendo procesado. Esto normalmente toma unos momentos.'}
            </p>
            <button 
              className={styles.retryButton}
              onClick={() => {
                console.log('🔄 Usuario clickeó reintentar manualmente');
                setRetryCount(0); // Resetear contador
                setManualRetryTrigger(prev => prev + 1); // Forzar re-ejecución del useEffect
              }}
            >
              {ingles ? '🔄 Retry Now' : '🔄 Reintentar Ahora'}
            </button>
            <p className={styles.retryNotice}>
              {ingles 
                ? 'You will also receive your QR code via email' 
                : 'También recibirás tu código QR por correo electrónico'}
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className={styles.nextSteps}>
          <h3 className={styles.nextStepsTitle}>
            {ingles ? 'Next Steps' : 'Siguientes Pasos'}
          </h3>

          {isConfirmed && (
            <ul className={styles.stepsList}>
              <li>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}>
                  {ingles 
                    ? 'You will receive a confirmation email with your QR code' 
                    : 'Recibirás un correo de confirmación con tu código QR'}
                </span>
              </li>
              <li>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}>
                  {ingles 
                    ? 'Save or print your QR code for event check-in' 
                    : 'Guarda o imprime tu código QR para el acceso al evento'}
                </span>
              </li>
              <li>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepText}>
                  {ingles 
                    ? 'Arrive at the venue on November 22 at 9:00 AM' 
                    : 'Llega a la sede el 22 de noviembre a las 9:00 AM'}
                </span>
              </li>
            </ul>
          )}

          {isPending && (
            <ul className={styles.stepsList}>
              <li>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}>
                  {ingles 
                    ? 'Your payment receipt will be reviewed within 24-48 hours' 
                    : 'Tu comprobante será revisado en 24-48 horas'}
                </span>
              </li>
              <li>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}>
                  {ingles 
                    ? 'You will receive a confirmation email once approved' 
                    : 'Recibirás un correo de confirmación una vez aprobado'}
                </span>
              </li>
              <li>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepText}>
                  {ingles 
                    ? 'The email will include your QR code for event access' 
                    : 'El correo incluirá tu código QR para acceso al evento'}
                </span>
              </li>
            </ul>
          )}
        </div>

        {/* Important Info */}
        <div className={styles.infoBox}>
          <h4 className={styles.infoTitle}>
            {ingles ? 'Important Information' : 'Información Importante'}
          </h4>
          <ul className={styles.infoList}>
            <li>
              {ingles 
                ? 'Please check your spam folder if you don\'t receive the email' 
                : 'Por favor revisa tu carpeta de spam si no recibes el correo'}
            </li>
            <li>
              {ingles 
                ? 'Bring a valid ID for event check-in' 
                : 'Lleva una identificación oficial para el acceso al evento'}
            </li>
            <li>
              {ingles 
                ? 'For questions, contact us at: contacto@abogadosliberales.mx' 
                : 'Para dudas, contáctanos: contacto@abogadosliberales.mx'}
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className={styles.ctaButtons}>
          <a href="/" className={styles.ctaPrimary}>
            {ingles ? 'Back to Home' : 'Volver al Inicio'}
          </a>
          <a href="/contacto" className={styles.ctaSecondary}>
            {ingles ? 'Contact Support' : 'Contactar Soporte'}
          </a>
        </div>

      </div>
    </div>
  );
};

export default ConfirmacionSeccion;
