import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import { 
  calculateAcademicPrice, 
  getMSIOptions, 
  canAccessPaquete11,
  formatPrice 
} from '../../../lib/academicPricing';
import styles from '../css/academicStepper.module.css';

// Import additional components for personal data and payment steps. These imports
// are relative to the file structure of the project. They may need to be
// adjusted based on your actual project layout. We import FormularioLead with
// forwardRef support, and payment components for the final step.
import FormularioLead from './FormularioLead.jsx';
import PayPalIframe from '../components/PayPalIframe';
import IPPayTemporaryMessage from '../components/IPPayTemporaryMessage';
import ComprobantePagoForm from '../components/ComprobantePagoForm';

const AcademicStepper = ({ onComplete, onPriceChange }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en.academicStepper : translationsRegistro.es.academicStepper;

  // Estado del stepper
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos del lead y método de pago para los pasos 4 y 5
  const [leadData, setLeadData] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('paypal'); // 'paypal' | 'creditCard' | 'bankTransfer'

  // Referencia al formulario de datos personales (FormularioLead)
  const formRef = useRef(null);

  // Datos académicos
  const [academicData, setAcademicData] = useState({
    university: '',
    role: '',
    isPaquete11: false,
    documentType: '',
    documentNumber: '',
    studentId: '',
    proofFile: null,
    paymentPlan: 'single' // 'single' | 'msi3' | 'msi6' | 'msi12'
  });

  // Errores por paso
  const [errors, setErrors] = useState({});

  // Archivo seleccionado
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Calcular precio en tiempo real
  useEffect(() => {
    if (academicData.university && academicData.role) {
      const priceData = calculateAcademicPrice({
        isAcademic: true,
        university: academicData.university,
        role: academicData.role,
        isPaquete11: academicData.isPaquete11,
        paymentPlan: academicData.paymentPlan
      });

      // Notificar al padre del cambio de precio
      if (onPriceChange) {
        onPriceChange(priceData);
      }
    }
  }, [academicData.university, academicData.role, academicData.isPaquete11, academicData.paymentPlan]);

  // Helper para obtener la etiqueta de cada paso en la barra de progreso.
  const getStepLabel = (step) => {
    if (step === 4) {
      return ingles ? 'Datos personales' : 'Datos personales';
    }
    if (step === 5) {
      return ingles ? 'Plan de pago' : 'Plan de pago';
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
        if (!academicData.documentType) {
          newErrors.documentType = t.step3.documentType.error;
        }
        if (!academicData.documentNumber.trim()) {
          newErrors.documentNumber = t.step3.documentNumber.error;
        }
        // Matrícula obligatoria para estudiantes y posgrado
        if (
          (academicData.role === 'licenciatura' || academicData.role === 'posgrado') &&
          !academicData.studentId.trim()
        ) {
          newErrors.studentId = t.step3.studentId.error;
        }
        break;

      case 4:
        // Paso 4 corresponde a datos personales y será validado mediante el formulario
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleNext = () => {
    // Si estamos en el paso 4 (datos personales), enviamos el formulario y esperamos a que el callback de onSubmit avance al siguiente paso.
    if (currentStep === 4) {
      if (formRef.current && typeof formRef.current.submit === 'function') {
        formRef.current.submit();
      }
    } else {
      // Para los demás pasos, realizar validación y avanzar normalmente
      if (validateStep(currentStep)) {
        if (currentStep < 5) {
          setCurrentStep(currentStep + 1);
        } else {
          handleComplete();
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
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
        paymentPlan: academicData.paymentPlan
      });

      // Notificar al padre
      if (onComplete) {
        onComplete({
          ...academicData,
          priceData: finalPriceData
        });
      }

      console.log('✅ Academic verification completed:', {
        ...academicData,
        finalPrice: finalPriceData.finalPrice
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

    // Validar tipo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
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
  };

  // Callback para el formulario de datos personales. Almacena los datos del lead y avanza al paso 5.
  const handleLeadSubmit = (data, id) => {
    setLeadData(data);
    setLeadId(id);
    // Una vez guardado el lead, avanzar automáticamente al paso 5 (Plan de pago)
    setCurrentStep(5);
  };

  // Obtener opciones MSI disponibles
  const availableMSI = getMSIOptions(academicData.role, academicData.isPaquete11);

  // Calcular precio actual
  const currentPrice = academicData.university && academicData.role
    ? calculateAcademicPrice({
        isAcademic: true,
        university: academicData.university,
        role: academicData.role,
        isPaquete11: academicData.isPaquete11,
        paymentPlan: academicData.paymentPlan
      })
    : null;

  return (
    <div className={styles.stepperContainer}>
      
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
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
                {t.step1.label} <span className={styles.required}>*</span>
              </label>
              <select
                id="university"
                value={academicData.university}
                onChange={(e) => {
                  setAcademicData({ ...academicData, university: e.target.value });
                  if (errors.university) setErrors({ ...errors, university: '' });
                }}
                className={`${styles.select} ${errors.university ? styles.inputError : ''}`}
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
                        isPaquete11: false 
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

              {/* Paquete 11 (solo para profesor y posgrado) */}
              {canAccessPaquete11(academicData.role) && (
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
                      setAcademicData({ ...academicData, isPaquete11: !academicData.isPaquete11 });
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
              )}
            </div>

            {errors.role && (
              <span className={styles.errorText}>{errors.role}</span>
            )}
          </div>
        )}

        {/* STEP 3: Verificación */}
        {currentStep === 3 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>{t.step3.title}</h3>
            <p className={styles.stepSubtitle}>{t.step3.subtitle}</p>

            {/* Tipo de documento */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="documentType">
                {t.step3.documentType.label} <span className={styles.required}>*</span>
              </label>
              <select
                id="documentType"
                value={academicData.documentType}
                onChange={(e) => {
                  setAcademicData({ ...academicData, documentType: e.target.value });
                  if (errors.documentType) setErrors({ ...errors, documentType: '' });
                }}
                className={`${styles.select} ${errors.documentType ? styles.inputError : ''}`}
              >
                <option value="">{t.step3.documentType.placeholder}</option>
                {t.step3.documentType.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.documentType && (
                <span className={styles.errorText}>{errors.documentType}</span>
              )}
            </div>

            {/* Número de documento */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="documentNumber">
                {t.step3.documentNumber.label} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="documentNumber"
                value={academicData.documentNumber}
                onChange={(e) => {
                  setAcademicData({ ...academicData, documentNumber: e.target.value });
                  if (errors.documentNumber) setErrors({ ...errors, documentNumber: '' });
                }}
                placeholder={t.step3.documentNumber.placeholder}
                className={`${styles.input} ${errors.documentNumber ? styles.inputError : ''}`}
              />
              {errors.documentNumber && (
                <span className={styles.errorText}>{errors.documentNumber}</span>
              )}
            </div>

            {/* Matrícula (solo para estudiantes) */}
            {(academicData.role === 'licenciatura' || academicData.role === 'posgrado') && (
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="studentId">
                  {t.step3.studentId.label} <span className={styles.required}>*</span>
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
                <span className={styles.hint}>{t.step3.studentId.hint}</span>
              </div>
            )}

            {/* Archivo (opcional) */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="proofFile">
                {t.step3.proofFile.label}
              </label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="proofFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <label htmlFor="proofFile" className={styles.fileLabel}>
                  <svg className={styles.fileIcon} width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{selectedFile ? t.step3.proofFile.selectedText : t.step3.proofFile.buttonText}</span>
                </label>
              </div>
              {selectedFile && (
                <div className={styles.selectedFile}>
                  <span className={styles.fileName}>{selectedFile.name}</span>
                  <span className={styles.fileSize}>
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              {fileError && (
                <span className={styles.errorText}>{fileError}</span>
              )}
              <span className={styles.hint}>{t.step3.proofFile.hint}</span>
            </div>
          </div>
        )}

        {/* STEP 4: Datos personales */}
        {currentStep === 4 && (
          <div className={styles.step}>
            {/* Use translation if available; fallback to a static label */}
            <h3 className={styles.stepTitle}>
              {(t.step4 && t.step4.title) || (ingles ? 'Datos personales' : 'Datos personales')}
            </h3>
            <p className={styles.stepSubtitle}>
              {(t.step4 && t.step4.subtitle) || (ingles ? 'Por favor ingresa tus datos personales' : 'Por favor ingresa tus datos personales')}
            </p>
            {/* Formulario de datos personales */}
            <FormularioLead
              ref={formRef}
              onSubmit={handleLeadSubmit}
              isCompleted={!!leadData}
              hideSubmitButton={true}
            />
            {!leadData && (
              <p className={styles.hint}>
                {ingles ? 'Completa el formulario para continuar' : 'Completa el formulario para continuar'}
              </p>
            )}
          </div>
        )}

        {/* STEP 5: Plan de pago */}
        {currentStep === 5 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>
              {(t.step5 && t.step5.title) || (ingles ? 'Plan de pago' : 'Plan de pago')}
            </h3>
            <p className={styles.stepSubtitle}>
              {(t.step5 && t.step5.subtitle) || (ingles ? 'Selecciona tu método de pago' : 'Selecciona tu método de pago')}
            </p>
            {leadData ? (
              <>
                {/* Métodos de pago */}
                <div className={styles.paymentSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      {(t.paymentMethods && t.paymentMethods.title) || (ingles ? 'Métodos de pago' : 'Métodos de pago')}
                    </h2>
                    <p className={styles.sectionSubtitle}>
                      {(t.paymentMethods && t.paymentMethods.subtitle) || (ingles ? 'Elige cómo pagar' : 'Elige cómo pagar')}
                    </p>
                  </div>
                  <div className={styles.tabs}>
                    <button
                      className={`${styles.tab} ${selectedMethod === 'paypal' ? styles.tabActive : ''}`}
                      type="button"
                      onClick={() => setSelectedMethod('paypal')}
                    >
                      <div className={styles.tabIcon}>💳</div>
                      <span className={styles.tabLabel}>
                        {(t.paymentMethods && t.paymentMethods.tabs && t.paymentMethods.tabs.paypal) || 'PayPal'}
                      </span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                    <button
                      className={`${styles.tab} ${selectedMethod === 'creditCard' ? styles.tabActive : ''}`}
                      type="button"
                      onClick={() => setSelectedMethod('creditCard')}
                    >
                      <div className={styles.tabIcon}>💰</div>
                      <span className={styles.tabLabel}>
                        {(t.paymentMethods && t.paymentMethods.tabs && t.paymentMethods.tabs.creditCard) || 'Tarjeta'}
                      </span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                    <button
                      className={`${styles.tab} ${selectedMethod === 'bankTransfer' ? styles.tabActive : ''}`}
                      type="button"
                      onClick={() => setSelectedMethod('bankTransfer')}
                    >
                      <div className={styles.tabIcon}>🏦</div>
                      <span className={styles.tabLabel}>
                        {(t.paymentMethods && t.paymentMethods.tabs && t.paymentMethods.tabs.bankTransfer) || 'Transferencia'}
                      </span>
                      <div className={styles.tabIndicator}></div>
                    </button>
                  </div>
                  <div className={styles.paymentFormCard}>
                    {selectedMethod === 'paypal' && (
                      <PayPalIframe leadId={leadId} leadData={leadData} academicPriceData={currentPrice} isAcademic={true} />
                    )}
                    {selectedMethod === 'creditCard' && <IPPayTemporaryMessage />}
                    {selectedMethod === 'bankTransfer' && (
                      <ComprobantePagoForm
                        leadId={leadId}
                        leadData={leadData}
                        academicPriceData={currentPrice}
                        isAcademic={true}
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.hint}>
                {ingles ? 'Por favor completa tus datos personales primero' : 'Por favor completa tus datos personales primero'}
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

        <button
          type="button"
          onClick={handleNext}
          className={styles.btnPrimary}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t.messages.completing
            : currentStep === 5
            ? t.navigation.finish
            : t.navigation.next}
        </button>
      </div>
    </div>
  );
};

export default AcademicStepper;
