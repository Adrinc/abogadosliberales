import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/ipPayTemporaryMessage.module.css';

const IPPayTemporaryMessage = () => {
  const ingles = useStore(isEnglish);

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <div className={styles.icon}>🚧</div>
      </div>
      
      <h3 className={styles.title}>
        {ingles 
          ? 'Payment Method Temporarily Unavailable' 
          : 'Método de pago temporalmente no disponible'}
      </h3>
      
      <p className={styles.description}>
        {ingles
          ? 'We are currently updating our credit card payment system to provide you with a better experience. This option will be available again soon.'
          : 'Actualmente estamos actualizando nuestro sistema de pago con tarjeta de crédito para brindarle una mejor experiencia. Esta opción estará disponible nuevamente próximamente.'}
      </p>

      <div className={styles.alternativesBox}>
        <p className={styles.alternativesLabel}>
          {ingles ? 'Available payment methods:' : 'Métodos de pago disponibles:'}
        </p>
        <ul className={styles.alternativesList}>
          <li>
            <span className={styles.altIcon}>💳</span>
            <span>{ingles ? 'PayPal' : 'PayPal'}</span>
          </li>
          <li>
            <span className={styles.altIcon}>🏦</span>
            <span>{ingles ? 'Bank Transfer' : 'Transferencia Bancaria'}</span>
          </li>
        </ul>
      </div>

      <p className={styles.footer}>
        {ingles
          ? 'For inquiries, please contact us at'
          : 'Para consultas, contáctenos en'}{' '}
        <a href="mailto:contacto@abogadosliberales.mx" className={styles.email}>
          contacto@abogadosliberales.mx
        </a>
      </p>
    </div>
  );
};

export default IPPayTemporaryMessage;
