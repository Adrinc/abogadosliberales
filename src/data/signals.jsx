// src/data/signals.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";
import { isEnglish } from "./variables";

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  // FORZAR ESPAÑOL: Ya no se usa inglés en el portal
  // Se ignora localStorage y la configuración del navegador
  const browserLang = "es";

  const [lang, setLang] = useState(browserLang);

  const t = translations[lang] || translations.es;
  
  // Limpiar localStorage al iniciar para usuarios que tenían inglés guardado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("lang");
      if (storedLang === "en") {
        localStorage.removeItem("lang");
        localStorage.setItem("lang", "es");
      }
    }
  }, []);

  const changeLang = (newLang) => {
    // Ya no se permite cambiar idioma - siempre español
    setLang("es");
    localStorage.setItem("lang", "es");
    isEnglish.set(false);
  };

  useEffect(() => {
    // Forzar español siempre
    isEnglish.set(false);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
