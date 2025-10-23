import React, { useState, useImperativeHandle } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/formularioLead.module.css';
import supabase from '../../../lib/supabaseClient';

const FormularioLead = React.forwardRef(({ 
  onSubmit, 
  isCompleted, 
  hideSubmitButton = false, 
  customerCategoryFk = null  // Para flujo académico: 5 (profesor), 6 (posgrado), 7 (licenciatura)
}, ref) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_phone: '',
    document_type: '',
    document_number: '',
    company: '',
    job_title: '',
    coupon: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expose an imperative submit method to parent components (e.g., steppers)
  // IMPORTANTE: Este hook DEBE estar aquí, SIEMPRE, no dentro de un return temprano
  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit({ preventDefault: () => {} });
    }
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = t.leadForm.firstName.error;
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = t.leadForm.lastName.error;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.leadForm.email.error;
    }
    if (!formData.mobile_phone.trim()) {
      newErrors.mobile_phone = t.leadForm.mobilePhone.error;
    }
    if (!formData.document_type) {
      newErrors.document_type = t.leadForm.documentType.error;
    }
    if (!formData.document_number.trim()) {
      newErrors.document_number = t.leadForm.documentNumber.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log('📤 Submitting lead to Supabase...');
      
      // 1. Verificar si el email ya existe
      const { data: existingCustomer, error: selectError } = await supabase
        .from('customer')
        .select('customer_id, email, status')
        .eq('email', formData.email)
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.warn('⚠️ Error checking existing customer (non-fatal):', selectError.message);
      }

      let customerId = null;

      if (existingCustomer) {
        // Cliente ya existe, usar su ID
        console.log('✅ Customer already exists:', existingCustomer.customer_id);
        customerId = existingCustomer.customer_id;

        // Opcional: actualizar datos si han cambiado
        const { error: updateError } = await supabase
          .from('customer')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            mobile_phone: formData.mobile_phone,
            status: 'Lead' // Mantener o actualizar status
          })
          .eq('customer_id', customerId);

        if (updateError) {
          console.warn('⚠️ Error updating customer (non-fatal):', updateError.message);
        } else {
          console.log('✅ Customer data updated');
        }
      } else {
        // Cliente no existe, crear nuevo
        const customerPayload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          mobile_phone: formData.mobile_phone,
          status: 'Lead',
          customer_parent_id: null,
          customer_category_fk: customerCategoryFk || null,  // Mapeo académico: 5, 6, o 7
          organization_fk: null
        };

        console.log('📥 Inserting new customer:', { email: formData.email });

        const { data: newCustomer, error: insertError } = await supabase
          .from('customer')
          .insert(customerPayload)
          .select('customer_id')
          .single();

        if (insertError) {
          console.error('❌ Error creating customer:', insertError.message);
          throw new Error(ingles 
            ? 'Failed to create customer. Please try again.' 
            : 'Error al crear el cliente. Por favor intente nuevamente.'
          );
        }

        customerId = newCustomer.customer_id;
        console.log('✅ New customer created with ID:', customerId);
      }

      // 2. Preparar datos del lead para el componente padre
      const leadDataToSubmit = {
        ...formData,
        status: 'Lead',
        event_id: 1, // Congreso Nacional de Amparo
        customer_id: customerId
      };

      console.log('🎉 Lead submission successful!');
      console.log('📋 Lead data:', leadDataToSubmit);
      console.log('🆔 Customer ID:', customerId);

      // 3. Notificar al componente padre (RegistroSeccion2)
      onSubmit(leadDataToSubmit, customerId);

    } catch (error) {
      console.error('❌ Error during lead submission:', error);
      
      // Mostrar error al usuario (podrías agregar un estado para esto)
      alert(error.message || (ingles 
        ? 'An error occurred. Please try again.' 
        : 'Ocurrió un error. Por favor intente nuevamente.'
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.completedBanner}>
        <div className={styles.completedIcon}>✓</div>
        <div>
          <h3 className={styles.completedTitle}>Información guardada</h3>
          <p className={styles.completedText}>
            {formData.first_name} {formData.last_name} - {formData.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>{t.leadForm.title}</h2>
      <p className={styles.formSubtitle}>{t.leadForm.subtitle}</p>

      {/* Nombre y Apellidos (Grid 2 columnas) */}
      <div className={styles.gridRow}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="first_name">
            {t.leadForm.firstName.label} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder={t.leadForm.firstName.placeholder}
            className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
          />
          {errors.first_name && <span className={styles.errorText}>{errors.first_name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="last_name">
            {t.leadForm.lastName.label} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder={t.leadForm.lastName.placeholder}
            className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
          />
          {errors.last_name && <span className={styles.errorText}>{errors.last_name}</span>}
        </div>
      </div>

      {/* Email */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="email">
          {t.leadForm.email.label} <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t.leadForm.email.placeholder}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
        />
        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
      </div>

      {/* Teléfono */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="mobile_phone">
          {t.leadForm.mobilePhone.label} <span className={styles.required}>*</span>
        </label>
        <input
          type="tel"
          id="mobile_phone"
          name="mobile_phone"
          value={formData.mobile_phone}
          onChange={handleChange}
          placeholder={t.leadForm.mobilePhone.placeholder}
          className={`${styles.input} ${errors.mobile_phone ? styles.inputError : ''}`}
        />
        {errors.mobile_phone && <span className={styles.errorText}>{errors.mobile_phone}</span>}
        <span className={styles.hint}>{t.leadForm.mobilePhone.hint}</span>
      </div>

      {/* Tipo de Documento y Número (Grid 2 columnas) */}
      <div className={styles.gridRow}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="document_type">
            {t.leadForm.documentType.label} <span className={styles.required}>*</span>
          </label>
          <select
            id="document_type"
            name="document_type"
            value={formData.document_type}
            onChange={handleChange}
            className={`${styles.select} ${errors.document_type ? styles.inputError : ''}`}
          >
            <option value="">{t.leadForm.documentType.placeholder}</option>
            {t.leadForm.documentType.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.document_type && <span className={styles.errorText}>{errors.document_type}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="document_number">
            {t.leadForm.documentNumber.label} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="document_number"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            placeholder={t.leadForm.documentNumber.placeholder}
            className={`${styles.input} ${errors.document_number ? styles.inputError : ''}`}
          />
          {errors.document_number && <span className={styles.errorText}>{errors.document_number}</span>}
        </div>
      </div>

      {/* Organización (Opcional) */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="company">
          {t.leadForm.company.label}
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder={t.leadForm.company.placeholder}
          className={styles.input}
        />
        <span className={styles.hint}>{t.leadForm.company.hint}</span>
      </div>

      {/* Cargo (Opcional) */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="job_title">
          {t.leadForm.jobTitle.label}
        </label>
        <input
          type="text"
          id="job_title"
          name="job_title"
          value={formData.job_title}
          onChange={handleChange}
          placeholder={t.leadForm.jobTitle.placeholder}
          className={styles.input}
        />
        <span className={styles.hint}>{t.leadForm.jobTitle.hint}</span>
      </div>

      {/* Cupón (Opcional) */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="coupon">
          {t.leadForm.coupon.label}
        </label>
        <input
          type="text"
          id="coupon"
          name="coupon"
          value={formData.coupon}
          onChange={handleChange}
          placeholder={t.leadForm.coupon.placeholder}
          className={styles.input}
        />
        <span className={styles.hint}>{t.leadForm.coupon.hint}</span>
      </div>

      {/* Botón Submit */}
      {!hideSubmitButton && (
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? t.leadForm.savingButton : t.leadForm.saveButton}
        </button>
      )}
    </form>
  );
});

export default FormularioLead;
