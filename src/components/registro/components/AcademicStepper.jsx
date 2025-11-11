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

import StripeForm from './StripeForm'; // ✅ Stripe ÚNICO método de pago
// 🚫 DESHABILITADO: ComprobantePagoForm (transferencia bancaria ya no se usa)
// import ComprobantePagoForm from '../components/ComprobantePagoForm';

const AcademicStepper = ({ onComplete, onPriceChange, onPhoneValidation }) => { // 🆕 Agregado onPhoneValidation
  const ingles = useStore(isEnglish);
  const t = ingles
    ? translationsRegistro.en.academicStepper
    : translationsRegistro.es.academicStepper;

  // Estado del stepper - 🔥 AHORA SOLO 3 PASOS
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos del lead para el paso de pago (Step 3 - antes Step 4)
  const [leadData, setLeadData] = useState(null);
  const [leadId, setLeadId] = useState(null);
  // 🚫 selectedMethod ELIMINADO - Solo Stripe ahora (sin selector de métodos)

  // Referencia al formulario de datos personales (FormularioLead)
  const formRef = useRef(null);

  // Datos académicos y personales
  const [academicData, setAcademicData] = useState({
    university: '',
    role: '',
    isPaquete11: false,
    // Datos personales (FUSIONADOS EN STEP 1)
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

  // 🆕 NUEVO: Estados para validación de teléfono
  const [phoneValidation, setPhoneValidation] = useState({
    isValidating: false,
    isValidated: false,
    validationResult: null,
    error: null
  });

  // Calcular precio en tiempo real - 🔥 PRECIO FIJO $490 PARA TODOS LOS ROLES ACADÉMICOS
  useEffect(() => {
    if (academicData.university && academicData.role) {
      // 🔥 PRECIO FIJO: $490 para TODOS los roles académicos (profesor, posgrado, licenciatura)
      const priceData = {
        finalPrice: 490,
        basePrice: 990,
        discount: 500,
        discountPercentage: 50,
        monthlyAmount: null,
        availableMSI: [],
        appliedDiscounts: ['academic_rate']
      };

      // 🔥 GUARDAR INMEDIATAMENTE EN LOCALSTORAGE
      localStorage.setItem('lastPaymentAmount', '490.00');

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
    // 🔥 Títulos personalizados para los 3 pasos
    if (step === 1) {
      return ingles ? 'Personal data' : 'Datos personales';
    }
    if (step === 2) {
      return ingles ? 'Academic data' : 'Datos académicos';
    }
    if (step === 3) {
      return ingles ? 'Payment data' : 'Datos de pago';
    }
    return step;
  };

  // Validación por paso - 🔥 AHORA SOLO 3 PASOS
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        // 🔥 STEP 1: Solo Datos Personales (SIN universidad, matrícula ni credencial)
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
        // Validar teléfono
        if (!academicData.phone.trim()) {
          newErrors.phone = t.step3.phone.error;
        } else if (academicData.phone.length !== 10) {
          newErrors.phone = ingles 
            ? 'Phone must be exactly 10 digits' 
            : 'El teléfono debe tener exactamente 10 dígitos';
        }
        // 🆕 Validar teléfono esté validado
        if (!phoneValidation.isValidated) {
          newErrors.phone = ingles 
            ? 'Please wait for phone validation to complete' 
            : 'Espere a que se complete la validación del teléfono';
        } else if (phoneValidation.validationResult && !phoneValidation.validationResult.canProceed) {
          newErrors.phone = phoneValidation.validationResult.message;
        }
        break;

      case 2:
        // 🔥 STEP 2: Universidad + Rol Académico + Matrícula + Credencial + CREACIÓN EN BD
        if (!academicData.university) {
          newErrors.university = t.step1.error;
        }
        if (!academicData.role) {
          newErrors.role = t.step2.error;
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
    // Validar que customer_id sea numérico
    if (!customerId || typeof customerId !== 'number') {
      throw new Error('customer_id debe ser numérico. Recibido: ' + typeof customerId);
    }

    try {
      // Convertir archivo a base64
      const base64File = await fileToBase64(file);

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

      // Enviar al webhook
      const response = await fetch('https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_upload_credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // Leer el texto de respuesta primero
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText || 'Error desconocido del servidor'}`);
      }

      // Intentar parsear como JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('El servidor no respondió con un JSON válido. Por favor contacte al administrador.');
      }

      return result;

    } catch (error) {
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
     
      
      // Obtener la categoría correspondiente según el rol
      const customerCategoryFk = getCustomerCategoryFk(academicData.role, academicData.isPaquete11);
   

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
    

        // 🔥 VALIDACIÓN CRÍTICA: Si el status NO es "Lead", NO permitir continuar
        if (existingCustomer.status !== 'Lead') {
   
          
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

        customerId = existingCustomer.customer_id;
        isNewCustomer = false;

        // 🔥 Preparar metadata JSONB con matrícula
        const metadata = {
          matricula: academicData.studentId
        };

        const { error: updateError } = await supabase
          .from('customer')
          .update({
            first_name: academicData.firstName,
            last_name: academicData.lastName,
            mobile_phone: academicData.phone,
            customer_category_fk: customerCategoryFk,
            metadata: metadata, // 🔥 NUEVO: Guardar matrícula en metadata JSONB
            status: 'Lead'
          })
          .eq('customer_id', customerId);

        if (updateError) {
          console.warn('⚠️ Error updating customer:', updateError.message);
        } else {
          console.log('✅ Customer updated successfully with metadata:', metadata);
        }
      } else {
        // Cliente no existe, crear nuevo
        
        // 🔥 Preparar metadata JSONB con matrícula
        const metadata = {
          matricula: academicData.studentId
        };

        const { data: newCustomer, error: insertError } = await supabase
          .from('customer')
          .insert({
            first_name: academicData.firstName,
            last_name: academicData.lastName,
            email: academicData.email,
            mobile_phone: academicData.phone,
            customer_category_fk: customerCategoryFk,
            metadata: metadata, // 🔥 NUEVO: Guardar matrícula en metadata JSONB
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
    
      }

      // 🔥 PASO 2: Subir credencial usando el customer_id numérico
   
      
      if (selectedFile) {
        try {
          await uploadCredential(customerId, selectedFile);
      
        } catch (uploadError) {
     
          
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
 

      // 3. Guardar leadData y leadId
      setLeadId(customerId);
      const newLeadData = {
        name: `${academicData.firstName} ${academicData.lastName}`,
        email: academicData.email,
        phone: academicData.phone,
        customer_id: customerId
      };
      setLeadData(newLeadData);


      
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

    // 🔥 Si estamos en el paso 2 (rol + matrícula + credencial), crear customer en BD
    if (currentStep === 2) {
      await handleCreateCustomer();
    } else {
      // Para los demás pasos, avanzar normalmente
      if (currentStep < 3) { // 🔥 AHORA SOLO 3 PASOS
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Si venimos del step 3 (pago), volver al step 2
      // Limpiar leadData para permitir edición
      if (currentStep === 3) { // 🔥 AHORA ES STEP 3 (antes Step 4)
        setLeadData(null);
        setLeadId(null);
        
        // Notificar al padre para que también limpie su estado
        if (onComplete) {
          onComplete({
            leadData: null,
            leadId: null
          });
        }
    
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

  // 🆕 NUEVO: Validación automática de teléfono
  const validatePhone = async (phone) => {
    if (!phone || phone.length !== 10) {
      return;
    }


    
    setPhoneValidation({
      isValidating: true,
      isValidated: false,
      validationResult: null,
      error: null
    });

    try {
      const response = await fetch(
        'https://u-n8n.virtalus.cbluna-dev.com/webhook/congreso_nacional_search_phone',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone,
            event_id: 1,
            email: academicData.email
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
   

      const result = Array.isArray(data) ? data[0] : data;


      let validationResult = null;

      if (result.valid === false) {
        validationResult = {
          status: 'blocked',
          message: ingles 
            ? '⚠️ This phone is already registered for the event.' 
            : '⚠️ Este teléfono ya está registrado para el evento.',
          canProceed: false
        };
      } else {
        validationResult = {
          status: 'new_customer',
          message: ingles 
            ? '✓ Phone validated successfully' 
            : '✓ Teléfono validado correctamente',
          canProceed: true
        };
      }

      setPhoneValidation({
        isValidating: false,
        isValidated: true,
        validationResult,
        error: null
      });

      // 🆕 NUEVO: Notificar al padre sobre resultado de validación
      if (onPhoneValidation) {

        onPhoneValidation(validationResult);
      }

    } catch (error) {
      console.error('❌ [Academic] Error en validación de teléfono:', error);
      
      setPhoneValidation({
        isValidating: false,
        isValidated: false,
        validationResult: null,
        error: ingles 
          ? 'Could not validate phone. Please try again.' 
          : 'No se pudo validar el teléfono. Intente nuevamente.'
      });
    }
  };

  // 🆕 NUEVO: Handler para campo de teléfono con validación
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const limitedValue = value.slice(0, 10);
    
    setAcademicData({ ...academicData, phone: limitedValue });
    
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }

    if (limitedValue.length < 10) {
      setPhoneValidation({
        isValidating: false,
        isValidated: false,
        validationResult: null,
        error: null
      });
    }

    if (limitedValue.length === 10) {
      validatePhone(limitedValue);
    }
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

  // Calcular precio actual - 🔥 PRECIO FIJO $490 PARA TODOS LOS ROLES ACADÉMICOS
  const currentPrice =
    academicData.university && academicData.role
      ? {
          finalPrice: 490,
          basePrice: 990,
          discount: 500,
          discountPercentage: 50,
          monthlyAmount: null,
          availableMSI: [],
          appliedDiscounts: ['academic_rate']
        }
      : null;

  return (
    <div className={styles.stepperContainer}>
      {/* Progress Bar - 🔥 AHORA SOLO 3 PASOS */}
      <div
        className={styles.progressBar}
        style={{ display: 'flex', flexWrap: 'nowrap' }}
      >
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            style={{ width: '33.333%' }}
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
        {/* STEP 1: Solo Datos Personales (SIN universidad, matrícula ni credencial) */}
        {currentStep === 1 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>
              {ingles ? 'Personal Data' : 'Datos Personales'}
            </h3>
            <p className={styles.stepSubtitle}>
              {ingles 
                ? 'Enter your personal information' 
                : 'Ingrese su información personal'}
            </p>

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
              
              <div className={styles.phoneInputWrapper}>
                <span className={styles.phonePrefix}>+52</span>
                <input
                  type="tel"
                  id="phone"
                  value={academicData.phone}
                  onChange={handlePhoneChange}
                  placeholder="1234567890"
                  className={`${styles.input} ${styles.phoneInput} ${errors.phone ? styles.inputError : ''} ${phoneValidation.isValidated && phoneValidation.validationResult?.canProceed ? styles.inputSuccess : ''}`}
                  maxLength={10}
                />
                
                {phoneValidation.isValidating && (
                  <span className={styles.phoneValidating}>
                    🔄 {ingles ? 'Validating...' : 'Validando...'}
                  </span>
                )}
              </div>
              
              {errors.phone && (
                <span className={styles.errorText}>{errors.phone}</span>
              )}
              
              {!errors.phone && phoneValidation.isValidated && (phoneValidation.validationResult?.status === 'redirect_barista' || phoneValidation.validationResult?.status === 'free_ticket') && (
                <span className={styles.warningText}>
                  {phoneValidation.validationResult.message}
                </span>
              )}
              
              {!errors.phone && phoneValidation.isValidated && phoneValidation.validationResult?.canProceed && (
                <span className={styles.successText}>
                  {phoneValidation.validationResult.message}
                </span>
              )}
              
              {!phoneValidation.isValidated && (
                <span className={styles.hint}>
                  {ingles 
                    ? 'Enter 10 digits (without country code)' 
                    : 'Ingrese 10 dígitos (sin código de país)'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Universidad + Rol Académico + Matrícula + Credencial */}
        {currentStep === 2 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>{t.step2.title}</h3>
            <p className={styles.stepSubtitle}>{t.step2.subtitle}</p>

            {/* 🔥 NUEVO: Universidad (primer elemento del Step 2) */}
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

            {/* Divisor visual */}
            <div style={{ 
              borderTop: '2px solid #E2E8F0', 
              margin: '2rem 0 1.5rem 0',
              paddingTop: '1.5rem'
            }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 600, 
                color: 'var(--al-blue-primary, #020266)',
                marginBottom: '1.5rem'
              }}>
                {ingles ? 'Academic Role' : 'Rol Académico'}
              </h4>
            </div>

            {/* 🔥 DROPDOWN COMPACTO: Selección de rol académico */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="role">
                {t.step2.label}{' '}
                <span className={styles.required}>*</span>
              </label>
              <select
                id="role"
                value={academicData.role}
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  console.log('🎓 ROL ACADÉMICO SELECCIONADO:', selectedRole);
                  setAcademicData({
                    ...academicData,
                    role: selectedRole,
                    isPaquete11: false,
                  });
                  console.log('📝 academicData.role actualizado a:', selectedRole);
                  if (errors.role) setErrors({ ...errors, role: '' });
                }}
                className={`${styles.select} ${
                  errors.role ? styles.inputError : ''
                }`}
              >
                <option value="">
                  {ingles ? 'Select your academic role' : 'Seleccione su rol académico'}
                </option>
                {t.step2.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <span className={styles.errorText}>{errors.role}</span>
              )}
            </div>

            {/* Divisor visual para matrícula y credencial */}
            <div style={{ 
              borderTop: '2px solid #E2E8F0', 
              margin: '2rem 0 1.5rem 0',
              paddingTop: '1.5rem'
            }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 600, 
                color: 'var(--al-blue-primary, #020266)',
                marginBottom: '1.5rem'
              }}>
                {ingles ? 'Academic Verification' : 'Verificación Académica'}
              </h4>
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
                  <span className={styles.fileName}>{selectedFile.name}</span>
                  <span className={styles.fileSize}>
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

        {/* STEP 3: Datos de pago (antes Step 4) */}
        {currentStep === 3 && (
          <div className={styles.step}>
       
            {leadData ? (
              <>
                {/* Solo StripeForm - sin tabs de métodos de pago */}
                <div className={styles.paymentSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      {(t.paymentMethods && t.paymentMethods.title) ||
                        (ingles ? 'Payment Data' : 'Datos de Pago')}
                    </h2>
                    <p className={styles.sectionSubtitle}>
                      {(t.paymentMethods && t.paymentMethods.subtitle) ||
                        (ingles ? 'Complete your card details securely' : 'Complete los datos de su tarjeta de forma segura')}
                    </p>
                  </div>
                  
                  {/* Solo StripeForm - sin selector de métodos */}
                  <div className={styles.paymentFormCard}>
                    <StripeForm
                      leadId={leadId}
                      leadData={leadData}
                      academicPriceData={currentPrice}
                      isAcademic={true}
                      academicRole={academicData.role}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.hint}>
                {ingles
                  ? 'Please complete your personal data first'
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

        {/* El botón "Continuar" se oculta en el Step 3 (método de pago) */}
        {currentStep < 3 && (
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