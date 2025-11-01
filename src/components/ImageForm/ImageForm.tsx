import React, { useRef } from 'react';
import FileUpload from '../FileUpload/FileUpload';
import './ImageForm.css';
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';
import OptionSelector from '../OptionSelector/OptionSelector.tsx'

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
  onFolderChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
        <OptionSelector
          name='folder'
          options_map={available_folders}
          value={formData.folder || ''}
          onChange={onFolderChange}
          label='Folders'
          placeholder='Select a folder'
        ></OptionSelector>
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
                  className=" preview-open file-name"
                  onClick={() => openImagePreview(URL.createObjectURL(formData.pending_file!))}
                >✓ {formData.pending_file.name} uploaded</div>
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