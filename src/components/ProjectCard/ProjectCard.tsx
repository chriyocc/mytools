import React from 'react';
import './ProjectCard.css';
import iconMap from '../IconSelector/iconMap';
import type { Database } from '../../types/database.types';
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';
import { useMarkdownPreview } from '../MarkdownPreview/markdownPreviewContext.tsx';


type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: ProjectRow;
  onEdit: (project: ProjectRow) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const { openImagePreview } = useImagePreview();
  const { openMarkdownPreview } = useMarkdownPreview();
  return (
    <div className="project-card">
      <div className='project-card-header'>
        <h2 className="project-title">{project.title}</h2>
        <button onClick={() => onDelete(project.id)} className="btn-delete">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#cf0000ff">
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </svg>
        </button>
      </div>
      <p className="project-info">
        {project.description}
      </p>
      {project.tool_icon1 && (
        <p className='project-info'>
          <strong>Icon 1:</strong>&nbsp;<span dangerouslySetInnerHTML={{ __html: iconMap[project.tool_icon1] }} />
        </p>
      )}
      {project.tool_icon2 && (
        <p className='project-info'>
          <strong>Icon 2:</strong>&nbsp;<span dangerouslySetInnerHTML={{ __html: iconMap[project.tool_icon2] }} />
        </p>
      )}
      {project.date && (
        <div className="project-info">
          <strong>Project Date:</strong>&nbsp; {project.date}
        </div>
      )}
      <div>
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className="project-image img-open"
            onClick={() => {
              openImagePreview(project.image!);
            }}
          />
        )}
        <p className='project-fileInfo'>
          ✓ {project.image_file} uploaded
        </p>
      </div>
       {project.markdown_content && (
        <p className='preview-open project-fileInfo' onClick={() => { openMarkdownPreview(project.markdown_content!); }}>
          ✓ {project.markdown_file} uploaded
        </p>
      )}
      <div className="project-bottomBar">
        <div className='project-dateWrapper'>
          <div className="db-date">
            Created at: {project.created_at && new Date(project.created_at).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </div>
          <div className="db-date">
            Updated at: {project.updated_at && new Date(project.updated_at).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </div>
        </div>
        <div className="project-actions">
        <button onClick={() => onEdit(project)} className="btn btn-primary">
          Edit
        </button>
      </div>
      </div>
      
    </div>
  );
};

export default ProjectCard;
