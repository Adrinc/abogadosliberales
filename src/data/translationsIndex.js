// translationsIndex.js - Traducciones completas para index.astro (Landing Congreso)
// Barra Mexicana de Abogados Liberales

export const translationsIndex = {
  es: {
    // SECCIÓN 1: HERO
    hero: {
      badge: "EVENTO PRESENCIAL · CUPO LIMITADO",
      title: "Congreso Nacional de Litigio Estratégico en Amparo",
      subtitle: "Protección de los Derechos Humanos 2025",
      date: "14 y 15 de noviembre · Ciudad de México",
      description: "Dos días de formación de excelencia con magistrados, litigantes y académicos líderes en la defensa constitucional de derechos fundamentales.",
      ctaPrimary: "Adquirir entrada",
      ctaSecondary: "Ver programa completo",
      price: "$1,990 MXN",
      trustSignals: {
        certification: "Certificado oficial de participación",
        attendees: "200+ asistentes edición 2024",
        experts: "12 ponentes especializados"
      }
    },

    // SECCIÓN 2: SOBRE EL EVENTO
    sobreEvento: {
      label: "SOBRE EL CONGRESO",
      title: "La justicia como derecho humano",
      description: "El Congreso Nacional de Litigio Estratégico en Amparo y Protección de los Derechos Humanos 2025 reúne a los principales expertos en justicia constitucional de México. Un espacio de formación especializada para abogados comprometidos con la defensa estratégica de garantías fundamentales.",
      highlightText: "La razón como luz que guía la justicia",
      items: [
        {
          icon: "🎓",
          title: "Formación de excelencia",
          description: "Capacitación de alto nivel con magistrados de circuito, académicos constitucionalistas y litigantes con casos paradigmáticos ante la Suprema Corte."
        },
        {
          icon: "⚖️",
          title: "Perspectiva humanista",
          description: "Enfoque centrado en la protección efectiva de derechos humanos mediante el uso estratégico del juicio de amparo como herramienta de justicia social."
        },
        {
          icon: "🤝",
          title: "Red profesional comprometida",
          description: "Espacio de encuentro con abogados liberales que comparten valores de ética, transparencia y responsabilidad en el ejercicio del Derecho."
        }
      ],
      cta: "Conoce más sobre la Barra"
    },

    // SECCIÓN 3: PONENTES PRINCIPALES
    ponentes: {
      label: "EXPERTOS NACIONALES",
      title: "Ponentes principales",
      description: "Magistrados, académicos y litigantes de prestigio que han marcado precedentes en la protección de derechos humanos.",
      cta: "Ver programa detallado",
      speakers: [
        {
          name: "Magistrado [Nombre]",
          role: "Magistrado de Circuito",
          institution: "Poder Judicial de la Federación",
          topic: "Criterios jurisprudenciales en amparo directo",
          image: "/image/ponentes/magistrado1.jpg" // Placeholder
        },
        {
          name: "Dra. [Nombre]",
          role: "Catedrática de Derecho Constitucional",
          institution: "UNAM",
          topic: "Control de convencionalidad y DDHH",
          image: "/image/ponentes/academica1.jpg"
        },
        {
          name: "Mtro. [Nombre]",
          role: "Litigante Especializado",
          institution: "Barra Mexicana de Abogados Liberales",
          topic: "Casos paradigmáticos ante la SCJN",
          image: "/image/ponentes/litigante1.jpg"
        },
        {
          name: "Magistrada [Nombre]",
          role: "Magistrada de Circuito",
          institution: "Tribunal Colegiado en Materia Civil",
          topic: "Amparo indirecto en materia familiar",
          image: "/image/ponentes/magistrada2.jpg"
        },
        {
          name: "Dr. [Nombre]",
          role: "Investigador Constitucional",
          institution: "Instituto de Investigaciones Jurídicas UNAM",
          topic: "Evolución del juicio de amparo en México",
          image: "/image/ponentes/academico2.jpg"
        },
        {
          name: "Lic. [Nombre]",
          role: "Defensor de Derechos Humanos",
          institution: "CNDH",
          topic: "Litigio estratégico en comunidades vulnerables",
          image: "/image/ponentes/defensor1.jpg"
        }
      ]
    },

    // SECCIÓN 4: PROGRAMA
    programa: {
      label: "PROGRAMA ACADÉMICO",
      title: "Agenda del congreso",
      description: "Dos días intensivos de conferencias magistrales, paneles de discusión y talleres prácticos.",
      downloadCta: "Descargar programa completo (PDF)",
      days: {
        day1: {
          title: "Día 1 - Jueves 14 de noviembre",
          sessions: [
            {
              time: "09:00 - 10:00",
              title: "Registro y bienvenida",
              type: "Acto protocolario",
              speaker: "Mesa Directiva BMAL"
            },
            {
              time: "10:00 - 11:30",
              title: "Conferencia magistral: El amparo como garantía constitucional",
              type: "Conferencia",
              speaker: "Magistrado [Nombre] - Tribunal Colegiado"
            },
            {
              time: "11:30 - 12:00",
              title: "Receso - Coffee break",
              type: "Intermedio",
              speaker: ""
            },
            {
              time: "12:00 - 14:00",
              title: "Panel: Criterios recientes de la SCJN en materia de DDHH",
              type: "Panel de discusión",
              speaker: "3 magistrados de circuito"
            },
            {
              time: "14:00 - 15:30",
              title: "Comida - Networking",
              type: "Intermedio",
              speaker: ""
            },
            {
              time: "15:30 - 17:30",
              title: "Taller práctico: Redacción de demandas de amparo indirecto",
              type: "Taller",
              speaker: "Mtro. [Nombre] - Litigante especializado"
            },
            {
              time: "17:30 - 18:00",
              title: "Sesión de preguntas y respuestas",
              type: "Q&A",
              speaker: "Todos los ponentes"
            }
          ]
        },
        day2: {
          title: "Día 2 - Viernes 15 de noviembre",
          sessions: [
            {
              time: "09:00 - 10:30",
              title: "Conferencia: Control de convencionalidad y derechos humanos",
              type: "Conferencia",
              speaker: "Dra. [Nombre] - UNAM"
            },
            {
              time: "10:30 - 11:00",
              title: "Receso - Coffee break",
              type: "Intermedio",
              speaker: ""
            },
            {
              time: "11:00 - 13:00",
              title: "Panel: Casos paradigmáticos de amparo en protección de DDHH",
              type: "Panel de discusión",
              speaker: "4 litigantes con casos ante SCJN"
            },
            {
              time: "13:00 - 14:30",
              title: "Comida - Networking",
              type: "Intermedio",
              speaker: ""
            },
            {
              time: "14:30 - 16:30",
              title: "Taller: Litigio estratégico en comunidades vulnerables",
              type: "Taller",
              speaker: "Lic. [Nombre] - CNDH"
            },
            {
              time: "16:30 - 17:30",
              title: "Conferencia de clausura: El futuro del amparo en México",
              type: "Conferencia",
              speaker: "Dr. [Nombre] - IIJ UNAM"
            },
            {
              time: "17:30 - 18:00",
              title: "Entrega de constancias y despedida",
              type: "Acto protocolario",
              speaker: "Mesa Directiva BMAL"
            }
          ]
        }
      }
    },

    // SECCIÓN 5: INSCRIPCIÓN
    inscripcion: {
      label: "INSCRIPCIÓN",
      title: "Asegura tu lugar",
      subtitle: "Inversión en tu formación profesional",
      price: "$1,990",
      currency: "MXN",
      priceDescription: "Cuota de recuperación por persona",
      badgeDiscount: "OFERTA ESPECIAL - Grupos de 3+ personas: 10% descuento",
      includes: {
        title: "Tu registro incluye:",
        items: [
          "Acceso completo a las 2 jornadas del congreso",
          "Certificado oficial de participación avalado por la Barra",
          "Material didáctico digital (memorias del congreso)",
          "Coffee breaks y comida de ambos días",
          "Networking con ponentes y asistentes",
          "Acceso a grupo exclusivo de seguimiento post-congreso"
        ]
      },
      ctaPrimary: "Registrar mi lugar ahora",
      ctaSecondary: "Consultar descuentos para grupos",
      paymentInfo: {
        title: "Datos para realizar el pago",
        bank: "INBURSA",
        clabe: "036180500731081928",
        accountName: "BARRA MEXICANA DE CIENCIAS JURIDICAS Y PROFESIONALES LIBERALES DEL DERECHO A.C.",
        instructions: "Envía tu comprobante de pago a: congreso@abogadosliberales.mx",
        note: "Cupo limitado a 250 asistentes. Los lugares se asignan por orden de pago confirmado."
      }
    },

    // SECCIÓN 6: TESTIMONIOS
    testimonios: {
      label: "VOCES DE NUESTROS ASISTENTES",
      title: "Lo que dicen quienes ya asistieron",
      subtitle: "Testimonios de abogados que vivieron la experiencia del congreso anterior",
      videoTitle: "Revive los mejores momentos del Congreso 2024",
      testimonials: [
        {
          name: "Lic. María Fernández García",
          role: "Litigante independiente",
          location: "Ciudad de México",
          text: "Un congreso de altísimo nivel académico. Los talleres prácticos me dieron herramientas concretas que he aplicado en mis casos de amparo. La calidad de los ponentes y el networking valieron cada peso invertido.",
          rating: 5,
          image: "/image/testimonials/avatar1.png"
        },
        {
          name: "Mtro. Carlos Ramírez Soto",
          role: "Asesor jurídico corporativo",
          location: "Monterrey, NL",
          text: "Excelente organización y contenido de primer nivel. Los magistrados compartieron criterios actualizados que no encuentras en ningún curso online. Volveré sin duda a la próxima edición.",
          rating: 5,
          image: "/image/testimonials/avatar2.png"
        },
        {
          name: "Dra. Ana Patricia Ruiz",
          role: "Catedrática universitaria",
          location: "Guadalajara, Jal",
          text: "Como académica, valoro enormemente el rigor jurídico y la perspectiva humanista del congreso. Un espacio de reflexión crítica sobre el uso del amparo en la defensa de derechos humanos.",
          rating: 5,
          image: "/image/testimonials/avatar3.png"
        }
      ]
    },

    // SECCIÓN 7: SOBRE LA BARRA
    sobreBarra: {
      label: "NUESTRA INSTITUCIÓN",
      title: "Barra Mexicana de Abogados Liberales",
      subtitle: "Comunidad comprometida con la justicia social y la excelencia jurídica",
      description: "Fundada el 12 de julio de 2024, la Barra Mexicana de Abogados Liberales es una asociación civil que promueve la defensa estratégica de derechos humanos, la ética profesional y la filantropía jurídica. Somos una red de abogados comprometidos con los valores del liberalismo jurídico: razón, justicia y dignidad.",
      motto: "¡Que la luz de la razón brille en la justicia!",
      mottoLatin: "Lux Iustitia Excellentium",
      pillars: [
        {
          icon: "⚖️",
          title: "Justicia Social",
          description: "Defensa estratégica de derechos humanos y acceso efectivo a la justicia para todas las personas."
        },
        {
          icon: "🎓",
          title: "Ética Profesional",
          description: "Excelencia, transparencia y responsabilidad en el ejercicio del Derecho como pilares de nuestra práctica."
        },
        {
          icon: "🤝",
          title: "Filantropía Jurídica",
          description: "Asesoría pro bono, formación comunitaria e impacto social como compromiso con la sociedad."
        }
      ],
      cta: "Conoce más sobre nosotros",
      ctaLink: "/nosotros"
    },

    // SECCIÓN 8: PREGUNTAS FRECUENTES
    faqs: {
      label: "PREGUNTAS FRECUENTES",
      title: "Resolvemos tus dudas",
      subtitle: "Todo lo que necesitas saber sobre el congreso",
      questions: [
        {
          question: "¿Cómo obtengo mi certificado de participación?",
          answer: "El certificado oficial se entrega de forma digital al finalizar el congreso (viernes 15 de noviembre). Deberás haber asistido al menos al 80% de las sesiones y registrar tu asistencia con el código QR proporcionado en cada conferencia. El certificado estará firmado por la Mesa Directiva de la Barra y avalado por nuestros ponentes magistrados."
        },
        {
          question: "¿Habrá transmisión en línea o es solo presencial?",
          answer: "Este congreso es 100% presencial. No habrá transmisión online ni grabaciones disponibles posteriormente, ya que buscamos fomentar la interacción directa entre ponentes y asistentes. El valor diferencial está en el networking, las sesiones de Q&A en vivo y los talleres prácticos."
        },
        {
          question: "¿Ofrecen descuentos para grupos o estudiantes?",
          answer: "Sí. Grupos de 3 o más personas obtienen 10% de descuento. Estudiantes de licenciatura con credencial vigente obtienen 20% de descuento. Para aplicar descuentos, contacta directamente a: congreso@abogadosliberales.mx antes de realizar el pago."
        },
        {
          question: "¿Qué formas de pago aceptan además de transferencia bancaria?",
          answer: "Actualmente solo aceptamos transferencia o depósito bancario a la cuenta de INBURSA. Estamos trabajando en habilitar pagos con tarjeta para próximas ediciones. Si requieres factura, solicítala al enviar tu comprobante de pago."
        },
        {
          question: "¿El precio incluye hospedaje?",
          answer: "No, el precio solo cubre tu acceso al congreso, material didáctico, certificado y alimentos durante las jornadas. Sin embargo, hemos negociado tarifas preferenciales con hoteles cercanos a la sede. Consulta la lista de hoteles recomendados en la sección de Ubicación."
        },
        {
          question: "¿Puedo solicitar reembolso si ya no puedo asistir?",
          answer: "Sí, aceptamos cancelaciones con reembolso del 80% hasta el 1 de noviembre. Después de esa fecha no hay reembolsos, pero puedes transferir tu lugar a otra persona notificándonos con al menos 3 días de anticipación."
        }
      ]
    },

    // SECCIÓN 9: UBICACIÓN
    ubicacion: {
      label: "SEDE DEL EVENTO",
      title: "Cómo llegar",
      subtitle: "El congreso se realizará en el corazón de la Ciudad de México",
      venue: {
        name: "Auditorio [Nombre por definir]",
        address: "Av. Reforma [Número] · Col. Juárez · Cuauhtémoc · 06600 CDMX",
        directions: "A 5 minutos del Metro Hidalgo (Líneas 2 y 3) y 10 minutos del Metrobús Reforma."
      },
      mapTitle: "Ubicación exacta",
      hotelsTitle: "Hoteles recomendados cercanos",
      hotels: [
        {
          name: "Hotel Ejecutivo",
          distance: "300 metros (3 min caminando)",
          price: "Desde $1,200/noche",
          rating: "4.2 estrellas",
          phone: "+52 55 1234 5678"
        },
        {
          name: "City Express Reforma",
          distance: "500 metros (6 min caminando)",
          price: "Desde $950/noche",
          rating: "4.0 estrellas",
          phone: "+52 55 8765 4321"
        },
        {
          name: "Hotel Boutique Juárez",
          distance: "800 metros (10 min caminando)",
          price: "Desde $1,500/noche",
          rating: "4.5 estrellas",
          phone: "+52 55 9876 5432"
        }
      ],
      parkingInfo: "Estacionamiento disponible en el edificio con costo de $60/día.",
      accessibilityInfo: "El auditorio cuenta con acceso para personas con discapacidad motriz."
    },

    // SECCIÓN 10: CTA FINAL
    ctaFinal: {
      badge: "ÚLTIMOS LUGARES DISPONIBLES",
      title: "No dejes pasar esta oportunidad",
      subtitle: "Invierte en tu formación profesional y forma parte de la comunidad de abogados liberales más comprometida de México",
      description: "El congreso de amparo y derechos humanos más importante del año. Magistrados, académicos y litigantes de élite compartiendo conocimiento de excelencia.",
      ctaPrimary: "Asegurar mi lugar ahora",
      ctaSecondary: "Contactar por WhatsApp",
      newsletter: {
        title: "Recibe información de próximos eventos",
        placeholder: "correo@ejemplo.com",
        button: "Suscribirme",
        privacy: "No compartimos tu información. Podrás cancelar tu suscripción en cualquier momento."
      },
      trustSignals: {
        limitedSeats: "Cupo limitado a 250 asistentes",
        officialCert: "Certificado oficial avalado",
        expertSpeakers: "12 expertos nacionales confirmados"
      }
    }
  },

  en: {
    // SECTION 1: HERO
    hero: {
      badge: "IN-PERSON EVENT · LIMITED CAPACITY",
      title: "National Congress on Strategic Amparo Litigation",
      subtitle: "Human Rights Protection 2025",
      date: "November 14-15 · Mexico City",
      description: "Two days of excellence training with leading magistrates, litigators and academics in constitutional defense of fundamental rights.",
      ctaPrimary: "Get Ticket",
      ctaSecondary: "View Full Program",
      price: "$1,990 MXN",
      trustSignals: {
        certification: "Official participation certificate",
        attendees: "200+ attendees 2024 edition",
        experts: "12 specialized speakers"
      }
    },

    // SECTION 2: ABOUT THE EVENT
    sobreEvento: {
      label: "ABOUT THE CONGRESS",
      title: "Justice as a human right",
      description: "The National Congress on Strategic Amparo Litigation and Human Rights Protection 2025 brings together Mexico's leading experts in constitutional justice. A specialized training space for lawyers committed to strategic defense of fundamental guarantees.",
      highlightText: "Reason as the light that guides justice",
      items: [
        {
          icon: "🎓",
          title: "Excellence training",
          description: "High-level training with circuit magistrates, constitutional scholars and litigators with landmark cases before the Supreme Court."
        },
        {
          icon: "⚖️",
          title: "Humanist perspective",
          description: "Focus on effective protection of human rights through strategic use of amparo lawsuits as a social justice tool."
        },
        {
          icon: "🤝",
          title: "Committed professional network",
          description: "Meeting space with liberal lawyers who share values of ethics, transparency and responsibility in legal practice."
        }
      ],
      cta: "Learn more about the Bar"
    },

    // SECTION 3: MAIN SPEAKERS
    ponentes: {
      label: "NATIONAL EXPERTS",
      title: "Main speakers",
      description: "Prestigious magistrates, academics and litigators who have set precedents in human rights protection.",
      cta: "View detailed program",
      speakers: [
        {
          name: "Magistrate [Name]",
          role: "Circuit Magistrate",
          institution: "Federal Judicial Branch",
          topic: "Jurisprudential criteria in direct amparo",
          image: "/image/ponentes/magistrado1.jpg"
        },
        {
          name: "Dr. [Name]",
          role: "Constitutional Law Professor",
          institution: "UNAM",
          topic: "Conventionality control and human rights",
          image: "/image/ponentes/academica1.jpg"
        },
        {
          name: "Mtro. [Name]",
          role: "Specialized Litigator",
          institution: "Mexican Bar of Liberal Lawyers",
          topic: "Landmark cases before SCJN",
          image: "/image/ponentes/litigante1.jpg"
        },
        {
          name: "Magistrate [Name]",
          role: "Circuit Magistrate",
          institution: "Collegiate Court in Civil Matters",
          topic: "Indirect amparo in family matters",
          image: "/image/ponentes/magistrada2.jpg"
        },
        {
          name: "Dr. [Name]",
          role: "Constitutional Researcher",
          institution: "UNAM Legal Research Institute",
          topic: "Evolution of amparo lawsuit in Mexico",
          image: "/image/ponentes/academico2.jpg"
        },
        {
          name: "Lic. [Name]",
          role: "Human Rights Defender",
          institution: "CNDH",
          topic: "Strategic litigation in vulnerable communities",
          image: "/image/ponentes/defensor1.jpg"
        }
      ]
    },

    // SECTION 4: PROGRAM
    programa: {
      label: "ACADEMIC PROGRAM",
      title: "Congress agenda",
      description: "Two intensive days of keynote speeches, discussion panels and practical workshops.",
      downloadCta: "Download full program (PDF)",
      days: {
        day1: {
          title: "Day 1 - Thursday, November 14",
          sessions: [
            {
              time: "09:00 - 10:00",
              title: "Registration and welcome",
              type: "Protocol act",
              speaker: "BMAL Board of Directors"
            },
            {
              time: "10:00 - 11:30",
              title: "Keynote: Amparo as constitutional guarantee",
              type: "Conference",
              speaker: "Magistrate [Name] - Collegiate Court"
            },
            {
              time: "11:30 - 12:00",
              title: "Break - Coffee break",
              type: "Intermission",
              speaker: ""
            },
            {
              time: "12:00 - 14:00",
              title: "Panel: Recent SCJN criteria on human rights",
              type: "Discussion panel",
              speaker: "3 circuit magistrates"
            },
            {
              time: "14:00 - 15:30",
              title: "Lunch - Networking",
              type: "Intermission",
              speaker: ""
            },
            {
              time: "15:30 - 17:30",
              title: "Workshop: Drafting indirect amparo lawsuits",
              type: "Workshop",
              speaker: "Mtro. [Name] - Specialized litigator"
            },
            {
              time: "17:30 - 18:00",
              title: "Q&A session",
              type: "Q&A",
              speaker: "All speakers"
            }
          ]
        },
        day2: {
          title: "Day 2 - Friday, November 15",
          sessions: [
            {
              time: "09:00 - 10:30",
              title: "Conference: Conventionality control and human rights",
              type: "Conference",
              speaker: "Dr. [Name] - UNAM"
            },
            {
              time: "10:30 - 11:00",
              title: "Break - Coffee break",
              type: "Intermission",
              speaker: ""
            },
            {
              time: "11:00 - 13:00",
              title: "Panel: Landmark amparo cases in human rights protection",
              type: "Discussion panel",
              speaker: "4 litigators with SCJN cases"
            },
            {
              time: "13:00 - 14:30",
              title: "Lunch - Networking",
              type: "Intermission",
              speaker: ""
            },
            {
              time: "14:30 - 16:30",
              title: "Workshop: Strategic litigation in vulnerable communities",
              type: "Workshop",
              speaker: "Lic. [Name] - CNDH"
            },
            {
              time: "16:30 - 17:30",
              title: "Closing conference: The future of amparo in Mexico",
              type: "Conference",
              speaker: "Dr. [Name] - IIJ UNAM"
            },
            {
              time: "17:30 - 18:00",
              title: "Certificate delivery and farewell",
              type: "Protocol act",
              speaker: "BMAL Board of Directors"
            }
          ]
        }
      }
    },

    // SECTION 5: REGISTRATION
    inscripcion: {
      label: "REGISTRATION",
      title: "Secure your spot",
      subtitle: "Investment in your professional development",
      price: "$1,990",
      currency: "MXN",
      priceDescription: "Recovery fee per person",
      badgeDiscount: "SPECIAL OFFER - Groups of 3+ people: 10% discount",
      includes: {
        title: "Your registration includes:",
        items: [
          "Full access to the 2-day congress",
          "Official participation certificate endorsed by the Bar",
          "Digital educational material (congress proceedings)",
          "Coffee breaks and meals for both days",
          "Networking with speakers and attendees",
          "Access to exclusive post-congress follow-up group"
        ]
      },
      ctaPrimary: "Register my spot now",
      ctaSecondary: "Check group discounts",
      paymentInfo: {
        title: "Payment information",
        bank: "INBURSA",
        clabe: "036180500731081928",
        accountName: "BARRA MEXICANA DE CIENCIAS JURIDICAS Y PROFESIONALES LIBERALES DEL DERECHO A.C.",
        instructions: "Send your payment receipt to: congreso@abogadosliberales.mx",
        note: "Limited capacity to 250 attendees. Spots are assigned by confirmed payment order."
      }
    },

    // SECTION 6: TESTIMONIALS
    testimonios: {
      label: "VOICES OF OUR ATTENDEES",
      title: "What past attendees say",
      subtitle: "Testimonials from lawyers who experienced last year's congress",
      videoTitle: "Relive the best moments of Congress 2024",
      testimonials: [
        {
          name: "Lic. María Fernández García",
          role: "Independent litigator",
          location: "Mexico City",
          text: "A congress of the highest academic level. The practical workshops gave me concrete tools that I have applied in my amparo cases. The quality of speakers and networking were worth every peso invested.",
          rating: 5,
          image: "/image/testimonials/avatar1.png"
        },
        {
          name: "Mtro. Carlos Ramírez Soto",
          role: "Corporate legal advisor",
          location: "Monterrey, NL",
          text: "Excellent organization and first-class content. The magistrates shared updated criteria that you won't find in any online course. I will definitely return to the next edition.",
          rating: 5,
          image: "/image/testimonials/avatar2.png"
        },
        {
          name: "Dra. Ana Patricia Ruiz",
          role: "University professor",
          location: "Guadalajara, Jal",
          text: "As an academic, I greatly value the legal rigor and humanist perspective of the congress. A space for critical reflection on the use of amparo in human rights defense.",
          rating: 5,
          image: "/image/testimonials/avatar3.png"
        }
      ]
    },

    // SECTION 7: ABOUT THE BAR
    sobreBarra: {
      label: "OUR INSTITUTION",
      title: "Mexican Bar of Liberal Lawyers",
      subtitle: "Community committed to social justice and legal excellence",
      description: "Founded on July 12, 2024, the Mexican Bar of Liberal Lawyers is a civil association that promotes strategic defense of human rights, professional ethics and legal philanthropy. We are a network of lawyers committed to the values of legal liberalism: reason, justice and dignity.",
      motto: "May the light of reason shine on justice!",
      mottoLatin: "Lux Iustitia Excellentium",
      pillars: [
        {
          icon: "⚖️",
          title: "Social Justice",
          description: "Strategic defense of human rights and effective access to justice for all people."
        },
        {
          icon: "🎓",
          title: "Professional Ethics",
          description: "Excellence, transparency and responsibility in legal practice as pillars of our work."
        },
        {
          icon: "🤝",
          title: "Legal Philanthropy",
          description: "Pro bono advice, community training and social impact as commitment to society."
        }
      ],
      cta: "Learn more about us",
      ctaLink: "/nosotros"
    },

    // SECTION 8: FAQ
    faqs: {
      label: "FREQUENTLY ASKED QUESTIONS",
      title: "We answer your questions",
      subtitle: "Everything you need to know about the congress",
      questions: [
        {
          question: "How do I get my participation certificate?",
          answer: "The official certificate is delivered digitally at the end of the congress (Friday, November 15). You must have attended at least 80% of sessions and register your attendance with the QR code provided at each conference. The certificate will be signed by the Bar's Board of Directors and endorsed by our magistrate speakers."
        },
        {
          question: "Will there be online streaming or is it only in-person?",
          answer: "This congress is 100% in-person. There will be no online streaming or recordings available afterwards, as we seek to foster direct interaction between speakers and attendees. The differential value is in networking, live Q&A sessions and practical workshops."
        },
        {
          question: "Do you offer discounts for groups or students?",
          answer: "Yes. Groups of 3 or more people get 10% discount. Undergraduate students with valid ID get 20% discount. To apply discounts, contact directly: congreso@abogadosliberales.mx before making payment."
        },
        {
          question: "What payment methods do you accept besides bank transfer?",
          answer: "We currently only accept bank transfer or deposit to the INBURSA account. We are working on enabling card payments for future editions. If you require an invoice, request it when sending your payment receipt."
        },
        {
          question: "Does the price include accommodation?",
          answer: "No, the price only covers your congress access, educational materials, certificate and meals during the sessions. However, we have negotiated preferential rates with hotels near the venue. Check the list of recommended hotels in the Location section."
        },
        {
          question: "Can I request a refund if I can no longer attend?",
          answer: "Yes, we accept cancellations with 80% refund until November 1. After that date there are no refunds, but you can transfer your spot to another person by notifying us at least 3 days in advance."
        }
      ]
    },

    // SECTION 9: LOCATION
    ubicacion: {
      label: "EVENT VENUE",
      title: "How to get there",
      subtitle: "The congress will take place in the heart of Mexico City",
      venue: {
        name: "Auditorium [Name TBD]",
        address: "Av. Reforma [Number] · Col. Juárez · Cuauhtémoc · 06600 CDMX",
        directions: "5 minutes from Hidalgo Metro (Lines 2 and 3) and 10 minutes from Reforma Metrobus."
      },
      mapTitle: "Exact location",
      hotelsTitle: "Recommended nearby hotels",
      hotels: [
        {
          name: "Hotel Ejecutivo",
          distance: "300 meters (3 min walk)",
          price: "From $1,200/night",
          rating: "4.2 stars",
          phone: "+52 55 1234 5678"
        },
        {
          name: "City Express Reforma",
          distance: "500 meters (6 min walk)",
          price: "From $950/night",
          rating: "4.0 stars",
          phone: "+52 55 8765 4321"
        },
        {
          name: "Hotel Boutique Juárez",
          distance: "800 meters (10 min walk)",
          price: "From $1,500/night",
          rating: "4.5 stars",
          phone: "+52 55 9876 5432"
        }
      ],
      parkingInfo: "Parking available in the building at $60/day.",
      accessibilityInfo: "The auditorium has access for people with mobility disabilities."
    },

    // SECTION 10: FINAL CTA
    ctaFinal: {
      badge: "LAST SPOTS AVAILABLE",
      title: "Don't miss this opportunity",
      subtitle: "Invest in your professional development and be part of Mexico's most committed liberal lawyers community",
      description: "The most important amparo and human rights congress of the year. Magistrates, academics and elite litigators sharing excellence knowledge.",
      ctaPrimary: "Secure my spot now",
      ctaSecondary: "Contact via WhatsApp",
      newsletter: {
        title: "Receive information about upcoming events",
        placeholder: "email@example.com",
        button: "Subscribe",
        privacy: "We don't share your information. You can unsubscribe anytime."
      },
      trustSignals: {
        limitedSeats: "Limited to 250 attendees",
        officialCert: "Official endorsed certificate",
        expertSpeakers: "12 confirmed national experts"
      }
    }
  }
};
