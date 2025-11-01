import React, { useRef } from 'react';
import FileUpload from '../FileUpload/FileUpload';
import './ImageForm.css';
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';
import SearchSelector from '../SearchSelector/SearchSelector.tsx';

interface ImageFormState {
  folder: string;
  pending_file?: File;
  custom_filename: string;
}

interface ImageFormProps {
  available_folders: string[];
  formData: ImageFormState;
  onSubmit: (e: React.FormEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFolderChange: (value: string) => void;
  onFileNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  isDisabled: boolean;
}

const ImageForm: React.FC<ImageFormProps> = ({
  formData,
  available_folders,
  onSubmit,
  onFileUpload,
  onFolderChange,
  onFileNameChange,
  onCancel,
  isDisabled,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { openImagePreview } = useImagePreview();

  return (
    <form className="common-form" onSubmit={onSubmit}>
      <div className="common-form-group">
        <SearchSelector
          fetchOptions={() => {
            // Add 'root' option along with existing folders
            const folders = ['root', ...available_folders.filter(f => f !== 'root')];
            return folders.map((folder) => ({
              label: folder === 'root' ? 'root' : folder,
              value: '',
            }));
          }}
          value={formData.folder || ''}
          onChange={onFolderChange}
          placeholder="Select or type a folder name"
          allowCustomValue={true}
          emptyMessage="Type to create a new folder"
        />
        
        <input
          type="text"
          name="custom_filename"
          placeholder="file-name"
          value={formData.custom_filename || ''}
          onChange={onFileNameChange}
          className="common-form-control"
          disabled={isDisabled || !formData.pending_file}
        />

        <div className="upload-section">
          <FileUpload
            ref={imageInputRef}
            accept="image/*"
            onChange={onFileUpload}
            label={formData.pending_file ? 'Change Image' : 'Upload Image'}
            disabled={isDisabled}
          />
        </div>

        <div className='file-status-section'>
          {formData.pending_file && (
            <div className="file-name-group">
              <div
                className="preview-open file-name"
                onClick={() => openImagePreview(URL.createObjectURL(formData.pending_file!))}
              >
                ✓ {formData.pending_file.name} uploaded
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="common-card-actions">
        <button
          type="button"
          className="btn btn-danger"
          onClick={onCancel}
          disabled={isDisabled}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isDisabled || !formData.pending_file}
        >
          {isDisabled ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
    </form>
  );
};

export default ImageForm;