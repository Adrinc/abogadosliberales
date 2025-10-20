import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/avisoPrivacidad.module.css';

const AvisoPrivacidadSeccion = () => {
  const ingles = useStore(isEnglish);

  const content = {
    es: {
      title: "Aviso de Privacidad",
      subtitle: "Barra Mexicana de Ciencias Jurídicas y Profesionales Liberales del Derecho A.C.",
      motto: "Que la Luz de la Razón Brille en la Justicia",
      sections: [
        {
          title: "Protección de Datos Personales",
          subtitle: "En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares",
          content: [
            "En términos del artículo 15 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, la Barra Mexicana de Ciencias Jurídicas y Profesionales Liberales del Derecho A.C., con domicilio en Homero número 229, despacho 501, col. Polanco V Sección, demarcación Miguel Hidalgo código postal 11560, Ciudad de México, recaba los datos contenidos en los formularios de inscripción, físicos o electrónicos a eventos académicos y al sistema de afiliación para la recepción de servicios profesionales relacionados con la academia o el ejercicio de la profesión de abogado; así como o cuestionarios de recepción de servicios jurídicos y/o cualquier otro que se genere de la provisión de servicios profesionales que presta esta Asociación, con la finalidad de gestionar y/o procesar su inscripción, recepción y en su caso evaluación en los eventos académicos que organiza, o bien la provisión de servicios profesionales relacionados con la academia o el ejercicio de la profesión de abogado, además de las asesorías jurídicas y/o representación legal ante cualquier órgano administrativo o jurisdiccional competente, según sea el caso, que se presta al público en general, así como cualquier otro servicio prestado por esta Asociación Profesional o cualquiera de sus asociados, representantes o trabajadores que actúe en su nombre o por su intermediación; siendo en este último caso (el de intermediación) que esta Asociación adquiere únicamente los datos proporcionados para gestionar la intermediación y de ninguna manera es responsable del uso o protección que proporcione al ente intermediado que recabe datos adicionales directamente del usuario del servicio.",
            "El formulario, cuestionario o documento por el que se recaben los datos personales, quedará registrado en nuestros archivos electrónicos y/o físicos, según su forma de recepción y/o procesamiento, conforme al evento de prestación de servicios que se lleve a cabo. El uso de los datos se limitará a su operación para la prestación del servicio que se haya solicitado y/o proporcionado y únicamente podrá ser compartido con terceros, cuando su recolección se dé a través de la prestación de un servicio que implique trato con terceros, tal como la provisión de servicios profesionales relacionados con la academia o el ejercicio de la profesión de abogado, mediante el sistema de afiliación de profesionales del Derecho para la recepción de descuentos en establecimientos con convenio, o advierta que dichos terceros pueden proporcionarle algún descuento o ventaja en la adquisición de algún producto o servicio relacionado con los servicios que le prestó al Titular esta Asociación Profesional."
          ]
        },
        {
          title: "Ejercicio de Derechos ARCO",
          subtitle: "Acceso, Rectificación, Cancelación y Oposición",
          content: [
            "En caso de que con posterioridad a la entrega de los datos personales a esta Asociación, su Titular requiera accesar, rectificar o cancelar los mismos en nuestros registros y/o archivos, podrá hacerlo mediante solicitud a través de correo electrónico dirigido a la Secretaría General de la Barra Mexicana de Ciencias Jurídicas y Abogados Liberales, al correo electrónico:",
          ],
          email: "secretariageneral@abogadosliberales.mx"
        },
        {
          title: "Datos Personales Sensibles",
          content: [
            "Se hace de su conocimiento que se consideran como datos personales sensibles el origen racial o étnico, estado de salud presente y futuro, información genética, creencias religiosas, filosóficas y morales, afiliación sindical, opiniones políticas, preferencia sexual, además la ley señala que se consideran sensibles aquellos datos que afecten a la esfera más íntima de su titular, o cuya utilización indebida pueda dar origen a discriminación o conlleve un riesgo grave para éste."
          ]
        },
        {
          title: "Modificaciones al Aviso de Privacidad",
          content: [
            "De efectuarse modificaciones a la política de privacidad se le dará el aviso respectivo a través del sitio web:"
          ],
          url: "www.abogadosliberales.mx/aviso-privacidad"
        }
      ],
      contact: {
        title: "Datos de Contacto",
        organization: "Barra Mexicana de Ciencias Jurídicas y Profesionales Liberales del Derecho A.C.",
        address: "Homero 229, Despacho 501, Col. Polanco V Sección, Miguel Hidalgo, C.P. 11560, Ciudad de México",
        email: "secretariageneral@abogadosliberales.mx"
      },
      footer: "Todos los derechos reservados",
      lastUpdated: "Última actualización: 12 de julio de 2024"
    },
    en: {
      title: "Privacy Notice",
      subtitle: "Mexican Bar of Legal Sciences and Liberal Law Professionals A.C.",
      motto: "May the Light of Reason Shine in Justice",
      sections: [
        {
          title: "Personal Data Protection",
          subtitle: "In compliance with the Federal Law on Protection of Personal Data Held by Private Parties",
          content: [
            "In accordance with Article 15 of the Federal Law on Protection of Personal Data Held by Private Parties, the Mexican Bar of Legal Sciences and Liberal Law Professionals A.C., with address at Homero 229, office 501, Polanco V Section, Miguel Hidalgo, postal code 11560, Mexico City, collects data contained in registration forms, physical or electronic, for academic events and the membership system for receiving professional services related to academia or the practice of law; as well as questionnaires for receiving legal services and/or any other generated from the provision of professional services provided by this Association, with the purpose of managing and/or processing your registration, reception and, where applicable, evaluation in the academic events it organizes, or the provision of professional services related to academia or the practice of law, in addition to legal advice and/or legal representation before any competent administrative or jurisdictional body, as applicable, that is provided to the general public, as well as any other service provided by this Professional Association or any of its associates, representatives or workers acting on its behalf or through its intermediation; being in this last case (intermediation) that this Association only acquires the data provided to manage the intermediation and is in no way responsible for the use or protection provided by the intermediated entity that collects additional data directly from the service user.",
            "The form, questionnaire or document by which personal data is collected will be recorded in our electronic and/or physical files, according to its form of reception and/or processing, in accordance with the service provision event that takes place. The use of data will be limited to its operation for the provision of the service that has been requested and/or provided and may only be shared with third parties when its collection occurs through the provision of a service that involves dealing with third parties, such as the provision of professional services related to academia or the practice of law, through the membership system of Law professionals for receiving discounts at establishments with agreements, or advises that such third parties may provide you with a discount or advantage in acquiring a product or service related to the services provided to the Holder by this Professional Association."
          ]
        },
        {
          title: "Exercise of ARCO Rights",
          subtitle: "Access, Rectification, Cancellation and Opposition",
          content: [
            "In the event that after the delivery of personal data to this Association, its Holder requires access, rectification or cancellation of the same in our records and/or files, they may do so by requesting via email addressed to the General Secretariat of the Mexican Bar of Legal Sciences and Liberal Lawyers, at the email:",
          ],
          email: "secretariageneral@abogadosliberales.mx"
        },
        {
          title: "Sensitive Personal Data",
          content: [
            "Please note that sensitive personal data includes racial or ethnic origin, present and future health status, genetic information, religious, philosophical and moral beliefs, union affiliation, political opinions, sexual preference. Additionally, the law states that data affecting the most intimate sphere of the holder, or whose improper use may give rise to discrimination or entail a serious risk for them, are considered sensitive."
          ]
        },
        {
          title: "Modifications to Privacy Notice",
          content: [
            "If modifications are made to the privacy policy, you will be notified through the website:"
          ],
          url: "www.abogadosliberales.mx/aviso-privacidad"
        }
      ],
      contact: {
        title: "Contact Information",
        organization: "Mexican Bar of Legal Sciences and Liberal Law Professionals A.C.",
        address: "Homero 229, Office 501, Polanco V Section, Miguel Hidalgo, Postal Code 11560, Mexico City",
        email: "secretariageneral@abogadosliberales.mx"
      },
      footer: "All rights reserved",
      lastUpdated: "Last updated: July 12, 2024"
    }
  };

  const t = ingles ? content.en : content.es;

  return (
    <div className={styles.avisoContainer}>
      {/* Header con franja dorada */}
      <div className={styles.headerSection}>
        <div className={styles.goldenBar}></div>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <img src="/favicon.jpg" alt="Barra Mexicana de Abogados Liberales" className={styles.logo} />
          </div>
          <h1 className={styles.mainTitle}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
          <p className={styles.motto}>"{t.motto}"</p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          
          {/* Secciones del aviso */}
          {t.sections.map((section, index) => (
            <section key={index} className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</div>
                <div>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  {section.subtitle && (
                    <p className={styles.sectionSubtitle}>{section.subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className={styles.sectionContent}>
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
                
                {section.email && (
                  <div className={styles.highlightBox}>
                    <div className={styles.emailIcon}>📧</div>
                    <a href={`mailto:${section.email}`} className={styles.emailLink}>
                      {section.email}
                    </a>
                  </div>
                )}
                
                {section.url && (
                  <div className={styles.highlightBox}>
                    <div className={styles.webIcon}>🌐</div>
                    <a href={`https://${section.url}`} className={styles.webLink} target="_blank" rel="noopener noreferrer">
                      {section.url}
                    </a>
                  </div>
                )}
              </div>
            </section>
          ))}

          {/* Información de contacto */}
          <section className={styles.contactSection}>
            <h2 className={styles.contactTitle}>{t.contact.title}</h2>
            <div className={styles.contactCard}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>🏢</div>
                <div style={{ flex: 1, minWidth: 0 }}> {/* Añadido minWidth: 0 para forzar contención */}
                  <p className={styles.contactLabel}>{ingles ? "Organization" : "Organización"}</p>
                  <p className={styles.contactValue}>{t.contact.organization}</p>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>📍</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={styles.contactLabel}>{ingles ? "Address" : "Dirección"}</p>
                  <p className={styles.contactValue}>{t.contact.address}</p>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>✉️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={styles.contactLabel}>{ingles ? "Email" : "Correo Electrónico"}</p>
                  <a href={`mailto:${t.contact.email}`} className={styles.contactEmail}>
                    {t.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Footer de la página */}
          <div className={styles.pageFooter}>
            <p className={styles.lastUpdated}>{t.lastUpdated}</p>
            <p className={styles.copyright}>© 2024-2025 {t.contact.organization}</p>
            <p className={styles.rights}>{t.footer}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AvisoPrivacidadSeccion;
