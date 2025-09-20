import React from 'react';
import { type Project } from '../../types/Project';
import './ProjectCard.css';

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
      <p className="project-description">{project.description}</p>
      <p className="project-tech">
        <strong>Tech Stack:</strong> {project.techStack}
      </p>
      {project.image && (
        <img 
          src={project.image} 
          alt={project.title}
          className="project-image"
        />
      )}
      <div className="project-actions">
        <button onClick={() => onEdit(project)} className="btn btn-primary">
          Edit
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
