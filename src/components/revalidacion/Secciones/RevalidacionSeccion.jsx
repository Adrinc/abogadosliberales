import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRevalidacion } from '../../../data/translationsRevalidacion';
import FileUploader from '../components/FileUploader';
import RevalidacionSuccess from '../components/RevalidacionSuccess';
import supabase from '../../../lib/supabaseClient';
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

  // 🔥 NUEVO: Estado para customer category y amount calculado
  const [customerCategoryFk, setCustomerCategoryFk] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(990); // Default general

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  // 🔥 Extraer parámetros de la URL del navegador y buscar customer category
  useEffect(() => {
    const fetchCustomerData = async () => {
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

        // 🔥 Si el tipo de rechazo es 'receipt', buscar customer_category_fk
        if (hasParams && isValid && rejectedTypeParam === 'receipt' && customerIdParam) {
          try {
            console.log('🔎 Buscando customer_category_fk para customer_id:', customerIdParam);
            
            const { data: customerData, error: customerError } = await supabase
              .from('customer')
              .select('customer_category_fk')
              .eq('customer_id', parseInt(customerIdParam, 10))
              .single();

            if (customerError) {
              console.error('❌ Error al buscar customer:', customerError);
              // Si hay error, usar valores por defecto
              setCustomerCategoryFk(null);
              setCalculatedAmount(990);
            } else {
              const categoryFk = customerData?.customer_category_fk || null;
              setCustomerCategoryFk(categoryFk);

              // 🔥 Calcular amount según customer_category_fk
              let amount = 990; // Default general (null o empty)
              
              if (categoryFk === 7 || categoryFk === 6 || categoryFk === 5) {
                amount = 490; // Precio académico unificado
              }

              setCalculatedAmount(amount);

              console.log('✅ Customer category y amount calculado:', {
                customer_category_fk: categoryFk,
                calculated_amount: amount
              });
            }
          } catch (err) {
            console.error('❌ Error inesperado al buscar customer:', err);
            // Valores por defecto en caso de error
            setCustomerCategoryFk(null);
            setCalculatedAmount(990);
          }
        }

        setIsLoadingParams(false); // 🔥 Termina el loading

        console.log('✅ [CLIENT] Validación:', {
          hasRequiredParams: hasParams,
          isValidRejectedType: isValid,
          willShowForm: hasParams && isValid
        });
      }
    };

    fetchCustomerData();
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
      // 🔥 INTEGRACIÓN REAL CON n8n webhooks
      console.log('📤 Enviando archivo al webhook de n8n...');
      
      // Convertir archivo a base64
      const base64File = await fileToBase64(file);
      console.log('✅ File converted to base64');

      // Determinar el webhook y payload según el tipo de rechazo
      let webhookUrl = '';
      let payload = {};

      if (rejectedType === 'credential') {
        // 🎓 CREDENCIAL RECHAZADA - Usar congreso_nacional_upload_credential
        webhookUrl = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_credential';
        
        // Determinar el tipo de credencial (por defecto student_id)
        const credentialType = 'student_id'; // TODO: Podrías guardar esto en la BD si es necesario
        
        payload = {
          customer_id: parseInt(customerId, 10), // ✅ Número puro
          credential_type: credentialType,
          institution_name: 'Universidad', // TODO: Recuperar de BD si es necesario
          event_id: 1, // Congreso Nacional de Amparo
          file: {
            file_name: `credential_revalidation_${customerId}`,
            file_bucket: 'customer_document',
            file_route: `credentials/${customerId}`,
            file_title: 'Credencial Re-subida',
            file_description: 'Credencial re-subida después de rechazo',
            metadata_json: {
              customer_id: parseInt(customerId, 10),
              upload_source: 'revalidation_page',
              original_file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              uploaded_at: new Date().toISOString(),
              is_reupload: true // ✅ Marcar como re-subida
            },
            media_category_id: 3, // Categoría de credenciales
            file: base64File // String base64 puro
          }
        };

        console.log('🎓 Payload para credencial:', {
          customer_id: payload.customer_id,
          credential_type: payload.credential_type,
          event_id: payload.event_id,
          file: {
            ...payload.file,
            file: `[base64 string with ${base64File.length} characters]`
          }
        });

      } else if (rejectedType === 'receipt') {
        // 🧾 COMPROBANTE RECHAZADO - Usar congreso_nacional_upload_receipt
        webhookUrl = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_receipt';
        
        payload = {
          customer_id: parseInt(customerId, 10), // ✅ Número puro
          event_id: 1, // Congreso Nacional de Amparo
          amount: parseFloat(calculatedAmount.toFixed(2)), // 🔥 NUEVO: Amount calculado dinámicamente
          file: {
            file_name: `receipt_revalidation_${customerId}`,
            file_bucket: 'customer_document',
            file_route: `receipts/${customerId}`,
            file_title: 'Comprobante de Pago Re-subido',
            file_description: 'Comprobante de pago re-subido después de rechazo',
            metadata_json: {
              customer_id: parseInt(customerId, 10),
              upload_source: 'revalidation_page',
              original_file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              uploaded_at: new Date().toISOString(),
              is_reupload: true, // ✅ Marcar como re-subida
              customer_category_fk: customerCategoryFk, // 🔥 Guardar categoría en metadata
              calculated_amount: calculatedAmount // 🔥 Guardar amount calculado en metadata
            },
            media_category_id: 4, // Categoría de comprobantes
            file: base64File // String base64 puro
          }
        };

        console.log('🧾 Payload para comprobante:', {
          customer_id: payload.customer_id,
          event_id: payload.event_id,
          amount: payload.amount, // 🔥 IMPORTANTE: Verificar que se envíe
          customer_category_fk: customerCategoryFk,
          file: {
            ...payload.file,
            file: `[base64 string with ${base64File.length} characters]`
          }
        });
      }

      console.log('📡 Sending to webhook:', webhookUrl);

      // Enviar al webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      // Leer el texto de respuesta primero
      const responseText = await response.text();
      console.log('📡 Response text:', responseText);

      if (!response.ok) {
        console.error('❌ Webhook error response:', responseText);
        throw new Error(`HTTP ${response.status}: ${responseText || 'Error desconocido del servidor'}`);
      }

      // Intentar parsear como JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ File uploaded successfully:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        console.error('❌ Raw response:', responseText);
        throw new Error('El servidor no respondió con un JSON válido. Por favor contacte al administrador.');
      }

      // ✅ ÉXITO
      console.log('✅ Archivo enviado correctamente');
      setSubmitStatus('success');

    } catch (error) {
      console.error('❌ Error al enviar archivo:', error);
      
      // Mensaje de error específico
      let errorMsg = t.fileValidation.uploadError;
      
      if (error.message.includes('JSON')) {
        errorMsg = ingles 
          ? '⚠️ Server error: The upload service is not responding correctly. Please contact support.' 
          : '⚠️ Error del servidor: El servicio de carga no está respondiendo correctamente. Por favor contacte a soporte.';
      } else if (error.message.includes('HTTP')) {
        errorMsg = ingles 
          ? `⚠️ Server error (${error.message}). Please try again or contact support.` 
          : `⚠️ Error del servidor (${error.message}). Por favor intente nuevamente o contacte a soporte.`;
      }
      
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };

  // Convertir archivo a base64 (helper function)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo "data:image/jpeg;base64," para obtener solo el string base64
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
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
