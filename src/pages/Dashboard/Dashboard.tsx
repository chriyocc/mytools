import React, { useState, useEffect } from 'react';
import type { Database } from '../../types/database.types';
import Modal from '../../components/Modal/Modal';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import PageLoader from '../../components/PageLoader/PageLoader'
import { toast } from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal/ConfirmModalContext';
import './Dashboard.css';
import { projectApi } from '../../api/projectApi';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

const Dashboard = () => {

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { confirm } = useConfirm();

  const [formData, setFormData] = useState<Partial<ProjectInsert>>({
    title: '',
    slug: '',
    date: '',
    description: '',
    markdown_file: '',
    markdown_content: '',
    tool_icon1: '',
    tool_icon2: '',
    image_file: '',
    image: '',
    image_public_id: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllProjects();
  }, []);

  async function fetchAllProjects() {
    try {
      setIsLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
      console.log('Loaded projects:', data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    try {
      const { name, value } = e.target;
      if (name === 'title') {
        const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        setFormData({ ...formData, title: value, slug });
        return;
      }
      setFormData({ ...formData, [name]: value });
    } catch (error) { 
      console.error('Error updating form field:', error);
      toast.error('Something went wrong while updating the form.');
    }
    
  };

  function getPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    // Get everything after /upload/
    const afterUpload = parts[1];
    
    // Remove version number (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Failed to extract public_id:', error);
    return null;
  }
}

  const handleFileUpload = (type: 'markdown_content' | 'image') => async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name;
        const reader = new FileReader();

        reader.onload = async (event) => {
          const content = event.target?.result as string;

          if (type === 'markdown_content') {
            setFormData({
              ...formData,
              markdown_content: content,
              markdown_file: fileName,
            });
          } else {
            try {
              const sigResponse = await fetch('http://localhost:3000/api/signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: 'project_imgs' }),
              });

              const { signature, timestamp, cloudName, apiKey, folder } = await sigResponse.json();

              const sigFormData = new FormData();
              sigFormData.append('file', file);
              sigFormData.append('signature', signature);
              sigFormData.append('timestamp', timestamp.toString());
              sigFormData.append('api_key', apiKey);
              sigFormData.append('folder', folder);

              const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: sigFormData,
              });

              const data = await response.json();
              console.log('Uploaded directly to Cloudinary:', data.secure_url);
              toast.success('Image uploaded successfully');
              setFormData({
                ...formData,
                image: data.secure_url, 
                image_file: fileName,
                image_public_id: getPublicIdFromUrl(data.secure_url),
              });

            } catch (error) {
              console.error('Image upload failed:', error);
              toast.error('Image upload failed. Please try again.');
              return;
            }
            
          }
        };

        reader.onerror = (err) => {
          console.error('File reading failed:', err);
          toast.error('Failed to read file. Please try again.');
        };

        if (type === 'markdown_content') {
          reader.readAsText(file); // Reads the file as plain text (UTF-8)
        } else {
          reader.readAsDataURL(file); // Reads file as a base64-encoded URL (for image preview)
        }
      } catch (error) {
        console.error('Unexpected error during file upload:', error);
        toast.error('An unexpected error occurred while processing the file.');
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof ProjectInsert)[] = [
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
      
    try {
      if (formData.id !== undefined) {
        // setProjects(projects.map((proj) => (proj.id === formData.id ? { ...formData, id: proj.id } : proj)));
        //await api.put(`/projects/${formData.id}`, formData);
        await projectApi.update(formData.id, formData)
      } else {
        await projectApi.create(formData as ProjectInsert)
        
        // setProjects([...projects, { ...formData, id: Date.now() }]);
        //await api.post('/projects', newProject);
      }
      toast.success(`Project ${formData.id !== undefined ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving the project. Please try again.');
      return;
    } finally {

      await fetchAllProjects();
      // Reset form and close modal
      setFormData({
        title: '',
        slug: '',
        date: '',
        description: '',
        markdown_file: '',
        markdown_content: '',
        tool_icon1: '',
        tool_icon2: '',
        image: '',
        image_file: '',
        image_public_id: '',
      });

      setIsModalOpen(false);
    }
    
  };

  const handleEdit = (project: ProjectRow) => {
    if (!project) {
      toast.error('Invalid project data');
      return;
    }
    setFormData(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const project = await projectApi.getById(id);
      
      // Delete image from Cloudinary if it exists
      if (project.image_public_id) {
        
        try {
          const response = await fetch(
            `http://localhost:3000/api/delete`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json', 
              },
              body: JSON.stringify({
                public_id: project.image_public_id,
              }),
            }
          );

          const data = await response.json();
          
          if (!data.success) {
            console.warn('Failed to delete image from Cloudinary:', data.error);
          }
        } catch (imageError) {
          console.error('Error deleting image:', imageError);
        }
      } else {
        toast.error('No associated image to delete from Cloudinary.');
      }
      
      // Delete project from database
      await projectApi.remove(id);
      
      toast.success('Project deleted successfully!');
    }
    catch (error) {
      console.error(error);
      toast.error('Failed to delete project. Please try again.');
      return;
    } finally {
      await fetchAllProjects();
    }

  };

  const handleAddNew = () => {
    setFormData({  title: '', slug:'', date:'', description: '', tool_icon1: '', markdown_file:'', markdown_content: '', image_file: '', image: '' });
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

      <PageLoader
        isShowing={isLoading}
      ></PageLoader>

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
