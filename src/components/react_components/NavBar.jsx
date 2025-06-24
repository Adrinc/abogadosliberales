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
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const country = useStore(selectedCountry);
  const { t, changeLang, lang } = useLang();
  const ingles = useStore(isEnglish);
  const textosNavbar = ingles ? translations.en.navbar : translations.es.navbar;

  useEffect(() => {
    // Detectar scroll para efectos de navbar
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
      
      if (isOpen) {
        setIsOpen(false);
      }
    };

    // Detectar cambios de tamaño de ventana
    const handleResize = () => {
      // Si la ventana es mayor a 900px y el menú está abierto, cerrarlo
      if (window.innerWidth > 900 && isOpen) {
        setIsOpen(false);
      }
    };

    // Detectar la página actual
    setCurrentPath(window.location.pathname);

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Función para alternar el menú en móviles
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Función para manejar el cambio de país en el switch
  const handleSwitch = (country) => {
    selectedCountry.set(country);
    if (country === "mex") {
      isEnglish.set(false);
      changeLang("es");
    } else if (country === "usa") {
      isEnglish.set(true);
      changeLang("en");
    }
  };

  // Función para verificar si el enlace está activo
  const isActiveLink = (href) => {
    if (href === "/" && currentPath === "/") return true;
    if (href !== "/" && currentPath.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      {/* Overlay para móvil */}
      {isOpen && <div className={styles.overlay} onClick={toggleMenu} />}
      
      {/* Logo con efecto de hover mejorado */}
      <div className={styles.logopic}>
        <img src="/logo_nh_b.png" alt="NetHive Logo" />
        <div className={styles.logoGlow}></div>
      </div>

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
            href="/funcionalidades" 
            className={`${styles.navLink} ${isActiveLink("/funcionalidades") ? styles.activeLink : ""}`}
          >
            {textosNavbar.funcionalidades}
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="/precios" 
            className={`${styles.navLink} ${isActiveLink("/precios") ? styles.activeLink : ""}`}
          >
            {textosNavbar.precios}
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="/soporte" 
            className={`${styles.navLink} ${isActiveLink("/soporte") ? styles.activeLink : ""}`}
          >
            {textosNavbar.soporte}
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
          <a className={`${styles.buyButton} ${styles.mobileLoginButton}`} href="#registrarse">
            <span className={styles.buttonText}>{textosNavbar.iniciarSesion}</span>
            <div className={styles.buttonShine}></div>
          </a>
        </li>
      </ul>

      {/* Grupo de íconos sociales con efectos mejorados */}
      <div className={styles.socialIconsGroup}>
        <a href="https://www.linkedin.com/company/nethive" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/icons/linkedin.svg" alt="LinkedIn" className={styles.icon} />
          <div className={styles.iconRipple}></div>
        </a>
        <a href="https://twitter.com/nethive" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/icons/twitter.svg" alt="Twitter" className={styles.icon} />
          <div className={styles.iconRipple}></div>
        </a>
        <a href="mailto:info@nethive.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/icons/email.svg" alt="Email" className={styles.icon} />
          <div className={styles.iconRipple}></div>
        </a>
      </div>

      {/* Switch de países mejorado */}
      <div className={styles.countrySwitch}>
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
      </div>

      {/* Botón de contacto con efectos premium */}
      <div className={styles.desktopOnly}>
        <a className={styles.buyButton} href="#registrarse">
          <span className={styles.buttonText}>{textosNavbar.iniciarSesion}</span>
          <div className={styles.buttonShine}></div>
        </a>
      </div>
    </nav>
  );
};

export default NavBar;
