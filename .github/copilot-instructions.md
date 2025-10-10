# Instrucciones Copilot - Barra Mexicana de Abogados Liberales

## Descripción General del Proyecto
Esta es una aplicación web híbrida **Astro + React** para la **Barra Mexicana de Abogados Liberales** - asociación jurídica fundada el 12 de julio de 2024, enfocada en la defensa de la justicia social, derechos humanos y ética profesional. El sitio es bilingüe (ES/EN) con enfoque institucional, académico y comprometido con los valores del liberalismo jurídico.

### Identidad de la Organización
- **Nombre oficial**: Barra Mexicana de Abogados Liberales
- **Lema**: "¡Que la luz de la razón brille en la justicia!"
- **Lema en latín**: "Lux Iustitia" (Luz de la Justicia) + "Excellentium" (Excelencia)
- **Fundación**: 12 de julio de 2024
- **Membresía premium**: "Lux Iustitia Excellentium"

### Pilares Fundamentales (3 Core)
1. **Justicia Social** - Defensa estratégica de derechos humanos y acceso a la justicia
2. **Ética Profesional** - Excelencia, transparencia y responsabilidad en el ejercicio del Derecho
3. **Filantropía Jurídica** - Asesoría pro bono, formación comunitaria, impacto social

## ⚡ Reglas de Oro (Leer Primero)

### 1. Estructura de Páginas y Componentes
```
src/pages/{nombre}.astro  →  src/components/{nombre}/
```
- **Cada página `.astro`** tiene su carpeta con el **mismo nombre** en `src/components/`
- Ejemplo: `index.astro` → `src/components/index/`

### 2. Layout Predeterminado
```astro
import LayoutBasic from '../layouts/LayoutBasic.astro'; // SIEMPRE usar este
```
**NO cambiar** a menos que se indique explícitamente.

### 3. Estructura de Carpetas de Componentes
```
src/components/{nombre-pagina}/
├── Secciones/           # IndexSeccion1.jsx, IndexSeccion2.jsx, etc.
├── components/          # Componentes SOLO de esta página
└── css/                 # indexSeccion1.module.css, indexSeccion2.module.css
```

### 4. Nomenclatura de Archivos
- **JSX**: `PascalCase` → `IndexSeccion1.jsx`, `CongresoSeccion2.jsx`
- **CSS**: `camelCase` + `.module.css` → `indexSeccion1.module.css`, `congresoSeccion2.module.css`

### 5. Traducciones
```
src/data/translations{NombrePagina}.js
```
- `translationsIndex.js` para `index.astro`
- `translationsCongreso.js` para `congreso.astro`
- `translationsNosotros.js` para `nosotros.astro`
- `translations.js` para elementos globales (navbar, footer)

### 6. Componentes Globales
```
src/components/global/  # NavBar, Footer, componentes compartidos
```
**NO** mezclar con componentes específicos de página.

### 7. Responsive Design
**TODO** debe funcionar en móvil, tablet y desktop. Siempre incluir media queries.

### 8. Sistema de Diseño "Lux Iustitia"
**Concepto visual**: Institucional + solemne + académico + luz y justicia.

**Palabras clave**: elegancia, seriedad, confianza, sabiduría, razón, dignidad.

**Regla 70/20/10**: 70% neutros (blanco, gris claro), 20% azul (institucional), 10% dorado (luz/excelencia).

---

## 🎨 Sistema de Diseño "Lux Iustitia"

### Filosofía Visual
El diseño de Abogados Liberales fusiona:
- **Institucionalidad**: Seriedad corporativa, confianza, tradición jurídica
- **Humanismo**: Calidez, accesibilidad, enfoque social
- **Iluminación**: La razón como luz que guía la justicia

### Paleta de Colores y Atmósferas

#### **Uso por Sección**
- **Base clara** (secciones informativas): Blanco puro con grises suaves
- **Bloques institucionales** (autoridad): Azul marino profundo con dorado
- **Acentos estratégicos**: Dorado SOLO en highlights, insignias y elementos de prestigio

