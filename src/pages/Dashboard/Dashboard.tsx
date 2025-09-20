import React, { useState } from 'react';
import type { Project } from '../../types/Project';
import Modal from '../../components/Modal/Modal';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState<(Project & { id: number })[]>([
    { id: 1, title: 'Project A', description: 'Description A', techStack: 'React, Node.js' },
    { id: 2, title: 'Project B', description: 'Description B', techStack: 'Vue, Firebase' },
  ]);

  const [formData, setFormData] = useState<Project>({
    title: '',
    description: '',
    techStack: '',
    markdown: '',
    image: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (type: 'markdown' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormData({ ...formData, [type]: content });
    };

    if (type === 'markdown') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id !== undefined) {
      setProjects(projects.map((proj) => (proj.id === formData.id ? { ...formData, id: proj.id } : proj)));
    } else {
      setProjects([...projects, { ...formData, id: Date.now() }]);
    }
    setFormData({ title: '', description: '', techStack: '', markdown: '', image: '' });
    setIsModalOpen(false);
  };

  const handleEdit = (project: Project & { id: number }) => {
    setFormData(project);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setProjects(projects.filter((proj) => proj.id !== id));
  };

  const handleAddNew = () => {
    setFormData({ title: '', description: '', techStack: '', markdown: '', image: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Project Dashboard</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add Project
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id !== undefined ? 'Edit Project' : 'Add New Project'}
      >
        <ProjectForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onFileUpload={handleFileUpload}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
