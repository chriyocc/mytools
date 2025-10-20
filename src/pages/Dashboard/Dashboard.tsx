import React, { useState, useEffect } from 'react';
import type { Database } from '../../types/database.types';
import Modal from '../../components/Modal/Modal';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import PageLoader from '../../components/PageLoader/PageLoader'
import { toast } from 'react-hot-toast';
import { projectApi } from '../../api/projectApi';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';
import { readFileAsText } from '../../utils/fileReader';
import { generateSlug, hasEmptyRequiredFields, hasTempContent } from '../../utils/formHelpers';
import { useConfirm } from '../../utils/ConfirmModalContext.tsx';
import './Dashboard.css';


type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

const EMPTY_PROJECT_FORM: Partial<ProjectInsert> = {
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
};

const EMPTY_TEMP_PROJECT_FORM = {
  temp_markdown_file: '',
  temp_markdown_content: '',
  temp_image_file: '',
  temp_image: '',
  temp_image_public_id: '',
}

const REQUIRED_PROJECT_FIELDS: (keyof ProjectInsert)[] = [
  'title',
  'date',
  'description',
  'markdown_content',
  'tool_icon1',
  'image',
];

const Dashboard = () => {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<ProjectInsert>>(EMPTY_PROJECT_FORM);
  const [tempFormData, setTempFormData] = useState<typeof EMPTY_TEMP_PROJECT_FORM>(EMPTY_TEMP_PROJECT_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm } = useConfirm();

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
        const slug = generateSlug(value);
        setFormData({ ...formData, title: value, slug });
        return;
      }
      
      setFormData({ ...formData, [name]: value });
    } catch (error) {
      console.error('Error updating form field:', error);
      toast.error('Something went wrong while updating the form.');
    }
  };

  const handleFileUpload = (type: 'markdown_content' | 'image') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileName = file.name;

      if (type === 'markdown_content') {
        const content = await readFileAsText(file);
        setFormData({
          ...formData,
          markdown_content: content,
          markdown_file: fileName,
        });
        toast.success('Markdown file uploaded successfully!');
      } else {
        toast.promise(
          new Promise(async (resolve, reject) => {
            try {
              const { secure_url, public_id } = await uploadToCloudinary(file);
              resolve({ secure_url, public_id });
            } catch (error) {
              reject(error);
            }
          }),
          {
            loading: 'Uploading image...',
            success: 'Image uploaded successfully!',
            error: 'Image upload failed. Please try again.',
          }
        ).then((result: any) => {
          const { secure_url, public_id } = result;
          setFormData({
            ...formData,
            image: secure_url,
            image_file: fileName,
            image_public_id: public_id,
          });
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(type === 'image' ? 'Image upload failed. Please try again.' : 'Failed to read file. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasEmptyRequiredFields(formData, REQUIRED_PROJECT_FIELDS)) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }

    try {
      if (hasTempContent(tempFormData, EMPTY_TEMP_PROJECT_FORM)) { 
        console.log('Handling temporary content cleanup...');
        
        if (tempFormData.temp_markdown_content) {
          await deleteFile('markdown_content');
        }
        if (tempFormData.temp_image) {
          await deleteFile('image');
          
        }

      }
      if (formData.id !== undefined) {
        await projectApi.update(formData.id, formData);
      } else {
        await projectApi.create(formData as ProjectInsert);
      }
      
      toast.success(`Project ${formData.id !== undefined ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving the project. Please try again.');
      return;
    } finally {
      setFormData(EMPTY_PROJECT_FORM);
      setTempFormData(EMPTY_TEMP_PROJECT_FORM);
      setIsModalOpen(false);
      await fetchAllProjects();
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

  const handleProjectDelete = async (id: string) => {
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
          await toast.promise(deleteFromCloudinary(project.image_public_id),
            {
              loading: 'Deleting image...',
              success: 'Image deleted successfully!',
              error: 'Failed to delete image. Please try again.',
            }
          );
        } catch (error) {
          console.error('Cloudinary deletion error:', error);
          toast.error('Failed to delete image.');
        }
      }

      // Delete project from database
      await projectApi.remove(id);
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project. Please try again.');
      return;
    } finally {
      await fetchAllProjects();
    }
  };

  const handleFileDelete = async (type: 'markdown_content' | 'image') => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      
      if (type === 'markdown_content') {
        setTempFormData({
          ...tempFormData,
          temp_markdown_content: formData.markdown_content || '',
          temp_markdown_file: formData.markdown_file || '',
        });
        setFormData({
          ...formData,
          markdown_content: '',
          markdown_file: '',
        });
        toast.success('Markdown file is temporary deleted.');
          
      } else {
        if (formData.image_public_id) {
          setTempFormData({
            ...tempFormData,
            temp_image: formData.image || '',
            temp_image_file: formData.image_file || '',
            temp_image_public_id: formData.image_public_id || '',
          });
          setFormData({
            ...formData,
            image: '',
            image_file: '',
            image_public_id: '',
          });
          toast.success('Image is temporarily deleted.');
          return;
        }

        setFormData({
          ...formData,
          image: '',
          image_file: '',
          image_public_id: '',
        });
      }
    } catch (error) {
      console.error('File deletion error:', error);
      toast.error('Failed to delete file. Please try again.');
    }
  };

  const deleteFile = async (type: 'markdown_content' | 'image') => {
    try {
      if (type === 'markdown_content') {
        setTempFormData({
          ...tempFormData,
          temp_markdown_content: '',
          temp_markdown_file: '',
        });
        toast.success('Temporary markdown content cleared.');
      } else {
        // Delete image from Cloudinary if it exists
        if (formData.image_public_id) {
          try {
            await toast.promise(deleteFromCloudinary(tempFormData.temp_image_public_id || ''),
              {
                loading: 'Deleting previous image...',
                success: 'Previous image deleted successfully!',
                error: 'Failed to delete previous image. Please try again.',
              });
          } catch (error) {
            console.error('Cloudinary deletion error:', error);
            toast.error('Failed to delete image.');
          }
        }
        setTempFormData(EMPTY_TEMP_PROJECT_FORM);
        setFormData({
          ...formData,
          image: '',
          image_file: '',
          image_public_id: '',
        });
        toast.success('Temporary image content cleared.');
        
      }
    } catch (error) {
      console.error('File deletion error:', error);
      toast.error('Failed to delete file. Please try again.');
    }
  };

  const handleAddNew = () => {
    setFormData(EMPTY_PROJECT_FORM);
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

      <PageLoader isShowing={isLoading} />

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
          onFileDelete={handleFileDelete}
          onCancel={() => { setIsModalOpen(false), setTempFormData(EMPTY_TEMP_PROJECT_FORM)}}
        />
      </Modal>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleProjectDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;