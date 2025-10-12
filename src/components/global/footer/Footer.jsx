import React from "react";
import styles from "./footer.module.css";
import { useStore } from "@nanostores/react";
import { isEnglish } from "../../../data/variables";

const Footer = () => {
  const ingles = useStore(isEnglish);

  const footerContent = {
    es: {
      copyright: "Barra Mexicana de Abogados Liberales A.C.",
      motto: "¡Que la luz de la razón brille en la justicia!",
      sections: {
        about: {
          title: "Sobre Nosotros",
          links: [
            { text: "Historia", href: "/nosotros#historia" },
            { text: "Pilares Fundamentales", href: "/nosotros#pilares" },
            { text: "Mesa Directiva", href: "/nosotros#mesa" },
            { text: "Código Ético", href: "/codigo-etico" }
          ]
        },
        events: {
          title: "Eventos",
          links: [
            { text: "Congreso 2025", href: "/" },
            { text: "Calendario", href: "/eventos" },
            { text: "Talleres", href: "/eventos#talleres" },
            { text: "Webinars", href: "/eventos#webinars" }
          ]
        },
        contact: {
          title: "Contacto",
          email: "congreso@abogadosliberales.mx",
          phone: "+52 55 1234 5678",
          address: "Ciudad de México"
        }
      },
      scrollTop: "Volver arriba"
    },
    en: {
      copyright: "Mexican Bar of Liberal Lawyers A.C.",
      motto: "May the light of reason shine on justice!",
      sections: {
        about: {
          title: "About Us",
          links: [
            { text: "History", href: "/nosotros#historia" },
            { text: "Core Pillars", href: "/nosotros#pilares" },
            { text: "Board of Directors", href: "/nosotros#mesa" },
            { text: "Code of Ethics", href: "/codigo-etico" }
          ]
        },
        events: {
          title: "Events",
          links: [
            { text: "Congress 2025", href: "/" },
            { text: "Calendar", href: "/eventos" },
            { text: "Workshops", href: "/eventos#talleres" },
            { text: "Webinars", href: "/eventos#webinars" }
          ]
        },
        contact: {
          title: "Contact",
          email: "congreso@abogadosliberales.mx",
          phone: "+52 55 1234 5678",
          address: "Mexico City"
        }
      },
      scrollTop: "Back to top"
    }
  };

  const t = ingles ? footerContent.en : footerContent.es;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className={styles.footer}>
      {/* Franja dorada superior */}
      <div className={styles.goldenStripe}></div>

      <div className={styles.footerContainer}>
        {/* Columna 1: Logo + Lema */}
        <div className={styles.footerColumn}>
          <div className={styles.logoSection}>
            <img src="/favicon.jpg" alt="Barra Mexicana de Abogados Liberales" className={styles.logo} />
            <h3 className={styles.logoTitle}>{t.copyright}</h3>
          </div>
          <p className={styles.motto}>{t.motto}</p>
          
          {/* Redes sociales */}
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/BarraMexicanaAbogadosLiberales" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <img src="/icons/facebook.svg" alt="Facebook" />
            </a>
            <a href="https://www.instagram.com/abogadosliberalesmx" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <img src="/icons/insta.svg" alt="Instagram" />
            </a>
            <a href="https://twitter.com/BarraMexAbogLib" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <img src="/icons/twitter.svg" alt="Twitter" />
            </a>
            <a href="https://www.linkedin.com/company/barra-mexicana-abogados-liberales" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <img src="/icons/linkedin.svg" alt="LinkedIn" />
            </a>
          </div>
        </div>

        {/* Columna 2: Sobre Nosotros */}
        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>{t.sections.about.title}</h4>
          <ul className={styles.linkList}>
            {t.sections.about.links.map((link, index) => (
              <li key={index}>
                <a href={link.href} className={styles.footerLink}>{link.text}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Eventos */}
        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>{t.sections.events.title}</h4>
          <ul className={styles.linkList}>
            {t.sections.events.links.map((link, index) => (
              <li key={index}>
                <a href={link.href} className={styles.footerLink}>{link.text}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 4: Contacto */}
        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>{t.sections.contact.title}</h4>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactIcon}>📧</span>
              <a href={`mailto:${t.sections.contact.email}`} className={styles.contactLink}>
                {t.sections.contact.email}
              </a>
            </li>
            <li>
              <span className={styles.contactIcon}>📱</span>
              <span className={styles.contactText}>{t.sections.contact.phone}</span>
            </li>
            <li>
              <span className={styles.contactIcon}>📍</span>
              <span className={styles.contactText}>{t.sections.contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer bottom */}
      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} {t.copyright}. Todos los derechos reservados.
        </div>
        
        <div className={styles.scrollTop} onClick={scrollToTop}>
          <span className={styles.scrollText}>{t.scrollTop}</span>
          <span className={styles.arrowIcon}>⬆️</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
