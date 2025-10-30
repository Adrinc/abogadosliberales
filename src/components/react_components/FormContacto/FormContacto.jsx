import React, { useState } from 'react';
import styles from './FormContacto.module.css';
import { isEnglish } from '../../../data/variables';
import { useStore } from '@nanostores/react';
import { translations } from '../../../data/translations';

const FormContacto = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translations.en.formContacto : translations.es.formContacto;
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ayuda: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === 'nombre') {
      const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
      setFormData({ ...formData, [name]: filteredValue });
      if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) {
        newErrors.nombre = t.error_nombre;
      } else {
        delete newErrors.nombre;
      }
    } else if (name === 'telefono') {
      const filteredValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: filteredValue });
      if (!/^\d*$/.test(value)) {
        newErrors.telefono = t.error_telefono;
      } else {
        delete newErrors.telefono;
      }
    } else if (name === 'email') {
      setFormData({ ...formData, [name]: value });
      if (!/^.{4,}@/.test(value)) {
        newErrors.email = t.error_email_short;
      } else {
        delete newErrors.email;
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};

    if (!/^[a-zA-ZÀ-ÿ\s]{1,50}$/.test(formData.nombre)) {
      newErrors.nombre = t.error_nombre;
    }
    if (!/^.{4,}@[\w-]+\.[a-z]{2,}$/.test(formData.email)) {
      newErrors.email = t.error_email;
    }
    if (!/^\d{10,15}$/.test(formData.telefono)) {
      newErrors.telefono = t.error_telefono;
    }
    if (formData.ayuda.trim() === '') {
      newErrors.ayuda = t.error_ayuda;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    setErrors({});

    // División inteligente del nombre completo
    const palabras = formData.nombre.trim().split(/\s+/);
    const mitad = Math.ceil(palabras.length / 2);
    const first = palabras.slice(0, mitad).join(' ');
    const last = palabras.slice(mitad).join(' ');

    const payload = {
      lead_email: formData.email,
      lead_phone: formData.telefono,
      lead_first_name: first,
      lead_last_name: last,
      lead_message: formData.ayuda,
      organization_id: "14"
    };

    try {
      const response = await fetch("https://u-n8n.virtalus.cbluna-dev.com/webhook/contactus_process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ nombre: '', email: '', telefono: '', ayuda: '' });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus(null), 5000);
      }
    } catch (err) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t.title}
      </h2>
      
      {submitStatus === 'success' && (
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          {t.success}
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className={styles.errorMessage}>
          <div className={styles.errorIcon}>✗</div>
          {t.fail}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nombre">
            {t.nombre}
          </label>
          <div className={styles.inputContainer}>
            <img src="/icons/user.svg" alt="User Icon" className={styles.icon} />
            <input
              type="text"
              id="nombre"
              name="nombre"
              className={styles.input}
              value={formData.nombre}
              onChange={handleChange}
              placeholder={t.placeholder_nombre}
              disabled={isSubmitting}
            />
          </div>
          {errors.nombre && <p className={styles.error}>{errors.nombre}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            {t.email}
          </label>
          <div className={styles.inputContainer}>
            <img src="/icons/email.svg" alt="Email Icon" className={styles.icon} />
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              placeholder={t.placeholder_email}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="telefono">
            {t.telefono}
          </label>
          <div className={styles.inputContainer}>
            <img src="/icons/phone.svg" alt="Phone Icon" className={styles.icon} />
            <input
              type="text"
              id="telefono"
              name="telefono"
              className={styles.input}
              value={formData.telefono}
              onChange={handleChange}
              placeholder={t.placeholder_telefono}
              disabled={isSubmitting}
            />
          </div>
          {errors.telefono && <p className={styles.error}>{errors.telefono}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ayuda">
            {t.ayuda}
          </label>
          <div className={styles.inputContainer}>
            <img src="/icons/help.svg" alt="Help Icon" className={styles.icon} />
            <textarea
              id="ayuda"
              name="ayuda"
              className={styles.textarea}
              value={formData.ayuda}
              onChange={handleChange}
              placeholder={t.placeholder_ayuda}
              disabled={isSubmitting}
            ></textarea>
          </div>
          {errors.ayuda && <p className={styles.error}>{errors.ayuda}</p>}
        </div>

        <button 
          type="submit" 
          className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner}></div>
              {t.enviando || 'Enviando...'}
            </>
          ) : (
            t.enviar
          )}
        </button>
      </form>
    </div>
  );
};

export default FormContacto;