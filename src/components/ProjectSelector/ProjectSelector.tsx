import { useState, useEffect, useRef } from 'react';
import './ProjectSelector.css';

interface Project {
  title: string;
  slug: string;
}

interface ProjectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fetchProjects: () => Promise<Project[]>;
}

const ProjectSelector = ({ 
  value, 
  onChange, 
  placeholder = 'Search or select a project...',
  fetchProjects 
}: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const baseUrl = '/projects/';

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on input value
    if (value) {
      const filtered = projects.filter(project =>
        project.title.toLowerCase().includes(value.toLowerCase()) ||
        project.slug.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [value, projects]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectProject = (project: Project) => {
    onChange(project.slug);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="project-selector-container" ref={wrapperRef}>
      <div className="project-selector-input-wrapper">
        {baseUrl && (
          <span className="project-selector-prefix">{baseUrl}</span>
        )}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="project-selector-input"
        />
      </div>
      
      {isOpen && filteredProjects.length > 0 && (
        <ul className="project-selector-dropdown">
          {filteredProjects.map((project) => (
            <li
              key={project.slug}
              onClick={() => handleSelectProject(project)}
              className="project-selector-item"
            >
              <span className="project-title">{project.title}</span>
              <span className="project-slug">{project.slug}</span>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && filteredProjects.length === 0 && value && (
        <div className="project-selector-empty">
          No projects found
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;