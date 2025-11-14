import React, { useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { translationsRevalidacion } from '../../../data/translationsRevalidacion';
import styles from '../css/fileUploader.module.css';

const FileUploader = ({ file, filePreview, onFileChange, rejectedType }) => {
  const ingles = useStore(isEnglish);
  const t = ingles ? translationsRevalidacion.en : translationsRevalidacion.es;
  
  // Determinar contenido según tipo de rechazo
  let content;
  if (rejectedType === 'credential') {
    content = t.credential;
  } else if (rejectedType === 'comprobante_membresia') {
    content = t.comprobante_membresia;
  } else {
    content = t.receipt;
  }

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Validar archivo
  const validateFile = (file) => {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return t.fileValidation.invalidType;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return t.fileValidation.tooLarge;
    }

    return null;
  };

  // Handler para input file
  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const error = validateFile(selectedFile);
      if (error) {
        setValidationError(error);
        onFileChange(null);
      } else {
        setValidationError('');
        onFileChange(selectedFile);
      }
    }
  };

  // Handler para drag & drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const error = validateFile(droppedFile);
      if (error) {
        setValidationError(error);
        onFileChange(null);
      } else {
        setValidationError('');
        onFileChange(droppedFile);
      }
    }
  };

  // Trigger input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Remover archivo
  const handleRemove = () => {
    onFileChange(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.uploaderContainer}>
      {/* Zona de drop */}
      {!file && (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileInput}
            className={styles.hiddenInput}
          />

          <div className={styles.dropContent}>
            <div className={styles.uploadIcon}>📄</div>
            <p className={styles.dragText}>{content.fileUploader.dragText}</p>
            <p className={styles.orText}>{content.fileUploader.orText}</p>
            <div className={styles.formatText}>{content.fileUploader.formats}</div>
          </div>
        </div>
      )}

      {/* Preview de archivo seleccionado */}
      {file && (
        <div className={styles.filePreview}>
          <div className={styles.previewHeader}>
            <span className={styles.fileIcon}>
              {file.type === 'application/pdf' ? '📄' : '🖼️'}
            </span>
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              className={styles.removeButton}
              onClick={handleRemove}
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Imagen preview (solo para JPG/PNG) */}
          {filePreview && filePreview !== 'pdf' && (
            <div className={styles.imagePreview}>
              <img src={filePreview} alt="Preview" className={styles.previewImage} />
            </div>
          )}

          {/* PDF indicator */}
          {filePreview === 'pdf' && (
            <div className={styles.pdfIndicator}>
              <div className={styles.pdfIcon}>📄</div>
              <p className={styles.pdfText}>
                {ingles ? 'PDF Document' : 'Documento PDF'}
              </p>
            </div>
          )}

          {/* Botón para cambiar archivo */}
          <button
            className={styles.changeButton}
            onClick={handleClick}
            type="button"
          >
            {content.fileUploader.changeButton}
          </button>
        </div>
      )}

      {/* Error de validación */}
      {validationError && (
        <div className={styles.validationError}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
