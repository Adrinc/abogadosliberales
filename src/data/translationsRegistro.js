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
      subtitle: "Complete su registro y asegure su lugar en el evento jurídico del año. Pago seguro con tarjeta de crédito o débito."
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SELECTION CARDS - Sistema de 3 opciones
    // ═══════════════════════════════════════════════════════════════════════
    selectionCards: {
      mainTitle: "Seleccione su tipo de registro",
      mainSubtitle: "Elija la opción que mejor se adapte a su perfil profesional",

      // OPCIÓN 1: General
      generalBadge: "Más Popular",
      generalTitle: "Entrada General",
      generalDescription: "Acceso completo al congreso con certificado oficial de participación",

      // OPCIÓN 2: Académico
      academicBadge: "Descuento Académico",
      academicTitle: "Tarifa Académica (Con credencial vigente)",
      academicDescription: "Descuentos exclusivos UVM, UAM o UNAM",

      // OPCIÓN 3: Membresía
      membershipBadge: "Membresía Anual y Congreso",
      membershipTitle: "Membresía Anual de la Barra y Congreso (Previa Aprobación)",
      membershipDescription: "Acceso a beneficios exclusivos durante todo el año",

      // Botones
      buttonSelect: "Seleccionar",
      buttonSelected: "✓ Seleccionado"
    },

    // Toggle Académico
    academicToggle: {
      title: "¿Perteneces a una institución educativa?",
      subtitle: "Obtén descuentos exclusivos UVM, UAM o UNAM",
      activeMessage: "Accede a precios académicos especiales. Complete los datos adicionales a continuación."
    },

    // Toggle Barrista
    barristaToggle: {
      title: "¿Eres miembro de la Barra Mexicana de Abogados Liberales?",
      subtitle: "Miembros activos, inactivos, o deseas unirte",
      activeMessage: "Registro de miembro habilitado",
      disabledWarning: "No se puede combinar con descuento académico"
    },

    // Validador de Teléfono Barrista
    barristaValidator: {
      title: "Verificación de Membresía",
      subtitle: "Ingresa tu teléfono para verificar tu estado",
      placeholder: "+52 55 1234 5678",
      buttonVerify: "Verificar Teléfono",
      buttonVerifying: "Verificando...",
      formatHelp: "Usa formato internacional con código de país",
      
      // Resultados de validación
      results: {
        blocked: {
          title: "⚠️ Registro ya confirmado",
          message: "Este teléfono ya tiene un registro confirmado para el evento. Si necesitas ayuda, contacta a soporte.",
          contactEmail: "soporte@abogadosliberales.mx"
        },
        vip: {
          title: "🎉 ¡Eres invitado especial!",
          message: "Tu acceso al congreso es GRATUITO. Completa tus datos para generar tu código QR de entrada.",
          price: "$0 MXN",
          badge: "Acceso VIP"
        },
        barristaActivo: {
          title: "⚖️ Miembro de la Barra",
          message: "Eres miembro activo o inactivo. Solo pagas la anualidad del congreso.",
          price: "$3,850 MXN",
          badge: "Anualidad 2do año en adelante",
          description: "Incluye acceso al congreso + renovación de membresía"
        },
        barristaNuevo: {
          title: "🆕 ¡Bienvenido a la Barra!",
          message: "No encontramos membresía previa. Pagas inscripción + primer año.",
          price: "$3,850 MXN",
          badge: "Inscripción + 1er año",
          description: "Incluye acceso al congreso + membresía anual completa"
        }
      },

      // Errores
      errors: {
        required: "El teléfono es obligatorio",
        invalidFormat: "Formato inválido. Usa formato internacional: +52 55 1234 5678",
        serverError: "Error al conectar con el servidor. Intenta nuevamente.",
        unknownError: "Error desconocido. Por favor contacta a soporte."
      }
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
          { value: "UVM", label: "UVM - Universidad del Valle de México" },
          { value: "UAM", label: "UAM - Universidad Autónoma Metropolitana" },
          { value: "UNAM", label: "UNAM - Universidad Nacional Autónoma de México" }
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
            label: "Personal educativo",
            description: "Personal académico de tiempo completo o por asignatura",
            price: "$490 MXN",
            discount: "50% descuento"
          },
          { 
            value: "posgrado", 
            label: "Estudiante de Posgrado",
            description: "Maestría, Doctorado o Especialidad",
            price: "$490 MXN",
            discount: "50% descuento"
          },
          { 
            value: "licenciatura", 
            label: "Estudiante de Licenciatura",
            description: "Estudiante activo de pregrado",
            price: "$490 MXN",
            discount: "50% descuento"
          }
        ],
        paquete11: {
          label: "Paquete 11 Participantes",
          description: "Solo para profesores y posgrado. Compra grupal.",
          price: "$4,900 MXN",
          discount: "55% descuento vs precio lista",
          hint: "Esta opción genera una compra para 11 participantes"
        }
      },

      // Paso 3: Datos personales y verificación
      step3: {
        title: "Datos personales y verificación",
        subtitle: "Complete su información y documentación académica",
        
        firstName: {
          label: "Nombre(s)",
          placeholder: "Ingrese su(s) nombre(s)",
          required: true,
          error: "Ingrese su nombre"
        },

        lastName: {
          label: "Apellido(s)",
          placeholder: "Ingrese sus apellidos",
          required: true,
          error: "Ingrese sus apellidos"
        },

        email: {
          label: "Correo electrónico",
          placeholder: "ejemplo@correo.com",
          required: true,
          error: "Ingrese un correo válido",
          hint: "Recibirá su confirmación y QR de acceso aquí"
        },

        emailConfirm: {
          label: "Confirmar correo electrónico",
          placeholder: "Confirme su correo",
          required: true,
          error: "Los correos no coinciden",
          hint: "Asegúrese de escribir el mismo correo para evitar errores"
        },

        phone: {
          label: "Teléfono / WhatsApp",
          placeholder: "+52 55 1234 5678",
          required: true,
          error: "Ingrese su teléfono"
        },

        studentId: {
          label: "Matrícula o Número de empleado",
          placeholder: "Ej: 318123456 o EMP-12345",
          required: true,
          error: "Ingrese su matrícula o número de empleado",
          hint: "Obligatorio para validar su descuento académico"
        },

        proofFile: {
          label: "Identificación académica",
          hint: "Suba una imagen (foto) de su credencial escolar, constancia de estudios o nombramiento. Formatos aceptados: JPG, PNG, WebP, HEIC (iPhone), AVIF. Hasta 5 MB.",
          buttonText: "Seleccionar imagen",
          selectedText: "Imagen seleccionada:",
          errorSize: "La imagen no debe exceder 5 MB",
          errorType: "Solo se permiten archivos de imagen (JPG, PNG, WebP, HEIC, AVIF, BMP)",
          dragText: "Arrastre su imagen aquí o haga clic para seleccionar",
          required: true,
          error: "Debe cargar una imagen de su identificación académica"
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

    // 🚫 MÉTODO DE PAGO: Textos actualizados - Solo Stripe ahora (sin selector de métodos)
    paymentMethods: {
      title: "Datos de pago",
      subtitle: "Complete los datos de su tarjeta de forma segura",
      
      tabs: {
        // 🚫 Tabs deshabilitados - Solo mantenidos por compatibilidad
        paypal: "PayPal",
        creditCard: "Pago en línea",
        bankTransfer: "Pago por transferencia bancaria"
      }
    },

    // Método 1: PayPal
    paypal: {
      title: "Pago seguro con PayPal",
      description: "Procesamiento instantáneo. Recibirá su confirmación y código QR por email inmediatamente.",
      amount: "$990 MXN",
      instructions: "Haga clic en el botón de PayPal para completar su pago de forma segura.",
      processing: "Procesando pago...",
      success: "¡Pago exitoso! Redirigiendo...",
      error: "Error al procesar el pago. Intente nuevamente."
    },

    // Método 2: IPPAY (Tarjeta)
    creditCard: {
      title: "Pago con tarjeta de crédito o débito",
      description: "Procesamiento instantáneo y seguro. Aceptamos Visa, Mastercard y American Express.",
      amount: "$990 MXN",
      
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
      
      submitButton: "Pagar $990 MXN",
      processing: "Procesando pago seguro...",
      success: "¡Pago exitoso! Redirigiendo...",
      error: "Error al procesar el pago. Verifique los datos."
    },

    // Método 3: Comprobante de pago
    bankTransfer: {
      title: "Transferencia o depósito bancario",
      description: "Realice su pago y suba el comprobante. Su registro será validado en 24-48 horas hábiles.",
      amount: "$990 MXN",
      
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
        amount: "$990 MXN",
        note: "Pago único"
      },
      dates: {
        label: "Fechas",
        value: "22 de noviembre de 2025"
      },
      venue: {
        label: "Sede",
        value: "Teatro Legaria (IMSS)",
        location: "Ciudad de México"
      },
      schedule: {
        label: "Horario",
        value: "09:00 – 18:00 hrs"
      },
      benefits: {
        title: "Tu inscripción incluye",
        items: [
          "Acceso completo a una jornada del congreso",
          "Material didáctico digital (memorias del congreso)",
          "Networking con ponentes y asistentes",
          "Acceso a grupo exclusivo de seguimiento post-congreso"
        ],
        membership: [
          "Acceso completo a una jornada del congreso",
          "Material didáctico digital (memorias del congreso)",
          "Networking con ponentes y asistentes",
          "Acceso a grupo exclusivo de seguimiento post-congreso",
          "Precio especial por congreso"
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
      subtitle: "Complete your registration and secure your place at the legal event of the year. Secure payment with credit or debit card."
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SELECTION CARDS - 3-option system
    // ═══════════════════════════════════════════════════════════════════════
    selectionCards: {
      mainTitle: "Select your registration type",
      mainSubtitle: "Choose the option that best suits your professional profile",

      // OPTION 1: General
      generalBadge: "Most Popular",
      generalTitle: "General Entry",
      generalDescription: "Full access to congress with official participation certificate",

      // OPTION 2: Academic
      academicBadge: "Academic Discount",
      academicTitle: "Academic Rate (With valid ID)",
      academicDescription: "Exclusive discounts for UVM, UAM or UNAM",

      // OPTION 3: Membership
      membershipBadge: "Annual Membership",
      membershipTitle: "Bar Membership",
      membershipDescription: "Access to exclusive benefits throughout the year",

      // Buttons
      buttonSelect: "Select",
      buttonSelected: "✓ Selected"
    },

    // Academic Toggle
    academicToggle: {
      title: "Do you belong to an educational institution?",
      subtitle: "Get exclusive discounts from UVM, UAM or UNAM",
      activeMessage: "Access special academic pricing. Complete the additional information below."
    },

    // Barrista Toggle
    barristaToggle: {
      title: "Are you a member of the Mexican Bar of Liberal Lawyers?",
      subtitle: "Active members, inactive members, or wish to join",
      activeMessage: "Member registration enabled",
      disabledWarning: "Cannot combine with academic discount"
    },

    // Barrista Phone Validator
    barristaValidator: {
      title: "Membership Verification",
      subtitle: "Enter your phone number to verify your status",
      placeholder: "+52 55 1234 5678",
      buttonVerify: "Verify Phone",
      buttonVerifying: "Verifying...",
      formatHelp: "Use international format with country code",
      
      // Validation results
      results: {
        blocked: {
          title: "⚠️ Registration Already Confirmed",
          message: "This phone number already has a confirmed registration for the event. If you need help, contact support.",
          contactEmail: "soporte@abogadosliberales.mx"
        },
        vip: {
          title: "🎉 You're a Special Guest!",
          message: "Your access to the congress is FREE. Complete your information to generate your entry QR code.",
          price: "$0 MXN",
          badge: "VIP Access"
        },
        barristaActivo: {
          title: "⚖️ Bar Member",
          message: "You are an active or inactive member. You only pay the congress annual fee.",
          price: "$3,850 MXN",
          badge: "Annual fee 2nd year onwards",
          description: "Includes congress access + membership renewal"
        },
        barristaNuevo: {
          title: "🆕 Welcome to the Bar!",
          message: "No previous membership found. You pay registration + first year.",
          price: "$3,850 MXN",
          badge: "Registration + 1st year",
          description: "Includes congress access + full annual membership"
        }
      },

      // Errors
      errors: {
        required: "Phone number is required",
        invalidFormat: "Invalid format. Use international format: +52 55 1234 5678",
        serverError: "Error connecting to server. Please try again.",
        unknownError: "Unknown error. Please contact support."
      }
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
          { value: "UVM", label: "UVM - University of Valle de México" },
          { value: "UAM", label: "UAM - Metropolitan Autonomous University" },
          { value: "UNAM", label: "UNAM - National Autonomous University of Mexico" }
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
            label: "Educational Staff",
            description: "Full-time or adjunct academic staff",
            price: "$490 MXN",
            discount: "50% discount"
          },
          { 
            value: "posgrado", 
            label: "Graduate Student",
            description: "Master's, PhD or Specialty",
            price: "$490 MXN",
            discount: "50% discount"
          },
          { 
            value: "licenciatura", 
            label: "Undergraduate Student",
            description: "Active undergraduate student",
            price: "$490 MXN",
            discount: "50% discount"
          }
        ],
        paquete11: {
          label: "11 Participants Package",
          description: "For professors and graduate students only. Group purchase.",
          price: "$4,900 MXN",
          discount: "55% discount vs list price",
          hint: "This option generates a purchase for 11 participants"
        }
      },

      // Step 3: Personal data and verification
      step3: {
        title: "Personal data and verification",
        subtitle: "Complete your information and academic documentation",
        
        firstName: {
          label: "First name(s)",
          placeholder: "Enter your first name(s)",
          required: true,
          error: "Enter your first name"
        },

        lastName: {
          label: "Last name(s)",
          placeholder: "Enter your last name(s)",
          required: true,
          error: "Enter your last name"
        },

        email: {
          label: "Email address",
          placeholder: "example@email.com",
          required: true,
          error: "Enter a valid email",
          hint: "You will receive your confirmation and access QR here"
        },

        emailConfirm: {
          label: "Confirm email address",
          placeholder: "Confirm your email",
          required: true,
          error: "Emails do not match",
          hint: "Make sure to write the same email to avoid errors"
        },

        phone: {
          label: "Phone / WhatsApp",
          placeholder: "+52 55 1234 5678",
          required: true,
          error: "Enter your phone number"
        },

        studentId: {
          label: "Student ID or Employee number",
          placeholder: "E.g: 318123456 or EMP-12345",
          required: true,
          error: "Enter your student ID or employee number",
          hint: "Required to validate your academic discount"
        },

        proofFile: {
          label: "Academic identification",
          hint: "Upload an image (photo) of your student ID, enrollment certificate or appointment. Accepted formats: JPG, PNG, WebP, HEIC (iPhone), AVIF. Up to 5 MB.",
          buttonText: "Select image",
          selectedText: "Selected image:",
          errorSize: "Image must not exceed 5 MB",
          errorType: "Only image files allowed (JPG, PNG, WebP, HEIC, AVIF, BMP)",
          dragText: "Drag your image here or click to select",
          required: true,
          error: "You must upload an image of your academic identification"
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
        amount: "$990 MXN",
        note: "Single payment - Includes certificate"
      },
      dates: {
        label: "Dates",
        value: "November 22, 2025"
      },
      venue: {
        label: "Venue",
        value: "Teatro Legaria (IMSS)",
        location: "Mexico City"
      },
      schedule: {
        label: "Schedule",
        value: "09:00 AM – 06:00 PM"
      },
      benefits: {
        title: "Your registration includes",
        items: [
          "Full access to one day of the conference.",
          "Digital educational materials",
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
      subtitle: "Complete your registration and secure your place at the legal event of the year. Secure payment with credit or debit card."
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

    // 🚫 PAYMENT METHOD: Updated texts - Only Stripe now (no method selector)
    paymentMethods: {
      title: "Payment data",
      subtitle: "Complete your card details securely",
      
      tabs: {
        // 🚫 Tabs disabled - Only kept for compatibility
        paypal: "PayPal",
        creditCard: "Credit/Debit Card",
        bankTransfer: "Bank Transfer"
      }
    },

    // Method 1: PayPal
    paypal: {
      title: "Secure payment with PayPal",
      description: "Instant processing. You will receive your confirmation and QR code by email immediately.",
      amount: "$990 MXN",
      instructions: "Click the PayPal button to complete your payment securely.",
      processing: "Processing payment...",
      success: "Payment successful! Redirecting...",
      error: "Error processing payment. Please try again."
    },

    // Method 2: IPPAY (Credit Card)
    creditCard: {
      title: "Pay with credit or debit card",
      description: "Instant and secure processing. We accept Visa, Mastercard, and American Express.",
      amount: "$990 MXN",
      
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
      
      submitButton: "Pay $990 MXN",
      processing: "Processing secure payment...",
      success: "Payment successful! Redirecting...",
      error: "Error processing payment. Please check the details."
    },

    // Method 3: Bank Transfer
    bankTransfer: {
      title: "Bank transfer or deposit",
      description: "Make your payment and upload the receipt. Your registration will be validated within 24-48 business hours.",
      amount: "$990 MXN",
      
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
        amount: "$990 MXN",
        note: "Single payment - Certificate included"
      },
      dates: {
        label: "Dates",
        value: "November 22, 2025"
      },
      venue: {
        label: "Venue",
        value: "Teatro Legaria (IMSS)",
        location: "Mexico City"
      },
      schedule: {
        label: "Schedule",
        value: "09:00 AM – 06:00 PM"
      },
      benefits: {
        title: "Your registration includes",
        items: [
          "Full access to one day of the conference.",
          "Digital educational materials (congress proceedings)",
          "Networking with speakers and attendees",
          "Access to exclusive post-congress follow-up group"
        ],
        membership: [
          "Full access to one day of the conference.",
          "Digital educational materials (congress proceedings)",
          "Networking with speakers and attendees",
          "Access to exclusive post-congress follow-up group",
          "Special price for congress registration"
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
