import React, { useState } from 'react';
import type { Project } from '../../types/Project';
import Modal from '../../components/Modal/Modal';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { toast } from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal/ConfirmModalContext';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState<(Project & { id: number })[]>([
    { id: 1, slug:'project-a', title: 'Project A', date: '2025-08', description: 'Description A', image: '', markdown_content: '', tool_icon1: 'typescript', tool_icon2: 'react', created_at: '2025-08-01', updated_at: '2025-08-01' },
    { id: 2, slug:'project-b', title: 'Project B', date: '2025-11', description: 'Description B', image: '', markdown_content: '', tool_icon1: 'typescript', tool_icon2: 'react', created_at: '2025-08-01', updated_at: '2025-08-01' },
  ]);

  const { confirm } = useConfirm();

  const [formData, setFormData] = useState<Project>({
    title: '',
    slug: '',
    date: '',
    description: '',
    markdown_content: '',
    tool_icon1: '',
    tool_icon2: '',
    image: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      setFormData({ ...formData, title: value, slug });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (type: 'markdown_content' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormData({ ...formData, [type]: content });
    };

    if (type === 'markdown_content') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof Project)[] = [
      'title',
      'date',
      'description',
      'markdown_content',
      'tool_icon1',
      'image',
    ];

    // Validate required fields safely
    const hasEmptyRequired = requiredFields.some((field) => {
      const value = formData[field];
      return typeof value !== 'string' || value.trim() === ''; // Ensure value is a string before calling trim(), as ID can be number or undefined
    });

    if (hasEmptyRequired) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }

    if (formData.id !== undefined) {
      setProjects(projects.map((proj) => (proj.id === formData.id ? { ...formData, id: proj.id } : proj)));
    } else {
      setProjects([...projects, { ...formData, id: Date.now() }]);
    }
    toast.success(`Project ${formData.id !== undefined ? 'updated' : 'added'} successfully!`);

    // Reset form and close modal
    setFormData({
      title: '',
      slug: '',
      date: '',
      description: '',
      markdown_content: '',
      tool_icon1: '',
      tool_icon2: '',
      image: '',
    });

    setIsModalOpen(false);
  };



  const handleEdit = (project: Project & { id: number }) => {
    setFormData(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      type: 'danger',
    });

    if (confirmed) {
      setProjects(projects.filter((proj) => proj.id !== id));//call API
      toast.success('Project deleted');
    }
  };

  const handleAddNew = () => {
    setFormData({  title: '', slug:'', date:'', description: '', tool_icon1: '', markdown_content: '', image: '' });
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
