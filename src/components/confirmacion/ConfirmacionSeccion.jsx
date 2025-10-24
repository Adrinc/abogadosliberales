import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import supabase from '../../lib/supabaseClient';
import styles from './confirmacion.module.css';

const ConfirmacionSeccion = ({ transactionId, leadId, paymentMethod, status, hasData }) => {
  const ingles = useStore(isEnglish);
  
  // Estados para datos del cliente y pago
  const [customerData, setCustomerData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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

      if (!leadId || !transactionId) {
        console.warn('⚠️ Missing params in URL, checking localStorage...');
        
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

        // 2. Obtener datos del pago desde event.event_payment
        if (effectiveTransactionId) {
          console.log('📥 Fetching payment data...');
          console.log('📋 Search params:', { 
            leadId: effectiveLeadId, 
            transactionId: effectiveTransactionId, 
            paymentMethod 
          });
          
          let paymentQuery = supabase
            .schema('event')
            .from('event_payment')
            .select('event_payment_id, amount, currency, payment_method, status, created_at, response, paypal_transaction_id, ippay_transaction_id')
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
            console.log('✅ Payment data loaded:', payment);
            console.log('🔍 FULL payment object from DB:', JSON.stringify(payment, null, 2));
            setPaymentData(payment);
          } else {
            console.log('ℹ️ No payment record found yet (webhook may be processing)');
            
            // Si no se encuentra el pago y es el primer intento, reintentar después de 3 segundos
            if (retryCount < 2) {
              console.log(`🔄 Retry ${retryCount + 1}/2: Will check again in 3 seconds...`);
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
              }, 3000);
              return; // No marcar como cargado aún
            } else {
              console.warn('⚠️ Payment record not found after 2 retries');
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('❌ Unexpected error loading data:', err);
        setError('unexpected');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [leadId, transactionId, paymentMethod, retryCount]); // Removido hasData de dependencias

  // 🐛 PANEL DE DEBUG TEMPORAL (remover después de solucionar)
  const DebugPanel = () => (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000',
      color: '#0f0',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      border: '2px solid #0f0'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#ff0' }}>
        🐛 DEBUG PANEL
      </div>
      <div><strong>hasData:</strong> {String(hasData)}</div>
      <div><strong>leadId:</strong> {leadId} ({typeof leadId})</div>
      <div><strong>transactionId:</strong> {transactionId}</div>
      <div><strong>paymentMethod:</strong> {paymentMethod}</div>
      <div><strong>status:</strong> {status}</div>
      <hr style={{ margin: '10px 0', borderColor: '#0f0' }} />
      <div><strong>isLoading:</strong> {String(isLoading)}</div>
      <div><strong>error:</strong> {error || 'null'}</div>
      <div><strong>customerData:</strong> {customerData ? '✅ Loaded' : '❌ Null'}</div>
      <div><strong>paymentData:</strong> {paymentData ? '✅ Loaded' : '❌ Null'}</div>
      <div><strong>retryCount:</strong> {retryCount}</div>
    </div>
  );

  // Pantalla de error: no se pudo recuperar leadId ni de URL ni de localStorage
  if (error === 'no_lead_id') {
    return (
      <div className={styles.container}>
        <DebugPanel />
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
        <DebugPanel />
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
        <DebugPanel />
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

  // Calcular monto a mostrar
  const displayAmount = paymentData?.amount || 1990;
  const displayCurrency = paymentData?.currency || 'MXN';
  
  // Obtener método de pago del objeto payment (más confiable que URL)
  const actualPaymentMethod = paymentData?.payment_method?.toLowerCase() || paymentMethod;
  
  // Extraer datos del response (webhook de n8n)
  const webhookResponse = paymentData?.response || {};
  
  // 🐛 LOG: Verificar estructura completa del response
  console.log('🎫 Full webhookResponse:', webhookResponse);
  console.log('🎫 webhookResponse.data:', webhookResponse.data);
  
  // La estructura correcta según el API es: response.data.qr_image_url
  const ticketQRUrl = webhookResponse.data?.qr_image_url;
  const ticketId = webhookResponse.data?.qr_code || webhookResponse.data?.ticket_id;
  
  console.log('🎫 Extracted ticketQRUrl:', ticketQRUrl);
  console.log('🎫 Extracted ticketId:', ticketId);

  const isConfirmed = status === 'confirmed';
  const isPending = status === 'pending';

  return (
    <div className={styles.container}>
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
              {paymentData?.event_payment_id || leadId}
            </span>
          </div>

          {transactionId && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {paymentMethod === 'paypal' && (ingles ? 'PayPal Transaction:' : 'Transacción PayPal:')}
                {paymentMethod === 'ippay' && (ingles ? 'Credit Card Transaction:' : 'Transacción Tarjeta:')}
                {paymentMethod === 'transfer' && (ingles ? 'Reference Number:' : 'Número de Referencia:')}
                {paymentMethod === 'unknown' && (ingles ? 'Transaction ID:' : 'ID de Transacción:')}
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
              {actualPaymentMethod === 'ippay' && (ingles ? 'Credit/Debit Card' : 'Tarjeta de Crédito/Débito')}
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
              <span>{ingles ? 'November 14–15, 2025' : '14–15 de Noviembre, 2025'}</span>
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

        {/* QR Code / Ticket */}
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
                    ? 'Arrive at the venue on November 14 at 8:00 AM' 
                    : 'Llega a la sede el 14 de noviembre a las 8:00 AM'}
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
