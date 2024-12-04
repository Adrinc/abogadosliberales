import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import styles from './techModal.module.css'; 

function TechModal({ tech, onClose }) {
  const modalRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (tech && !isVisible) {
      gsap.fromTo(
        modalRef.current,
        { x: '-100%' },
        { x: '0%', duration: 0.5, ease: 'power3.out' }
      );
      setIsVisible(true);
    }
  }, [tech, isVisible]);

  const handleExit = () => {
    gsap.to(modalRef.current, {
      x: '-100%',
      duration: 0.5,
      ease: 'power3.in',
      onComplete: () => {
        setIsVisible(false);
        onClose();
      },
    });
  };

  if (!tech) return null;

  return (

      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeButton} onClick={handleExit}>X</button>
        <img src={tech.logo} alt={tech.name} className={styles.logo} />
        <h2 className={styles.title}>{tech.name}</h2>
        <h3 className={styles.subtitle}>{tech.type}</h3>
        <p>{tech.description}</p>
      </div>
 
  );
}

export default TechModal;