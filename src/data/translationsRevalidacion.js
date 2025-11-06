export const translationsRevalidacion = {
  es: {
    // Estados de error
    errors: {
      missingParams: {
        title: 'Acceso Inválido',
        description: 'No se encontraron los parámetros requeridos en la URL. Por favor, utilice el enlace enviado a su correo electrónico.',
        ctaButton: 'Ir a Registro'
      },
      invalidType: {
        title: 'Tipo de Rechazo Inválido',
        description: 'El tipo de documento rechazado no es válido. Por favor, contacte a soporte.',
        ctaButton: 'Contactar Soporte'
      },
      customerNotFound: {
        title: 'Cliente No Encontrado',
        description: 'No se encontró ningún registro con el ID proporcionado.',
        ctaButton: 'Ir a Registro'
      }
    },

    // Pantalla principal - Credencial
    credential: {
      badge: 'Verificación Requerida',
      title: 'Verificación de Credencial Académica',
      subtitle: 'Su credencial académica no pudo ser validada',
      description: 'Por favor, suba una imagen clara donde se vea su nombre completo, fotografía y vigencia de la credencial.',
      requirements: {
        title: 'Requisitos de la imagen:',
        items: [
          'Imagen clara y legible',
          'Nombre completo visible',
          'Fotografía del titular',
          'Vigencia actual',
          'Formato: JPG, PNG o PDF',
          'Tamaño máximo: 5MB'
        ]
      },
      fileUploader: {
        placeholder: 'Cargar credencial académica',
        dragText: 'Arrastra tu credencial aquí',
        orText: 'o haz clic para seleccionar',
        formats: 'JPG, PNG, PDF (máx. 5MB)',
        changeButton: 'Cambiar archivo'
      },
      submitButton: 'Enviar para Validación',
      submittingButton: 'Enviando...',
      footer: 'Recibirá un correo electrónico en las próximas 24-48 horas con la confirmación una vez validada su credencial.'
    },

    // Pantalla principal - Comprobante
    receipt: {
      badge: 'Verificación Requerida',
      title: 'Verificación de Comprobante de Pago',
      subtitle: 'Su comprobante de transferencia no pudo ser validado',
      description: 'Por favor, suba una imagen clara del comprobante bancario donde se vea la referencia de pago, monto y fecha.',
      requirements: {
        title: 'Requisitos de la imagen:',
        items: [
          'Comprobante de transferencia bancaria',
          'Referencia de pago visible',
          'Monto: $990 MXN (o monto académico)',
          'Fecha de transacción visible',
          'Formato: JPG, PNG o PDF',
          'Tamaño máximo: 5MB'
        ]
      },
      fileUploader: {
        placeholder: 'Cargar comprobante de pago',
        dragText: 'Arrastra tu comprobante aquí',
        orText: 'o haz clic para seleccionar',
        formats: 'JPG, PNG, PDF (máx. 5MB)',
        changeButton: 'Cambiar archivo'
      },
      submitButton: 'Enviar para Validación',
      submittingButton: 'Enviando...',
      footer: 'Recibirá un correo electrónico en las próximas 24-48 horas con la confirmación una vez validado su pago.'
    },

    // Pantalla de éxito
    success: {
      icon: '✅',
      title: 'Archivo Enviado Correctamente',
      subtitle: 'Validación en Proceso',
      credentialMessage: 'Su credencial académica ha sido recibida y está siendo validada por nuestro equipo.',
      receiptMessage: 'Su comprobante de pago ha sido recibido y está siendo validado por nuestro equipo.',
      emailNotification: 'Recibirá un correo electrónico en las próximas 24-48 horas con la confirmación de su registro una vez completada la validación.',
      ctaButton: 'Volver al Inicio',
      supportText: '¿Tiene alguna duda?',
      supportLink: 'Contactar Soporte'
    },

    // Validación de archivos
    fileValidation: {
      invalidType: 'Tipo de archivo no válido. Solo se permiten JPG, PNG o PDF.',
      tooLarge: 'El archivo es demasiado grande. Tamaño máximo: 5MB.',
      uploadError: 'Error al subir el archivo. Por favor, intente nuevamente.',
      networkError: 'Error de conexión. Verifique su internet e intente nuevamente.',
      serverError: 'Error del servidor. Por favor, contacte a soporte.'
    }
  },

  en: {
    // Error states
    errors: {
      missingParams: {
        title: 'Invalid Access',
        description: 'Required parameters not found in URL. Please use the link sent to your email.',
        ctaButton: 'Go to Registration'
      },
      invalidType: {
        title: 'Invalid Rejection Type',
        description: 'The rejected document type is invalid. Please contact support.',
        ctaButton: 'Contact Support'
      },
      customerNotFound: {
        title: 'Customer Not Found',
        description: 'No registration found with the provided ID.',
        ctaButton: 'Go to Registration'
      }
    },

    // Main screen - Credential
    credential: {
      badge: 'Verification Required',
      title: 'Academic Credential Verification',
      subtitle: 'Your academic credential could not be validated',
      description: 'Please upload a clear image showing your full name, photograph, and credential validity.',
      requirements: {
        title: 'Image requirements:',
        items: [
          'Clear and legible image',
          'Full name visible',
          'Holder photograph',
          'Current validity',
          'Format: JPG, PNG or PDF',
          'Maximum size: 5MB'
        ]
      },
      fileUploader: {
        placeholder: 'Upload academic credential',
        dragText: 'Drag your credential here',
        orText: 'or click to select',
        formats: 'JPG, PNG, PDF (max. 5MB)',
        changeButton: 'Change file'
      },
      submitButton: 'Submit for Validation',
      submittingButton: 'Submitting...',
      footer: 'You will receive an email within 24-48 hours with confirmation once your credential is validated.'
    },

    // Main screen - Receipt
    receipt: {
      badge: 'Verification Required',
      title: 'Payment Receipt Verification',
      subtitle: 'Your transfer receipt could not be validated',
      description: 'Please upload a clear image of the bank receipt showing the payment reference, amount, and date.',
      requirements: {
        title: 'Image requirements:',
        items: [
          'Bank transfer receipt',
          'Payment reference visible',
          'Amount: $990 MXN (or academic amount)',
          'Transaction date visible',
          'Format: JPG, PNG or PDF',
          'Maximum size: 5MB'
        ]
      },
      fileUploader: {
        placeholder: 'Upload payment receipt',
        dragText: 'Drag your receipt here',
        orText: 'or click to select',
        formats: 'JPG, PNG, PDF (max. 5MB)',
        changeButton: 'Change file'
      },
      submitButton: 'Submit for Validation',
      submittingButton: 'Submitting...',
      footer: 'You will receive an email within 24-48 hours with confirmation once your payment is validated.'
    },

    // Success screen
    success: {
      icon: '✅',
      title: 'File Successfully Submitted',
      subtitle: 'Validation in Progress',
      credentialMessage: 'Your academic credential has been received and is being validated by our team.',
      receiptMessage: 'Your payment receipt has been received and is being validated by our team.',
      emailNotification: 'You will receive an email within 24-48 hours with your registration confirmation once validation is complete.',
      ctaButton: 'Back to Home',
      supportText: 'Have questions?',
      supportLink: 'Contact Support'
    },

    // File validation
    fileValidation: {
      invalidType: 'Invalid file type. Only JPG, PNG or PDF allowed.',
      tooLarge: 'File is too large. Maximum size: 5MB.',
      uploadError: 'Error uploading file. Please try again.',
      networkError: 'Connection error. Check your internet and try again.',
      serverError: 'Server error. Please contact support.'
    }
  }
};
