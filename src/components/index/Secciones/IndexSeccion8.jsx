import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsIndex } from '../../../data/translationsIndex';
import styles from '../css/indexSec8.module.css';

const IndexSeccion8 = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsIndex.en.faqs : translationsIndex.es.faqs;
  
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      id="faqs"
    >
      <div className={styles.container}>
        
        {/* Label superior */}
        <div className={styles.labelWrapper}>
          <span className={styles.label}>{t.label}</span>
        </div>

        {/* Título y subtítulo */}
        <div className={styles.headerWrapper}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        {/* Acordeón de preguntas */}
        <div className={styles.accordionWrapper}>
          {t.questions.map((item, index) => (
            <div 
              key={index} 
              className={`${styles.accordionItem} ${openIndex === index ? styles.open : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button 
                className={styles.accordionButton}
                onClick={() => toggleAccordion(index)}
                aria-expanded={openIndex === index}
              >
                <span className={styles.questionIcon}>
                  {openIndex === index ? '−' : '+'}
                </span>
                <span className={styles.question}>{item.question}</span>
              </button>
              
              <div className={`${styles.accordionContent} ${openIndex === index ? styles.expanded : ''}`}>
                <p className={styles.answer}>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default IndexSeccion8;
