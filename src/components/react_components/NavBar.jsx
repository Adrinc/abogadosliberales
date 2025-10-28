import React, { useState, useEffect, useRef } from "react";
import styles from "./navbar.module.css";

import { useStore } from "@nanostores/react";
import { isEnglish, selectedCountry } from "../../data/variables"; 
import { useLang } from "../../data/signals";
import { translations } from "../../data/translations";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [currentHash, setCurrentHash] = useState("");
  const [activeSection, setActiveSection] = useState(""); // Nueva: sección activa por scroll
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const country = useStore(selectedCountry);
  const { t, changeLang, lang } = useLang();
  const ingles = useStore(isEnglish);
  const textosNavbar = ingles ? translations.en.navbar : translations.es.navbar;

  useEffect(() => {
    // Detectar scroll para efectos de navbar Y detección de secciones
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
      
      if (isOpen) {
        setIsOpen(false);
      }

      // Detectar sección activa por scroll (solo en página principal)
      if (window.location.pathname === "/") {
        // Lista de IDs de secciones en orden EXACTO de aparición en index.astro
        const sections = [
          'programa',        // Sección 4 - primera con ID
          'inscripcion',     // Sección 5
          'testimonios',     // Sección 6
          'sobre-barra',     // Sección 7
          'como-llegar',     // Sección 9
          'cta-final',       // Sección 10
          'faqs'             // Sección 8 - última
        ];

        // Si estamos en el tope de la página (primeros 100px), marcar "inicio"
        if (scrollPosition < 100) {
          setActiveSection("");
          setCurrentHash("");
          return;
        }

        // Buscar la sección visible actual
        let currentSection = "";
        
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Si la sección está visible en el viewport (con offset de navbar)
            if (rect.top <= 100 && rect.bottom >= 100) {
              currentSection = sectionId;
              break;
            }
          }
        }

        if (currentSection) {
          setActiveSection(currentSection);
          // No actualizar el hash real para no afectar el historial
        } else if (scrollPosition >= 100) {
          // Si no hay sección específica pero no estamos en el tope
          setActiveSection("");
        }
      }
    };

    // Detectar cambios de tamaño de ventana
    const handleResize = () => {
      // Si la ventana es mayor a 900px y el menú está abierto, cerrarlo
      if (window.innerWidth > 900 && isOpen) {
        setIsOpen(false);
      }
    };

    // Detectar cambios en la URL (navegación)
    const handleLocationChange = () => {
      const newPath = window.location.pathname;
      const newHash = window.location.hash;

      setCurrentPath(newPath);
      setCurrentHash(newHash);
      
      // Si hay hash, actualizar también activeSection
      if (newHash) {
        const sectionId = newHash.replace('#', '');
        setActiveSection(sectionId);
      } else if (newPath === "/") {
        setActiveSection("");
      }
      
      // Cerrar el menú móvil al navegar
      if (isOpen) {
        setIsOpen(false);
      }
    };

    // Detectar la página actual inicialmente
    setCurrentPath(window.location.pathname);
    setCurrentHash(window.location.hash);
    
    // Detectar sección activa inicial si hay hash
    if (window.location.hash) {
      const sectionId = window.location.hash.replace('#', '');
      setActiveSection(sectionId);
    }

    // Event listeners
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // Listener para detectar cambios en la URL (popstate para botón atrás/adelante)
    const handlePopState = () => {
      handleLocationChange();
    };

    // Listener personalizado para detectar navegación programática
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(handleLocationChange, 0); // Defer to next tick
    };

    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(handleLocationChange, 0); // Defer to next tick
    };

    // Listener específico para Astro view transitions
    const handleAstroBeforeSwap = () => {
      setTimeout(handleLocationChange, 0);
    };

    const handleAstroAfterSwap = () => {
      setTimeout(handleLocationChange, 100); // Dar más tiempo para que Astro complete
    };

    // Listener para cualquier cambio en el DOM que indique navegación
    const observer = new MutationObserver(() => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        handleLocationChange();
      }
    });

    // Observar cambios en el title del documento (Astro lo cambia en navegación)
    observer.observe(document.querySelector('title') || document.head, {
      childList: true,
      characterData: true
    });

    // Polling como fallback para casos edge
    const pathCheckInterval = setInterval(() => {
      const newPath = window.location.pathname;
      const newHash = window.location.hash;
      if (newPath !== currentPath || newHash !== currentHash) {
        handleLocationChange();
      }
    }, 100);

    // Listener para detectar cambios en el hash específicamente
    const handleHashChange = () => {
      const newHash = window.location.hash;
      setCurrentHash(newHash);
      
      // Actualizar activeSection cuando cambia el hash
      if (newHash) {
        const sectionId = newHash.replace('#', '');
        setActiveSection(sectionId);
      } else {
        setActiveSection("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    
    // Listeners específicos para Astro
    document.addEventListener('astro:before-swap', handleAstroBeforeSwap);
    document.addEventListener('astro:after-swap', handleAstroAfterSwap);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('astro:before-swap', handleAstroBeforeSwap);
      document.removeEventListener('astro:after-swap', handleAstroAfterSwap);
      document.body.style.overflow = '';
      
      // Limpiar observer y polling
      observer.disconnect();
      clearInterval(pathCheckInterval);
      
      // Restaurar métodos originales
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [isOpen, currentPath, currentHash, activeSection]); // Agregar activeSection como dependencia

  // Función para alternar el menú en móviles
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Función para manejar el cambio de país en el switch (DESHABILITADA - solo español)
  const handleSwitch = (country) => {
    // FORZAR ESPAÑOL SIEMPRE
    selectedCountry.set("mex");
    isEnglish.set(false);
    changeLang("es");
  };

  // Función para verificar si el enlace está activo
  const isActiveLink = (href) => {
    // Caso 1: Enlace a la página principal "/"
    if (href === "/") {
      // "Inicio" está activo SOLO si:
      // - Estamos en la página principal Y
      // - NO hay hash activo Y
      // - NO hay sección activa por scroll
      return currentPath === "/" && !currentHash && !activeSection;
    }
    
    // Caso 2: Enlaces a otras páginas completas (sin hash)
    if (!href.includes("#")) {
      return currentPath.startsWith(href);
    }
    
    // Caso 3: Enlaces a secciones ancladas (con hash)
    const hrefHash = href.includes("#") ? href.split("#")[1] : "";
    
    // Si estamos en la misma página, verificar si la sección está activa
    if (currentPath === "/" || currentPath === href.split("#")[0]) {
      // Priorizar activeSection (detección por scroll) sobre currentHash
      if (activeSection) {
        return activeSection === hrefHash;
      }
      // Fallback al hash en la URL
      return currentHash === `#${hrefHash}`;
    }
    
    return false;
  };

  // Manejar click en el logo para ir a home
  const handleLogoClick = (e) => {
    e.preventDefault();
    window.location.href = "/";
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      {/* Overlay para móvil */}
      {isOpen && <div className={styles.overlay} onClick={toggleMenu} />}
      
      {/* Logo con efecto de hover mejorado */}
      <a href="/" className={styles.logopic} onClick={handleLogoClick} tabIndex={0} aria-label="Ir a inicio">
        <img src="/favicon.jpg" alt="Barra Mexicana de Abogados Liberales" />
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>Abogados Liberales</div>
          <div className={styles.logoSubtitle}>Lux Iustitia</div>
        </div>
        <div className={styles.logoGlow}></div>
      </a>

      {/* Switch de países mejorado */}
 {/*      <div className={styles.countrySwitch}>
        <div
          className={`${styles.switchIconContainer} ${country === "mex" ? styles.active : styles.inactive}`}
          onClick={() => handleSwitch("mex")}
        >
          <img src="/icons/icon_mex.webp" alt="Mexico" className={styles.switchIcon} />
        </div>
        <div
          className={`${styles.switchIconContainer} ${country === "usa" ? styles.active : styles.inactive}`}
          onClick={() => handleSwitch("usa")}
        >
          <img src="/icons/icon_usa.webp" alt="USA" className={styles.switchIcon} />
        </div>
        <div className={styles.switchIndicator}></div>
      </div> */}

      {/* Ícono de menú hamburguesa animado */}
      <div 
        className={`${styles.hamburger} ${isOpen ? styles.active : ""}`} 
        onClick={toggleMenu} 
        ref={buttonRef}
        aria-label="Toggle menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </div>

      {/* Menú de navegación con indicadores activos */}
      {/* 
        TEMPORAL (BETA): Los siguientes enlaces apuntan a secciones de la landing
        hasta que se creen las páginas completas:
        - "Programa" → /#programa (Sección 4)
        - "Inscripción" → /#inscripcion (Sección 5)
        - "Cómo llegar" → /#como-llegar (Sección con ubicación/mapa)
        
        TODO: Restaurar a enlaces originales cuando las páginas estén listas:
        - "Congreso 2025" → /congreso
        - "Membresía" → /membresia
      */}
      <ul className={`${styles.navMenu} ${isOpen ? styles.active : ""}`} ref={menuRef}>
        <li className={styles.navItem}>
          <a 
            href="/" 
            className={`${styles.navLink} ${isActiveLink("/") ? styles.activeLink : ""}`}
          >
            {textosNavbar.inicio}
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="/#programa" 
            className={`${styles.navLink} ${isActiveLink("/#programa") ? styles.activeLink : ""}`}
          >
            Programa
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="/#inscripcion" 
            className={`${styles.navLink} ${isActiveLink("/#inscripcion") ? styles.activeLink : ""}`}
          >
            Inscripción
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="/#como-llegar" 
            className={`${styles.navLink} ${isActiveLink("/#como-llegar") ? styles.activeLink : ""}`}
          >
            {textosNavbar.comoLlegar}
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="/contacto" 
            className={`${styles.navLink} ${isActiveLink("/contacto") ? styles.activeLink : ""}`}
          >
            {textosNavbar.contacto}
          </a>
        </li>
        
        {/* Botón de login separado para móvil */}
        <li className={`${styles.navItem} ${styles.mobileLoginItem} ${styles.mobileOnly}`}>
          <a className={`${styles.buyButton} ${styles.mobileLoginButton}`} href="/registro">
            <span className={styles.buttonText}>{textosNavbar.adquirirEntrada}</span>
            <div className={styles.buttonShine}></div>
          </a>
        </li>
      </ul>

      {/* Grupo de íconos sociales con efectos mejorados */}
      <div className={styles.socialIconsGroup}>
        <a href="https://www.facebook.com/p/Barra-Mexicana-de-Abogados-Liberales-61564196123876/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/icons/facebook.svg" alt="Facebook" className={styles.icon} />
          <div className={styles.iconRipple}></div>
        </a>
        <a href="https://www.instagram.com/abogadosliberalesmx" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/icons/insta.svg" alt="Instagram" className={styles.icon} />
          <div className={styles.iconRipple}></div>
        </a>
        <a href="https://twitter.com/BarraMexAbogLib" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/icons/twitter.svg" alt="Twitter" className={styles.icon} />
          <div className={styles.iconRipple}></div>
        </a>
        <a href="https://www.linkedin.com/company/barra-mexicana-abogados-liberales" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/icons/linkedin.svg" alt="LinkedIn" className={styles.icon} />
          <div className={styles.iconRipple}></div>
        </a>
      </div>

      {/* Botón de contacto con efectos premium */}
      <div className={styles.desktopOnly}>
        <a className={styles.buyButton} href="/registro">
          <span className={styles.buttonText}>{textosNavbar.adquirirEntrada}</span>
          <div className={styles.buttonShine}></div>
        </a>
      </div>
    </nav>
  );
};

export default NavBar;
