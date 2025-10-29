import React, { useState, useEffect, useRef } from 'react';
import type { Database } from '../../types/database.types.ts';
import Modal from '../../components/Modal/Modal.tsx';
import ProjectForm from '../../components/ProjectForm/ProjectForm.tsx';
import ProjectCard from '../../components/ProjectCard/ProjectCard.tsx';
import PageLoader from '../../components/PageLoader/PageLoader.tsx'
import { toast } from 'react-hot-toast';
import { projectApi } from '../../api/projectApi.ts';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.ts';
import { readFileAsText } from '../../utils/fileReader.ts';
import { generateSlug, hasEmptyRequiredFields } from '../../utils/formHelpers.ts';
import { useConfirm } from '../../utils/confirmModalContext.tsx';
import './ProjectsDashboard.css';


type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

interface ProjectFormState extends Partial<ProjectInsert> {
  pending_image_file?: File;
  image_deleted?: boolean;
}

const EMPTY_PROJECT_FORM: ProjectFormState = {
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
  pending_image_file: undefined,
  image_deleted: false,
};

const REQUIRED_PROJECT_FIELDS: (keyof ProjectInsert)[] = [
  'title',
  'date',
  'description',
  'markdown_content',
  'tool_icon1',
  'image',
];

const ProjectsDashboard = () => {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Track saving state
  const [formData, setFormData] = useState<ProjectFormState>(EMPTY_PROJECT_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm } = useConfirm();

  const originalImagePublicIdRef = useRef<string>('');

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Always prevent if saving
      if (isSaving) {
        e.preventDefault();
        e.returnValue = 'Upload in progress. Are you sure you want to leave?';
        return e.returnValue;
      }

      // Also prevent if modal is open with unsaved changes
      if (isModalOpen) {
        const hasChanges = 
          formData.title !== EMPTY_PROJECT_FORM.title ||
          formData.description !== EMPTY_PROJECT_FORM.description ||
          formData.markdown_content !== EMPTY_PROJECT_FORM.markdown_content ||
          formData.pending_image_file !== undefined ||
          formData.image_deleted === true;

        if (hasChanges) {
          e.preventDefault();
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
          return e.returnValue;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaving, isModalOpen, formData]);

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
        toast.success('Markdown file loaded!');
      } else {
        const imageUrl = URL.createObjectURL(file);
        setFormData({
          ...formData,
          image: imageUrl,
          image_file: fileName,
          pending_image_file: file,
          image_deleted: false,
        });
        toast.success('Image selected! Will upload on save.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(type === 'image' ? 'Failed to select image.' : 'Failed to read file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasEmptyRequiredFields(formData, REQUIRED_PROJECT_FIELDS)) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }

    setIsSaving(true);
    let toastId: string | undefined;

    try {
      let finalImageUrl = formData.image;
      let finalImagePublicId = formData.image_public_id;

      // Handle image upload/deletion
      if (formData.pending_image_file) {
        // New image selected - upload it
        toastId = toast.loading('Uploading image...');
        
        const uploadResult = await uploadToCloudinary(formData.pending_image_file);
        finalImageUrl = uploadResult.secure_url;
        finalImagePublicId = uploadResult.public_id;
        
        toast.success('Image uploaded!', { id: toastId });

        // Delete old image if this is an edit and there was a previous image
        if (formData.id !== undefined && originalImagePublicIdRef.current) {
          try {
            toastId = toast.loading('Removing old image...');
            await deleteFromCloudinary(originalImagePublicIdRef.current);
            toast.success('Old image removed!', { id: toastId });
          } catch (error) {
            console.error('Failed to delete old image:', error);
            toast.dismiss(toastId);
            // Continue anyway - new image is uploaded
          }
        }
      } else if (formData.image_deleted && originalImagePublicIdRef.current) {
        // Image was deleted in edit mode - clean up from Cloudinary
        try {
          toastId = toast.loading('Deleting image...');
          await deleteFromCloudinary(originalImagePublicIdRef.current);
          toast.success('Image deleted!', { id: toastId });
        } catch (error) {
          console.error('Failed to delete image:', error);
          toast.error('Failed to delete image.', { id: toastId });
        }
        finalImageUrl = '';
        finalImagePublicId = '';
      }

      // Prepare data for submission
      const submitData: Partial<ProjectInsert> = {
        title: formData.title,
        slug: formData.slug,
        date: formData.date,
        description: formData.description,
        markdown_file: formData.markdown_file,
        markdown_content: formData.markdown_content,
        tool_icon1: formData.tool_icon1,
        tool_icon2: formData.tool_icon2,
        image_file: formData.image_file,
        image: finalImageUrl,
        image_public_id: finalImagePublicId,
      };

      // Save to database
      toastId = toast.loading(formData.id !== undefined ? 'Updating project...' : 'Adding project...');
      
      if (formData.id !== undefined) {
        await projectApi.update(formData.id, submitData);
        toast.success('Project updated successfully!', { id: toastId });
      } else {
        await projectApi.create(submitData as ProjectInsert);
        toast.success('Project added successfully!', { id: toastId });
      }

      // Clean up blob URLs
      if (formData.image && formData.image.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image);
      }

      setFormData(EMPTY_PROJECT_FORM);
      setIsModalOpen(false);
      await fetchAllProjects();
    } catch (error) {
      console.error(error);
      if (toastId) {
        toast.error('Failed to save project. Please try again.', { id: toastId });
      } else {
        toast.error('Failed to save project. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (project: ProjectRow) => {
    if (!project) {
      toast.error('Invalid project data');
      return;
    }
    setFormData({
      ...project,
      pending_image_file: undefined,
      image_deleted: false,
    });
    originalImagePublicIdRef.current = project.image_public_id || '';
    setIsModalOpen(true);
  };

  const handleProjectDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project?',
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    const toastId = toast.loading('Deleting project...');

    try {
      const project = await projectApi.getById(id);

      // Delete image from Cloudinary if it exists
      if (project.image_public_id) {
        try {
          await deleteFromCloudinary(project.image_public_id);
        } catch (error) {
          console.error('Cloudinary deletion error:', error);
          toast.error('Failed to delete image, but will continue...', { id: toastId });
        }
      }

      // Delete project from database
      await projectApi.remove(id);
      toast.success('Project deleted successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project.', { id: toastId });
    } finally {
      await fetchAllProjects();
    }
  };

  const handleFileDelete = async (type: 'markdown_content' | 'image') => {
    const confirmed = await confirm({
      title: 'Remove File',
      message: 'Are you sure you want to remove this file from the form?',
      confirmText: 'Remove',
      type: 'danger',
    });

    if (!confirmed) return;

    if (type === 'markdown_content') {
      setFormData({
        ...formData,
        markdown_content: '',
        markdown_file: '',
      });
      toast.success('Markdown file removed.');
    } else {
      // Revoke object URL if it exists
      if (formData.image && formData.image.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image);
      }
      
      setFormData({
        ...formData,
        image: '',
        image_file: '',
        image_public_id: '',
        pending_image_file: undefined,
        image_deleted: true,
      });
      toast.success('Image removed.');
    }
  };

  const handleCancel = async () => {
    // Don't allow cancel during save
    if (isSaving) return;

    // Check if there are unsaved changes
    const hasChanges = 
      formData.title !== EMPTY_PROJECT_FORM.title ||
      formData.description !== EMPTY_PROJECT_FORM.description ||
      formData.markdown_content !== EMPTY_PROJECT_FORM.markdown_content ||
      formData.pending_image_file !== undefined ||
      formData.image_deleted === true;

    if (hasChanges && formData.id === undefined) {
      const confirmed = await confirm({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        type: 'danger',
      });

      if (!confirmed) return;
    }

    // Clean up blob URLs
    if (formData.image && formData.image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image);
    }

    setFormData(EMPTY_PROJECT_FORM);
    setIsModalOpen(false);
  };

  const handleAddNew = () => {
    setFormData(EMPTY_PROJECT_FORM);
    originalImagePublicIdRef.current = '';
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
        onClose={handleCancel}
        title={formData.id !== undefined ? 'Edit Project' : 'Add New Project'}
      >
        <ProjectForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onFileUpload={handleFileUpload}
          onFileDelete={handleFileDelete}
          onCancel={handleCancel}
          isDisabled={isSaving} // Pass saving state to disable form
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

export default ProjectsDashboard;