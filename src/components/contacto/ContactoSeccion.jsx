import React, { useEffect, useRef } from 'react';
import styles from './ContactoSeccion.module.css';
import FormContact from '../react_components/FormContacto/FormContacto.jsx';
import { isEnglish } from '../../data/variables';
import { useStore } from '@nanostores/react';
import { translations } from '../../data/translations';

const FloatingParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? 'rgba(238, 203, 0,' : 'rgba(2, 2, 102,'
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + particle.opacity + ')';
        ctx.fill();
        
        // Conectar partículas cercanas
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(238, 203, 0, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={styles.particleCanvas}
    />
  );
};

const ContactoSeccion = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translations.en.contactoSeccion : translations.es.contactoSeccion;

  return (
    <section id="Contacto" className={styles.section}>
      <FloatingParticles />
      
      <div className={styles.container}>
        <div className={styles.formColumn}>
          <FormContact />
        </div>
      </div>
      
      <div className={styles.infoColumn}>
        <div className={styles.containerInfo}>
          <div className={styles.logoContainer}>
            <img src="./favicon.jpg" alt="Barra Mexicana de Abogados Liberales" className={styles.logo} />
            <div className={styles.logoGlow}></div>
          </div>
          
          <h1 className={styles.title}>
            <span className={styles.titleWord}>{t.title.split(' ')[0]}</span>
            <span className={styles.titleWord}>{t.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          
          <p className={styles.description}>
            {t.description}
          </p>
          
          <div className={styles.decorativeElements}>
            <div className={styles.circle1}></div>
            <div className={styles.circle2}></div>
            <div className={styles.circle3}></div>
          </div>
        </div>
      </div>
      
      <div className={styles.esfera} />
      
      {/* Elementos decorativos adicionales */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>
    </section>
  );
};

export default ContactoSeccion;
