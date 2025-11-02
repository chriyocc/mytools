import React, { useRef } from 'react';
import type { Database } from '../../types/database.types';
import FileUpload from '../FileUpload/FileUpload';
import IconSelector from '../IconSelector/IconSelector';
import InputUpload from '../InputUpload/InputUpload.tsx';
import './ProjectForm.css';
import '../../styles/CommonForm.css'
import '../../styles/CommonCard.css'
import { useMarkdownPreview } from '../MarkdownPreview/markdownPreviewContext.tsx';
import { downloadMarkdownFromTitle } from '../../utils/downloadMarkdown.ts';

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
  const imageFileInputRef = useRef<HTMLInputElement>(null); 
  const { openMarkdownPreview } = useMarkdownPreview();

  const isMarkdownUploaded = !!formData.markdown_content;

  const handleDeleteImage = () => {
    onFileDelete('image');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
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

        <div className="icon-section-wrapper">
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
        </div>

        <InputUpload
          ref={imageInputRef}
          name="image"
          accept="image/*"
          value={formData.image || ''}
          fileName={formData.image_file || ''}
          onChange={onChange}
          onFileUpload={onFileUpload('image')}
          onFileDelete={handleDeleteImage}
          placeholder="Upload or paste image URL here"
        />

        <div className='upload-section'>
          <FileUpload
            ref={markdownInputRef}
            accept=".md"
            onChange={onFileUpload('markdown_content')}
            label="Markdown"
            disabled={isDisabled}
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
                className="btn-underline primary" 
                onClick={() => downloadMarkdownFromTitle(formData.markdown_content || '', formData.title || 'default_name')}
              >
                Download
              </button>
              <button 
                type="button" 
                className="btn-underline danger" 
                onClick={handleDeleteMarkdown}
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