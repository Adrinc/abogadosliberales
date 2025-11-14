import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRevalidacion } from '../../../data/translationsRevalidacion';
import styles from '../css/revalidacionSuccess.module.css';

const RevalidacionSuccess = ({ rejectedType }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRevalidacion.en : translationsRevalidacion.es;

  // Determinar mensaje según tipo de rechazo
  let message;
  if (rejectedType === 'credential') {
    message = t.success.credentialMessage;
  } else if (rejectedType === 'comprobante_membresia') {
    message = ingles 
      ? 'Your membership proof has been received and is being validated by our team.'
      : 'Su comprobante de membresía ha sido recibido y está siendo validado por nuestro equipo.';
  } else {
    message = t.success.receiptMessage;
  }

  return (
    <section className={styles.successSection}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Icon de éxito */}
          <div className={styles.successIcon}>{t.success.icon}</div>

          {/* Título */}
          <h1 className={styles.title}>{t.success.title}</h1>
          <p className={styles.subtitle}>{t.success.subtitle}</p>

          {/* Mensaje principal */}
          <div className={styles.messageBox}>
            <p className={styles.message}>{message}</p>
          </div>

          {/* Notificación de email */}
          <div className={styles.notificationBox}>
            <div className={styles.emailIcon}>📧</div>
            <p className={styles.notificationText}>{t.success.emailNotification}</p>
          </div>

          {/* Botones */}
          <div className={styles.actions}>
            <a href="/" className={styles.ctaButton}>
              {t.success.ctaButton}
            </a>
            <div className={styles.supportLink}>
              <span className={styles.supportText}>{t.success.supportText}</span>
              <a href="/contacto" className={styles.linkButton}>
                {t.success.supportLink}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevalidacionSuccess;
