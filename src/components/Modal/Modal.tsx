import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const html = document.querySelector('html');
  if (!isOpen) {
    html?.classList.remove('no-scroll');  
    return null
  };

  html?.classList.add('no-scroll');  
  
  return (
    <>
      <div className="modal-overlay"></div>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
