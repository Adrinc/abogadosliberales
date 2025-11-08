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
  customerCategoryFk = null,  // Para flujo académico: 5 (profesor), 6 (posgrado), 7 (licenciatura) | Para barrista: 4 (Miembro Barra) o 8 (VIP)
  isAcademicFlow = false,  // TRUE cuando viene del flujo académico (AcademicStepper)
  isBarristaFlow = false,  // 🆕 TRUE cuando viene del flujo barrista
  prefilledPhone = null,  // 🆕 Teléfono pre-llenado desde validación barrista
  rfcRequired = false  // 🆕 Si se requiere RFC (flujo barrista)
}, ref) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    email_confirm: '', // 🔥 NUEVO: Confirmación de email
    mobile_phone: prefilledPhone || '', // 🆕 Pre-llenar si viene de barrista
    rfc: '', // 🆕 RFC para flujo barrista
    // 🚫 ELIMINADOS: document_type y document_number ya no se usan en flujo general
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
    // 🔥 NUEVO: Validar que el email de confirmación coincida
    if (!formData.email_confirm.trim()) {
      newErrors.email_confirm = ingles 
        ? 'Please confirm your email' 
        : 'Por favor confirme su correo electrónico';
    } else if (formData.email !== formData.email_confirm) {
      newErrors.email_confirm = ingles 
        ? 'Emails do not match' 
        : 'Los correos electrónicos no coinciden';
    }
    if (!formData.mobile_phone.trim()) {
      newErrors.mobile_phone = t.leadForm.mobilePhone.error;
    }

    // 🆕 VALIDACIÓN RFC (solo si rfcRequired === true en flujo barrista)
    if (rfcRequired && !formData.rfc.trim()) {
      newErrors.rfc = ingles 
        ? 'RFC is required for bar members' 
        : 'El RFC es obligatorio para miembros de la Barra';
    } else if (rfcRequired && formData.rfc.trim()) {
      // Validar formato básico de RFC (puede ser 12 o 13 caracteres)
      const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/i;
      if (!rfcRegex.test(formData.rfc.trim())) {
        newErrors.rfc = ingles 
          ? 'Invalid RFC format' 
          : 'Formato de RFC inválido';
      }
    }

    // 🚫 ELIMINADA validación de document_type y document_number (ya no se usan)

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
        console.log('✅ Customer already exists:', existingCustomer.customer_id);
        console.log('📊 Current status:', existingCustomer.status);

        // 🔥 VALIDACIÓN CRÍTICA: Si el status NO es "Lead", NO permitir continuar
        if (existingCustomer.status !== 'Lead') {
          console.error('❌ Customer status is NOT "Lead" (current:', existingCustomer.status, ')');
          console.error('❌ User is already registered for the event - Registration blocked');
          
          // Mostrar error al usuario
          setErrors({
            email: ingles 
              ? '⚠️ This email is already registered for the event. If you need assistance, please contact support.' 
              : '⚠️ Este correo ya está registrado para el evento. Si necesita asistencia, por favor contacte a soporte.'
          });
          
          setIsSubmitting(false);
          return; // ⚠️ CRÍTICO: Salir SIN continuar, base de datos intacta
        }

        // ✅ Status es "Lead" → Permitir actualización
        console.log('✅ Status is "Lead" - Proceeding with update');
        customerId = existingCustomer.customer_id;

        // ✅ Actualizar datos incluyendo customer_category_fk
        const updatePayload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          mobile_phone: formData.mobile_phone,
          status: 'Lead'
        };

        // Siempre actualizar customer_category_fk (null si no es académico, 5/6/7 si lo es)
        updatePayload.customer_category_fk = customerCategoryFk || null;
        console.log('📋 Updating customer_category_fk:', customerCategoryFk || null, '(null = general)');

        const { error: updateError } = await supabase
          .from('customer')
          .update(updatePayload)
          .eq('customer_id', customerId);

        if (updateError) {
          console.warn('⚠️ Error updating customer (non-fatal):', updateError.message);
        } else {
          console.log('✅ Customer data updated with category:', customerCategoryFk || null);
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
          customer_category_fk: customerCategoryFk || null,  // Mapeo académico: 5 (profesor), 6 (posgrado), 7 (licenciatura)
          organization_fk: 14
        };

        console.log('📥 Inserting new customer:', { 
          email: formData.email, 
          customer_category_fk: customerCategoryFk 
        });

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
        console.log('✅ New customer created with ID:', customerId, 'and category:', customerCategoryFk);
      }

      // 2. Preparar datos del lead para el componente padre
      // 🔥 IMPORTANTE: Formato compatible con ResumenRegistro.jsx
      const leadDataToSubmit = {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`, // 🔥 Nombre completo para ResumenRegistro
        phone: formData.mobile_phone, // 🔥 Alias para ResumenRegistro
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

      {/* 🔥 NUEVO: Confirmación de Email */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="email_confirm">
          {ingles ? 'Confirm Email' : 'Confirmar Correo Electrónico'} <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          id="email_confirm"
          name="email_confirm"
          value={formData.email_confirm}
          onChange={handleChange}
          placeholder={ingles ? 'Re-enter your email address' : 'Vuelva a ingresar su correo electrónico'}
          className={`${styles.input} ${errors.email_confirm ? styles.inputError : ''}`}
        />
        {errors.email_confirm && <span className={styles.errorText}>{errors.email_confirm}</span>}
        {!errors.email_confirm && formData.email_confirm && formData.email === formData.email_confirm && (
          <span className={styles.successText}>✓ {ingles ? 'Emails match' : 'Los correos coinciden'}</span>
        )}
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
          readOnly={isBarristaFlow} // 🆕 Readonly si viene de flujo barrista
          disabled={isBarristaFlow} // 🆕 Disabled si viene de flujo barrista
        />
        {errors.mobile_phone && <span className={styles.errorText}>{errors.mobile_phone}</span>}
        {!isBarristaFlow && <span className={styles.hint}>{t.leadForm.mobilePhone.hint}</span>}
        {isBarristaFlow && (
          <span className={styles.hintSuccess}>
            {ingles 
              ? '✓ Verified phone from membership validation' 
              : '✓ Teléfono verificado desde validación de membresía'}
          </span>
        )}
      </div>

      {/* 🆕 RFC - Solo visible en flujo barrista */}
      {isBarristaFlow && rfcRequired && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="rfc">
            {ingles ? 'RFC (Tax ID)' : 'RFC'} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="rfc"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            placeholder={ingles ? 'e.g. XAXX010101000' : 'ej. XAXX010101000'}
            className={`${styles.input} ${errors.rfc ? styles.inputError : ''}`}
            maxLength={13}
          />
          {errors.rfc && <span className={styles.errorText}>{errors.rfc}</span>}
          <span className={styles.hint}>
            {ingles 
              ? '13 characters (legal entities) or 12 (individuals)' 
              : '13 caracteres (personas morales) o 12 (físicas)'}
          </span>
        </div>
      )}

      {/* 🚫 ELIMINADOS: Campos document_type y document_number */}

      {/* Cupón - OCULTO en flujo académico Y barrista (descuento ya aplicado) */}
      {!isAcademicFlow && !isBarristaFlow && (
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
      )}

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
