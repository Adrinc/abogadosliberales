import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import supabase from '../../../lib/supabaseClient';
import {
  calculateAcademicPrice,
  getMSIOptions,
  canAccessPaquete11,
  formatPrice,
  getCustomerCategoryFk,
} from '../../../lib/academicPricing';
import styles from '../css/academicStepper.module.css';

// Import additional components for personal data and payment steps.
import FormularioLead from './FormularioLead.jsx';
import PayPalIframe from '../components/PayPalIframe';
import IPPayTemporaryMessage from '../components/IPPayTemporaryMessage';
import StripeForm from './StripeForm'; // ✅ Revertido: Stripe Redirect (temporal)
import ComprobantePagoForm from '../components/ComprobantePagoForm';

const AcademicStepper = ({ onComplete, onPriceChange, selectedMethod, setSelectedMethod }) => {
  const ingles = useStore(isEnglish);
  const t = ingles
    ? translationsRegistro.en.academicStepper
    : translationsRegistro.es.academicStepper;

  // Estado del stepper
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos del lead y método de pago para los pasos 4 y 5
  const [leadData, setLeadData] = useState(null);
  const [leadId, setLeadId] = useState(null);
  // selectedMethod ahora viene como prop desde RegistroSeccion2
  // const [selectedMethod, setSelectedMethod] = useState('paypal'); // REMOVIDO - ahora es prop

  // Referencia al formulario de datos personales (FormularioLead)
  const formRef = useRef(null);

  // Datos académicos y personales
  const [academicData, setAcademicData] = useState({
    university: '',
    role: '',
    isPaquete11: false,
    // Datos personales (antes en Step 4, ahora en Step 3)
    firstName: '',
    lastName: '',
    email: '',
    emailConfirm: '',
    phone: '',
    studentId: '',
    proofFile: null,
    paymentPlan: 'single', // 'single' | 'msi3' | 'msi6' | 'msi12'
  });

  // Errores por paso
  const [errors, setErrors] = useState({});

  // Archivo seleccionado y preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');

  // Calcular precio en tiempo real
  useEffect(() => {
    if (academicData.university && academicData.role) {
      const priceData = calculateAcademicPrice({
        isAcademic: true,
        university: academicData.university,
        role: academicData.role,
        isPaquete11: academicData.isPaquete11,
        paymentPlan: academicData.paymentPlan,
      });

      console.log('═══════════════════════════════════════════');
      console.log('💰 PRECIO ACADÉMICO CALCULADO EN STEPPER');
      console.log('═══════════════════════════════════════════');
      console.log('🎓 Universidad:', academicData.university);
      console.log('🎓 Rol:', academicData.role);
      console.log('💵 Precio Final:', priceData.finalPrice);
      console.log('💵 Descuento:', priceData.discountPercentage + '%');
      console.log('═══════════════════════════════════════════');

      // 🔥 GUARDAR INMEDIATAMENTE EN LOCALSTORAGE
      localStorage.setItem('lastPaymentAmount', priceData.finalPrice.toFixed(2));
      console.log('💾 Monto guardado en localStorage:', priceData.finalPrice.toFixed(2));

      // Notificar al padre del cambio de precio
      if (onPriceChange) {
        onPriceChange(priceData);
      }
    }
  }, [
    academicData.university,
    academicData.role,
    academicData.isPaquete11,
    academicData.paymentPlan,
  ]);

  // Helper para obtener la etiqueta de cada paso en la barra de progreso.
  const getStepLabel = (step) => {
    if (step === 4) {
      return ingles ? 'Payment method' : 'Método de pago';
    }
    const key = `step${step}`;
    return (t[key] && t[key].title) || step;
  };

  // Validación por paso
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!academicData.university) {
          newErrors.university = t.step1.error;
        }
        break;

      case 2:
        if (!academicData.role) {
          newErrors.role = t.step2.error;
        }
        break;

      case 3:
        // Validar datos personales
        if (!academicData.firstName.trim()) {
          newErrors.firstName = t.step3.firstName.error;
        }
        if (!academicData.lastName.trim()) {
          newErrors.lastName = t.step3.lastName.error;
        }
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!academicData.email.trim()) {
          newErrors.email = t.step3.email.error;
        } else if (!emailRegex.test(academicData.email)) {
          newErrors.email = t.step3.email.error;
        }
        // Validar confirmación de email
        if (!academicData.emailConfirm.trim()) {
          newErrors.emailConfirm = t.step3.emailConfirm.error;
        } else if (academicData.email !== academicData.emailConfirm) {
          newErrors.emailConfirm = t.step3.emailConfirm.error;
        }
        if (!academicData.phone.trim()) {
          newErrors.phone = t.step3.phone.error;
        }
        // Matrícula obligatoria
        if (!academicData.studentId.trim()) {
          newErrors.studentId = t.step3.studentId.error;
        }
        // Archivo obligatorio
        if (!selectedFile && !academicData.proofFile) {
          newErrors.proofFile = t.step3.proofFile.error;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convertir archivo a base64
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

  // Subir credencial al webhook de n8n
  const uploadCredential = async (customerId, file) => {
    console.log('📤 Uploading credential to n8n webhook...');
    console.log('📋 Customer ID:', customerId, '(type:', typeof customerId, ')');
    console.log('📋 File name:', file.name);
    console.log('📋 File type:', file.type);
    console.log('📋 File size:', file.size);

    // Validar que customer_id sea numérico
    if (!customerId || typeof customerId !== 'number') {
      throw new Error('customer_id debe ser numérico. Recibido: ' + typeof customerId);
    }

    try {
      // Convertir archivo a base64
      const base64File = await fileToBase64(file);
      console.log('✅ File converted to base64');

      // Determinar el tipo de credencial según el rol
      let credentialType = 'student_id'; // Por defecto
      if (academicData.role === 'profesor') {
        credentialType = 'teacher_id';
      } else if (academicData.role === 'licenciatura' || academicData.role === 'posgrado') {
        credentialType = 'student_id';
      }

      // Construir payload según la especificación del compañero (incluye event_id)
      const payload = {
        customer_id: customerId, // ✅ Número puro, no string
        credential_type: credentialType,
        institution_name: academicData.university || 'Universidad no especificada',
        event_id: 1, // ✅ NUEVO - ID del evento (Congreso Nacional de Amparo)
        file: {
          file_name: `credential_${customerId}`,
          file_bucket: 'customer_document',
          file_route: `credentials/${customerId}`,
          file_title: credentialType === 'teacher_id' ? 'Credencial de Profesor' : 'Credencial Estudiantil',
          file_description: `Credencial ${credentialType === 'teacher_id' ? 'de profesor' : 'estudiantil'} subida por el cliente`,
          metadata_json: {
            customer_id: customerId, // ✅ Número puro
            upload_source: 'landing_page',
            original_file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          },
          media_category_id: 3, // Categoría de credenciales
          file: base64File // String base64 puro (sin prefijo)
        }
      };

      console.log('📦 Payload preparado:', {
        customer_id: payload.customer_id,
        credential_type: payload.credential_type,
        institution_name: payload.institution_name,
        event_id: payload.event_id,
        file: {
          ...payload.file,
          file: `[base64 string with ${base64File.length} characters]`
        }
      });

      // Enviar al webhook
      const response = await fetch('https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_credential', {
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
        console.log('✅ Credential uploaded successfully:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        console.error('❌ Raw response:', responseText);
        throw new Error('El servidor no respondió con un JSON válido. Por favor contacte al administrador.');
      }

      return result;

    } catch (error) {
      console.error('❌ Error uploading credential:', error);
      throw new Error(ingles 
        ? 'Failed to upload credential. Please try again.' 
        : 'Error al subir la credencial. Por favor intente nuevamente.'
      );
    }
  };

  // Crear customer en Supabase (Step 3)
  const handleCreateCustomer = async () => {
    setIsSubmitting(true);

    let customerId = null;
    let isNewCustomer = false;

    try {
      // 🔥 PASO 1: Crear/actualizar customer PRIMERO para obtener customer_id numérico
      console.log('📤 Step 1: Creating/updating customer in Supabase...');
      
      // Obtener la categoría correspondiente según el rol
      const customerCategoryFk = getCustomerCategoryFk(academicData.role, academicData.isPaquete11);
      console.log('📋 Customer category FK:', customerCategoryFk);

      // 1.1. Verificar si el email ya existe
      const { data: existingCustomer, error: selectError } = await supabase
        .from('customer')
        .select('customer_id, email, status')
        .eq('email', academicData.email)
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.warn('⚠️ Error checking existing customer:', selectError.message);
      }

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
        isNewCustomer = false;

        const { error: updateError } = await supabase
          .from('customer')
          .update({
            first_name: academicData.firstName,
            last_name: academicData.lastName,
            mobile_phone: academicData.phone,
            customer_category_fk: customerCategoryFk,
            status: 'Lead'
          })
          .eq('customer_id', customerId);

        if (updateError) {
          console.warn('⚠️ Error updating customer:', updateError.message);
        } else {
          console.log('✅ Customer updated successfully');
        }
      } else {
        // Cliente no existe, crear nuevo
        const { data: newCustomer, error: insertError } = await supabase
          .from('customer')
          .insert({
            first_name: academicData.firstName,
            last_name: academicData.lastName,
            email: academicData.email,
            mobile_phone: academicData.phone,
            customer_category_fk: customerCategoryFk,
            status: 'Lead',
            customer_parent_id: null,
            organization_fk: 14
          })
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
        isNewCustomer = true;
        console.log('✅ New customer created with ID:', customerId);
      }

      // 🔥 PASO 2: Subir credencial usando el customer_id numérico
      console.log('📤 Step 2: Uploading credential with customer_id:', customerId);
      
      if (selectedFile) {
        try {
          await uploadCredential(customerId, selectedFile);
          console.log('✅ Credential uploaded successfully');
        } catch (uploadError) {
          console.error('❌ Error uploading credential:', uploadError);
          
          // 🔥 CRÍTICO: Si falla la subida Y es un nuevo customer, BORRARLO
          if (isNewCustomer && customerId) {
            console.warn('⚠️ Credential upload failed for NEW customer - rolling back...');
            try {
              const { error: deleteError } = await supabase
                .from('customer')
                .delete()
                .eq('customer_id', customerId);
              
              if (deleteError) {
                console.error('❌ Failed to rollback customer:', deleteError.message);
              } else {
                console.log('✅ Customer rollback successful - customer_id', customerId, 'deleted');
              }
            } catch (rollbackError) {
              console.error('❌ Rollback error:', rollbackError);
            }
          }
          
          // Mostrar error al usuario
          alert(uploadError.message || (ingles 
            ? 'Failed to upload credential. Please check your internet connection and try again.' 
            : 'Error al subir la credencial. Por favor verifique su conexión a internet e intente nuevamente.'));
          
          // 🔥 DETENER TODO el flujo
          throw uploadError;
        }
      } else {
        console.warn('⚠️ No credential file to upload');
      }

      // 🔥 PASO 3: TODO OK - Customer creado y credencial subida
      console.log('🎉 Customer created AND credential uploaded successfully!');

      // 3. Guardar leadData y leadId
      setLeadId(customerId);
      const newLeadData = {
        name: `${academicData.firstName} ${academicData.lastName}`,
        email: academicData.email,
        phone: academicData.phone,
        customer_id: customerId
      };
      setLeadData(newLeadData);

      console.log('🎉 Customer creation successful!');
      
      // 4. Notificar al componente padre que se creó el lead
      if (onComplete) {
        onComplete({
          leadData: newLeadData,
          leadId: customerId
        });
      }
      
      // 5. Avanzar al siguiente paso
      setCurrentStep(currentStep + 1);

    } catch (error) {
      console.error('❌ Error during customer creation/upload:', error);
      
      // 🔥 Mensaje de error específico según el tipo
      let errorMessage = error.message;
      
      if (error.message.includes('JSON')) {
        errorMessage = ingles 
          ? '⚠️ Server error: The credential upload service is not responding correctly.\n\nPlease contact the administrator with this error:\n"Invalid JSON response from upload_credential webhook"\n\nWebhook: https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_credential' 
          : '⚠️ Error del servidor: El servicio de carga de credenciales no está respondiendo correctamente.\n\nPor favor contacte al administrador con este error:\n"Respuesta JSON inválida del webhook upload_credential"\n\nWebhook: https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_credential';
      } else if (error.message.includes('HTTP')) {
        errorMessage = ingles 
          ? '⚠️ Server error: Could not connect to credential upload service. Please check your internet connection and try again.' 
          : '⚠️ Error del servidor: No se pudo conectar al servicio de carga de credenciales. Por favor verifique su conexión a internet e intente nuevamente.';
      } else if (error.message.includes('customer_id')) {
        errorMessage = ingles 
          ? 'Invalid customer ID format. Please contact support.' 
          : 'Formato de ID de cliente inválido. Por favor contacte a soporte.';
      } else if (error.message.includes('customer')) {
        errorMessage = ingles 
          ? 'Failed to create customer record. Please try again.' 
          : 'Error al crear el registro del cliente. Por favor intente nuevamente.';
      } else {
        // Error genérico - mostrar el mensaje original
        errorMessage = ingles 
          ? `Credential upload failed: ${error.message}.\n\nPlease try again or contact support.` 
          : `Error al subir credencial: ${error.message}.\n\nPor favor intente nuevamente o contacte a soporte.`;
      }
      
      alert(errorMessage);
      
      // 🔥 NO AVANZAR AL STEP 4 - el usuario debe quedarse en Step 3
      console.log('🛑 Stopping flow due to error - staying in Step 3');
      
      if (isNewCustomer) {
        console.log('💡 NOTE: New customer was rolled back (deleted) due to credential upload failure');
      }
      
      console.log('💡 TIP: If you see "Invalid JSON response", the webhook is not configured correctly in n8n');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers
  const handleNext = async () => {
    // Validar el paso actual
    if (!validateStep(currentStep)) {
      return;
    }

    // Si estamos en el paso 3 (datos personales + académicos), crear customer en BD
    if (currentStep === 3) {
      await handleCreateCustomer();
    } else {
      // Para los demás pasos, avanzar normalmente
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Si venimos del step 4 (pago), volver al step 3
      // Limpiar leadData para permitir edición
      if (currentStep === 4) {
        setLeadData(null);
        setLeadId(null);
        
        // Notificar al padre para que también limpie su estado
        if (onComplete) {
          onComplete({
            leadData: null,
            leadId: null
          });
        }
        console.log('🧹 Retrocediendo del Step 4 → Step 3 - Datos limpiados');
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Calcular precio final
      const finalPriceData = calculateAcademicPrice({
        isAcademic: true,
        university: academicData.university,
        role: academicData.role,
        isPaquete11: academicData.isPaquete11,
        paymentPlan: academicData.paymentPlan,
      });

      // Notificar al padre
      if (onComplete) {
        onComplete({
          ...academicData,
          priceData: finalPriceData,
          leadData: leadData,          // Incluir datos del lead (paso 4)
          leadId: leadId,              // Incluir ID del lead
        });
      }

      console.log('✅ Academic verification completed:', {
        ...academicData,
        finalPrice: finalPriceData.finalPrice,
      });
    } catch (error) {
      console.error('❌ Error completing academic verification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');

    if (!file) return;

    // Validar tipo - IMÁGENES (JPG, PNG, WebP, HEIC, AVIF, BMP)
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',      // Android, web moderna
      'image/heic',      // iPhone (iOS 11+)
      'image/heif',      // iPhone alternativo
      'image/avif',      // Formato moderno
      'image/bmp'        // Formato antiguo pero válido
    ];
    if (!validTypes.includes(file.type)) {
      setFileError(t.step3.proofFile.errorType);
      return;
    }

    // Validar tamaño (5 MB = 5242880 bytes)
    if (file.size > 5242880) {
      setFileError(t.step3.proofFile.errorSize);
      return;
    }

    setSelectedFile(file);
    setAcademicData({ ...academicData, proofFile: file });

    // Generar preview de la imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Función para remover archivo
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setAcademicData({ ...academicData, proofFile: null });
    if (errors.proofFile) {
      setErrors({ ...errors, proofFile: '' });
    }
    // Limpiar input file
    const fileInput = document.getElementById('proofFile');
    if (fileInput) fileInput.value = '';
  };

  // Callback para el formulario de datos personales. Almacena los datos del lead y avanza al paso 5.
  const handleLeadSubmit = (data, id) => {
    setLeadData(data);
    setLeadId(id);
    // Una vez guardado el lead, avanzar automáticamente al paso 5 (Plan de pago)
    setCurrentStep(5);
  };

  // Obtener opciones MSI disponibles (no utilizadas en el flujo de pago simplificado, pero se mantiene por compatibilidad)
  const availableMSI = getMSIOptions(academicData.role, academicData.isPaquete11);

  // Calcular precio actual
  const currentPrice =
    academicData.university && academicData.role
      ? calculateAcademicPrice({
          isAcademic: true,
          university: academicData.university,
          role: academicData.role,
          isPaquete11: academicData.isPaquete11,
          paymentPlan: academicData.paymentPlan,
        })
      : null;

  return (
    <div className={styles.stepperContainer}>
      {/* Progress Bar */}
      {/* Configuramos la barra de progreso para mostrar cuatro pasos en una sola línea.
          Utilizamos flexbox y asignamos un ancho de 25% a cada paso. */}
      <div
        className={styles.progressBar}
        style={{ display: 'flex', flexWrap: 'nowrap' }}
      >
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{ width: '25%' }}
            className={`${styles.progressStep} ${
              step <= currentStep ? styles.progressStepActive : ''
            } ${step < currentStep ? styles.progressStepCompleted : ''}`}
          >
            <div className={styles.progressStepNumber}>
              {step < currentStep ? '✓' : step}
            </div>
            <div className={styles.progressStepLabel}>
              {getStepLabel(step)}
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={styles.stepContent}>
        {/* STEP 1: Universidad */}
        {currentStep === 1 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>{t.step1.title}</h3>
            <p className={styles.stepSubtitle}>{t.step1.subtitle}</p>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="university">
                {t.step1.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <select
                id="university"
                value={academicData.university}
                onChange={(e) => {
                  setAcademicData({ ...academicData, university: e.target.value });
                  if (errors.university) setErrors({ ...errors, university: '' });
                }}
                className={`${styles.select} ${
                  errors.university ? styles.inputError : ''
                }`}
              >
                <option value="">{t.step1.placeholder}</option>
                {t.step1.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.university && (
                <span className={styles.errorText}>{errors.university}</span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Rol Académico */}
        {currentStep === 2 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>{t.step2.title}</h3>
            <p className={styles.stepSubtitle}>{t.step2.subtitle}</p>

            <div className={styles.roleOptions}>
              {t.step2.options.map((option) => (
                <label
                  key={option.value}
                  className={`${styles.roleCard} ${
                    academicData.role === option.value && !academicData.isPaquete11
                      ? styles.roleCardActive
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={academicData.role === option.value && !academicData.isPaquete11}
                    onChange={(e) => {
                      setAcademicData({
                        ...academicData,
                        role: e.target.value,
                        isPaquete11: false,
                      });
                      if (errors.role) setErrors({ ...errors, role: '' });
                    }}
                    className={styles.roleRadio}
                  />
                  <div className={styles.roleContent}>
                    <div className={styles.roleHeader}>
                      <span className={styles.roleName}>{option.label}</span>
                      <span className={styles.roleDiscount}>{option.discount}</span>
                    </div>
                    <p className={styles.roleDescription}>{option.description}</p>
                    <p className={styles.rolePrice}>{option.price}</p>
                  </div>
                </label>
              ))}

              {/* Paquete 11 (solo para profesor y posgrado) - TEMPORALMENTE OCULTO */}
              {/* {canAccessPaquete11(academicData.role) && (
                <label
                  className={`${styles.roleCard} ${styles.roleCardSpecial} ${
                    academicData.isPaquete11 ? styles.roleCardActive : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paquete11"
                    checked={academicData.isPaquete11}
                    onChange={() => {
                      setAcademicData({
                        ...academicData,
                        isPaquete11: !academicData.isPaquete11,
                      });
                    }}
                    className={styles.roleRadio}
                  />
                  <div className={styles.roleContent}>
                    <div className={styles.roleHeader}>
                      <span className={styles.roleName}>{t.step2.paquete11.label}</span>
                      <span className={styles.roleDiscount}>{t.step2.paquete11.discount}</span>
                    </div>
                    <p className={styles.roleDescription}>{t.step2.paquete11.description}</p>
                    <p className={styles.rolePrice}>{t.step2.paquete11.price}</p>
                    <p className={styles.roleHint}>{t.step2.paquete11.hint}</p>
                  </div>
                </label>
              )} */}
            </div>

            {errors.role && <span className={styles.errorText}>{errors.role}</span>}
          </div>
        )}

        {/* STEP 3: Datos personales y verificación */}
        {currentStep === 3 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>{t.step3.title}</h3>
            <p className={styles.stepSubtitle}>{t.step3.subtitle}</p>

            {/* Nombre(s) */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="firstName">
                {t.step3.firstName.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={academicData.firstName}
                onChange={(e) => {
                  setAcademicData({ ...academicData, firstName: e.target.value });
                  if (errors.firstName) setErrors({ ...errors, firstName: '' });
                }}
                placeholder={t.step3.firstName.placeholder}
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
              />
              {errors.firstName && (
                <span className={styles.errorText}>{errors.firstName}</span>
              )}
            </div>

            {/* Apellido(s) */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="lastName">
                {t.step3.lastName.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={academicData.lastName}
                onChange={(e) => {
                  setAcademicData({ ...academicData, lastName: e.target.value });
                  if (errors.lastName) setErrors({ ...errors, lastName: '' });
                }}
                placeholder={t.step3.lastName.placeholder}
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
              />
              {errors.lastName && (
                <span className={styles.errorText}>{errors.lastName}</span>
              )}
            </div>

            {/* Correo electrónico */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                {t.step3.email.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                value={academicData.email}
                onChange={(e) => {
                  setAcademicData({ ...academicData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder={t.step3.email.placeholder}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
              {!errors.email && t.step3.email.hint && (
                <span className={styles.hint}>{t.step3.email.hint}</span>
              )}
            </div>

            {/* Confirmar correo electrónico */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="emailConfirm">
                {t.step3.emailConfirm.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="emailConfirm"
                value={academicData.emailConfirm}
                onChange={(e) => {
                  setAcademicData({ ...academicData, emailConfirm: e.target.value });
                  if (errors.emailConfirm) setErrors({ ...errors, emailConfirm: '' });
                }}
                placeholder={t.step3.emailConfirm.placeholder}
                className={`${styles.input} ${errors.emailConfirm ? styles.inputError : ''}`}
              />
              {errors.emailConfirm && (
                <span className={styles.errorText}>{errors.emailConfirm}</span>
              )}
              {!errors.emailConfirm && academicData.emailConfirm && academicData.email === academicData.emailConfirm && (
                <span className={styles.successText}>✓ {ingles ? 'Emails match' : 'Los correos coinciden'}</span>
              )}
              {!errors.emailConfirm && t.step3.emailConfirm.hint && !academicData.emailConfirm && (
                <span className={styles.hint}>{t.step3.emailConfirm.hint}</span>
              )}
            </div>

            {/* Teléfono / WhatsApp */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="phone">
                {t.step3.phone.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={academicData.phone}
                onChange={(e) => {
                  setAcademicData({ ...academicData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder={t.step3.phone.placeholder}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              />
              {errors.phone && (
                <span className={styles.errorText}>{errors.phone}</span>
              )}
            </div>

            {/* Matrícula o Número de empleado */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="studentId">
                {t.step3.studentId.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="studentId"
                value={academicData.studentId}
                onChange={(e) => {
                  setAcademicData({ ...academicData, studentId: e.target.value });
                  if (errors.studentId) setErrors({ ...errors, studentId: '' });
                }}
                placeholder={t.step3.studentId.placeholder}
                className={`${styles.input} ${errors.studentId ? styles.inputError : ''}`}
              />
              {errors.studentId && (
                <span className={styles.errorText}>{errors.studentId}</span>
              )}
              {!errors.studentId && t.step3.studentId.hint && (
                <span className={styles.hint}>{t.step3.studentId.hint}</span>
              )}
            </div>

            {/* Archivo de identificación (OBLIGATORIO) */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="proofFile">
                {t.step3.proofFile.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="proofFile"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.avif,.bmp,image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,image/bmp"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <label htmlFor="proofFile" className={`${styles.fileLabel} ${errors.proofFile ? styles.fileLabelError : ''}`}>
                  <svg className={styles.fileIcon} width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
                    <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>{selectedFile ? t.step3.proofFile.selectedText : t.step3.proofFile.buttonText}</span>
                </label>
              </div>
              {selectedFile && (
                <div className={styles.selectedFile}>
                  <span className={styles.selectedFileName}>{selectedFile.name}</span>
                  <span className={styles.selectedFileSize}>
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className={styles.removeFileButton}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Preview de la imagen cargada */}
              {filePreview && (
                <div className={styles.filePreviewContainer}>
                  <img 
                    src={filePreview} 
                    alt="Vista previa de identificación" 
                    className={styles.imagePreview}
                  />
                  <p className={styles.previewLabel}>
                    {ingles ? 'Preview of uploaded image' : 'Vista previa de la imagen cargada'}
                  </p>
                </div>
              )}

              {errors.proofFile && (
                <span className={styles.errorText}>{errors.proofFile}</span>
              )}
              {!errors.proofFile && t.step3.proofFile.hint && (
                <span className={styles.hint}>{t.step3.proofFile.hint}</span>
              )}
              {fileError && <span className={styles.errorText}>{fileError}</span>}
            </div>
          </div>
        )}

        {/* STEP 4: Método de pago */}
        {currentStep === 4 && (
          <div className={styles.step}>
       
            {leadData ? (
              <>
                {/* Métodos de pago */}
                <div className={styles.paymentSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      {(t.paymentMethods && t.paymentMethods.title) ||
                        (ingles ? 'Métodos de pago' : 'Métodos de pago')}
                    </h2>
                    <p className={styles.sectionSubtitle}>
                      {(t.paymentMethods && t.paymentMethods.subtitle) ||
                        (ingles ? 'Elige cómo pagar' : 'Elige cómo pagar')}
                    </p>
                  </div>
                  <div className={styles.tabs}>
                    {/* 🚫 PayPal OCULTO - No eliminar, solo comentar */}
                    {/* <button
                      className={`${styles.tab} ${
                        selectedMethod === 'paypal' ? styles.tabActive : ''
                      }`}
                      type="button"
                      onClick={() => setSelectedMethod('paypal')}
                    >
                      <div className={styles.tabIcon}>💳</div>
                      <span className={styles.tabLabel}>
                        {(t.paymentMethods &&
                          t.paymentMethods.tabs &&
                          t.paymentMethods.tabs.paypal) || 'PayPal'}
                      </span>
                      <div className={styles.tabIndicator}></div>
                    </button> */}
                    <button
                      className={`${styles.tab} ${
                        selectedMethod === 'creditCard' ? styles.tabActive : ''
                      }`}
                      type="button"
                      onClick={() => setSelectedMethod('creditCard')}
                    >
                      <div className={styles.tabIcon}>💰</div>
                      <span className={styles.tabLabel}>
                        {(t.paymentMethods &&
                          t.paymentMethods.tabs &&
                          t.paymentMethods.tabs.creditCard) || 'Tarjeta'}
                      </span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                    <button
                      className={`${styles.tab} ${
                        selectedMethod === 'bankTransfer' ? styles.tabActive : ''
                      }`}
                      type="button"
                      onClick={() => setSelectedMethod('bankTransfer')}
                    >
                      <div className={styles.tabIcon}>🏦</div>
                      <span className={styles.tabLabel}>
                        {(t.paymentMethods &&
                          t.paymentMethods.tabs &&
                          t.paymentMethods.tabs.bankTransfer) || 'Transferencia'}
                      </span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                  </div>
                  <div className={styles.paymentFormCard}>
                    {/* 🚫 PayPal OCULTO - No eliminar, solo comentar */}
                    {/* {selectedMethod === 'paypal' && (
                      <PayPalIframe
                        leadId={leadId}
                        leadData={leadData}
                        academicPriceData={currentPrice}
                        isAcademic={true}
                        academicRole={academicData.role}
                      />
                    )} */}
                    {selectedMethod === 'creditCard' && (
                      <StripeForm
                        leadId={leadId}
                        leadData={leadData}
                        academicPriceData={currentPrice}
                        isAcademic={true}
                        academicRole={academicData.role}
                      />
                    )}
                    {selectedMethod === 'bankTransfer' && (
                      <ComprobantePagoForm
                        leadId={leadId}
                        leadData={leadData}
                        academicPriceData={currentPrice}
                        isAcademic={true}
                        academicRole={academicData.role}
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.hint}>
                {ingles
                  ? 'Por favor completa tus datos personales primero'
                  : 'Por favor completa tus datos personales primero'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.navigation}>
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className={styles.btnSecondary}
            disabled={isSubmitting}
          >
            {t.navigation.previous}
          </button>
        )}

        {/* El botón "Continuar" se oculta en el Step 4 (método de pago) */}
        {currentStep < 4 && (
          <button
            type="button"
            onClick={handleNext}
            className={styles.btnPrimary}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t.messages.completing
              : t.navigation.next}
          </button>
        )}
      </div>
    </div>
  );
};

export default AcademicStepper;