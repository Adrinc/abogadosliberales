import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRegistro } from '../../../data/translationsRegistro';
import styles from '../css/selectionCards.module.css';

const SelectionCards = ({ selectedOption, onSelectOption }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRegistro.en : translationsRegistro.es;

  const options = [
    {
      id: 1,
      icon: '🎫',
      badge: t.selectionCards.generalBadge,
      title: t.selectionCards.generalTitle,
      description: t.selectionCards.generalDescription
    },
    {
      id: 2,
      icon: '🎓',
      badge: t.selectionCards.academicBadge,
      title: t.selectionCards.academicTitle,
      description: t.selectionCards.academicDescription
    },
    {
      id: 3,
      icon: '⚖️',
      badge: t.selectionCards.membershipBadge,
      title: t.selectionCards.membershipTitle,
      description: t.selectionCards.membershipDescription
    },
    {
      id: 4,
      icon: '🏛️',
      badge: t.selectionCards.activeMemberBadge,
      title: t.selectionCards.activeMemberTitle,
      description: t.selectionCards.activeMemberDescription
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.selectionCards.mainTitle}</h2>
        <p className={styles.subtitle}>{t.selectionCards.mainSubtitle}</p>
      </div>

      <div className={styles.cardsGrid}>
        {options.map((option) => (
          <div
            key={option.id}
            className={`${styles.card} ${selectedOption === option.id ? styles.cardActive : ''}`}
            onClick={() => onSelectOption(option.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectOption(option.id);
              }
            }}
          >
            {/* Badge */}
            <div className={styles.badge}>{option.badge}</div>

            {/* Icon */}
            <div className={styles.icon}>{option.icon}</div>

            {/* Title */}
            <h3 className={styles.cardTitle}>{option.title}</h3>

            {/* Description */}
            <p className={styles.description}>{option.description}</p>

            {/* CTA Button */}
            <button
              className={`${styles.ctaButton} ${selectedOption === option.id ? styles.ctaButtonActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectOption(option.id);
              }}
            >
              {selectedOption === option.id 
                ? t.selectionCards.buttonSelected 
                : t.selectionCards.buttonSelect}
            </button>

            {/* Active Indicator */}
            {selectedOption === option.id && (
              <div className={styles.activeIndicator}>
                <span className={styles.activeIcon}>✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectionCards;