#### **Variables CSS Disponibles** (en `LayoutBasic.astro`):
```css
/* PALETA CORE */
--al-blue-primary: #020266;        /* Azul marino institucional (marca, headers) */
--al-blue-700: #020266;            /* Azul oscuro profundo */
--al-blue-800: #05054F;            /* Azul midnight (footer, fondos oscuros) */
--al-blue-midnight: #0B0B2B;       /* Azul casi negro (gradientes) */

/* DORADO (LUZ) */
--al-gold-primary: #EECB00;        /* Dorado brillante (acentos, insignias) */
--al-gold-500: #EECB00;            /* Dorado estándar */
--al-gold-light: #F4D672;          /* Dorado claro (hovers) */

/* NEUTROS */
--al-bg-white: #FFFFFF;            /* Fondo blanco puro */
--al-bg-light: #F8FAFC;            /* Gris muy claro (fondos alternos) */
--al-bg-soft: #F4F6FF;             /* Azul muy suave (secciones suaves) */
--al-border-light: #E2E8F0;        /* Bordes sutiles */
--al-text-primary: #1A202C;        /* Texto principal (casi negro) */
--al-text-secondary: #4A5568;      /* Texto secundario (gris oscuro) */
--al-text-light: #FFFFFF;          /* Texto sobre azul */

/* GRADIENTES */
--al-gradient-blue-midnight: linear-gradient(180deg, #020266, #0B0B2B);
--al-gradient-blue-gold: linear-gradient(135deg, #020266, #EECB00);
--al-gradient-overlay: linear-gradient(to bottom, rgba(2,2,102,0.55), rgba(0,0,0,0.8));
```

### Tipografía Institucional

#### **Fuentes**
- **Headlines**: `--al-font-headline` (Merriweather o EB Garamond) - Elegancia serif clásica
- **Body/UI**: `--al-font-body` (Inter o Source Sans 3) - Legibilidad moderna

#### **Escala Tipográfica** (responsive)
```css
--al-text-h1: clamp(2.5rem, 4vw, 3.5rem);      /* 40-56px */
--al-text-h2: clamp(2rem, 3vw, 2.5rem);        /* 32-40px */
--al-text-h3: clamp(1.5rem, 2vw, 1.875rem);    /* 24-30px */
--al-text-body: clamp(1rem, 1.5vw, 1.125rem);  /* 16-18px */
--al-text-caption: 0.875rem;                   /* 14px */
```

#### **Line Heights**
```css
--al-leading-tight: 1.25;   /* Titulares institucionales */
--al-leading-normal: 1.5;   /* Body text */
--al-leading-relaxed: 1.75; /* Textos largos, académicos */
```

**Tracking**: Ligeramente amplio (+0.01em) en H1 para dignidad y claridad.

### Composición y Ritmo Visual

#### **Grid System**
- **12 columnas** con espaciado equilibrado
- **Max-width**: 1280px para contenido principal, 1440px para secciones full
- **Gutters**: 20-40px (responsive con `clamp`)

#### **Simetría Institucional**
- Layouts centrados y balanceados
- Cards con radios moderados: `--al-radius-md` (12px) o `--al-radius-lg` (16px)
- Evitar asimetrías excesivas (mantener orden visual)

#### **Separadores Elegantes**
- Líneas horizontales sutiles (1-2px, color dorado o gris claro)
- Transiciones suaves entre secciones con cambios de fondo

### Tratamiento de Imagen y Video

#### **Color Grading**
- Tono neutro profesional, ligeramente cálido
- **Contraste equilibrado** (no dramático)
- Uso de clase `.professional-tone` para imágenes institucionales

#### **Formatos Mixtos**
- Video hero: 16:9, calidad profesional
- Fotos de eventos: 4:3 o 16:9
- Retratos de ponentes: 1:1 (circulares o cuadradas)

