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

  // Cargar datos del cliente y pago desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!hasData || !leadId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('📥 Fetching customer data for leadId:', leadId);
        
        // 1. Obtener datos del cliente
        const { data: customer, error: customerError } = await supabase
          .from('customer')
          .select('customer_id, first_name, last_name, email, mobile_phone, status')
          .eq('customer_id', parseInt(leadId))
          .single();

        if (customerError) {
          console.error('❌ Error fetching customer:', customerError);
          setError('customer');
          setIsLoading(false);
          return;
        }

        console.log('✅ Customer data loaded:', customer);
        setCustomerData(customer);

        // 2. Obtener datos del pago desde event.event_payment
        if (transactionId) {
          console.log('📥 Fetching payment data for transaction:', transactionId);
          
          let paymentQuery = supabase
            .schema('event')
            .from('event_payment')
            .select('event_payment_id, amount, currency, payment_method, status, created_at, response')
            .eq('customer_fk', parseInt(leadId))
            .order('created_at', { ascending: false })
            .limit(1);

          // Filtrar por tipo de transacción según el método
          if (paymentMethod === 'paypal' && transactionId) {
            paymentQuery = paymentQuery.eq('paypal_transaction_id', transactionId);
          } else if (paymentMethod === 'ippay' && transactionId) {
            paymentQuery = paymentQuery.eq('ippay_transaction_id', transactionId);
          }

          const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

          if (paymentError) {
            console.warn('⚠️ Error fetching payment (non-fatal):', paymentError);
          } else if (payment) {
            console.log('✅ Payment data loaded:', payment);
            setPaymentData(payment);
          } else {
            console.log('ℹ️ No payment record found yet (webhook may be processing)');
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
  }, [hasData, leadId, transactionId, paymentMethod]);

  // Pantalla de error: sin datos en URL
  if (!hasData) {
    return (
      <div className={styles.container}>
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
            <span className={styles.detailValue}>{leadId}</span>
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
              {paymentMethod === 'paypal' && 'PayPal'}
              {paymentMethod === 'ippay' && (ingles ? 'Credit/Debit Card' : 'Tarjeta de Crédito/Débito')}
              {paymentMethod === 'transfer' && (ingles ? 'Bank Transfer' : 'Transferencia Bancaria')}
              {paymentMethod === 'unknown' && (ingles ? 'Unknown' : 'Desconocido')}
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
