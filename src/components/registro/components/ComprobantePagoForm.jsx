import React, { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/comprobantePagoForm.module.css';
import supabase from '../../../lib/supabaseClient';

const ComprobantePagoForm = ({ leadId, leadData }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;

  // Estados del formulario
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  
  // Estados de validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Estados de envío
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Constantes
  const EVENT_ID = 1;
  const AMOUNT = '1990.00';
  const CURRENCY = 'MXN';
  const WEBHOOK_URL = 'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_receipt';
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  // Validaciones
  const validateFile = (file) => {
    if (!file) return ingles ? 'Receipt file is required' : 'Archivo de comprobante requerido';
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return ingles 
        ? 'Only PDF, JPG, and PNG files are allowed' 
        : 'Solo se permiten archivos PDF, JPG y PNG';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return ingles 
        ? 'File size must be less than 5MB' 
        : 'El archivo debe ser menor a 5MB';
    }
    
    return '';
  };

  const validateReferenceNumber = (ref) => {
    if (!ref.trim()) {
      return ingles ? 'Reference number is required' : 'Número de referencia requerido';
    }
    if (ref.length < 5) {
      return ingles ? 'Reference number too short' : 'Número de referencia muy corto';
    }
    return '';
  };

  const validatePaymentDate = (date) => {
    if (!date) return ingles ? 'Payment date is required' : 'Fecha de pago requerida';
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return ingles ? 'Payment date cannot be in the future' : 'La fecha no puede ser futura';
    }
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (selectedDate < thirtyDaysAgo) {
      return ingles 
        ? 'Payment date cannot be more than 30 days ago' 
        : 'La fecha no puede ser mayor a 30 días';
    }
    
    return '';
  };

  // Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const error = validateFile(selectedFile);
    setErrors(prev => ({ ...prev, file: error }));
    setTouched(prev => ({ ...prev, file: true }));

    if (error) {
      setFile(null);
      setFilePreview(null);
      return;
    }

    setFile(selectedFile);

    // Crear preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({ type: 'image', url: reader.result });
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === 'application/pdf') {
      setFilePreview({ type: 'pdf', name: selectedFile.name, size: selectedFile.size });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const handleReferenceNumberChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 50);
    setReferenceNumber(value);
    if (touched.referenceNumber) {
      setErrors(prev => ({ ...prev, referenceNumber: validateReferenceNumber(value) }));
    }
  };

  const handlePaymentDateChange = (e) => {
    const value = e.target.value;
    setPaymentDate(value);
    if (touched.paymentDate) {
      setErrors(prev => ({ ...prev, paymentDate: validatePaymentDate(value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const validations = {
      file: () => validateFile(file),
      referenceNumber: () => validateReferenceNumber(referenceNumber),
      paymentDate: () => validatePaymentDate(paymentDate)
    };

    if (validations[field]) {
      setErrors(prev => ({ ...prev, [field]: validations[field]() }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      file: validateFile(file),
      referenceNumber: validateReferenceNumber(referenceNumber),
      paymentDate: validatePaymentDate(paymentDate)
    };

    setErrors(newErrors);
    setTouched({
      file: true,
      referenceNumber: true,
      paymentDate: true
    });

    return Object.values(newErrors).every(error => !error);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remover el prefijo data:image/png;base64, o data:application/pdf;base64,
        const base64String = reader.result;
        const base64Data = base64String.split(',')[1]; // Solo obtener la parte después de la coma
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  // Intentar obtener o crear un customer en Supabase y devolver su customer_id
  const getOrCreateCustomer = async () => {
    try {
      // Si ya tenemos leadId (prop), usarlo
      if (leadId) return parseInt(leadId);

      // Intentar buscar por email si está disponible en leadData
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

      // Si no existe, insertar nuevo cliente
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage(ingles 
        ? 'Please correct the errors in the form' 
        : 'Por favor corrija los errores en el formulario'
      );
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    try {
      console.log('📤 Starting receipt upload process...');

      // Obtener o crear customer en Supabase (lead_id)
      const resolvedCustomerId = await getOrCreateCustomer();
      const effectiveLeadId = resolvedCustomerId || (leadId ? parseInt(leadId) : null);
      console.log('📋 Effective lead/customer id to use:', effectiveLeadId);

      // Convertir archivo a base64
      console.log('🔄 Converting file to base64...');
      const base64File = await fileToBase64(file);
      console.log('✅ File converted to base64');

      // Preparar payload según el nuevo formato
      const webhookPayload = {
        customer_id: effectiveLeadId,
        event_id: EVENT_ID,
        reference_number: referenceNumber.trim(),
        amount: parseFloat(AMOUNT),
        payment_date: new Date(paymentDate).toISOString(),
        file: {
          file_name: `receipt_${EVENT_ID}_${effectiveLeadId || 'anon'}`,
          file_bucket: "event",
          file_route: `${EVENT_ID}/receipts/${effectiveLeadId || 'anon'}`,
          file_title: ingles 
            ? `Payment Receipt - Event ${EVENT_ID}` 
            : `Comprobante de Pago - Evento ${EVENT_ID}`,
          file_description: ingles 
            ? "Payment receipt uploaded by customer" 
            : "Comprobante de pago subido por el cliente",
          metadata_json: {
            event_id: EVENT_ID,
            customer_id: effectiveLeadId,
            upload_source: "landing_page",
            original_file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          },
          media_category_id: 2, // Categoría de comprobantes
          file: base64File // Base64 content (sin prefijo)
        }
      };

      console.log('📋 Payload prepared:', {
        customer_id: webhookPayload.customer_id,
        event_id: webhookPayload.event_id,
        reference_number: webhookPayload.reference_number,
        amount: webhookPayload.amount,
        payment_date: webhookPayload.payment_date,
        file_info: {
          file_name: webhookPayload.file.file_name,
          file_bucket: webhookPayload.file.file_bucket,
          file_route: webhookPayload.file.file_route,
          media_category_id: webhookPayload.file.media_category_id,
          metadata: webhookPayload.file.metadata_json
        }
      });

      console.log('📤 Sending to webhook:', WEBHOOK_URL);

      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      console.log('📬 Webhook response status:', webhookResponse.status);

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('❌ Webhook error response:', errorText);
        throw new Error(`Webhook error: ${webhookResponse.status}`);
      }

      const webhookResult = await webhookResponse.json();
      console.log('✅ Webhook response:', webhookResult);

      // Éxito
      setUploadStatus('success');
      setIsUploading(false);

      console.log('🎉 Receipt uploaded successfully! Redirecting...');

      // Redirigir después de 3 segundos
      setTimeout(() => {
        window.location.href = `/validacion?receipt_id=${webhookResult.data?.receipt_id || referenceNumber}&lead_id=${effectiveLeadId || ''}&method=transfer&status=pending`;
      }, 3000);

    } catch (error) {
      console.error('❌ Error uploading receipt:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setUploadStatus('error');
      setErrorMessage(ingles 
        ? 'Failed to upload receipt. Please try again or contact support.'
        : 'Error al subir comprobante. Por favor intente nuevamente o contacte a soporte.'
      );
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t.bankTransfer.title}</h3>
      <p className={styles.description}>{t.bankTransfer.description}</p>
      
      <div className={styles.amountBox}>
        <span className={styles.amountLabel}>{ingles ? 'Total amount:' : 'Monto total:'}</span>
        <span className={styles.amount}>{t.bankTransfer.amount}</span>
      </div>

      {/* Datos bancarios */}
      <div className={styles.bankDetails}>
        <h4 className={styles.bankDetailsTitle}>{t.bankTransfer.bankDetails.title}</h4>
        <div className={styles.bankInfo}>
          <div className={styles.bankRow}>
            <strong>{ingles ? 'Bank:' : 'Banco:'}</strong> 
            <span>{t.bankTransfer.bankDetails.bank}</span>
          </div>
          <div className={styles.bankRow}>
            <strong>CLABE:</strong> 
            <span>{t.bankTransfer.bankDetails.clabe}</span>
          </div>
          <div className={styles.bankRow}>
            <strong>{ingles ? 'Beneficiary:' : 'Beneficiario:'}</strong> 
            <span>{t.bankTransfer.bankDetails.beneficiary}</span>
          </div>
        </div>
      </div>

      {/* Estados de Envío */}
      {isUploading && (
        <div className={styles.uploadingState}>
          <div className={styles.spinner}></div>
          <p>{ingles ? 'Uploading receipt...' : 'Subiendo comprobante...'}</p>
          <small>{ingles ? 'Please do not close this window' : 'Por favor no cierre esta ventana'}</small>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className={styles.successState}>
          <div className={styles.successIcon}>✓</div>
          <h4>{ingles ? 'Receipt uploaded!' : '¡Comprobante subido!'}</h4>
          <p>{ingles ? 'Your payment is under review...' : 'Su pago está en revisión...'}</p>
          <small>{ingles ? 'Redirecting to confirmation...' : 'Redirigiendo a confirmación...'}</small>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>✕</div>
          <h4>{ingles ? 'Error' : 'Error'}</h4>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Formulario de Comprobante */}
      {!isUploading && uploadStatus === null && (
        <form onSubmit={handleSubmit} className={styles.receiptForm}>
          {/* File Upload */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {ingles ? 'Upload Receipt' : 'Subir Comprobante'}
              <span className={styles.fileTypes}>(PDF, JPG, PNG - Max 5MB)</span>
            </label>
            
            {!filePreview ? (
              <div 
                className={`${styles.dropZone} ${errors.file && touched.file ? styles.dropZoneError : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={styles.dropZoneIcon}>📄</div>
                <p className={styles.dropZoneText}>
                  {ingles 
                    ? 'Drag & drop your receipt here or click to browse' 
                    : 'Arrastra tu comprobante aquí o haz clic para buscar'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>
            ) : (
              <div className={styles.filePreview}>
                {filePreview.type === 'image' ? (
                  <img src={filePreview.url} alt="Preview" className={styles.previewImage} />
                ) : (
                  <div className={styles.pdfPreview}>
                    <div className={styles.pdfIcon}>📑</div>
                    <div className={styles.pdfInfo}>
                      <p className={styles.pdfName}>{filePreview.name}</p>
                      <p className={styles.pdfSize}>{formatFileSize(filePreview.size)}</p>
                    </div>
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={handleRemoveFile}
                  className={styles.removeButton}
                >
                  ✕ {ingles ? 'Remove' : 'Eliminar'}
                </button>
              </div>
            )}
            
            {errors.file && touched.file && (
              <span className={styles.errorText}>{errors.file}</span>
            )}
          </div>

          {/* Reference Number */}
          <div className={styles.formGroup}>
            <label htmlFor="referenceNumber" className={styles.label}>
              {ingles ? 'Reference Number' : 'Número de Referencia'}
            </label>
            <input
              id="referenceNumber"
              type="text"
              value={referenceNumber}
              onChange={handleReferenceNumberChange}
              onBlur={() => handleBlur('referenceNumber')}
              placeholder={ingles ? 'Enter reference number' : 'Ingrese número de referencia'}
              className={`${styles.input} ${errors.referenceNumber && touched.referenceNumber ? styles.inputError : ''}`}
            />
            {errors.referenceNumber && touched.referenceNumber && (
              <span className={styles.errorText}>{errors.referenceNumber}</span>
            )}
          </div>

          {/* Payment Date */}
          <div className={styles.formGroup}>
            <label htmlFor="paymentDate" className={styles.label}>
              {ingles ? 'Payment Date' : 'Fecha de Pago'}
            </label>
            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={handlePaymentDateChange}
              onBlur={() => handleBlur('paymentDate')}
              max={new Date().toISOString().split('T')[0]}
              className={`${styles.input} ${errors.paymentDate && touched.paymentDate ? styles.inputError : ''}`}
            />
            {errors.paymentDate && touched.paymentDate && (
              <span className={styles.errorText}>{errors.paymentDate}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitButton}>
            {ingles ? 'Submit Receipt' : 'Enviar Comprobante'}
          </button>

          {/* Info */}
          <div className={styles.infoBox}>
            <span className={styles.infoIcon}>ℹ️</span>
            <small>
              {ingles 
                ? 'Your payment will be reviewed within 24-48 hours. You will receive a confirmation email once approved.' 
                : 'Su pago será revisado en 24-48 horas. Recibirá un correo de confirmación una vez aprobado.'}
            </small>
          </div>
        </form>
      )}

      <div className={styles.debugInfo}>
        <small>🔧 Debug: Lead ID = {leadId} | Event ID = {EVENT_ID}</small>
      </div>
    </div>
  );
};

export default ComprobantePagoForm;