#### **Overlays sobre Video**
```css
.videoOverlay {
  background: linear-gradient(to bottom, 
    rgba(2, 2, 102, 0.55), 
    rgba(0, 0, 0, 0.8)
  );
}
```
- Siempre asegurar legibilidad de texto sobre video
- Contraste mínimo AA (4.5:1)

### Motion y Microinteracciones

#### **Easing Institucional**
```css
--al-ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);     /* Suave y profesional */
--al-ease-gentle: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Muy suave */
```

#### **Patrones de Animación**
- **Hero**: Fade + translateY suave (300-400ms)
- **Cards**: Elevación mínima al hover (2-4px)
- **Scroll**: Fade-in sin parallax agresivo
- **Transiciones**: 250-300ms para cambios de estado

#### **Respeto por "Reduce Motion"**
```css
@media (prefers-reduced-motion: reduce) {
  * { 
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Sombras Profesionales (2 Capas)

```css
/* Capa 1: Sombra de card estándar */
--al-shadow-card: 
  0 4px 12px rgba(2, 2, 102, 0.08),
  0 2px 4px rgba(2, 2, 102, 0.04);

/* Capa 2: Hover elevado */
--al-shadow-card-hover: 
  0 8px 20px rgba(2, 2, 102, 0.12),
  0 4px 8px rgba(2, 2, 102, 0.06);

/* Capa 3: Modal/destacado */
--al-shadow-elevated: 
  0 12px 28px rgba(2, 2, 102, 0.15),
  0 6px 12px rgba(2, 2, 102, 0.08);
```

**Resultado**: Profundidad sutil y profesional, nunca dramática.

### Componentes con Carácter

#### **Botón Primario**
```css
.btnPrimary {
  background: var(--al-blue-primary);
  color: var(--al-text-light);
  padding: 14px 32px;
  border-radius: var(--al-radius-md);
  font-weight: 600;
  transition: all 0.3s var(--al-ease-smooth);
}

.btnPrimary:hover {
  background: var(--al-gold-primary);
  color: var(--al-blue-primary);
  transform: translateY(-2px);
  box-shadow: var(--al-shadow-card-hover);
}
```

#### **Botón Secundario**
```css
.btnSecondary {
  border: 2px solid var(--al-blue-primary);
  background: transparent;
  color: var(--al-blue-primary);
}

/* En secciones oscuras */
.btnSecondaryDark {
  border: 2px solid var(--al-text-light);
  color: var(--al-text-light);
  background: rgba(255, 255, 255, 0.1);
}
```

#### **Badges/Insignias**
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--al-radius-full);
  background: rgba(238, 203, 0, 0.15); /* Dorado al 15% */
  color: var(--al-blue-primary);
  font-size: var(--al-text-caption);
  font-weight: 600;
  border: 1px solid var(--al-gold-primary);
}
```

#### **Tarjetas de Ponentes/Eventos**
```jsx
<div className={styles.card}>
  <div className={styles.badge}>Magistrado</div>
  <img src={fotoPonente} className={styles.avatar} />
  <h3 className={styles.name}>{nombre}</h3>
  <p className={styles.role}>{cargo}</p>
  <p className={styles.institution}>{institucion}</p>
</div>
```

### Voz y Copy (Institucional con Alma)

#### **Titulares**
- **Solemnes, inspiradores**: "La justicia como derecho humano", "Excelencia en el ejercicio del Derecho"
- **Claridad + dignidad**: No sacrificar precisión por creatividad

#### **Microcopy**
- Siempre formal pero accesible
- Ejemplo: "Adquiera su acceso ahora" (no "Compra ya")
- "Certificado oficial de participación" (no "Constancia")

### Accesibilidad y Calidad

#### **Contraste**
- ✅ Blanco sobre azul `#020266` ≈ **12:1** (AAA)
- ✅ Texto `#1A202C` sobre `#FFFFFF` ≈ **16:1** (AAA)
- ✅ Dorado `#EECB00` sobre azul `#020266` ≈ **8.5:1** (AAA Large)

