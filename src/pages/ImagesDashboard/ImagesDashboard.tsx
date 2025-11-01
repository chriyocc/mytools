import { useState, useEffect } from 'react';
import ImageCard from '../../components/ImageCard/ImageCard.tsx';
import ImageForm from '../../components/ImageForm/ImageForm.tsx';
import Modal from '../../components/Modal/Modal';
import PageLoader from '../../components/PageLoader/PageLoader.tsx';
import { useConfirm } from '../../utils/confirmModalContext.tsx';
import { uploadToCloudinary, deleteFromCloudinary, getAllImages } from '../../utils/cloudinary.ts';
import { toast } from 'react-hot-toast';
import './ImagesDashboard.css';

interface CloudinaryImage {
  public_id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

interface ImageFormState {
  folder: string;
  pending_file?: File;
  custom_filename: string;
}

const EMPTY_IMAGE_FORM: ImageFormState = {
  folder: '',
  pending_file: undefined,
  custom_filename: ''
};

const ImagesDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ImageFormState>({ ...EMPTY_IMAGE_FORM });
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchAllImages();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = 'Upload in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isUploading]);

  async function fetchAllImages() {
    try {
      setIsLoading(true);
      const imageData = await getAllImages();
      setImages(imageData);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setFormData({
        ...formData,
        pending_file: file,
        custom_filename: file.name.substring(0, file.name.lastIndexOf('.')),
      });
      toast.success('Image selected!');
    } catch (error) {
      console.error('File select error:', error);
      toast.error('Failed to select image');
    }
  };

  const handleFolderChange = (value: string) => {
    setFormData({
      ...formData,
      folder: value,
    });
  };

   const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      custom_filename: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pending_file) {
      toast.error('Please select an image to upload');
      return;
    }

    if (!formData.custom_filename.trim()) {
      toast.error('Please provide a filename');
      return;
    }

    const validFilenameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validFilenameRegex.test(formData.custom_filename)) {
      toast.error('Filename can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const originalName = formData.pending_file.name;
      const extension = originalName.substring(originalName.lastIndexOf('.'));

      const renamedFile = new File(
        [formData.pending_file],
        `${formData.custom_filename}${extension}`,
        { type: formData.pending_file.type }
      );

      let folderName = ''
      console.log(folderName);
      
      if (formData.folder === 'root') {
        folderName = ''
      } else {
        folderName = formData.folder
      }

      await uploadToCloudinary(renamedFile, folderName);
      toast.success('Image uploaded successfully!', { id: toastId });

      setFormData(EMPTY_IMAGE_FORM);
      setIsModalOpen(false);
      await fetchAllImages();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    const confirmed = await confirm({
      title: 'Delete Image',
      message: (
        <>
          Are you sure you want to delete this image?
          <br />
          <strong>This action cannot be undone.</strong>
        </>
      ),
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    const toastId = toast.loading('Deleting image...');

    try {
      await deleteFromCloudinary(publicId);
      toast.success('Image deleted successfully!', { id: toastId });
      await fetchAllImages();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image.', { id: toastId });
    }
  };

  const handleCancel = async () => {
    if (isUploading) return;

    if (formData.pending_file) {
      const confirmed = await confirm({
        title: 'Discard Changes',
        message: 'You have selected an image. Are you sure you want to discard it?',
        confirmText: 'Discard',
        type: 'danger',
      });

      if (!confirmed) return;
    }

    setFormData(EMPTY_IMAGE_FORM);
    setIsModalOpen(false);
  };

  const handleAddNew = () => {
    setFormData(EMPTY_IMAGE_FORM);
    setIsModalOpen(true);
  };

  // Extract folder from public_id
  const getFolderFromPublicId = (publicId: string): string => {
    const parts = publicId.split('/');
    return parts.length > 1 ? parts[0] : 'root';
  };

  // Get unique folders
  const folders = [...Array.from(new Set(images.map(img => getFolderFromPublicId(img.public_id))))];
  
  // Filter images by folder
  const filteredImages = selectedFolder === 'all'
    ? images
    : images.filter(img => getFolderFromPublicId(img.public_id) === selectedFolder);

  // Sort images by created_at (newest first)
  const sortedImages = [...filteredImages].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Images Dashboard</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Upload Image
        </button>
      </div>

      <PageLoader isShowing={isLoading} />

      <div className="year-selector">
        {[ 'all', ...folders].map(folder => (
          <button
            key={folder}
            className={`btn year-btn ${selectedFolder === folder ? 'active' : ''}`}
            onClick={() => setSelectedFolder(folder)}
          >
            {folder === 'all' ? 'All Images' : folder}
          </button>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title="Upload Image"
      >
        <ImageForm
          formData={formData}
          available_folders={folders}
          onSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
          onFolderChange={handleFolderChange}
          onFileNameChange={handleFilenameChange}
          onCancel={handleCancel}
          isDisabled={isUploading}
        />
      </Modal>

      <div className="images-grid">
        {sortedImages.length === 0 ? (
          <div className="empty-state">
            <h2>No Images {selectedFolder !== 'all' ? `in ${selectedFolder}` : ''}</h2>
            <p>
              {selectedFolder === 'all'
                ? 'Start by uploading your first image!'
                : `No images found in ${selectedFolder}. Try selecting a different folder or upload a new image.`}
            </p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              Upload Your First Image
            </button>
          </div>
        ) : (
          sortedImages.map((image) => (
            <ImageCard
              key={image.public_id}
              image={image}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ImagesDashboard;