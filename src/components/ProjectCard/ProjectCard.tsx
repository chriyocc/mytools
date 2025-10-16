import React from 'react';
import { type Project } from '../../types/Project';
import './ProjectCard.css';
import iconMap from '../IconSelector/iconMap';

interface ProjectCardProps {
  project: Project & { id: number };
  onEdit: (project: Project & { id: number }) => void;
  onDelete: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
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
      <p className="project-info">{project.description}</p>
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
          <strong>Project Date:</strong>&nbsp;{project.date && new Date(project.date + '-01').toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
      )}
      <div>
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className="project-image"
          />
        )}
      </div>
       {project.markdown_content && (
        <p className='project-info'>
          ✓ Markdown File Uploaded
        </p>
      )}
      <div className="project-bottomBar">
        <div className='project-dateWrapper'>
          <div className="db-date">
            Created_at: {project.date && new Date(project.date + '-01').toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <div className="db-date">
            Updated_at: {project.date && new Date(project.date + '-01').toLocaleString(undefined, { month: 'long', year: 'numeric' })}
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