#### **Estados de Foco**
- Outline visible con `outline-offset: 2px`
- Color: `--al-gold-primary` para consistencia

#### **Alternativas "Reduce Motion"**
- Todas las animaciones respetan `prefers-reduced-motion`

### Iconografía

#### **Estilo**
- **Lineal** (Lucide-style) con remates cuadrados o redondeados
- Stroke: 2px
- Monocolor: azul o dorado según contexto

#### **Íconos clave**
- ⚖️ Balanza de la justicia
- 📜 Pergamino/documento legal
- 💡 Luz/foco (razón)
- 🎓 Birrete (formación académica)
- 🤝 Manos (filantropía, apoyo)

---

## Arquitectura y Patrones Clave

### Stack Tecnológico
- **Framework**: Astro 5.10.0 (Generación de Sitios Estáticos con islas React)
- **Librería UI**: React 18.2.0 (para componentes interactivos)
- **Estilos**: Tailwind CSS + CSS Modules (`.module.css`)
- **Gestión de Estado**: Nanostores (`@nanostores/react`)
- **i18n**: Sistema de traducción personalizado vía React Context
- **Animación**: Framer Motion (suaves, institucionales)
- **Video**: Vimeo/YouTube iframes embebidos o `<video>` local

### Estructura del Proyecto
```
src/
├── pages/           # Páginas Astro (enrutamiento basado en archivos)
├── layouts/         # LayoutBasic.astro
├── components/      # Componentes React organizados por funcionalidad
│   ├── index/       # Página principal (institucional)
│   ├── congreso/    # Landing page del congreso
│   ├── nosotros/    # Quiénes somos, historia, pilares
│   ├── eventos/     # Calendario de eventos
│   ├── membresia/   # Información de membresías
│   ├── codigo-etico/ # Código de ética profesional
│   ├── contacto/    # Formulario + ubicación
│   └── global/      # Componentes compartidos (navbar, footer)
├── data/            # Traducciones, átomos de estado, constantes
└── public/          # Assets estáticos (imágenes, videos, PDFs)
```

### Patrón de Organización de Componentes (CRÍTICO)

**REGLA FUNDAMENTAL**: Cada página `.astro` en `src/pages/` tiene su carpeta correspondiente en `src/components/` con el **mismo nombre** de la página.

#### Estructura Estándar de Componentes por Página:
```
src/components/{nombre-pagina}/
├── Secciones/           # Secciones numeradas
├── components/          # Sub-componentes específicos
└── css/                 # CSS Modules (*.module.css)
```

**Ejemplo para `index.astro`**:
```
src/components/index/
├── Secciones/
│   ├── IndexSeccion1.jsx      # Hero institucional
│   ├── IndexSeccion2.jsx      # Pilares fundamentales
│   ├── IndexSeccion3.jsx      # Membresías
│   ├── IndexSeccion4.jsx      # Eventos destacados
│   ├── IndexSeccion5.jsx      # Código ético
│   └── IndexSeccion6.jsx      # CTA + contacto
├── components/
│   ├── PillarCard.jsx
│   ├── EventCard.jsx
│   └── MembershipTier.jsx
└── css/
    ├── indexSeccion1.module.css
    └── ...
```

**Ejemplo para `congreso.astro`** (landing page del congreso):
```
src/components/congreso/
├── Secciones/
│   ├── CongresoSeccion1.jsx   # Hero (video + título evento)
│   ├── CongresoSeccion2.jsx   # Sobre el evento
│   ├── CongresoSeccion3.jsx   # Ponentes principales
│   ├── CongresoSeccion4.jsx   # Programa (timeline)
│   ├── CongresoSeccion5.jsx   # Inscripción/Pricing
│   ├── CongresoSeccion6.jsx   # Testimonios edición anterior
│   ├── CongresoSeccion7.jsx   # Sobre la organización
│   └── CongresoSeccion8.jsx   # FAQs + Footer CTA
├── components/
│   ├── SpeakerCard.jsx
│   ├── ProgramTimeline.jsx
│   └── PricingCard.jsx
└── css/
    ├── congresoSeccion1.module.css
    └── ...
```

