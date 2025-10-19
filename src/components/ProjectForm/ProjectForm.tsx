import React, { useRef } from 'react';
import type { Database } from '../../types/database.types';
import FileUpload from '../FileUpload/FileUpload';
import IconSelector from '../IconSelector/IconSelector';
import './ProjectForm.css';

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

interface ProjectFormProps {
  formData: Partial<ProjectInsert>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileUpload: (type: 'markdown_content' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}


const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onFileUpload,
  onCancel
}) => {
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="project-form">
      <div className="form-group">
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={formData.title || ''}
          onChange={onChange}
          className="form-control"
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description || ''}
          onChange={onChange}
          className="form-control"
        />

        <input
          type="month"
          name="date"
          value={formData.date || ''}
          onChange={onChange}
          className="form-control"
        />
        {/* {formData.date && (
          new Date(formData.date + '-01').toLocaleString(undefined, { month: 'long', year: 'numeric' })
        )} */}


        <IconSelector
          name="tool_icon1"
          value={formData.tool_icon1 || ''}
          onChange={onChange}
          label="Icon 1"
        />
        <IconSelector
          name="tool_icon2"
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
          />
          <FileUpload
            ref={imageInputRef}
            accept="image/*"
            onChange={onFileUpload('image')}
            label="Image"
          />
        </div>
        <div>
          {formData.markdown_content && <div className="file-name">✓ {formData.markdown_file} uploaded</div>}
          {formData.image && <div className="file-name">✓ {formData.image_file} uploaded</div>}
        </div>
      </div>
      <div className="project-actions">
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
