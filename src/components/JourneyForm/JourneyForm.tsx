import React, { useRef } from 'react';
import type { Database } from '../../types/database.types';
import FileUpload from '../FileUpload/FileUpload';
import IconSelector from '../IconSelector/IconSelector';
import ActionSelector from '../ActionSelector/ActionSelector';
import './JourneyForm.css';
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';
import { useMarkdownPreview } from '../MarkdownPreview/markdownPreviewContext.tsx';

type JourneyInsert = Database['public']['Tables']['journey']['Insert'];
type MonthRow = Database['public']['Tables']['months']['Row'];

interface JourneyFormState extends Partial<JourneyInsert> {
  year?: number;
  month_name?: string;
}

interface JourneyFormProps {
  formData: JourneyFormState;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileUpload: (type: 'markdown_content' | 'image_1' | 'image_2') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDelete: (type: 'markdown_content' | 'image_1' | 'image_2') => void;
  onCancel: () => void;
  isDisabled?: boolean;
}

const JourneyForm: React.FC<JourneyFormProps> = ({
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
  const isImage_1_Uploaded = !!formData.image_1;
  const isImage_2_Uploaded = !!formData.image_2;

  const date = formData.month_name || '' + formData.year || ''

  return (
    <form onSubmit={onSubmit} className="journey-form">
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
      <div className="form-group">
        <input
          type="text"
          name="title"
          placeholder="JourneyTitle"
          value={formData.title || ''}
          onChange={onChange}
          className="form-control"
        />
        <textarea
          name="description"
          placeholder="Journey Description"
          value={formData.description || ''}
          onChange={onChange}
          className="form-control"
        />

        <input
          type="text"
          name="date"
          placeholder="Month-Year"
          value={date}
          onChange={onChange}
          className="form-control"
        />

        <IconSelector
          name="tool_icon1"
          value={formData.type_icon1 || ''}
          onChange={onChange}
          label="Icon 1"
        />
        <IconSelector
          name="tool_icon2"
          value={formData.type_icon2 || ''}
          onChange={onChange}
          label="Icon 2"
        />

        <ActionSelector
          name="action"
          value={formData.action || ''}
          onChange={onChange}
          label='Choose Action'
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
            onChange={onFileUpload('image_1')}
            label="Image 1"
            disabled={isImage_1_Uploaded}
          />
          <FileUpload
            ref={imageInputRef}
            accept="image/*"
            onChange={onFileUpload('image_1')}
            label="Image 2"
            disabled={isImage_2_Uploaded}
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
                onClick={() => onFileDelete('markdown_content')}
              >
                Delete
              </button>
            </div>
          )}
          {isImage_1_Uploaded && (
            <div className="file-name-group">
              <div
                  className=" preview-open file-name"
                  onClick={() => openImagePreview(formData.image_1!)}
                >✓ {formData.image1_file} uploaded</div>
              <button 
                type="button" 
                className="btn-underline" 
                onClick={() => onFileDelete('image')}
              >
                Delete
              </button>
            </div>
            )}
            {isImage_2_Uploaded && (
            <div className="file-name-group">
              <div
                  className=" preview-open file-name"
                  onClick={() => openImagePreview(formData.image_2!)}
                >✓ {formData.image2_file} uploaded</div>
              <button 
                type="button" 
                className="btn-underline" 
                onClick={() => onFileDelete('image')}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
      <div className="journey-actions">
        <button type="button" className="btn btn-danger" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {formData.id !== undefined ? 'Update' : 'Add'} Journey
        </button>
      </div>
    </form>
  );
};

export default JourneyForm;