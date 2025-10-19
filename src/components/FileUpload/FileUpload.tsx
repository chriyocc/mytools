import React, { forwardRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  disabled?: boolean;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ accept, onChange, label, disabled = false }, ref) => {
    return (
      <div className="upload-group">
        <input
          type="file"
          accept={accept}
          ref={ref}
          onChange={onChange}
          style={{ display: 'none' }}
        />
        <button 
          type="button" 
          className="btn btn-secondary btn-with-icon" 
          onClick={() => (ref as React.RefObject<HTMLInputElement>).current?.click()}
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#000000ff">
            <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
          </svg>
          {label}
        </button>
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
