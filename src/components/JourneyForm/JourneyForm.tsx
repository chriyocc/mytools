import React, { useRef } from 'react';
import type { Database } from '../../types/database.types';
import FileUpload from '../FileUpload/FileUpload';
import IconSelector from '../IconSelector/IconSelector';
import ActionSelector from '../ActionSelector/ActionSelector';
import SearchSelector from '../SearchSelector/SearchSelector';
import InputUpload from '../InputUpload/InputUpload.tsx';
import './JourneyForm.css';
import '../../styles/CommonForm.css'
import '../../styles/CommonCard.css'
import { projectApi } from '../../api/projectApi.ts';
import { useMarkdownPreview } from '../MarkdownPreview/markdownPreviewContext.tsx';
import { downloadMarkdownFromTitle } from '../../utils/downloadMarkdown.ts';

type JourneyInsert = Database['public']['Tables']['journey']['Insert'];

interface JourneyFormState extends Partial<JourneyInsert> {
  year?: number;
  month_name?: string;
  month_num?: number;
}

interface JourneyFormProps {
  formData: JourneyFormState;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileUpload: (type: 'markdown_content' | 'image_1' | 'image_2') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDelete: (type: 'markdown_content' | 'image_1' | 'image_2') => void;
  onProjectChange: (slug: string) => void;
  onCancel: () => void;
  isDisabled?: boolean;
}

const JourneyForm: React.FC<JourneyFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onFileUpload,
  onFileDelete,
  onProjectChange,
  onCancel,
  isDisabled = false,
}) => {
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const image1InputRef = useRef<HTMLInputElement>(null);
  const image1FileInputRef = useRef<HTMLInputElement>(null); 
  const image2InputRef = useRef<HTMLInputElement>(null);
  const image2FileInputRef = useRef<HTMLInputElement>(null); 
  const { openMarkdownPreview } = useMarkdownPreview();

  const isMarkdownUploaded = !!formData.markdown_content;
  const isImage_1_Uploaded = !!formData.image_1;
  const isImage_2_Uploaded = !!formData.image_2;

  const date = `${formData.year}-${String(formData.month_num).padStart(2, '0')}`

  const handleDeleteImage1 = () => {
    // 1. Call the parent handler to clear the form data state
    onFileDelete('image_1');
    // 2. Clear the native browser input value to allow re-uploading the same file
    if (image1InputRef.current) {
      image1InputRef.current.value = '';
    }
    if (image1FileInputRef.current) {
      image1FileInputRef.current.value = '';
    }
  };

  const handleDeleteImage2 = () => {
    onFileDelete('image_2');
    if (image2InputRef.current) {
      image2InputRef.current.value = '';
    }
    if (image2FileInputRef.current) {
      image2FileInputRef.current.value = '';
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
          placeholder="JourneyTitle"
          value={formData.title || ''}
          onChange={onChange}
          className="common-form-control"
        />
        <textarea
          name="description"
          placeholder="Journey Description"
          value={formData.description || ''}
          onChange={onChange}
          className="common-form-control"
        />

        <input
          type="month"
          name="date"
          value={date || ''}
          onChange={onChange}
          className="common-form-control"
        />
        <div className="icon-section-wrapper">
          <IconSelector
            name="type_icon1"
            maps="journeyIconMap"
            value={formData.type_icon1 || ''}
            onChange={onChange}
            label="Icon 1"
          />
          <IconSelector
            name="type_icon2"
            maps="journeyIconMap"
            value={formData.type_icon2 || ''}
            onChange={onChange}
            label="Icon 2"
            />
          </div>

        <ActionSelector
          name="action"
          value={formData.action || ''}
          onChange={onChange}
          label='Choose Action'
        />

        {(formData.action === 'link') && 
          <input
            type="text"
            name="link"
            placeholder={`Paste your link here.`}
            value={formData.link || ''}
            onChange={onChange}
            className="common-form-control"
          />
        }

        {(formData.action === 'navigate') &&
          <SearchSelector
            value={formData.link || ''}
            onChange={onProjectChange}
            fetchOptions={async () => {
              const projects = await projectApi.getAllProjectsTitle();
              return projects.map(p => ({ label: p.title, value: p.slug }));
            }}
            prefix="/projects/"
            placeholder={`project-slug`}
            renderOption={(option) => (
              <>
                <span className="project-title">{option.label}</span>
                <span className="project-slug">{option.value}</span>
              </>
            )}
          />
        }

        <InputUpload
          ref={image1InputRef}
          name="image_1"
          accept="image/*"
          value={formData.image_1 || ''}
          fileName={formData.image1_file || ''}
          onChange={onChange}
          onFileUpload={onFileUpload('image_1')}
          onFileDelete={handleDeleteImage1}
          placeholder="Upload or paste image URL here"
        ></InputUpload>

        <InputUpload
          ref={image2InputRef}
          name="image_2"
          accept="image/*"
          value={formData.image_2 || ''}
          fileName={formData.image2_file || ''}
          onChange={onChange}
          onFileUpload={onFileUpload('image_2')}
          onFileDelete={handleDeleteImage2}
          placeholder="Upload or paste image URL here"
        ></InputUpload>

        <div className='upload-section'>
          <FileUpload
            ref={markdownInputRef}
            accept=".md"
            onChange={onFileUpload('markdown_content')}
            label="Markdown"
            disabled={(formData.action !== 'popbox') || isMarkdownUploaded}
          />
          <FileUpload
            ref={image1InputRef}
            accept="image/*"
            onChange={onFileUpload("image_1")}
            label="Image 1"
            disabled={isImage_1_Uploaded}
          />
          <FileUpload
            ref={image2InputRef}
            accept="image/*"
            onChange={onFileUpload("image_2")}
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
                className="btn-underline primary" 
                onClick={() => downloadMarkdownFromTitle(formData.markdown_content || '', formData.title || '')}
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
          {formData.id !== undefined ? 'Update' : 'Add'} Journey
        </button>
      </div>
    </form>
  );
};

export default JourneyForm;