**Convención de Nombres**:
- **Componentes JSX**: `PascalCase` → `IndexSeccion1.jsx`, `CongresoSeccion2.jsx`
- **CSS Modules**: `camelCase` → `indexSeccion1.module.css`, `congresoSeccion2.module.css`
- **Siempre** extensión `.module.css` para CSS Modules

#### Componentes Globales
Los componentes compartidos entre múltiples páginas van en `src/components/global/`:
- `NavBar.jsx` - Navegación principal con selector ES/EN
- `Footer.jsx` - Pie de página institucional
- `LanguageSwitch.jsx` - Selector de idioma
- `VideoPlayer.jsx` - Reproductor de video reutilizable
- Utilidades comunes

**NO** colocar componentes específicos de una página en `global/`.

### Patrón de Ensamblaje de Páginas (CRÍTICO)

**REGLA**: Todas las páginas en `src/pages/*.astro` deben usar `LayoutBasic` a menos que se especifique lo contrario.

#### Estructura de una Página Astro:
```astro
---
import LayoutBasic from '../layouts/LayoutBasic.astro';

import CongresoSeccion1 from '../components/congreso/Secciones/CongresoSeccion1.jsx';
import CongresoSeccion2 from '../components/congreso/Secciones/CongresoSeccion2.jsx';
import CongresoSeccion3 from '../components/congreso/Secciones/CongresoSeccion3.jsx';
import CongresoSeccion4 from '../components/congreso/Secciones/CongresoSeccion4.jsx';
import CongresoSeccion5 from '../components/congreso/Secciones/CongresoSeccion5.jsx';
import CongresoSeccion6 from '../components/congreso/Secciones/CongresoSeccion6.jsx';
import CongresoSeccion7 from '../components/congreso/Secciones/CongresoSeccion7.jsx';
import CongresoSeccion8 from '../components/congreso/Secciones/CongresoSeccion8.jsx';
---

<LayoutBasic 
  title="Congreso Nacional de Amparo y Derechos Humanos 2025 - Abogados Liberales" 
  showFooter={true}
>
  <CongresoSeccion1 transition:persist client:only/>
  <CongresoSeccion2 transition:persist client:only/>
  <CongresoSeccion3 transition:persist client:only/>
  <CongresoSeccion4 transition:persist client:only/>
  <CongresoSeccion5 transition:persist client:only/>
  <CongresoSeccion6 transition:persist client:only/>
  <CongresoSeccion7 transition:persist client:only/>
  <CongresoSeccion8 transition:persist client:only/>
</LayoutBasic>
```

**Directivas obligatorias**:
- `transition:persist` - Para mantener estado entre navegaciones
- `client:only` - Para componentes React con hooks/estado

## Internacionalización (i18n)

### Arquitectura del Sistema de Traducciones (CRÍTICO)

**REGLA**: Cada página tiene su propio archivo de traducciones en `src/data/` con el patrón `translations{NombrePagina}.js`

#### Archivos de Traducción por Página:
```
src/data/
├── translations.js              # Traducciones GLOBALES (navbar, footer)
├── translationsIndex.js         # Exclusivo para index.astro
├── translationsCongreso.js      # Exclusivo para congreso.astro
├── translationsNosotros.js      # Exclusivo para nosotros.astro
├── translationsMembresia.js     # Exclusivo para membresia.astro
└── translationsContacto.js      # Exclusivo para contacto.astro
```

