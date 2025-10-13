// translationsRegistro.js - Traducciones para la página de registro del congreso

export const translationsRegistro = {
  es: {
    // Header
    pageTitle: "Registro al Congreso",
    pageSubtitle: "Complete el siguiente formulario para confirmar su participación",
    backToHome: "← Volver al inicio",

    // Formulario
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
        note: "Pago único - Incluye certificado"
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
          "Acceso a todas las conferencias y talleres",
          "Certificado oficial de participación",
          "Material didáctico digital",
          "Coffee break y alimentos",
          "Networking con magistrados y litigantes",
          "Acceso a grabaciones del evento"
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
      email: "congreso@abogadosliberales.mx",
      whatsapp: "+52 55 1234 5678"
    }
  },

  en: {
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
          "Coffee break and meals",
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
      email: "congreso@abogadosliberales.mx",
      whatsapp: "+52 55 1234 5678"
    }
  }
};
