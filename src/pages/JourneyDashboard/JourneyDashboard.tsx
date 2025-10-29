import { useState, useEffect, useRef } from 'react';
import type { Database } from '../../types/database.types.ts';
import type { Journey } from '../../types/Journey';
import Modal from '../../components/Modal/Modal';
import JourneyCard from '../../components/JourneyCard/JourneyCard';
import JourneyForm from '../../components/JourneyForm/JourneyForm';
import PageLoader from '../../components/PageLoader/PageLoader.tsx'
import { useConfirm } from '../../utils/confirmModalContext.tsx';
import { journeyApi } from '../../api/journeyApi.ts';
import { readFileAsText } from '../../utils/fileReader.ts';
import { toast } from 'react-hot-toast';
import { hasEmptyRequiredFields } from '../../utils/formHelpers.ts';
import './JourneyDashboard.css';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.ts';

type JourneyRow = Database['public']['Tables']['journey']['Row'];
type JourneyInsert = Database['public']['Tables']['journey']['Insert'];
type MonthRow = Database['public']['Tables']['months']['Row'];

interface JourneyFormState extends Partial<JourneyInsert> {
  pending_image1_file?: File;
  pending_image2_file?: File;
  image1_deleted?: boolean;
  image2_deleted?: boolean;
  year?: number;
  month_name?: string;
}

const EMPTY_JOURNEY_FORM: JourneyFormState = {
  month_id: undefined,
  action: '',
  link: '',
  title: '',
  description: '',
  type_icon1: '',
  type_icon2: '',
  image_1: '',
  image_2: '',
  pending_image1_file: undefined,
  pending_image2_file: undefined,
  image1_deleted: false,
  image2_deleted: false,
  year: new Date().getFullYear(),
  month_name: '',
};

const REQUIRED_JOURNEY_FIELDS: (keyof JourneyInsert)[] = [
  'month_id',
  'title',
  'description',
  'image_1',
  'image_2',
];

const JourneyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 
  const [formData, setFormData] = useState<JourneyFormState>(EMPTY_JOURNEY_FORM);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const { confirm } = useConfirm();
  const [journeys, setJourneys] = useState<JourneyRow[]>([]);
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const originalImage1PublicIdRef = useRef<string>('');
  const originalImage2PublicIdRef = useRef<string>('');

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
            formData.title !== EMPTY_JOURNEY_FORM.title ||
            formData.description !== EMPTY_JOURNEY_FORM.description ||
            formData.markdown_content !== EMPTY_JOURNEY_FORM.markdown_content ||
            formData.pending_image1_file !== undefined ||
            formData.image1_deleted === true;
            formData.pending_image2_file !== undefined ||
            formData.image2_deleted === true;
  
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
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setIsLoading(true);
      const [journeyData, monthData] = await Promise.all([
        journeyApi.getAll(),
        journeyApi.getMonths(),
      ]);
      setJourneys(journeyData);
      setMonths(monthData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    try {
      const { name, value } = e.target;
      
      setFormData({ ...formData, [name]: value });
    } catch (error) {
      console.error('Error updating form field:', error);
      toast.error('Something went wrong while updating the form.');
    }
  };

  const handleFileUpload = (type: 'markdown_content' | 'image_1' | 'image_2') => async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const imageNum = type === 'image_1' ? '1' : '2';
        const imageUrl = URL.createObjectURL(file);
      
        setFormData({
          ...formData,
          [type]: imageUrl,
          [`image${imageNum}_file`]: fileName,
          [`pending_image${imageNum}_file`]: file,
          [`image${imageNum}_deleted`]: false,
        });
        toast.success('Image selected! Will upload on save.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to select image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasEmptyRequiredFields(formData, REQUIRED_JOURNEY_FIELDS)) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }
    
    setIsSaving(true);
    let toastId: string | undefined;
    
    try {
      // Handle image uploads if needed
      let finalImage1Url = formData.image_1;
      let finalImage2Url = formData.image_2;
      let finalImage1PublicId = formData.image1_public_id;
      let finalImage2PublicId = formData.image2_public_id;
      
      // ===== IMAGE 1 HANDLING =====
      if (formData.pending_image1_file) {
        // Upload image 1 to Cloudinary
        toastId = toast.loading('Uploading image 1...');
        const uploadResult = await uploadToCloudinary(formData.pending_image1_file);
        finalImage1Url = uploadResult.secure_url;
        finalImage1PublicId = uploadResult.public_id;
        toast.success('Image 1 uploaded!', { id: toastId });
        
        // Delete old image if this is an edit and there was a previous image
        if (formData.id !== undefined && originalImage1PublicIdRef.current) {
          try {
            toastId = toast.loading('Removing old image 1...');
            await deleteFromCloudinary(originalImage1PublicIdRef.current);
            toast.success('Old image 1 removed!', { id: toastId });
          } catch (error) {
            console.error('Failed to delete old image 1:', error);
            toast.dismiss(toastId);
            // Continue anyway - new image is uploaded
          }
        }
      } else if (formData.image1_deleted && originalImage1PublicIdRef.current) {
        // Image 1 was deleted in edit mode - clean up from Cloudinary
        try {
          toastId = toast.loading('Deleting image 1...');
          await deleteFromCloudinary(originalImage1PublicIdRef.current);
          toast.success('Image 1 deleted!', { id: toastId });
        } catch (error) {
          console.error('Failed to delete image 1:', error);
          toast.error('Failed to delete image 1.', { id: toastId });
        }
        finalImage1Url = '';
        finalImage1PublicId = '';
      }
      
      // ===== IMAGE 2 HANDLING =====
      if (formData.pending_image2_file) {
        // Upload image 2 to Cloudinary
        toastId = toast.loading('Uploading image 2...');
        const uploadResult = await uploadToCloudinary(formData.pending_image2_file);
        finalImage2Url = uploadResult.secure_url;
        finalImage2PublicId = uploadResult.public_id;
        toast.success('Image 2 uploaded!', { id: toastId });
        
        // Delete old image if this is an edit and there was a previous image
        if (formData.id !== undefined && originalImage2PublicIdRef.current) {
          try {
            toastId = toast.loading('Removing old image 2...');
            await deleteFromCloudinary(originalImage2PublicIdRef.current);
            toast.success('Old image 2 removed!', { id: toastId });
          } catch (error) {
            console.error('Failed to delete old image 2:', error);
            toast.dismiss(toastId);
            // Continue anyway - new image is uploaded
          }
        }
      } else if (formData.image2_deleted && originalImage2PublicIdRef.current) {
        // Image 2 was deleted in edit mode - clean up from Cloudinary
        try {
          toastId = toast.loading('Deleting image 2...');
          await deleteFromCloudinary(originalImage2PublicIdRef.current);
          toast.success('Image 2 deleted!', { id: toastId });
        } catch (error) {
          console.error('Failed to delete image 2:', error);
          toast.error('Failed to delete image 2.', { id: toastId });
        }
        finalImage2Url = '';
        finalImage2PublicId = '';
      }
      
      const journeyData: Partial<JourneyInsert> = {
        month_id: formData.month_id!,
        action: formData.action || '',
        link: formData.link || '',
        title: formData.title!,
        description: formData.description!,
        type_icon1: formData.type_icon1 || '',
        type_icon2: formData.type_icon2 || '',
        image_1: finalImage1Url || '',
        image_2: finalImage2Url || '',
        image1_file: formData.image1_file,
        image2_file: formData.image2_file,
        image1_public_id: finalImage1PublicId,
        image2_public_id: finalImage2PublicId,
      };
      
      toastId = toast.loading(formData.id !== undefined ? 'Updating journey...' : 'Adding journey...');
      
      if (formData.id !== undefined) {
        await journeyApi.update(formData.id, journeyData);
        toast.success('Journey updated successfully!', { id: toastId });
      } else {
        await journeyApi.create(journeyData as JourneyInsert);
        toast.success('Journey added successfully!', { id: toastId });
      }
      
      // Clean up blob URLs
      if (formData.image_1 && formData.image_1.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image_1);
      }
      if (formData.image_2 && formData.image_2.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image_2);
      }
      
      setFormData(EMPTY_JOURNEY_FORM);
      setIsModalOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error(error);
      if (toastId) {
        toast.error('Failed to save journey. Please try again.', { id: toastId });
      } else {
        toast.error('Failed to save journey. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (journey: JourneyRow) => {
    if (!journey) {
      toast.error('Invalid project data');
      return;
    }
    // Find the month details for this journey
    const month = months.find(m => m.id === journey.month_id);
    
    setFormData({
      ...journey,
      year: month?.year,
      month_name: month?.month_name,
      pending_image1_file: undefined,
      image1_deleted: false,
      pending_image2_file: undefined,
      image2_deleted: false,
    });

    originalImage1PublicIdRef.current = journey.image1_public_id || '';
    originalImage1PublicIdRef.current = journey.image2_public_id || '';
    setIsModalOpen(true);
  };

  const handleJourneyDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Journey',
      message: 'Are you sure you want to delete this journey?',
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    const toastId = toast.loading('Deleting journey...');

    try {
      const journey = await journeyApi.getById(id);

      // Delete image from Cloudinary if it exists
      if (journey.image1_public_id) {
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

  const handleFileDelete = async (type: 'image_1' | 'image_2') => {
    const confirmed = await confirm({
      title: 'Remove Image',
      message: 'Are you sure you want to remove this image from the form?',
      confirmText: 'Remove',
      type: 'danger',
    });

    if (!confirmed) return;

    const imageNum = type === 'image_1' ? '1' : '2';
    
    setFormData({
      ...formData,
      [type]: '',
      [`image${imageNum}_deleted`]: true,
      [`pending_image${imageNum}_file`]: undefined,
    });
    toast.success('Image removed.');
  };

  const handleDelete = async (id: string) => {
    const journey = journeys.find(j => j.id === id);
    if (!journey) return;

    const confirmed = await confirm({
      title: 'Delete Journey Entry',
      message: `Are you sure you want to delete "${journey.title}"?`,
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await journeyApi.delete(id);
      setJourneys(journeys.filter((j) => j.id !== id));
      toast.success('Journey entry deleted');
    } catch (error) {
      console.error('Error deleting journey:', error);
      toast.error('Failed to delete journey entry');
    }
  };

  const handleAddNew = () => {
    setFormData(EMPTY_JOURNEY_FORM);
    setIsModalOpen(true);
  };

  // Get journeys with month information
  const journeysWithMonths = journeys.map(journey => {
    const month = months.find(m => m.id === journey.month_id);
    return {
      ...journey,
      year: month?.year,
      month_name: month?.month_name,
      month_index: month?.month_name ? 
        ['January', 'February', 'March', 'April', 'May', 'June', 
         'July', 'August', 'September', 'October', 'November', 'December']
        .indexOf(month.month_name) : -1
    };
  });

  // Filter journeys based on selected year
  const filteredJourneys = selectedYear === 'all' 
    ? journeysWithMonths 
    : journeysWithMonths.filter(journey => journey.year === selectedYear);

  // Group and sort the filtered journeys
  const sortedGroups = Object.entries(
    filteredJourneys.reduce((groups, journey) => {
      if (!journey.year || !journey.month_name) return groups;
      
      const key = `${journey.year}-${journey.month_index}`;
      if (!groups[key]) {
        groups[key] = {
          year: journey.year,
          month: journey.month_name,
          journeys: []
        };
      }
      groups[key].journeys.push(journey);
      return groups;
    }, {} as Record<string, { year: number; month: string; journeys: typeof journeysWithMonths }>)
  ).sort(([a], [b]) => b.localeCompare(a));

  // Get unique years from months
  const availableYears = [...new Set(months.map(m => m.year))].sort((a, b) => b - a);

  return (
    <div className="journey-dashboard">
      <div className="dashboard-header">
        <h1>Journey Dashboard</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add Journey Entry
        </button>
      </div>

      <PageLoader isShowing={isLoading} />

      <div className="year-selector">
        <button 
          className={`btn year-btn ${selectedYear === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedYear('all')}
        >
          All Years
        </button>
        {availableYears.map(year => (
          <button
            key={year}
            className={`btn year-btn ${selectedYear === year ? 'active' : ''}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id !== undefined ? 'Edit Journey Entry' : 'Add Journey Entry'}
      >
        <JourneyForm
          formData={formData}
          months={months}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onFileDelete={handleFileDelete}
          onFileUpload={handleFileUpload}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      <div className="journey-timeline">
        {filteredJourneys.length === 0 ? (
          <div className="empty-state">
            <h2>No Journey Entries {selectedYear !== 'all' ? `for ${selectedYear}` : ''}</h2>
            <p>
              {selectedYear === 'all' 
                ? 'Start documenting your journey by adding your first entry!'
                : `No entries found for ${selectedYear}. Try selecting a different year or add a new entry.`}
            </p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              Add Your First Entry
            </button>
          </div>
        ) : (
          sortedGroups.map(([dateKey, group]) => {
            return (
              <div key={dateKey} className="timeline-group">
                <h2 className="timeline-header">
                  {group.month} {group.year}
                </h2>
                <div className="journey-group">
                  {group.journeys.map((journey) => (
                    <JourneyCard
                      key={journey.id}
                      journey={journey}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JourneyDashboard;