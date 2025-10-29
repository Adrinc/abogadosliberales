import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRevalidacion } from '../../../data/translationsRevalidacion';
import FileUploader from '../components/FileUploader';
import RevalidacionSuccess from '../components/RevalidacionSuccess';
import styles from '../css/revalidacionSeccion.module.css';

const RevalidacionSeccion = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRevalidacion.en : translationsRevalidacion.es;

  // 🔥 PARSEAR PARÁMETROS DEL LADO DEL CLIENTE (porque Astro no los pasa correctamente)
  const [customerId, setCustomerId] = useState(null);
  const [rejectedType, setRejectedType] = useState(null);
  const [hasRequiredParams, setHasRequiredParams] = useState(false);
  const [isValidRejectedType, setIsValidRejectedType] = useState(false);
  const [isLoadingParams, setIsLoadingParams] = useState(true); // 🔥 Estado de carga inicial

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  // 🔥 Extraer parámetros de la URL del navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const customerIdParam = urlParams.get('customer_id');
      const rejectedTypeParam = urlParams.get('rejected');

      console.log('🔍 [CLIENT] URL completa:', window.location.href);
      console.log('🔍 [CLIENT] Parámetros extraídos:', {
        customer_id: customerIdParam,
        rejected: rejectedTypeParam
      });

      setCustomerId(customerIdParam);
      setRejectedType(rejectedTypeParam);

      const hasParams = !!(customerIdParam && rejectedTypeParam);
      const isValid = rejectedTypeParam === 'credential' || rejectedTypeParam === 'receipt';

      setHasRequiredParams(hasParams);
      setIsValidRejectedType(isValid);
      setIsLoadingParams(false); // 🔥 Termina el loading

      console.log('✅ [CLIENT] Validación:', {
        hasRequiredParams: hasParams,
        isValidRejectedType: isValid,
        willShowForm: hasParams && isValid
      });
    }
  }, []);

  // 🔥 Pantalla de carga mientras se parsean los parámetros
  if (isLoadingParams) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Cargando...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error: Parámetros faltantes
  if (!hasRequiredParams) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1 className={styles.errorTitle}>{t.errors.missingParams.title}</h1>
          <p className={styles.errorText}>{t.errors.missingParams.description}</p>
          <a href="/registro" className={styles.ctaButton}>
            {t.errors.missingParams.ctaButton}
          </a>
        </div>
      </div>
    );
  }

  // Pantalla de error: Tipo de rechazo inválido
  if (!isValidRejectedType) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>❌</div>
          <h1 className={styles.errorTitle}>{t.errors.invalidType.title}</h1>
          <p className={styles.errorText}>{t.errors.invalidType.description}</p>
          <a href="/contacto" className={styles.ctaButton}>
            {t.errors.invalidType.ctaButton}
          </a>
        </div>
      </div>
    );
  }

  // Pantalla de éxito (después de enviar)
  if (submitStatus === 'success') {
    return <RevalidacionSuccess rejectedType={rejectedType} />;
  }

  // Obtener traducciones según tipo de rechazo
  const content = rejectedType === 'credential' ? t.credential : t.receipt;

  // Handler para cambio de archivo
  const handleFileChange = (newFile) => {
    setFile(newFile);
    setErrorMessage('');

    // Generar preview
    if (newFile) {
      if (newFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(newFile);
      } else if (newFile.type === 'application/pdf') {
        setFilePreview('pdf');
      }
    } else {
      setFilePreview(null);
    }
  };

  // Handler para enviar archivo
  const handleSubmit = async () => {
    console.log('🚀 Iniciando envío de archivo...');
    console.log('📋 Customer ID:', customerId);
    console.log('📋 Rejected Type:', rejectedType);
    console.log('📋 File:', file);

    if (!file) {
      setErrorMessage(ingles ? 'Please select a file first' : 'Por favor seleccione un archivo primero');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 🔥 PLACEHOLDER: Aquí irá la llamada al webhook de n8n cuando esté listo
      // Por ahora, simulamos el envío exitoso después de 2 segundos
      
      console.log('📤 [SIMULACIÓN] Enviando archivo al webhook de n8n...');
      console.log('📤 URL del webhook: [PENDIENTE - Tu compañero lo proporcionará]');
      console.log('📤 Payload esperado:');
      console.log({
        customer_id: parseInt(customerId),
        rejected_type: rejectedType,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        // file_base64: '[BASE64_STRING_AQUÍ]' // Se generará al integrar
      });

      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 🔥 CUANDO TU COMPAÑERO TENGA EL WEBHOOK LISTO, REEMPLAZA ESTO CON:
      /*
      const formData = new FormData();
      formData.append('customer_id', customerId);
      formData.append('rejected_type', rejectedType);
      formData.append('file', file);

      const response = await fetch('https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_reupload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al enviar el archivo');
      }

      const data = await response.json();
      console.log('✅ Respuesta del webhook:', data);
      */

      // Éxito simulado
      console.log('✅ [SIMULACIÓN] Archivo enviado correctamente');
      setSubmitStatus('success');

    } catch (error) {
      console.error('❌ Error al enviar archivo:', error);
      setErrorMessage(t.fileValidation.uploadError);
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.revalidacionSection}>
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Card Principal */}
          <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
              <span className={styles.badge}>{content.badge}</span>
              <h1 className={styles.title}>{content.title}</h1>
              <p className={styles.subtitle}>{content.subtitle}</p>
              <p className={styles.description}>{content.description}</p>
            </div>

            {/* Requisitos */}
            <div className={styles.requirements}>
              <h3 className={styles.requirementsTitle}>{content.requirements.title}</h3>
              <ul className={styles.requirementsList}>
                {content.requirements.items.map((item, index) => (
                  <li key={index} className={styles.requirementItem}>
                    <span className={styles.checkIcon}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* File Uploader */}
            <FileUploader
              file={file}
              filePreview={filePreview}
              onFileChange={handleFileChange}
              rejectedType={rejectedType}
            />

            {/* Error Message */}
            {errorMessage && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!file || isSubmitting}
            >
              {isSubmitting ? content.submittingButton : content.submitButton}
            </button>

            {/* Footer Text */}
            <p className={styles.footerText}>{content.footer}</p>

            {/* Debug Info (Solo en desarrollo) */}
            <div className={styles.debugInfo}>
              <small>
                🔧 Debug: Customer ID = {customerId} | Rejected Type = {rejectedType}
              </small>
              <small>
                📡 Webhook: [PENDIENTE - Integración con n8n]
              </small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevalidacionSeccion;
