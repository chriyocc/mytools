import React, { useState } from 'react';
import '../../styles/CommonCard.css';
import './ImageCard.css';
import { toast } from 'react-hot-toast';
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';

interface CloudinaryImage {
  public_id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

interface ImageCardProps {
  image: CloudinaryImage;
  onDelete: (publicId: string, url: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { openImagePreview } = useImagePreview()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
      console.error('Failed to copy: ', err);
    }
  };

  const handleDelete = () => {
    onDelete(image.public_id, image.url);
  };

  // Extract folder and filename from public_id
  const getFolderAndFilename = (publicId: string) => {
    const parts = publicId.split('/');
    if (parts.length > 1) {
      return {
        folder: parts[0],
        filename: parts.slice(1).join('/'),
      };
    }
    return {
      folder: 'root',
      filename: publicId,
    };
  };

  const { folder, filename } = getFolderAndFilename(image.public_id);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="image-card">
      {image.url && (
        <img
          src={image.url}
          alt={filename}
          className="image-card-image"
          loading="lazy"
        />
      )}
      <div className="image-card-overlay" onClick={() => openImagePreview(image.url!)}></div>
      <div className="image-card-caption">
        {filename}
      </div>

      <div className="image-card-actions">
        <button className="icon-btn delete" onClick={handleDelete}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#cf0000ff"
          >
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </svg>
        </button>
        <button className="icon-btn" onClick={handleCopy}>
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#e3e3e3"
            >
              <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
            </svg>
          )}
        </button>
        <div
          className="info-wrapper"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <button className="icon-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#e3e3e3"
            >
              <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          </button>

          {showInfo && (
            <div className="info-box">
              <p>
                <strong>Image Info</strong>
              </p>
              <p>Resolution: {image.width}×{image.height}</p>
              <p>Folder: {folder}</p>
              <p>Format: {image.format.toUpperCase()}</p>
              <p>Created: {formatDate(image.created_at)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;