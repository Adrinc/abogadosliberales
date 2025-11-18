import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/activeMemberForm.module.css';
import supabase from '../../../lib/supabaseClient';

const ActiveMemberForm = ({ onSubmit, onPhoneValidation }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    email_confirm: '',
    mobile_phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Estados para validación de teléfono
  const [phoneValidation, setPhoneValidation] = useState({
    isValidating: false,
    isValidated: false,
    validationResult: null,
    error: null
  });

  // Estados para carga de comprobante de membresía
  const [membershipProof, setMembershipProof] = useState({
    file: null,
    preview: null,
    isUploading: false,
    uploadError: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validación automática de teléfono
  const validatePhone = async (phone) => {
    if (!phone || phone.length !== 10) {
      return;
    }

    console.log('📞 [ActiveMember] Validando teléfono:', phone);
    
    setPhoneValidation({
      isValidating: true,
      isValidated: false,
      validationResult: null,
      error: null
    });

    try {
      const payload = {
        phone: phone,
        event_id: 1,
        email: formData.email || 'temp@email.com'
      };

      console.log('📤 [ActiveMember] Enviando payload:', payload);

      const response = await fetch(
        'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_search_phone',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [ActiveMember] Respuesta API:', result);

      const data = Array.isArray(result) ? result[0] : result;

      let validationResult;
      if (data.valid === false) {
        validationResult = { status: 'blocked', canProceed: false };
      } else {
        validationResult = { status: 'new_customer', canProceed: true };
      }

      setPhoneValidation({
        isValidating: false,
        isValidated: true,
        validationResult,
        error: null
      });

      if (onPhoneValidation) {
        onPhoneValidation(validationResult);
      }

    } catch (error) {
      console.error('❌ [ActiveMember] Error validando teléfono:', error);
      setPhoneValidation({
        isValidating: false,
        isValidated: false,
        validationResult: null,
        error: error.message
      });
    }
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, mobile_phone: value }));
    
    if (errors.mobile_phone) {
      setErrors(prev => ({ ...prev, mobile_phone: '' }));
    }

    if (value.length === 10) {
      validatePhone(value);
    } else {
      setPhoneValidation({
        isValidating: false,
        isValidated: false,
        validationResult: null,
        error: null
      });
    }
  };

  // Convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }

    // Validar tipo (solo imágenes)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/avif', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      setMembershipProof({
        file: null,
        preview: null,
        isUploading: false,
        uploadError: ingles 
          ? 'Only images are allowed (JPG, PNG, WebP, HEIC, AVIF, BMP)' 
          : 'Solo se permiten imágenes (JPG, PNG, WebP, HEIC, AVIF, BMP)'
      });
      return;
    }

    // Validar tamaño (máx 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMembershipProof({
        file: null,
        preview: null,
        isUploading: false,
        uploadError: ingles 
          ? 'Image must not exceed 5 MB' 
          : 'La imagen no debe exceder 5 MB'
      });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMembershipProof({
        file,
        preview: reader.result,
        isUploading: false,
        uploadError: null
      });
    };
    reader.readAsDataURL(file);
  };

  // Remover archivo
  const handleRemoveFile = () => {
    setMembershipProof({
      file: null,
      preview: null,
      isUploading: false,
      uploadError: null
    });
  };

  // Subir comprobante de membresía
  const uploadMembershipProof = async (customerId, file) => {
    console.log('📤 [ActiveMember] Iniciando carga de comprobante...');
    
    setMembershipProof(prev => ({ ...prev, isUploading: true, uploadError: null }));

    try {
      const base64File = await fileToBase64(file);

      const payload = {
        customer_id: customerId,
        event_id: 1,
        file: {
          file_name: `comprobante_${customerId}`,
          file_bucket: 'customer_document',
          file_route: `credentials/${customerId}`,
          file_title: 'Membresía Barra',
          file_description: `Membresía subida por el cliente`,
          metadata_json: {
            customer_id: customerId,
            upload_source: 'landing_page',
            original_file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          },
          media_category_id: 4,
          file: base64File
        }
      };

      console.log('📤 [ActiveMember] Payload preparado:', {
        customer_id: payload.customer_id,
        file_name: payload.file.file_name,
        file_size: file.size
      });

      const response = await fetch(
        'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_comprobante_membresia',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [ActiveMember] Comprobante subido:', result);

      setMembershipProof(prev => ({ ...prev, isUploading: false }));
      return result;

    } catch (error) {
      console.error('❌ [ActiveMember] Error subiendo comprobante:', error);
      setMembershipProof(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadError: ingles 
          ? 'Error uploading proof. Please try again.' 
          : 'Error al subir comprobante. Intente nuevamente.'
      }));
      throw error;
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = ingles ? 'First name is required' : 'El nombre es obligatorio';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = ingles ? 'Last name is required' : 'Los apellidos son obligatorios';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = ingles ? 'Email is required' : 'El correo es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = ingles ? 'Invalid email' : 'Correo inválido';
    }

    if (!formData.email_confirm.trim()) {
      newErrors.email_confirm = ingles ? 'Email confirmation is required' : 'La confirmación es obligatoria';
    } else if (formData.email !== formData.email_confirm) {
      newErrors.email_confirm = ingles ? 'Emails do not match' : 'Los correos no coinciden';
    }

    if (!formData.mobile_phone.trim()) {
      newErrors.mobile_phone = ingles ? 'Phone is required' : 'El teléfono es obligatorio';
    } else if (formData.mobile_phone.length !== 10) {
      newErrors.mobile_phone = ingles ? 'Phone must be 10 digits' : 'El teléfono debe tener 10 dígitos';
    }

    if (!phoneValidation.isValidated || !phoneValidation.validationResult?.canProceed) {
      newErrors.mobile_phone = ingles 
        ? 'Phone validation is required' 
        : 'Debe validar su teléfono';
    }

    if (!membershipProof.file) {
      newErrors.membershipProof = ingles 
        ? 'Membership proof is required' 
        : 'El comprobante de membresía es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('❌ [ActiveMember] Validación fallida:', errors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 [ActiveMember] Verificando si el email ya existe...');

      // 1️⃣ Verificar si el email ya existe
      const { data: existingCustomer, error: selectError } = await supabase
        .from('customer')
        .select('customer_id, email, status')
        .eq('email', formData.email)
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.warn('⚠️ [ActiveMember] Error checking existing customer (non-fatal):', selectError.message);
      }

      let customerId = null;

      if (existingCustomer) {
        console.log('✅ [ActiveMember] Customer already exists:', existingCustomer.customer_id);
        console.log('📊 [ActiveMember] Current status:', existingCustomer.status);

        // 🔥 VALIDACIÓN CRÍTICA: Si el status NO es "Lead", NO permitir continuar
        if (existingCustomer.status !== 'Lead') {
          console.error('❌ [ActiveMember] Customer status is NOT "Lead" (current:', existingCustomer.status, ')');
          console.error('❌ [ActiveMember] User is already registered for the event - Registration blocked');
          
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
        console.log('✅ [ActiveMember] Status is "Lead" - Proceeding with update');
        customerId = existingCustomer.customer_id;

        // ✅ Actualizar datos del customer
        const updatePayload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          mobile_phone: formData.mobile_phone,
          customer_category_fk: 4, // Miembro Barra
          status: 'Lead'
        };

        const { error: updateError } = await supabase
          .from('customer')
          .update(updatePayload)
          .eq('customer_id', customerId);

        if (updateError) {
          console.warn('⚠️ [ActiveMember] Error updating customer (non-fatal):', updateError.message);
        } else {
          console.log('✅ [ActiveMember] Customer data updated:', customerId);
        }
      } else {
        // 2️⃣ Cliente no existe, crear nuevo
        console.log('📝 [ActiveMember] Creando nuevo customer en Supabase...');

        const { data: customer, error: customerError } = await supabase
          .from('customer')
          .insert({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            mobile_phone: formData.mobile_phone,
            customer_category_fk: 4, // Miembro Barra
            status: 'Lead',
            organization_fk: 14
          })
          .select('customer_id')
          .single();

        if (customerError) {
          throw new Error(`Supabase error: ${customerError.message}`);
        }

        customerId = customer.customer_id;
        console.log('✅ [ActiveMember] Nuevo customer creado:', customerId);
      }

      // Subir comprobante de membresía
      await uploadMembershipProof(customerId, membershipProof.file);

      // Notificar al padre
      if (onSubmit) {
        onSubmit({
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          phone: formData.mobile_phone,
          mobile_phone: formData.mobile_phone,
          first_name: formData.first_name,
          last_name: formData.last_name,
          customer_id: customerId,
          status: 'Lead'
        }, customerId);
      }

      console.log('✅ [ActiveMember] Formulario completado exitosamente');
      setIsCompleted(true);

    } catch (error) {
      console.error('❌ [ActiveMember] Error en submit:', error);
      setErrors({
        submit: ingles 
          ? 'Error creating registration. Please try again.' 
          : 'Error al crear el registro. Intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar banner de completado (igual que FormularioLead)
  if (isCompleted) {
    return (
      <div className={styles.completedBanner}>
        <div className={styles.completedIcon}>✓</div>
        <div>
          <h3 className={styles.completedTitle}>
            {ingles ? 'Information Saved' : 'Información guardada'}
          </h3>
          <p className={styles.completedText}>
            {formData.first_name} {formData.last_name} - {formData.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2 className={styles.formTitle}>
          {ingles ? 'Active Bar Member Registration' : 'Registro de Miembro Activo'}
        </h2>
        <p className={styles.formSubtitle}>
          {ingles 
            ? 'Complete your information and upload your membership proof' 
            : 'Complete su información y cargue su comprobante de membresía'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Nombre y Apellidos (Grid 2 columnas) */}
        <div className={styles.gridRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {ingles ? 'First Name(s)' : 'Nombre(s)'} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
              placeholder={ingles ? 'Enter your first name(s)' : 'Ingrese su(s) nombre(s)'}
            />
            {errors.first_name && <span className={styles.errorText}>{errors.first_name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {ingles ? 'Last Name(s)' : 'Apellido(s)'} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
              placeholder={ingles ? 'Enter your last name(s)' : 'Ingrese sus apellidos'}
            />
            {errors.last_name && <span className={styles.errorText}>{errors.last_name}</span>}
          </div>
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {ingles ? 'Email' : 'Correo electrónico'} <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder={ingles ? 'email@example.com' : 'correo@ejemplo.com'}
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        {/* Confirmar Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {ingles ? 'Confirm Email' : 'Confirmar correo electrónico'} <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email_confirm"
            value={formData.email_confirm}
            onChange={handleChange}
            className={`${styles.input} ${errors.email_confirm ? styles.inputError : ''}`}
            placeholder={ingles ? 'Confirm your email' : 'Confirme su correo'}
          />
          {errors.email_confirm && <span className={styles.errorText}>{errors.email_confirm}</span>}
          {!errors.email_confirm && formData.email_confirm && formData.email === formData.email_confirm && (
            <span className={styles.successText}>✓ {ingles ? 'Emails match' : 'Los correos coinciden'}</span>
          )}
        </div>

        {/* Teléfono con validación */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {ingles ? 'Phone / WhatsApp' : 'Teléfono / WhatsApp'} <span className={styles.required}>*</span>
          </label>
          <div className={styles.phoneInputWrapper}>
            <span className={styles.phonePrefix}>+52</span>
            <input
              type="tel"
              name="mobile_phone"
              value={formData.mobile_phone}
              onChange={handlePhoneChange}
              className={`${styles.input} ${styles.phoneInput} ${errors.mobile_phone ? styles.inputError : ''}`}
              placeholder="5512345678"
              maxLength="10"
            />
          </div>
          {phoneValidation.isValidating && (
            <span className={styles.phoneValidating}>
              {ingles ? 'Validating...' : 'Validando...'}
            </span>
          )}
          {phoneValidation.isValidated && phoneValidation.validationResult?.canProceed && (
            <span className={styles.successText}>
              ✓ {ingles ? 'Phone validated' : 'Teléfono validado'}
            </span>
          )}
          {phoneValidation.validationResult?.status === 'blocked' && (
            <span className={styles.errorText}>
              {ingles 
                ? 'This user is already registered for this event' 
                : 'Esta persona ya está registrada para este evento'}
            </span>
          )}
          {errors.mobile_phone && <span className={styles.errorText}>{errors.mobile_phone}</span>}
        </div>

        {/* Comprobante de Membresía */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {ingles ? 'Bar Membership Proof' : 'Comprobante de Membresía de la Barra'} <span className={styles.required}>*</span>
          </label>
          <p className={styles.hint}>
            {ingles 
              ? 'Upload an image of your active membership proof. Accepted formats: JPG, PNG, WebP, HEIC, AVIF. Max 5 MB.' 
              : 'Suba una imagen de su comprobante de membresía activa. Formatos aceptados: JPG, PNG, WebP, HEIC, AVIF. Máx 5 MB.'}
          </p>

          {!membershipProof.file ? (
            <div className={styles.fileInput}>
              <input
                type="file"
                id="membershipProof"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/avif,image/bmp"
                onChange={handleFileChange}
                className={styles.fileInputHidden}
              />
              <label htmlFor="membershipProof" className={styles.fileInputLabel}>
                <span className={styles.fileInputIcon}>📎</span>
                <span className={styles.fileInputText}>
                  {ingles ? 'Select image' : 'Seleccionar imagen'}
                </span>
              </label>
            </div>
          ) : (
            <div className={styles.filePreview}>
              <img src={membershipProof.preview} alt="Preview" className={styles.previewImage} />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{membershipProof.file.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className={styles.removeButton}
                >
                  {ingles ? 'Remove' : 'Remover'}
                </button>
              </div>
            </div>
          )}

          {membershipProof.uploadError && (
            <span className={styles.errorText}>{membershipProof.uploadError}</span>
          )}
          {errors.membershipProof && (
            <span className={styles.errorText}>{errors.membershipProof}</span>
          )}
        </div>

        {/* Error general */}
        {errors.submit && (
          <div className={styles.submitError}>
            {errors.submit}
          </div>
        )}

        {/* Botón submit */}
        <button
          type="submit"
          disabled={isSubmitting || membershipProof.isUploading}
          className={`${styles.submitButton} ${isSubmitting ? styles.submitButtonDisabled : ''}`}
        >
          {isSubmitting 
            ? (ingles ? 'Processing...' : 'Procesando...') 
            : (ingles ? 'Continue to Payment' : 'Continuar al Pago')}
        </button>
      </form>
    </div>
  );
};

export default ActiveMemberForm;
