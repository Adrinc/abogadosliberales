import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/ippayForm.module.css';

const IPPayForm = ({ leadId, leadData }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;

  // Estados del formulario
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Estados de validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Estados de pago
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Constantes
  const EVENT_ID = 1;
  const AMOUNT = '990.00';
  const CURRENCY = 'MXN';
  const WEBHOOK_URL = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_ippay_payment';
  const IPPAY_API_URL = 'https://api.ippay.com/v1/charge'; // URL ficticia, reemplazar con la real

  // Utilidades de validación
  const luhnCheck = (num) => {
    let arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce(
      (acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9),
      0
    );
    sum += lastDigit;
    return sum % 10 === 0;
  };

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    return 'Unknown';
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  // Validaciones
  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (!cleaned) return ingles ? 'Card number is required' : 'Número de tarjeta requerido';
    if (cleaned.length < 13 || cleaned.length > 19) {
      return ingles ? 'Invalid card number length' : 'Longitud de tarjeta inválida';
    }
    if (!/^\d+$/.test(cleaned)) {
      return ingles ? 'Card number must contain only digits' : 'Solo números permitidos';
    }
    if (!luhnCheck(cleaned)) {
      return ingles ? 'Invalid card number' : 'Número de tarjeta inválido';
    }
    return '';
  };

  const validateCardholderName = (name) => {
    if (!name.trim()) return ingles ? 'Cardholder name is required' : 'Nombre del titular requerido';
    if (name.length < 3) return ingles ? 'Name too short' : 'Nombre muy corto';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
      return ingles ? 'Name must contain only letters' : 'Solo letras permitidas';
    }
    return '';
  };

  const validateExpiryMonth = (month) => {
    const m = parseInt(month);
    if (!month) return ingles ? 'Month is required' : 'Mes requerido';
    if (m < 1 || m > 12) return ingles ? 'Invalid month' : 'Mes inválido';
    return '';
  };

  const validateExpiryYear = (year) => {
    const currentYear = new Date().getFullYear() % 100;
    const y = parseInt(year);
    if (!year) return ingles ? 'Year is required' : 'Año requerido';
    if (y < currentYear) return ingles ? 'Card expired' : 'Tarjeta expirada';
    if (y > currentYear + 20) return ingles ? 'Invalid year' : 'Año inválido';
    return '';
  };

  const validateCvv = (cvv, cardNumber) => {
    if (!cvv) return ingles ? 'CVV is required' : 'CVV requerido';
    const cardType = detectCardType(cardNumber);
    const expectedLength = cardType === 'American Express' ? 4 : 3;
    if (cvv.length !== expectedLength) {
      return ingles ? `CVV must be ${expectedLength} digits` : `CVV debe ser ${expectedLength} dígitos`;
    }
    if (!/^\d+$/.test(cvv)) return ingles ? 'CVV must be numeric' : 'CVV solo números';
    return '';
  };

  // Handlers
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 19);
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    if (touched.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: validateCardNumber(formatted) }));
    }
  };

  const handleCardholderNameChange = (e) => {
    const value = e.target.value.slice(0, 50);
    setCardholderName(value);
    if (touched.cardholderName) {
      setErrors(prev => ({ ...prev, cardholderName: validateCardholderName(value) }));
    }
  };

  const handleExpiryMonthChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setExpiryMonth(value);
    if (touched.expiryMonth) {
      setErrors(prev => ({ ...prev, expiryMonth: validateExpiryMonth(value) }));
    }
  };

  const handleExpiryYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setExpiryYear(value);
    if (touched.expiryYear) {
      setErrors(prev => ({ ...prev, expiryYear: validateExpiryYear(value) }));
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(value);
    if (touched.cvv) {
      setErrors(prev => ({ ...prev, cvv: validateCvv(value, cardNumber) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const validations = {
      cardNumber: () => validateCardNumber(cardNumber),
      cardholderName: () => validateCardholderName(cardholderName),
      expiryMonth: () => validateExpiryMonth(expiryMonth),
      expiryYear: () => validateExpiryYear(expiryYear),
      cvv: () => validateCvv(cvv, cardNumber)
    };

    if (validations[field]) {
      setErrors(prev => ({ ...prev, [field]: validations[field]() }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: validateCardNumber(cardNumber),
      cardholderName: validateCardholderName(cardholderName),
      expiryMonth: validateExpiryMonth(expiryMonth),
      expiryYear: validateExpiryYear(expiryYear),
      cvv: validateCvv(cvv, cardNumber)
    };

    setErrors(newErrors);
    setTouched({
      cardNumber: true,
      cardholderName: true,
      expiryMonth: true,
      expiryYear: true,
      cvv: true
    });

    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage(ingles 
        ? 'Please correct the errors in the form' 
        : 'Por favor corrija los errores en el formulario'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Preparar datos para IPPAY API
      const cleanedCardNumber = cardNumber.replace(/\s/g, '');
      const cardType = detectCardType(cleanedCardNumber);
      
      const ippayPayload = {
        card_number: cleanedCardNumber,
        cardholder_name: cardholderName,
        exp_month: expiryMonth,
        exp_year: `20${expiryYear}`,
        cvv: cvv,
        amount: parseFloat(AMOUNT),
        currency: CURRENCY,
        description: ingles 
          ? 'National Congress on Amparo and Human Rights 2025 - Registration'
          : 'Congreso Nacional de Amparo y Derechos Humanos 2025 - Registro',
        customer_id: leadId,
        event_id: EVENT_ID
      };

      // TODO: Llamar API real de IPPAY (simulación por ahora)
      
      // Simulación de respuesta de IPPAY (remover en producción)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockIPPayResponse = {
        transaction_id: `IPP-${Date.now()}`,
        approval_code: Math.random().toString(36).substring(7).toUpperCase(),
        status: 'approved',
        last_four: cleanedCardNumber.slice(-4),
        card_type: cardType
      };

      // Llamar webhook n8n con datos de pago exitoso
      const webhookPayload = {
        lead_id: parseInt(leadId),
        event_id: EVENT_ID,
        credit_card_info: {
          last_four: mockIPPayResponse.last_four,
          card_type: mockIPPayResponse.card_type,
          cardholder_name: cardholderName
        },
        ippay_transaction_id: mockIPPayResponse.transaction_id,
        amount: parseFloat(AMOUNT),
        currency: CURRENCY,
        approval_code: mockIPPayResponse.approval_code,
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
      setTransactionId(mockIPPayResponse.transaction_id);
      setPaymentStatus('success');
      setIsProcessing(false);

      // Redirigir después de 3 segundos
      setTimeout(() => {
        window.location.href = `/confirmacion?transaction_id=${mockIPPayResponse.transaction_id}&lead_id=${leadId}&method=ippay&status=confirmed`;
      }, 3000);

    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(ingles 
        ? 'Payment failed. Please check your card details and try again.'
        : 'Pago fallido. Por favor verifique los datos de su tarjeta e intente nuevamente.'
      );
      setIsProcessing(false);
    }
  };

  const cardType = detectCardType(cardNumber);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t.creditCard.title}</h3>
      <p className={styles.description}>{t.creditCard.description}</p>
      
      <div className={styles.amountBox}>
        <span className={styles.amountLabel}>{ingles ? 'Total amount:' : 'Monto total:'}</span>
        <span className={styles.amount}>{t.creditCard.amount}</span>
      </div>

      {/* Estados de Pago */}
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

      {paymentStatus === 'error' && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>✕</div>
          <h4>{ingles ? 'Error' : 'Error'}</h4>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Formulario de Tarjeta */}
      {!isProcessing && paymentStatus === null && (
        <form onSubmit={handleSubmit} className={styles.cardForm}>
          {/* Número de Tarjeta */}
          <div className={styles.formGroup}>
            <label htmlFor="cardNumber" className={styles.label}>
              {ingles ? 'Card Number' : 'Número de Tarjeta'}
              {cardType !== 'Unknown' && <span className={styles.cardType}>{cardType}</span>}
            </label>
            <input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              onBlur={() => handleBlur('cardNumber')}
              placeholder={ingles ? '1234 5678 9012 3456' : '1234 5678 9012 3456'}
              className={`${styles.input} ${errors.cardNumber && touched.cardNumber ? styles.inputError : ''}`}
              maxLength="23"
            />
            {errors.cardNumber && touched.cardNumber && (
              <span className={styles.errorText}>{errors.cardNumber}</span>
            )}
          </div>

          {/* Nombre del Titular */}
          <div className={styles.formGroup}>
            <label htmlFor="cardholderName" className={styles.label}>
              {ingles ? 'Cardholder Name' : 'Nombre del Titular'}
            </label>
            <input
              id="cardholderName"
              type="text"
              value={cardholderName}
              onChange={handleCardholderNameChange}
              onBlur={() => handleBlur('cardholderName')}
              placeholder={ingles ? 'JUAN PEREZ' : 'JUAN PEREZ'}
              className={`${styles.input} ${errors.cardholderName && touched.cardholderName ? styles.inputError : ''}`}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.cardholderName && touched.cardholderName && (
              <span className={styles.errorText}>{errors.cardholderName}</span>
            )}
          </div>

          {/* Expiración y CVV */}
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: '1' }}>
              <label htmlFor="expiry" className={styles.label}>
                {ingles ? 'Expiry Date' : 'Fecha de Expiración'}
              </label>
              <div className={styles.expiryInputs}>
                <input
                  id="expiryMonth"
                  type="text"
                  value={expiryMonth}
                  onChange={handleExpiryMonthChange}
                  onBlur={() => handleBlur('expiryMonth')}
                  placeholder="MM"
                  className={`${styles.input} ${styles.expiryInput} ${errors.expiryMonth && touched.expiryMonth ? styles.inputError : ''}`}
                  maxLength="2"
                />
                <span className={styles.expirySeparator}>/</span>
                <input
                  id="expiryYear"
                  type="text"
                  value={expiryYear}
                  onChange={handleExpiryYearChange}
                  onBlur={() => handleBlur('expiryYear')}
                  placeholder="YY"
                  className={`${styles.input} ${styles.expiryInput} ${errors.expiryYear && touched.expiryYear ? styles.inputError : ''}`}
                  maxLength="2"
                />
              </div>
              {((errors.expiryMonth && touched.expiryMonth) || (errors.expiryYear && touched.expiryYear)) && (
                <span className={styles.errorText}>
                  {errors.expiryMonth || errors.expiryYear}
                </span>
              )}
            </div>

            <div className={styles.formGroup} style={{ flex: '1' }}>
              <label htmlFor="cvv" className={styles.label}>
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                onBlur={() => handleBlur('cvv')}
                placeholder="123"
                className={`${styles.input} ${errors.cvv && touched.cvv ? styles.inputError : ''}`}
                maxLength="4"
              />
              {errors.cvv && touched.cvv && (
                <span className={styles.errorText}>{errors.cvv}</span>
              )}
            </div>
          </div>

          {/* Botón de Submit */}
          <button type="submit" className={styles.submitButton}>
            {ingles ? 'Pay Now' : 'Pagar Ahora'} - {t.creditCard.amount}
          </button>

          {/* Seguridad */}
          <div className={styles.securityInfo}>
            <span className={styles.lockIcon}>🔒</span>
            <small>{ingles ? 'Secure payment encrypted with SSL' : 'Pago seguro encriptado con SSL'}</small>
          </div>
        </form>
      )}

      <div className={styles.debugInfo}>
        <small>🔧 Debug: Lead ID = {leadId} | Event ID = {EVENT_ID}</small>
      </div>
    </div>
  );
};

export default IPPayForm;
