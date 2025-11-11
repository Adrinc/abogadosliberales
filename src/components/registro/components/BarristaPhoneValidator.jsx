import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import { 
  calculateBarristaData, 
  validatePhoneFormat, 
  normalizePhone 
} from '../../../lib/barristaPricing';
import styles from '../css/barristaPhoneValidator.module.css';

const BarristaPhoneValidator = ({ onValidationComplete, onValidationError }) => {
  const ingles = useStore(isEnglish);
  
  // Fallback defensivo para traducciones
  const t = (ingles && translationsRegistro.en && translationsRegistro.en.barristaValidator)
    ? translationsRegistro.en.barristaValidator
    : (translationsRegistro.es && translationsRegistro.es.barristaValidator)
      ? translationsRegistro.es.barristaValidator
      : {
          title: ingles ? "Membership Verification" : "Verificación de Membresía",
          subtitle: ingles 
            ? "Enter your phone number to verify your status" 
            : "Ingresa tu teléfono para verificar tu estado",
          placeholder: "+52 55 1234 5678",
          buttonVerify: ingles ? "Verify Phone" : "Verificar Teléfono",
          buttonVerifying: ingles ? "Verifying..." : "Verificando...",
          formatHelp: ingles 
            ? "Use international format with country code" 
            : "Usa formato internacional con código de país"
        };

  const [phone, setPhone] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setError(null); // Limpiar error al escribir
  };

  const handleValidate = async () => {
    // 1. Validar formato localmente
    const phoneValidation = validatePhoneFormat(phone);
    
    if (!phoneValidation.valid) {
      setError(phoneValidation.error);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // 2. Llamar al API de validación
      const response = await fetch(
        'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_search_phone',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: normalizePhone(phone),
            event_id: 1 // ID del Congreso Nacional
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 3. Procesar respuesta con helper
      const validationResult = calculateBarristaData(data[0] || data);

      // 4. Agregar teléfono al resultado
      validationResult.phone = phone;

      // 5. Notificar al componente padre
      if (validationResult.valid && !validationResult.blocked) {
        onValidationComplete(validationResult);
      } else {
        onValidationError(validationResult);
      }

    } catch (err) {
      setError(
        ingles 
          ? 'Error connecting to server. Please try again.' 
          : 'Error al conectar con el servidor. Intenta nuevamente.'
      );
      
      onValidationError({
        valid: false,
        blocked: false,
        message: err.message
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidate();
    }
  };

  return (
    <div className={styles.validatorCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t.title}</h3>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={styles.inputIcon}
          >
            {/* Icono de teléfono */}
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            disabled={isValidating}
          />
        </div>

        <button
          onClick={handleValidate}
          disabled={isValidating || !phone.trim()}
          className={styles.buttonVerify}
        >
          {isValidating ? t.buttonVerifying : t.buttonVerify}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={styles.errorIcon}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <p className={styles.helpText}>{t.formatHelp}</p>

      {/* 🧪 SOLO EN DESARROLLO: Botones de prueba */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.testButtons}>
          <button
            onClick={() => setPhone('+57 259 197 5659')}
            className={styles.testButton}
          >
            Test Invitado VIP
          </button>
          <button
            onClick={() => setPhone('+7 413 602 9000')}
            className={styles.testButton}
          >
            Test Barrista
          </button>
        </div>
      )}
    </div>
  );
};

export default BarristaPhoneValidator;
