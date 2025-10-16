import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import styles from './confirmacion.module.css';

const ConfirmacionSeccion = ({ transactionId, leadId, paymentMethod, status, hasData }) => {
  const ingles = useStore(isEnglish);

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

        {/* Subtitle */}
        <p className={styles.subtitle}>
          {isConfirmed && (ingles 
            ? 'Your payment has been processed successfully' 
            : 'Tu pago ha sido procesado exitosamente')}
          {isPending && (ingles 
            ? 'Your payment receipt is under review' 
            : 'Tu comprobante de pago está en revisión')}
        </p>

        {/* Transaction Details */}
        <div className={styles.detailsBox}>
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
