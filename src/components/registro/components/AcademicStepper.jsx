import React, { useState, useEffect } from 'react';
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

const AcademicStepper = ({ onComplete, onPriceChange }) => {
  const ingles = useStore(isEnglish);
  // Fallback defensivo para evitar error si la traducción no existe
  const t = (ingles && translationsRegistro.en && translationsRegistro.en.academicStepper)
    ? translationsRegistro.en.academicStepper
    : (translationsRegistro.es && translationsRegistro.es.academicStepper)
      ? translationsRegistro.es.academicStepper
      : {
          step1: {
            title: ingles ? "Step 1 missing" : "Paso 1 faltante",
            subtitle: "Translation not found.",
            label: "Translation not found.",
            placeholder: "Translation not found.",
            error: "Translation not found.",
            options: []
          }
        };

  // Estado del stepper
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Plan de pago siempre tiene valor default
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
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
        {[1, 2, 3, 4].map((step) => (
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
              {t[`step${step}`].title}
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

        {/* STEP 4: Plan de Pago */}
        {currentStep === 4 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>{t.step4.title}</h3>
            <p className={styles.stepSubtitle}>{t.step4.subtitle}</p>

            {/* Resumen de precio */}
            {currentPrice && (
              <div className={styles.priceSummary}>
                <div className={styles.priceSummaryHeader}>
                  <span className={styles.priceSummaryLabel}>{t.step4.summary.total}</span>
                  <span className={styles.priceSummaryAmount}>
                    {formatPrice(currentPrice.finalPrice)}
                  </span>
                </div>
                {currentPrice.discount > 0 && (
                  <div className={styles.priceSummaryDetail}>
                    <span>{t.step4.summary.discount}</span>
                    <span className={styles.discountAmount}>
                      -{formatPrice(currentPrice.discount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Opciones de pago */}
            <div className={styles.paymentOptions}>
              {/* Pago único */}
              <label
                className={`${styles.paymentCard} ${
                  academicData.paymentPlan === 'single' ? styles.paymentCardActive : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentPlan"
                  value="single"
                  checked={academicData.paymentPlan === 'single'}
                  onChange={(e) => setAcademicData({ ...academicData, paymentPlan: e.target.value })}
                  className={styles.paymentRadio}
                />
                <div className={styles.paymentContent}>
                  <div className={styles.paymentHeader}>
                    <span className={styles.paymentName}>{t.step4.single.label}</span>
                    <span className={styles.paymentBadge}>{t.step4.single.badge}</span>
                  </div>
                  <p className={styles.paymentDescription}>{t.step4.single.description}</p>
                  {currentPrice && (
                    <p className={styles.paymentPrice}>{formatPrice(currentPrice.finalPrice)}</p>
                  )}
                </div>
              </label>

              {/* MSI Options */}
              {availableMSI.length > 0 && (
                <>
                  <div className={styles.msiDivider}>
                    <span>{t.step4.msi.label}</span>
                  </div>

                  {availableMSI.map((msi) => (
                    <label
                      key={msi.months}
                      className={`${styles.paymentCard} ${
                        academicData.paymentPlan === `msi${msi.months}` ? styles.paymentCardActive : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentPlan"
                        value={`msi${msi.months}`}
                        checked={academicData.paymentPlan === `msi${msi.months}`}
                        onChange={(e) => setAcademicData({ ...academicData, paymentPlan: e.target.value })}
                        className={styles.paymentRadio}
                      />
                      <div className={styles.paymentContent}>
                        <div className={styles.paymentHeader}>
                          <span className={styles.paymentName}>{msi.label}</span>
                        </div>
                        <p className={styles.paymentDescription}>{msi.description}</p>
                        <p className={styles.paymentPrice}>
                          {formatPrice(msi.monthlyAmount)}/mes
                        </p>
                      </div>
                    </label>
                  ))}
                </>
              )}
            </div>
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
            : currentStep === 4
            ? t.navigation.finish
            : t.navigation.next}
        </button>
      </div>
    </div>
  );
};

export default AcademicStepper;
