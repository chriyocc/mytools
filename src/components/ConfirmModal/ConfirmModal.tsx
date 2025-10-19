import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg className="confirm-modal-icon danger" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="confirm-modal-icon warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="confirm-modal-icon info" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        );
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onCancel(); // Close dialog after confirm
  };

  return (
    <>
      <div className="confirm-modal">
        <div className='confirm-modal-header-wrapper'>
          <div className="confirm-modal-header">
            {getIcon()}
            <h2>{title}</h2>
          </div>
          <button className="confirm-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="confirm-modal-content">
          {message}
        </div>
        <div className="confirm-modal-footer">
            <button 
              className="btn" 
              onClick={onCancel}
              autoFocus
            >
              {cancelText}
            </button>
            <button 
              className={`btn btn-primary ${type}`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
      </div>
    </>
  );
};

export default ConfirmModal;
