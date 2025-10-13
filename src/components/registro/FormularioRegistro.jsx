import React, { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import { translationsRegistro } from '../../data/translationsRegistro';
import styles from './formularioRegistro.module.css';

const FormularioRegistro = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;
  
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    position: '',
    specialization: '',
    coupon: '',
    paymentProof: null
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  // Validación de email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validación de archivo
  const validateFile = (file) => {
    if (!file) return false;
    
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, paymentProof: t.validation.invalidFileType }));
      return false;
    }
    
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, paymentProof: t.validation.fileTooLarge }));
      return false;
    }
    
    return true;
  };

  // Manejar cambios en inputs de texto
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file && validateFile(file)) {
      setFormData(prev => ({ ...prev, paymentProof: file }));
      setFileName(file.name);
      setErrors(prev => ({ ...prev, paymentProof: '' }));
    } else {
      e.target.value = '';
      setFileName('');
    }
  };

  // Validar formulario completo
  const validateForm = () => {
    const newErrors = {};
    
    // Nombre completo (obligatorio)
    if (!formData.fullName.trim()) {
      newErrors.fullName = t.form.fullName.error;
    }
    
    // Email (obligatorio y válido)
    if (!formData.email.trim()) {
      newErrors.email = t.form.email.error;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.validation.invalidEmail;
    }
    
    // Comprobante de pago (obligatorio)
    if (!formData.paymentProof) {
      newErrors.paymentProof = t.form.paymentProof.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll al primer error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Aquí iría la llamada al backend/API
      // Ejemplo: await fetch('/api/registro', { method: 'POST', body: formDataToSend });
      
      // Simulación de envío (remover en producción)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Éxito
      setSubmitStatus('success');
      
      // Limpiar formulario
      setFormData({
        fullName: '',
        email: '',
        whatsapp: '',
        position: '',
        specialization: '',
        coupon: '',
        paymentProof: null
      });
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Scroll arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limpiar formulario
  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      whatsapp: '',
      position: '',
      specialization: '',
      coupon: '',
      paymentProof: null
    });
    setFileName('');
    setErrors({});
    setSubmitStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Si el formulario fue enviado exitosamente, mostrar mensaje
  if (submitStatus === 'success') {
    return (
      <div className={styles.successMessage}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.successTitle}>{t.messages.success.title}</h2>
        <p className={styles.successText}>{t.messages.success.message}</p>
        <a href="/" className={styles.backButton}>
          {t.messages.success.action}
        </a>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        
        {/* Sección: Información Personal */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            {t.form.personalData}
          </h3>
          
          {/* Nombre completo */}
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>
              {t.form.fullName.label} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder={t.form.fullName.placeholder}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              autoComplete="name"
            />
            {errors.fullName && (
              <span className={styles.errorMessage}>{errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              {t.form.email.label} <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t.form.email.placeholder}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              autoComplete="email"
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          {/* WhatsApp */}
          <div className={styles.formGroup}>
            <label htmlFor="whatsapp" className={styles.label}>
              {t.form.whatsapp.label}
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              placeholder={t.form.whatsapp.placeholder}
              className={styles.input}
              autoComplete="tel"
            />
            <span className={styles.hint}>{t.form.whatsapp.hint}</span>
          </div>
        </div>

        {/* Sección: Información Profesional */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💼</span>
            {t.form.professionalData}
          </h3>
          
          {/* Cargo */}
          <div className={styles.formGroup}>
            <label htmlFor="position" className={styles.label}>
              {t.form.position.label}
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder={t.form.position.placeholder}
              className={styles.input}
            />
          </div>

          {/* Especialización */}
          <div className={styles.formGroup}>
            <label htmlFor="specialization" className={styles.label}>
              {t.form.specialization.label}
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder={t.form.specialization.placeholder}
              className={styles.input}
            />
            <span className={styles.hint}>{t.form.specialization.hint}</span>
          </div>

          {/* Cupón */}
          <div className={styles.formGroup}>
            <label htmlFor="coupon" className={styles.label}>
              {t.form.coupon.label}
            </label>
            <input
              type="text"
              id="coupon"
              name="coupon"
              value={formData.coupon}
              onChange={handleInputChange}
              placeholder={t.form.coupon.placeholder}
              className={styles.input}
            />
            <span className={styles.hint}>{t.form.coupon.hint}</span>
          </div>
        </div>

        {/* Sección: Comprobante de Pago */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📄</span>
            {t.form.paymentData}
          </h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="paymentProof" className={styles.label}>
              {t.form.paymentProof.label} <span className={styles.required}>*</span>
            </label>
            
            <div className={styles.fileUpload}>
              <input
                type="file"
                id="paymentProof"
                name="paymentProof"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className={styles.fileInput}
              />
              <label 
                htmlFor="paymentProof" 
                className={`${styles.fileButton} ${errors.paymentProof ? styles.fileButtonError : ''}`}
              >
                <span className={styles.fileIcon}>📎</span>
                {t.form.paymentProof.button}
              </label>
              <span className={styles.fileName}>
                {fileName || t.form.paymentProof.noFile}
              </span>
            </div>
            
            <span className={styles.hint}>{t.form.paymentProof.hint}</span>
            
            {errors.paymentProof && (
              <span className={styles.errorMessage}>{errors.paymentProof}</span>
            )}
          </div>
        </div>

        {/* Mensaje de error general */}
        {submitStatus === 'error' && (
          <div className={styles.errorAlert}>
            <span className={styles.errorAlertIcon}>⚠️</span>
            <div>
              <strong>{t.messages.error.title}</strong>
              <p>{t.messages.error.message}</p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? t.form.submitting : t.form.submit}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className={styles.resetButton}
            disabled={isSubmitting}
          >
            {t.form.reset}
          </button>
        </div>

        {/* Nota de campos obligatorios */}
        <p className={styles.requiredNote}>
          {t.footer.note}
        </p>
      </form>
    </div>
  );
};

export default FormularioRegistro;
