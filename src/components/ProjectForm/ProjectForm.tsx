import React, { useRef } from 'react';
import { type Project } from '../../types/Project';
import FileUpload from '../FileUpload/FileUpload';
import './ProjectForm.css';

interface ProjectFormProps {
  formData: Project;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileUpload: (type: 'markdown' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => void;
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
          value={formData.title}
          onChange={onChange}
          className="form-control"
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description}
          onChange={onChange}
          className="form-control"
        />
        <select
          name="icon1"
          value={formData.icon1 || ''}
          onChange={onChange}
          className="form-control"
        >
          <option value="">Select Icon 1</option>
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <select
          name="icon2"
          value={formData.icon2 || ''}
          onChange={onChange}
          className="form-control"
        >
          <option value="">Select Icon 2</option>
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <div className='upload-section'>
          <FileUpload
            ref={markdownInputRef}
            accept=".md"
            onChange={onFileUpload('markdown')}
            label="Markdown"
          />
          <FileUpload
            ref={imageInputRef}
            accept="image/*"
            onChange={onFileUpload('image')}
            label="Image"
          />
        </div>
        {formData.markdown && <span className="file-name">✓ Markdown uploaded</span>}
        {formData.image && <span className="file-name">✓ Image uploaded</span>}
      </div>
      <div className="project-actions">
        <button type="submit" className="btn btn-primary">
          {formData.id !== undefined ? 'Update' : 'Add'} Project
        </button>
        <button type="button" className="btn btn-danger" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
