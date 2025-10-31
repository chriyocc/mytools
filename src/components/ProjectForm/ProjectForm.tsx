import React, { useRef } from 'react';
import type { Database } from '../../types/database.types';
import FileUpload from '../FileUpload/FileUpload';
import IconSelector from '../IconSelector/IconSelector';
import './ProjectForm.css';
import '../../styles/CommonForm.css'
import '../../styles/CommonCard.css'
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';
import { useMarkdownPreview } from '../MarkdownPreview/markdownPreviewContext.tsx';

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

interface ProjectFormProps {
  formData: Partial<ProjectInsert>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileUpload: (type: 'markdown_content' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDelete: (type: 'markdown_content' | 'image') => void;
  onCancel: () => void;
  isDisabled?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onFileUpload,
  onFileDelete,
  onCancel,
  isDisabled = false,
}) => {
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { openImagePreview } = useImagePreview();
  const { openMarkdownPreview } = useMarkdownPreview();

  const isMarkdownUploaded = !!formData.markdown_content;
  const isImageUploaded = !!formData.image;

  const handleDeleteImage = () => {
    onFileDelete('image');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

   const handleDeleteMarkdown = () => {
    onFileDelete('markdown_content');
    if (markdownInputRef.current) {
      markdownInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={onSubmit} className="common-form">
      {/* Overlay to prevent interaction during save */}
      {isDisabled && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1001,
            cursor: 'not-allowed',
            borderRadius: '8px',
          }}
        />
      )}
      <div className="common-form-group">
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={formData.title || ''}
          onChange={onChange}
          className="common-form-control"
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description || ''}
          onChange={onChange}
          className="common-form-control"
        />

        <input
          type="month"
          name="date"
          value={formData.date || ''}
          onChange={onChange}
          className="common-form-control"
        />

        <IconSelector
          name="tool_icon1"
          maps="iconMap"
          value={formData.tool_icon1 || ''}
          onChange={onChange}
          label="Icon 1"
        />
        <IconSelector
          name="tool_icon2"
          maps="iconMap"
          value={formData.tool_icon2 || ''}
          onChange={onChange}
          label="Icon 2"
        />

        <div className='upload-section'>
          <FileUpload
            ref={markdownInputRef}
            accept=".md"
            onChange={onFileUpload('markdown_content')}
            label="Markdown"
            disabled={isMarkdownUploaded}
          />
          <FileUpload
            ref={imageInputRef}
            accept="image/*"
            onChange={onFileUpload('image')}
            label="Image"
            disabled={isImageUploaded}
          />
        </div>
        <div>
          <div className='file-status-section'> 
          {isMarkdownUploaded && (
            <div className="file-name-group">
              <div
                  className="preview-open file-name"
                  onClick={() => openMarkdownPreview(formData.markdown_content!)}
                >✓ {formData.markdown_file} uploaded</div>
              <button 
                type="button" 
                className="btn-underline" 
                onClick={handleDeleteMarkdown}
              >
                Delete
              </button>
            </div>
          )}
          {isImageUploaded && (
            <div className="file-name-group">
              <div
                  className=" preview-open file-name"
                  onClick={() => openImagePreview(formData.image!)}
                >✓ {formData.image_file} uploaded</div>
              <button 
                type="button" 
                className="btn-underline" 
                onClick={handleDeleteImage}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
      <div className="common-card-actions">
        <button type="button" className="btn btn-danger" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {formData.id !== undefined ? 'Update' : 'Add'} Project
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;