**Estructura de archivo de traducción**:
```javascript
// translationsCongreso.js
export const translationsCongreso = {
  es: {
    hero: {
      title: "Congreso Nacional de Amparo y Derechos Humanos 2025",
      subtitle: "14–15 de noviembre · Ciudad de México",
      description: "Dos días de conferencias, debates y talleres sobre litigio estratégico y justicia constitucional.",
      ctaPrimary: "Adquirir entrada",
      ctaSecondary: "Ver programa",
      price: "$1,990 MXN",
      badge: "Certificado oficial de participación · Cupo limitado"
    },
    sobreEvento: {
      title: "La justicia como derecho humano",
      description: "El Congreso Nacional de Amparo y Derechos Humanos 2025 reúne a magistrados, litigantes, académicos y defensores...",
      items: [
        {
          icon: "🎓",
          title: "Formación de excelencia",
          description: "Capacitación de alto nivel con expertos nacionales"
        },
        // ...
      ]
    },
    // ...
  },
  en: {
    hero: {
      title: "National Congress on Amparo and Human Rights 2025",
      subtitle: "November 14–15 · Mexico City",
      description: "Two days of conferences, debates and workshops on strategic litigation and constitutional justice.",
      ctaPrimary: "Get Ticket",
      ctaSecondary: "View Program",
      price: "$1,990 MXN",
      badge: "Official participation certificate · Limited seats"
    },
    // ...
  }
};
```

### Uso en Componentes
```jsx
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsCongreso } from '../../../data/translationsCongreso';

const MiComponente = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsCongreso.en : translationsCongreso.es;
  
  return <h1>{t.hero.title}</h1>;
};
```

## Convenciones de Estilos

### Híbrido Tailwind + CSS Modules
- **Tailwind**: Usa para layout, espaciado, utilidades responsive
- **CSS Modules**: Usa para animaciones específicas del componente, estados complejos
- **Propiedades CSS personalizadas**: Definidas en `tailwind.config.mjs`

### Sistema de Colores Abogados Liberales

#### Core
```javascript
bluePrimary: '#020266'        // Azul marino institucional
blue700: '#020266'            // Azul oscuro
blue800: '#05054F'            // Azul midnight
blueMidnight: '#0B0B2B'       // Azul casi negro
```

#### Dorado (Luz)
```javascript
goldPrimary: '#EECB00'        // Dorado brillante (acentos)
gold500: '#EECB00'            // Dorado estándar
goldLight: '#F4D672'          // Dorado claro (hovers)
```

#### Neutros
```javascript
bgWhite: '#FFFFFF'            // Blanco puro
bgLight: '#F8FAFC'            // Gris muy claro
bgSoft: '#F4F6FF'             // Azul muy suave
borderLight: '#E2E8F0'        // Bordes sutiles
textPrimary: '#1A202C'        // Texto principal
textSecondary: '#4A5568'      // Texto secundario
textLight: '#FFFFFF'          // Texto sobre azul
```

#### Gradientes
```javascript
gradientBlueMidnight: 'linear-gradient(180deg, #020266, #0B0B2B)'
gradientBlueGold: 'linear-gradient(135deg, #020266, #EECB00)'
gradientOverlay: 'linear-gradient(to bottom, rgba(2,2,102,0.55), rgba(0,0,0,0.8))'
```

