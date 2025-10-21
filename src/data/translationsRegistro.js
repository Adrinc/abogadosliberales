// translationsRegistro.js - Traducciones para la página de registro del congreso

export const translationsRegistro = {
  es: {
    // Header/Hero
    hero: {
      breadcrumb: {
        home: "Inicio",
        current: "Registro al Congreso"
      },
      title: "Registro al Congreso Nacional 2025",
      subtitle: "Complete su registro y asegure su lugar en el evento jurídico del año. Elija su método de pago preferido: <strong>PayPal</strong>, <strong>tarjeta de crédito</strong> o <strong>transferencia bancaria</strong>."
    },

    // Toggle Académico
    academicToggle: {
      title: "¿Perteneces a una institución educativa?",
      subtitle: "Obtén descuentos exclusivos de UNAM, UVM o UAM",
      activeMessage: "Accede a precios académicos especiales. Complete los datos adicionales a continuación."
    },

    // Stepper Académico (4 pasos)
    academicStepper: {
      title: "Verificación académica",
      subtitle: "Complete los siguientes pasos para acceder a precios especiales",
      
      // Paso 1: Universidad
      step1: {
        title: "Universidad",
        subtitle: "Seleccione su institución educativa",
        label: "Institución educativa",
        placeholder: "Seleccione universidad",
        required: true,
        error: "Seleccione su universidad",
        options: [
          { value: "UNAM", label: "UNAM - Universidad Nacional Autónoma de México" },
          { value: "UVM", label: "UVM - Universidad del Valle de México" },
          { value: "UAM", label: "UAM - Universidad Autónoma Metropolitana" }
        ]
      },

      // Paso 2: Rol académico
      step2: {
        title: "Rol académico",
        subtitle: "Indique su posición en la institución",
        label: "¿Cuál es su rol?",
        required: true,
        error: "Seleccione su rol académico",
        options: [
          { 
            value: "profesor", 
            label: "Profesor / Docente",
            description: "Personal académico de tiempo completo o por asignatura",
            price: "$1,691.50 MXN",
            discount: "15% descuento"
          },
          { 
            value: "posgrado", 
            label: "Estudiante de Posgrado",
            description: "Maestría, Doctorado o Especialidad",
            price: "$1,691.50 MXN",
            discount: "15% descuento"
          },
          { 
            value: "licenciatura", 
            label: "Estudiante de Licenciatura",
            description: "Estudiante activo de pregrado",
            price: "$995 MXN",
            discount: "50% descuento"
          }
        ],
        paquete11: {
          label: "Paquete 11 Participantes",
          description: "Solo para profesores y posgrado. Compra grupal.",
          price: "$16,915 MXN",
          discount: "22.7% descuento vs precio lista",
          hint: "Esta opción genera una compra para 11 participantes"
        }
      },

      // Paso 3: Verificación
      step3: {
        title: "Verificación de identidad",
        subtitle: "Documente su afiliación académica",
        
        documentType: {
          label: "Tipo de identificación",
          placeholder: "Seleccione tipo",
          required: true,
          error: "Seleccione el tipo de documento",
          options: [
            { value: "credencial_escolar", label: "Credencial escolar vigente" },
            { value: "ine", label: "INE / IFE" },
            { value: "curp", label: "CURP" },
            { value: "otro", label: "Otro documento oficial" }
          ]
        },

        documentNumber: {
          label: "Número de documento",
          placeholder: "Ingrese el número",
          required: true,
          error: "Ingrese el número de documento"
        },

        studentId: {
          label: "Matrícula o Número de empleado",
          placeholder: "Ej: 318123456 (UNAM) o 123456 (UVM)",
          required: true,
          error: "Ingrese su matrícula o número de empleado",
          hint: "Requerido para estudiantes y profesores"
        },

        proofFile: {
          label: "Comprobante académico (opcional pero recomendado)",
          hint: "Suba su credencial escolar, constancia de estudios o nombramiento. PDF, JPG o PNG hasta 5 MB.",
          buttonText: "Seleccionar archivo",
          selectedText: "Archivo seleccionado:",
          errorSize: "El archivo no debe exceder 5 MB",
          errorType: "Solo se permiten archivos PDF, JPG o PNG",
          dragText: "Arrastre su archivo aquí o haga clic para seleccionar"
        }
      },

      // Paso 4: Plan de pago
      step4: {
        title: "Plan de pago",
        subtitle: "Elija cómo desea pagar",
        
        single: {
          label: "Pago único",
          description: "Pague el total ahora",
          badge: "Recomendado"
        },

        msi: {
          label: "Meses Sin Intereses (MSI)",
          description: "Divida su pago en mensualidades",
          options: {
            3: "3 MSI",
            6: "6 MSI",
            12: "12 MSI"
          },
          hint: "Disponibilidad según rol académico"
        },

        summary: {
          total: "Total a pagar:",
          monthly: "Pago mensual:",
          discount: "Descuento aplicado:",
          savings: "Ahorras:"
        }
      },

      // Navegación
      navigation: {
        next: "Continuar",
        previous: "Atrás",
        finish: "Finalizar verificación",
        skip: "Omitir (no recomendado)"
      },

      // Mensajes de estado
      messages: {
        completing: "Verificando datos...",
        success: "¡Verificación completada! Puede continuar con el pago.",
        error: "Error al verificar. Por favor revise los datos.",
        incomplete: "Complete todos los campos obligatorios",
        fileUploading: "Subiendo archivo...",
        fileUploaded: "Archivo subido correctamente"
      }
    },

    // Formulario de Lead (común a todos los métodos)
    leadForm: {
      title: "Información del participante",
      subtitle: "Datos personales y profesionales",
      
      firstName: {
        label: "Nombre(s)",
        placeholder: "Juan",
        required: true,
        error: "El nombre es obligatorio"
      },
      lastName: {
        label: "Apellido(s)",
        placeholder: "Pérez González",
        required: true,
        error: "Los apellidos son obligatorios"
      },
      email: {
        label: "Correo electrónico",
        placeholder: "ejemplo@correo.com",
        required: true,
        error: "Ingrese un correo electrónico válido"
      },
      mobilePhone: {
        label: "Teléfono / WhatsApp",
        placeholder: "+52 123 456 7890",
        required: true,
        error: "El teléfono es obligatorio",
        hint: "Incluya código de país"
      },
      documentType: {
        label: "Tipo de documento",
        placeholder: "Seleccione",
        required: true,
        options: [
          { value: "INE", label: "INE / IFE" },
          { value: "CURP", label: "CURP" },
          { value: "Pasaporte", label: "Pasaporte" },
          { value: "RFC", label: "RFC" },
          { value: "Otro", label: "Otro" }
        ],
        error: "Seleccione un tipo de documento"
      },
      documentNumber: {
        label: "Número de documento",
        placeholder: "ABC123456XYZ",
        required: true,
        error: "El número de documento es obligatorio"
      },
      company: {
        label: "Organización / Despacho",
        placeholder: "Ej. Suprema Corte, Despacho Legal XYZ",
        required: false,
        hint: "Opcional"
      },
      jobTitle: {
        label: "Cargo / Posición",
        placeholder: "Ej. Abogado, Magistrado, Fiscal",
        required: false,
        hint: "Opcional"
      },
      coupon: {
        label: "Cupón de descuento",
        placeholder: "Ingrese código (opcional)",
        required: false,
        hint: "Si cuenta con un cupón grupal o institucional"
      },
      
      saveButton: "Continuar al pago",
      savingButton: "Guardando..."
    },

    // Selector de métodos de pago
    paymentMethods: {
      title: "Método de pago",
      subtitle: "Seleccione cómo desea realizar su pago",
      
      tabs: {
        paypal: "PayPal",
        creditCard: "Tarjeta de Crédito/Débito",
        bankTransfer: "Transferencia Bancaria"
      }
    },

    // Método 1: PayPal
    paypal: {
      title: "Pago seguro con PayPal",
      description: "Procesamiento instantáneo. Recibirá su confirmación y código QR por email inmediatamente.",
      amount: "$1,990 MXN",
      instructions: "Haga clic en el botón de PayPal para completar su pago de forma segura.",
      processing: "Procesando pago...",
      success: "¡Pago exitoso! Redirigiendo...",
      error: "Error al procesar el pago. Intente nuevamente."
    },

    // Método 2: IPPAY (Tarjeta)
    creditCard: {
      title: "Pago con tarjeta de crédito o débito",
      description: "Procesamiento instantáneo y seguro. Aceptamos Visa, Mastercard y American Express.",
      amount: "$1,990 MXN",
      
      cardNumber: {
        label: "Número de tarjeta",
        placeholder: "1234 5678 9012 3456",
        error: "Número de tarjeta inválido"
      },
      cardholderName: {
        label: "Nombre del titular",
        placeholder: "Como aparece en la tarjeta",
        error: "El nombre del titular es obligatorio"
      },
      expiryDate: {
        label: "Fecha de expiración",
        placeholder: "MM/AA",
        error: "Fecha inválida"
      },
      cvv: {
        label: "CVV",
        placeholder: "123",
        error: "CVV inválido",
        hint: "3-4 dígitos en el reverso"
      },
      
      submitButton: "Pagar $1,990 MXN",
      processing: "Procesando pago seguro...",
      success: "¡Pago exitoso! Redirigiendo...",
      error: "Error al procesar el pago. Verifique los datos."
    },

    // Método 3: Comprobante de pago
    bankTransfer: {
      title: "Transferencia o depósito bancario",
      description: "Realice su pago y suba el comprobante. Su registro será validado en 24-48 horas hábiles.",
      amount: "$1,990 MXN",
      
      bankDetails: {
        title: "Datos bancarios",
        bank: "INBURSA",
        clabe: "036180500731081928",
        beneficiary: "BARRA MEXICANA DE CIENCIAS JURIDICAS Y PROFESIONALES LIBERALES DEL DERECHO A.C.",
        reference: "CONGRESO2025",
        copyButton: "Copiar CLABE",
        copied: "¡Copiado!"
      },
      
      uploadSection: {
        title: "Subir comprobante de pago",
        fileLabel: "Archivo del comprobante",
        fileButton: "Seleccionar archivo",
        fileHint: "Formatos aceptados: PDF, JPG, PNG (máx. 5MB)",
        noFile: "Ningún archivo seleccionado",
        fileError: "El comprobante es obligatorio",
        
        referenceNumber: {
          label: "Número de referencia / Folio",
          placeholder: "Ej. 123456789",
          required: true,
          error: "El número de referencia es obligatorio",
          hint: "Aparece en su comprobante bancario"
        },
        
        previewTitle: "Vista previa del comprobante"
      },
      
      submitButton: "Enviar comprobante",
      submitting: "Subiendo comprobante...",
      success: "¡Comprobante recibido! Validaremos su pago en breve.",
      error: "Error al subir el comprobante. Intente nuevamente."
    },

    // Formulario (legacy - mantener por compatibilidad)
    form: {
      title: "Datos de registro",
      personalData: "Información personal",
      professionalData: "Información profesional",
      paymentData: "Confirmación de pago",

      // Campos
      fullName: {
        label: "Nombre completo",
        placeholder: "Ingrese su nombre completo",
        required: true,
        error: "El nombre completo es obligatorio"
      },
      email: {
        label: "Correo electrónico",
        placeholder: "ejemplo@correo.com",
        required: true,
        error: "Ingrese un correo electrónico válido"
      },
      whatsapp: {
        label: "WhatsApp",
        placeholder: "1234567890",
        required: false,
        hint: "Opcional - Para comunicación directa"
      },
      position: {
        label: "Cargo",
        placeholder: "Ej. Abogado, Magistrado, Fiscal",
        required: false
      },
      specialization: {
        label: "Materia de especialización",
        placeholder: "Materia de especialización",
        required: false,
        hint: "Ej. Amparo, Derechos Humanos, Civil"
      },
      coupon: {
        label: "Cupón de descuento",
        placeholder: "Ingrese el código de su cupón",
        required: false,
        hint: "Opcional - Descuentos grupales disponibles"
      },
      paymentProof: {
        label: "Comprobante de pago (.pdf, .jpg y .png)",
        button: "Seleccionar archivo",
        noFile: "Ningún archivo seleccionado",
        required: true,
        error: "El comprobante de pago es obligatorio",
        hint: "Suba su comprobante de transferencia bancaria"
      },

      // Botones
      submit: "ENVIAR REGISTRO",
      submitting: "Enviando...",
      reset: "Limpiar formulario"
    },

    // Resumen (sidebar)
    summary: {
      title: "Resumen de inscripción",
      eventName: "Congreso Nacional de Litigio Estratégico en Amparo",
      price: {
        label: "Precio",
        amount: "$1,990 MXN",
        note: "Pago único"
      },
      dates: {
        label: "Fechas",
        value: "14–15 de noviembre de 2025"
      },
      venue: {
        label: "Sede",
        value: "Teatro Legaria (IMSS)",
        location: "Ciudad de México"
      },
      schedule: {
        label: "Horario",
        value: "09:00 – 18:00 hrs (ambos días)"
      },
      benefits: {
        title: "Tu inscripción incluye",
        items: [
          "Acceso completo a las 2 jornadas del congreso",
          "Material didáctico digital (memorias del congreso)",
          "Coffee breaks",
          "Networking con ponentes y asistentes",
          "Acceso a grupo exclusivo de seguimiento post-congreso"
        ]
      }
    },

    // Mensajes de validación
    validation: {
      required: "Este campo es obligatorio",
      invalidEmail: "Correo electrónico no válido",
      invalidPhone: "Número de teléfono no válido",
      fileTooLarge: "El archivo es demasiado grande (máximo 5MB)",
      invalidFileType: "Tipo de archivo no válido. Use PDF, JPG o PNG"
    },

    // Mensajes de éxito/error
    messages: {
      success: {
        title: "¡Registro enviado exitosamente!",
        message: "Hemos recibido tu solicitud de inscripción. Te enviaremos un correo de confirmación en las próximas 24 horas.",
        action: "Volver al inicio"
      },
      error: {
        title: "Error al enviar el registro",
        message: "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente o contáctanos directamente.",
        action: "Intentar nuevamente"
      }
    },

    // Footer
    footer: {
      note: "Los campos con * son obligatorios",
      contact: "¿Necesitas ayuda? Contáctanos:",
      email: "secretariageneral@abogadosliberales.mx",
      whatsapp: "+52 55 1234 5678"
    }
  },

  en: {
    // Header/Hero
    hero: {
      breadcrumb: {
        home: "Home",
        current: "Congress Registration"
      },
      title: "National Congress Registration 2025",
      subtitle: "Complete your registration and secure your place at the legal event of the year. Choose your preferred payment method: <strong>PayPal</strong>, <strong>credit card</strong>, or <strong>bank transfer</strong>."
    },

    // Academic Toggle
    academicToggle: {
      title: "Do you belong to an educational institution?",
      subtitle: "Get exclusive discounts from UNAM, UVM or UAM",
      activeMessage: "Access special academic pricing. Complete the additional information below."
    },

    // Academic Stepper (4 steps)
    academicStepper: {
      title: "Academic verification",
      subtitle: "Complete the following steps to access special pricing",
      
      // Step 1: University
      step1: {
        title: "University",
        subtitle: "Select your educational institution",
        label: "Educational institution",
        placeholder: "Select university",
        required: true,
        error: "Select your university",
        options: [
          { value: "UNAM", label: "UNAM - National Autonomous University of Mexico" },
          { value: "UVM", label: "UVM - University of Valle de México" },
          { value: "UAM", label: "UAM - Metropolitan Autonomous University" }
        ]
      },

      // Step 2: Academic role
      step2: {
        title: "Academic role",
        subtitle: "Indicate your position at the institution",
        label: "What is your role?",
        required: true,
        error: "Select your academic role",
        options: [
          { 
            value: "profesor", 
            label: "Professor / Faculty",
            description: "Full-time or adjunct academic staff",
            price: "$1,691.50 MXN",
            discount: "15% discount"
          },
          { 
            value: "posgrado", 
            label: "Graduate Student",
            description: "Master's, PhD or Specialty",
            price: "$1,691.50 MXN",
            discount: "15% discount"
          },
          { 
            value: "licenciatura", 
            label: "Undergraduate Student",
            description: "Active undergraduate student",
            price: "$995 MXN",
            discount: "50% discount"
          }
        ],
        paquete11: {
          label: "11 Participants Package",
          description: "For professors and graduate students only. Group purchase.",
          price: "$16,915 MXN",
          discount: "22.7% discount vs list price",
          hint: "This option generates a purchase for 11 participants"
        }
      },

      // Step 3: Verification
      step3: {
        title: "Identity verification",
        subtitle: "Document your academic affiliation",
        
        documentType: {
          label: "Type of identification",
          placeholder: "Select type",
          required: true,
          error: "Select document type",
          options: [
            { value: "credencial_escolar", label: "Valid student ID" },
            { value: "ine", label: "INE / IFE" },
            { value: "curp", label: "CURP" },
            { value: "otro", label: "Other official document" }
          ]
        },

        documentNumber: {
          label: "Document number",
          placeholder: "Enter number",
          required: true,
          error: "Enter document number"
        },

        studentId: {
          label: "Student ID or Employee number",
          placeholder: "E.g: 318123456 (UNAM) or 123456 (UVM)",
          required: true,
          error: "Enter your student ID or employee number",
          hint: "Required for students and professors"
        },

        proofFile: {
          label: "Academic proof (optional but recommended)",
          hint: "Upload your student ID, enrollment certificate or appointment. PDF, JPG or PNG up to 5 MB.",
          buttonText: "Select file",
          selectedText: "Selected file:",
          errorSize: "File must not exceed 5 MB",
          errorType: "Only PDF, JPG or PNG files allowed",
          dragText: "Drag your file here or click to select"
        }
      },

      // Step 4: Payment plan
      step4: {
        title: "Payment plan",
        subtitle: "Choose how you want to pay",
        
        single: {
          label: "Single payment",
          description: "Pay the total now",
          badge: "Recommended"
        },

        msi: {
          label: "Interest-Free Months (MSI)",
          description: "Split your payment into installments",
          options: {
            3: "3 MSI",
            6: "6 MSI",
            12: "12 MSI"
          },
          hint: "Availability depends on academic role"
        },

        summary: {
          total: "Total to pay:",
          monthly: "Monthly payment:",
          discount: "Discount applied:",
          savings: "You save:"
        }
      },

      // Navigation
      navigation: {
        next: "Continue",
        previous: "Back",
        finish: "Finish verification",
        skip: "Skip (not recommended)"
      },

      // Status messages
      messages: {
        completing: "Verifying data...",
        success: "Verification completed! You can continue with payment.",
        error: "Verification error. Please check the data.",
        incomplete: "Complete all required fields",
        fileUploading: "Uploading file...",
        fileUploaded: "File uploaded successfully"
      }
    },

    // Header
    pageTitle: "Congress Registration",
    pageSubtitle: "Complete the following form to confirm your participation",
    backToHome: "← Back to home",

    // Form
    form: {
      title: "Registration data",
      personalData: "Personal information",
      professionalData: "Professional information",
      paymentData: "Payment confirmation",

      // Fields
      fullName: {
        label: "Full name",
        placeholder: "Enter your full name",
        required: true,
        error: "Full name is required"
      },
      email: {
        label: "Email address",
        placeholder: "example@email.com",
        required: true,
        error: "Enter a valid email address"
      },
      whatsapp: {
        label: "WhatsApp",
        placeholder: "1234567890",
        required: false,
        hint: "Optional - For direct communication"
      },
      position: {
        label: "Position",
        placeholder: "E.g. Lawyer, Magistrate, Prosecutor",
        required: false
      },
      specialization: {
        label: "Area of specialization",
        placeholder: "Area of specialization",
        required: false,
        hint: "E.g. Amparo, Human Rights, Civil"
      },
      coupon: {
        label: "Discount coupon",
        placeholder: "Enter your coupon code",
        required: false,
        hint: "Optional - Group discounts available"
      },
      paymentProof: {
        label: "Payment receipt (.pdf, .jpg and .png)",
        button: "Select file",
        noFile: "No file selected",
        required: true,
        error: "Payment receipt is required",
        hint: "Upload your bank transfer receipt"
      },

      // Buttons
      submit: "SUBMIT REGISTRATION",
      submitting: "Submitting...",
      reset: "Clear form"
    },

    // Summary (sidebar)
    summary: {
      title: "Registration summary",
      eventName: "National Congress on Strategic Amparo Litigation",
      price: {
        label: "Price",
        amount: "$1,990 MXN",
        note: "Single payment - Includes certificate"
      },
      dates: {
        label: "Dates",
        value: "November 14–15, 2025"
      },
      venue: {
        label: "Venue",
        value: "Teatro Legaria (IMSS)",
        location: "Mexico City"
      },
      schedule: {
        label: "Schedule",
        value: "09:00 AM – 06:00 PM (both days)"
      },
      benefits: {
        title: "Your registration includes",
        items: [
          "Access to all conferences and workshops",
          "Official participation certificate",
          "Digital educational materials",
          "Coffee break",
          "Networking with magistrates and litigators",
          "Access to event recordings"
        ]
      }
    },

    // Validation messages
    validation: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      invalidPhone: "Invalid phone number",
      fileTooLarge: "File is too large (maximum 5MB)",
      invalidFileType: "Invalid file type. Use PDF, JPG or PNG"
    },

    // Success/error messages
    messages: {
      success: {
        title: "Registration submitted successfully!",
        message: "We have received your registration request. We will send you a confirmation email within 24 hours.",
        action: "Back to home"
      },
      error: {
        title: "Error submitting registration",
        message: "An error occurred while processing your request. Please try again or contact us directly.",
        action: "Try again"
      }
    },

    // Footer
    footer: {
      note: "Fields with * are required",
      contact: "Need help? Contact us:",
      email: "secretariageneral@abogadosliberales.mx",
      whatsapp: "+52 55 1234 5678"
    }
  },

  // ============================================
  // ENGLISH TRANSLATIONS
  // ============================================
  en: {
    // Header/Hero
    hero: {
      breadcrumb: {
        home: "Home",
        current: "Congress Registration"
      },
      title: "National Congress Registration 2025",
      subtitle: "Complete your registration and secure your place at the legal event of the year. Choose your preferred payment method: <strong>PayPal</strong>, <strong>credit card</strong>, or <strong>bank transfer</strong>."
    },

    // Lead Form (common to all methods)
    leadForm: {
      title: "Participant information",
      subtitle: "Personal and professional data",
      
      firstName: {
        label: "First Name(s)",
        placeholder: "John",
        required: true,
        error: "First name is required"
      },
      lastName: {
        label: "Last Name(s)",
        placeholder: "Doe Smith",
        required: true,
        error: "Last name is required"
      },
      email: {
        label: "Email address",
        placeholder: "example@email.com",
        required: true,
        error: "Please enter a valid email address"
      },
      mobilePhone: {
        label: "Phone / WhatsApp",
        placeholder: "+52 123 456 7890",
        required: true,
        error: "Phone number is required",
        hint: "Include country code"
      },
      documentType: {
        label: "Document type",
        placeholder: "Select",
        required: true,
        options: [
          { value: "INE", label: "INE / IFE" },
          { value: "CURP", label: "CURP" },
          { value: "Pasaporte", label: "Passport" },
          { value: "RFC", label: "RFC" },
          { value: "Otro", label: "Other" }
        ],
        error: "Please select a document type"
      },
      documentNumber: {
        label: "Document number",
        placeholder: "ABC123456XYZ",
        required: true,
        error: "Document number is required"
      },
      company: {
        label: "Organization / Firm",
        placeholder: "E.g. Supreme Court, XYZ Legal Firm",
        required: false,
        hint: "Optional"
      },
      jobTitle: {
        label: "Position / Title",
        placeholder: "E.g. Attorney, Judge, Prosecutor",
        required: false,
        hint: "Optional"
      },
      coupon: {
        label: "Discount coupon",
        placeholder: "Enter code (optional)",
        required: false,
        hint: "If you have a group or institutional coupon"
      },
      
      saveButton: "Continue to payment",
      savingButton: "Saving..."
    },

    // Payment method selector
    paymentMethods: {
      title: "Payment method",
      subtitle: "Select how you want to make your payment",
      
      tabs: {
        paypal: "PayPal",
        creditCard: "Credit/Debit Card",
        bankTransfer: "Bank Transfer"
      }
    },

    // Method 1: PayPal
    paypal: {
      title: "Secure payment with PayPal",
      description: "Instant processing. You will receive your confirmation and QR code by email immediately.",
      amount: "$1,990 MXN",
      instructions: "Click the PayPal button to complete your payment securely.",
      processing: "Processing payment...",
      success: "Payment successful! Redirecting...",
      error: "Error processing payment. Please try again."
    },

    // Method 2: IPPAY (Credit Card)
    creditCard: {
      title: "Pay with credit or debit card",
      description: "Instant and secure processing. We accept Visa, Mastercard, and American Express.",
      amount: "$1,990 MXN",
      
      cardNumber: {
        label: "Card number",
        placeholder: "1234 5678 9012 3456",
        error: "Invalid card number"
      },
      cardholderName: {
        label: "Cardholder name",
        placeholder: "As it appears on the card",
        error: "Cardholder name is required"
      },
      expiryDate: {
        label: "Expiration date",
        placeholder: "MM/YY",
        error: "Invalid date"
      },
      cvv: {
        label: "CVV",
        placeholder: "123",
        error: "Invalid CVV",
        hint: "3-4 digits on the back"
      },
      
      submitButton: "Pay $1,990 MXN",
      processing: "Processing secure payment...",
      success: "Payment successful! Redirecting...",
      error: "Error processing payment. Please check the details."
    },

    // Method 3: Bank Transfer
    bankTransfer: {
      title: "Bank transfer or deposit",
      description: "Make your payment and upload the receipt. Your registration will be validated within 24-48 business hours.",
      amount: "$1,990 MXN",
      
      bankDetails: {
        title: "Bank details",
        bank: "INBURSA",
        clabe: "036180500731081928",
        beneficiary: "BARRA MEXICANA DE CIENCIAS JURIDICAS Y PROFESIONALES LIBERALES DEL DERECHO A.C.",
        reference: "CONGRESO2025",
        copyButton: "Copy CLABE",
        copied: "Copied!"
      },
      
      uploadSection: {
        title: "Upload payment receipt",
        fileLabel: "Receipt file",
        fileButton: "Select file",
        fileHint: "Accepted formats: PDF, JPG, PNG (max. 5MB)",
        noFile: "No file selected",
        fileError: "Receipt is required",
        
        referenceNumber: {
          label: "Reference / Folio number",
          placeholder: "E.g. 123456789",
          required: true,
          error: "Reference number is required",
          hint: "Appears on your bank receipt"
        },
        
        previewTitle: "Receipt preview"
      },
      
      submitButton: "Submit receipt",
      submitting: "Uploading receipt...",
      success: "Receipt received! We will validate your payment shortly.",
      error: "Error uploading receipt. Please try again."
    },

    // Legacy form (for compatibility)
    form: {
      title: "Registration data",
      personalData: "Personal information",
      professionalData: "Professional information",
      paymentData: "Payment confirmation"
    },

    // Summary (sidebar)
    summary: {
      title: "Registration summary",
      eventName: "National Congress on Strategic Amparo Litigation",
      price: {
        label: "Price",
        amount: "$1,990 MXN",
        note: "Single payment - Certificate included"
      },
      dates: {
        label: "Dates",
        value: "November 14–15, 2025"
      },
      venue: {
        label: "Venue",
        value: "Teatro Legaria (IMSS)",
        location: "Mexico City"
      },
      schedule: {
        label: "Schedule",
        value: "09:00 AM – 06:00 PM (both days)"
      },
      benefits: {
        title: "Your registration includes",
        items: [
          "Complete access to both congress days",
          "Digital educational materials (congress proceedings)",
          "Coffee breaks",
          "Networking with speakers and attendees",
          "Access to exclusive post-congress follow-up group"
        ]
      }
    },

    // Validation messages
    validation: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      invalidPhone: "Invalid phone number",
      fileTooLarge: "File is too large (maximum 5MB)",
      invalidFileType: "Invalid file type. Use PDF, JPG or PNG"
    },

    // Success/error messages
    messages: {
      success: {
        title: "Registration submitted successfully!",
        message: "We have received your registration request. We will send you a confirmation email within 24 hours.",
        action: "Back to home"
      },
      error: {
        title: "Error submitting registration",
        message: "An error occurred while processing your request. Please try again or contact us directly.",
        action: "Try again"
      }
    },

    // Footer
    footer: {
      note: "Fields with * are required",
      contact: "Need help? Contact us:",
      email: "secretariageneral@abogadosliberales.mx",
      whatsapp: "+52 55 1234 5678"
    }
  }
};
