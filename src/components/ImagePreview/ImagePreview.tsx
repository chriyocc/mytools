import React from "react";
import './ImagePreview.css';

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="image-preview-overlay"></div>
      <div className="image-preview-modal">
        <div className="image-preview-header">
          <button className="image-preview-close" onClick={onClose}>&times;</button>
        </div>
        <div className="image-preview-content">
          <img src={imageUrl} alt="Preview" className="image-preview-img" />
        </div>
      </div>
    </>
  );
};

export default ImagePreview;
