import React, { forwardRef, useRef } from 'react';
import './InputUpload.css';
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';

interface InputUploadProps {
  name: string;
  accept: string;
  value?: string;
  fileName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDelete: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const InputUpload = forwardRef<HTMLInputElement, InputUploadProps>(
  ({ 
    name, 
    accept, 
    value = '', 
    fileName = '',
    onChange, 
    onFileUpload, 
    onFileDelete,
    placeholder = 'Upload or paste URL here', 
    disabled = false 
  }, ref) => {
    const { openImagePreview } = useImagePreview();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const isFileUploaded = !!value;

    return (
      <div className="input-upload">
        <input
          type="text"
          ref={ref}
          name={name}
          placeholder={isFileUploaded ? '' : placeholder}
          value={isFileUploaded ? '' : value}
          onChange={onChange}
          onKeyDown={(e) => {
            // Prevent all keyboard input except Ctrl/Cmd shortcuts
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
            }
          }}
          className="common-form-control"
          disabled={isFileUploaded || disabled}
        />

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          onChange={onFileUpload}
          style={{ display: 'none' }}
        />

        {/* File chip when file is uploaded */}
        {isFileUploaded && (
          <div className="file-chip">
            <span 
              className="file-name" 
              onClick={() => openImagePreview(value)}
              style={{ cursor: 'pointer' }}
            >
              {fileName || 'File uploaded'}
            </span>
            <button
              type="button"
              className="remove-file-btn"
              onClick={onFileDelete}
            >
              ×
            </button>
          </div>
        )}

        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#000000ff">
            <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
          </svg>
        </button>
      </div>
    );
  }
);

InputUpload.displayName = 'InputUpload';

export default InputUpload;