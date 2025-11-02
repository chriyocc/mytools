import { useState, useEffect, useRef } from 'react';
import type { Database } from '../../types/database.types.ts';
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
  month_num?: number;
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
  image1_file: '',
  image2_file: '',
  image1_public_id: '',
  image2_public_id: '',
  pending_image1_file: undefined,
  pending_image2_file: undefined,
  image1_deleted: false,
  image2_deleted: false,
  year: new Date().getFullYear(),
  month_num: undefined,
};

const REQUIRED_JOURNEY_FIELDS: (keyof JourneyInsert)[] = [
  'title',
  'description',
];

const JourneyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 
  const [formData, setFormData] = useState<JourneyFormState>({ ...EMPTY_JOURNEY_FORM });
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const { confirm } = useConfirm();
  const [journeys, setJourneys] = useState<JourneyRow[]>([]);
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const originalImage1PublicIdRef = useRef<string>('');
  const originalImage2PublicIdRef = useRef<string>('');

  const originalFormDataRef = useRef<JourneyFormState>({ ...EMPTY_JOURNEY_FORM });

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
          formData.image1_deleted === true ||
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
    fetchAllJourneys();
  }, []);

  async function fetchAllJourneys() {
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

      // Handle image URL input
      if (name === 'image_1' || name === 'image_2') {
        const imageNum = name === 'image_1' ? '1' : '2';
        if (value) {
          // URL was pasted/entered
          const filename = value.split('/').pop()?.split('?')[0] || 'image-url';
          setFormData({ 
            ...formData, 
            [`image_${imageNum}`]: value,
            [`image${imageNum}_file`]: filename,
            [`image${imageNum}_public_id`]: '', // URLs don't have Cloudinary public IDs
            [`pending_image${imageNum}_file`]: undefined, // Clear any pending file
            [`image${imageNum}_deleted`]: false,
          });
          
        } else {
          // URL was cleared
          setFormData({ 
            ...formData, 
            [`image_${imageNum}`]: '',
            [`image${imageNum}_file`]: '',
            [`image${imageNum}_public_id`]: '',
            [`pending_image${imageNum}_file`]: undefined,
            [`image${imageNum}_deleted`]: false,
          });
        }
        return;
      }

      
      if (name === 'date') {
        const [year, month_num] = value.split('-');
        const yearNum = Number(year);
        const monthNum = Number(month_num);
        
        // Find or create the month_id based on year and month_num
        const matchingMonth = months.find(m => m.year === yearNum && m.month_num === monthNum);
        
        if (matchingMonth) {
          // Month exists, use its ID
          setFormData({ 
            ...formData, 
            month_id: matchingMonth.id,
            year: yearNum, 
            month_num: monthNum
          });
        } else {
          // Month doesn't exist yet - will be created on submit
          // For now, just store year and month_num
          setFormData({ 
            ...formData, 
            month_id: undefined, // Will be resolved on submit
            year: yearNum, 
            month_num: monthNum
          });
        }
        return;
      }

      if (name === 'action') {
        setFormData({
          ...formData,
          action: value,
          link: '',
          markdown_content: '',
          markdown_file: ''
        })
        return;
      } 

      setFormData({ ...formData, [name]: value });
      
    } catch (error) {
      console.error('Error updating form field:', error);
      toast.error('Something went wrong while updating the form.');
    }
  };

  const handleProjectChange = (slug: string) => {
    setFormData({ ...formData, link: slug });
  };

  const handleFileUpload = (type: 'markdown_content' | 'image_1' | 'image_2') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileName = file.name;

      if (formData.markdown_content) {
        const confirmed = await confirm({
          title: 'Replace Journey Content',
          message: (
            <>
              Are you sure you want to replace <strong>{formData.markdown_file}</strong> with <strong>{fileName}</strong>?
            </>
          ),
          confirmText: 'Replace',
          type: 'danger',
        });

        if (!confirmed) return;
      }

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
    
    if (hasEmptyRequiredFields(formData, REQUIRED_JOURNEY_FIELDS) || (!formData.month_num && !formData.year)) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }
    
    setIsSaving(true);
    let toastId: string | undefined;
    
    try {
      let monthId = formData.month_id;
    
      if (!monthId && formData.year && formData.month_num) {
        // Create or get the month
        const month = await journeyApi.getOrCreateMonth(formData.year, formData.month_num);
        monthId = month.id;
      }
      
      if (!monthId) {
        toast.error('Please select a valid date.');
        setIsSaving(false);
        return;
      }

      let finalFullLink = formData.link || ''
      if (formData.action === 'navigate') {
        finalFullLink = `/projects/${formData.link}`
      }

      // Handle image uploads if needed
      let finalImage1Url = formData.image_1 || '';
      let finalImage2Url = formData.image_2 || '';
      let finalImage1PublicId = formData.image1_public_id || '';
      let finalImage2PublicId = formData.image2_public_id || '';
      
      // ===== IMAGE 1 HANDLING =====
      if (formData.pending_image1_file) {
        // Upload image 1 to Cloudinary
        toastId = toast.loading('Uploading image 1...');
        const uploadResult = await uploadToCloudinary(formData.pending_image1_file, 'journey_imgs');
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
        const uploadResult = await uploadToCloudinary(formData.pending_image2_file, 'journey_imgs');
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
        month_id: monthId!,
        action: formData.action || '',
        link: finalFullLink || '',
        title: formData.title!,
        markdown_content: formData.markdown_content || '',
        markdown_file: formData.markdown_file || '',
        description: formData.description!,
        type_icon1: formData.type_icon1 || '',
        type_icon2: formData.type_icon2 || '',
        image_1: finalImage1Url,
        image_2: finalImage2Url,
        image1_file: formData.image1_file || '',
        image2_file: formData.image2_file || '',
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
      await fetchAllJourneys();
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

  const handleEdit = (journey: JourneyFormState) => {
    if (!journey) {
      toast.error('Invalid journey data');
      return;
    }

    const cleanValue = (input: string) => {
      if (input.startsWith('/projects/')) {
        return input.replace('/projects/', '');
      }
      return input;
    };
    // Find the month details for this journey
    const month = months.find(m => m.id === journey.month_id);

    const initialFormData = {
      ...journey,
      link: cleanValue(journey.link || ''),
      year: month?.year,
      month_num: month?.month_num ?? undefined,
      pending_image1_file: undefined,
      image1_deleted: false,
      pending_image2_file: undefined,
      image2_deleted: false,
    };
  
    
    setFormData(initialFormData);
    originalFormDataRef.current = { ...initialFormData };

    originalImage1PublicIdRef.current = journey.image1_public_id || '';
    originalImage2PublicIdRef.current = journey.image2_public_id || '';
    setIsModalOpen(true);
  };

  const handleJourneyDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete Journey',
      message: (
        <>
          Are you sure you want to delete <strong>{title}</strong>?
        </>
      ),
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    const toastId = toast.loading('Deleting journey...');

    try {
      const journey = await journeyApi.getById(id);

      if (!journey) {
        toast.error('Journey not found', { id: toastId });
        return;
      }

      // Delete image 1 from Cloudinary if it exists
      if (journey.image1_public_id) {
        try {
          await deleteFromCloudinary(journey.image1_public_id);
        } catch (error) {
          console.error('Cloudinary deletion error:', error);
          toast.error('Failed to delete image 1, but will continue...', { id: toastId });
        }
      }

      // Delete image 2 from Cloudinary if it exists
      if (journey.image2_public_id) {
        try {
          await deleteFromCloudinary(journey.image2_public_id);
        } catch (error) {
          console.error('Cloudinary deletion error:', error);
          toast.error('Failed to delete image 2, but will continue...', { id: toastId });
        }
      }

      if (!journey.image1_public_id || !journey.image2_public_id) {
        const confirmed = await confirm({
          title: "Can't Delete Image",
          message: (
            <>
              PublicID does not esist. Are you sure you want to continue delete?<br></br>
              {journey.image1_file && 
                (<strong>Image 1: {journey.image1_file}</strong>)
              }
              <br></br>
              {journey.image2_file && 
                (<strong>Image 2: {journey.image2_file}</strong>)
              }
            </>
          ),
          confirmText: 'Delete',
          type: 'danger',
        });
        if (!confirmed) return;
      }

      // Delete journey from database
      await journeyApi.remove(id);
      toast.success('Journey deleted successfully!', { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error('Failed to delete journey.', { id: toastId });
    } finally {
      await fetchAllJourneys();
    }
  };

  const handleFileDelete = async (type: 'markdown_content' | 'image_1' | 'image_2') => {
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
      const imageNum = type === 'image_1' ? '1' : '2';
      
      setFormData({
        ...formData,
        [type]: '',
        [`image${imageNum}_deleted`]: true,
        [`image${imageNum}_file`]: '',
        [`pending_image${imageNum}_file`]: undefined,
      });
      
      toast.success('Image removed.');
    }
  };

  const handleCancel = async () => {
      // Don't allow cancel during save
    if (isSaving) return;

    // Check if there are unsaved changes
    const normalize = (v: any) => {
      if (v === undefined || v === null) return '';
      if (typeof v === 'number') return String(v);
      return v;
    };

    const hasChanges =
      (Object.keys(originalFormDataRef.current) as Array<keyof JourneyFormState>).some(
        (key) => normalize(formData[key]) !== normalize(originalFormDataRef.current[key])
      ) ||
      !!formData.pending_image1_file ||
      !!formData.pending_image2_file ||
      formData.image1_deleted === true ||
      formData.image2_deleted === true;


    
    if (hasChanges) {
      const confirmed = await confirm({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        type: 'danger',
      });

      if (!confirmed) return;
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
  };

  const handleAddNew = () => {
    setFormData(EMPTY_JOURNEY_FORM);
    originalFormDataRef.current = { ...EMPTY_JOURNEY_FORM };
    originalImage1PublicIdRef.current = '';
    originalImage2PublicIdRef.current = '';
    setIsModalOpen(true);
  };

  
  // Month names constant for converting month_num to names
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper function to get month name from month_num (1-12)
  const getMonthName = (monthNum: number | null): string => {
    if (!monthNum || monthNum < 1 || monthNum > 12) return '';
    return MONTH_NAMES[monthNum - 1];
  };

  // Get journeys with month information
  const journeysWithMonths = journeys.map(journey => {
    const month = months.find(m => m.id === journey.month_id);
    const monthName = getMonthName(month?.month_num || null);
    
    return {
      ...journey,
      year: month?.year,
      month_num: month?.month_num ?? undefined,
      month_name: monthName,
      month_index: month?.month_num ? month.month_num - 1 : -1 // Convert 1-12 to 0-11 for sorting
    };
  });

  // Filter journeys based on selected year
  const filteredJourneys = selectedYear === 'all' 
    ? journeysWithMonths 
    : journeysWithMonths.filter(journey => journey.year === selectedYear);

  // Group and sort the filtered journeys
  const sortedGroups = Object.entries(
    filteredJourneys.reduce((groups, journey) => {
      if (!journey.year || !journey.month_num) return groups;
      
      const key = `${journey.year}-${String(journey.month_num).padStart(2, '0')}`; // e.g., "2024-03"
      
      if (!groups[key]) {
        groups[key] = {
          year: journey.year,
          month_num: journey.month_num,
          month: journey.month_name,
          journeys: []
        };
      }
      groups[key].journeys.push(journey);
      
      return groups;
    }, {} as Record<string, { year: number; month_num: number; month: string; journeys: typeof journeysWithMonths }>)
  ).sort(([a], [b]) => b.localeCompare(a)); // Sorts by "YYYY-MM" descending

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
            onClick={() => {
              setSelectedYear(year);
             }}
          >
            {year}
          </button>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel}
        title={formData.id !== undefined ? 'Edit Journey Entry' : 'Add Journey Entry'}
      >
        <JourneyForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onFileDelete={handleFileDelete}
          onFileUpload={handleFileUpload}
          onProjectChange={handleProjectChange}
          onCancel={handleCancel}
          isDisabled={isSaving}
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
                      onDelete={handleJourneyDelete}
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