### Aplicación por Sección
- **Header/Nav**: fondo blanco, logo en azul; links en azul con hover dorado
- **Hero**: titular en azul oscuro sobre video con overlay, CTA azul con hover dorado
- **Secciones informativas**: alterna fondos blanco y `#F8FAFC`
- **Secciones institucionales**: fondo azul marino con texto blanco y acentos dorados
- **Footer**: azul oscuro (#05054F) con texto blanco y franja dorada

### Patrones de CSS Modules (CRÍTICO)

**REGLA**: SIEMPRE usar nomenclatura `camelCase` con extensión `.module.css`

- Usa nomenclatura tipo BEM: `.container`, `.header`, `.speakerCard`
- Animaciones: Define `@keyframes` en el módulo, aplica con `animation-delay`
- Responsive: Breakpoints mobile-first - **TODO debe ser responsive**

**Convención de nombres de archivos CSS**:
```
CongresoSeccion1.jsx    →  congresoSeccion1.module.css
NosotrosSeccion3.jsx    →  nosotrosSeccion3.module.css
IndexSeccion2.jsx       →  indexSeccion2.module.css
```

**NUNCA**: `CongresoSeccion1.module.css` (PascalCase incorrecto)  
**SIEMPRE**: `congresoSeccion1.module.css` (camelCase correcto)

**Ejemplo de `congresoSeccion3.module.css`** (Ponentes):
```css
.speakerCard {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(2, 2, 102, 0.08);
  transition: all 0.3s ease;
  text-align: center;
}

.speakerCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(2, 2, 102, 0.12);
  border-bottom: 3px solid var(--al-gold-primary);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--al-gold-primary);
  margin: 0 auto 1rem;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(238, 203, 0, 0.15);
  color: var(--al-blue-primary);
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Responsive OBLIGATORIO */
@media (max-width: 768px) {
  .speakerCard {
    padding: 1.5rem;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
}
```

### Accesibilidad (contraste)
- Blanco sobre azul `#020266` ≈ 12:1 ✓ (AAA)
- Dorado `#EECB00` sobre azul `#020266` ≈ 8.5:1 ✓ (AAA Large)
- Texto `#1A202C` sobre blanco ≈ 16:1 ✓ (AAA)

## Estructura del Sitio

### Mapa del Sitio (Alto Nivel)
```
├── Inicio (institucional)
├── Congreso 2025 (landing page evento)
├── Nosotros
│   ├── Historia y fundación
│   ├── Pilares fundamentales
│   ├── Mesa directiva
│   └── Código ético
├── Membresías
│   ├── Lux Iustitia Excellentium
│   ├── Membresía regular
│   └── Beneficios
├── Eventos
│   ├── Calendario
│   ├── Congresos
│   ├── Talleres
│   └── Webinars
├── Capítulos
│   └── Capítulos por estado
├── Contacto
└── ES / EN (selector de idioma)
```

### Filosofía de Comunicación "Dignidad → Accesibilidad → Acción"

**CRÍTICO**: Abogados Liberales comunica con **seriedad institucional** pero **accesibilidad humana**:

1. **DIGNIDAD** - Lenguaje formal, respetuoso, profesional
2. **ACCESIBILIDAD** - Explicar sin tecnicismos innecesarios, enfoque humano
3. **ACCIÓN** - CTAs claros, invitación a participar, unirse, aprender

**Anti-Patrón PROHIBIDO**: Lenguaje rebuscado, tecnicismos sin explicación, frialdad corporativa extrema.

**Patrón CORRECTO**: "La justicia como derecho humano" (accesible), "Excelencia en el ejercicio del Derecho" (digno), "Únase a nuestra comunidad" (acción).

---

## Patrones Comunes y Anti-Patrones

### ✅ HACER (OBLIGATORIO)
- **Páginas**: Siempre usar `LayoutBasic`
- **Estructura de carpetas**: Cada página → carpeta en `components/`
- **Secciones**: Numerar siempre (`CongresoSeccion1.jsx`, etc.)
- **CSS Modules**: `camelCase.module.css`
- **Traducciones**: Archivo por página
- **Directivas Astro**: `client:only` + `transition:persist`
- **Responsive**: TODO debe funcionar en móvil
- **Contraste**: Verificar AA mínimo (4.5:1)
- **Lenguaje**: Formal pero accesible

### ❌ NO HACER (PROHIBIDO)
- **NO** usar `PascalCase` en archivos CSS
- **NO** mezclar componentes de diferentes páginas
- **NO** lenguaje informal o coloquial
- **NO** animaciones excesivas o "flashy"
- **NO** colores fuera de la paleta institucional
- **NO** gradientes arcoíris o multicolores
- **NO** CTAs agresivos tipo "¡Compra ya!"
- **NO** omitir estados de foco/accesibilidad
- **NO** videos con autoplay con audio
- **NO** textos muy largos sin jerarquía

---

## Contexto de Negocio - Barra Mexicana de Abogados Liberales

### Identidad Actual
Asociación civil fundada el 12 de julio de 2024 con enfoque liberal, social y ético en el ejercicio del Derecho. Promueve la defensa estratégica de derechos humanos, la excelencia profesional y la filantropía jurídica.

### Pilares Fundamentales (3 Core)
1. **Justicia Social** - Defensa de derechos humanos, acceso a la justicia, litigio estratégico
2. **Ética Profesional** - Transparencia, responsabilidad, excelencia en el ejercicio del Derecho
3. **Filantropía Jurídica** - Asesoría pro bono, formación comunitaria, servicio social

### Actividades Principales
- **Congresos**: Congreso Nacional de Amparo y Derechos Humanos (anual, noviembre)
- **Capacitaciones**: Programa Excellentium (formación judicial), talleres especializados
- **Webinars**: "Juicios épicos de la historia", análisis de casos relevantes
- **Eventos locales**: Congresos por capítulos estatales (Hidalgo, etc.)
- **Ceremonias**: Toma de protesta, membresías honorarias

### Redes Sociales Oficiales
- **Facebook**: Barra Mexicana de Abogados Liberales
- **Instagram**: @abogadosliberalesmx
- **Twitter/X**: @BarraMexAbogLib
- **LinkedIn**: Página institucional
- **YouTube**: Canal con conferencias y ceremonias

### Membresías
- **Lux Iustitia Excellentium**: Nivel premium, máximo reconocimiento
- **Membresía Regular**: Acceso a eventos, red profesional, descuentos

### Tono y Mensajes

#### Principios de Copy:
- **Dignidad**: Lenguaje formal, respetuoso, sin tecnicismos innecesarios
- **Claridad**: Explicar conceptos jurídicos de forma accesible
- **Inspiración**: Apelar a valores, ética, justicia social
- **Acción**: Invitar a participar, unirse, formarse

#### Ejemplos de Copy Correcto:
- ✅ "La justicia como derecho humano"
- ✅ "Excelencia en el ejercicio del Derecho"
- ✅ "Únase a nuestra comunidad de abogados comprometidos"
- ✅ "Defienda la razón, ilumine la justicia"

#### Ejemplos de Copy PROHIBIDO:
- ❌ "¡El mejor congreso de abogados!"
- ❌ "Compra tu boleto ahora"
- ❌ "No te lo pierdas"
- ❌ "Networking de lujo"

### Propuesta de Valor Central
"Comunidad de abogados liberales comprometidos con la justicia social, la ética profesional y la excelencia en el ejercicio del Derecho. Formación continua, red profesional y servicio a la comunidad."

---

## SEO & Metadatos

- **Title**: "[Título Página] - Barra Mexicana de Abogados Liberales"
- **Description**: Enfocada en "justicia social", "derechos humanos", "ética profesional", "abogados liberales México"
- **Keywords**: "amparo", "derechos humanos", "litigio estratégico", "abogados méxico", "congreso jurídico"
- **Schema**: Organization, Event, EducationalOrganization, FAQPage
- **OG Image**: Logo + lema sobre fondo azul institucional

---

## Notas Finales

Este archivo define la metodología de trabajo para el proyecto **Barra Mexicana de Abogados Liberales**. Mantiene la estructura, convenciones y patrones del proyecto Energy Media, pero adapta:

- **Identidad visual**: Azul marino + dorado (vs morado + cian)
- **Tono**: Institucional, solemne, académico (vs dinámico, performance)
- **Contenido**: Enfoque legal, social, ético (vs marketing digital, ROI)
- **Audiencia**: Abogados, estudiantes de Derecho, defensores de DDHH (vs empresas B2B/B2C)

**Principio rector**: "Que la luz de la razón brille en la justicia" - dignidad, claridad, accesibilidad.
