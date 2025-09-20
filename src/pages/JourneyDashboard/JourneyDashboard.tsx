import { useState } from 'react';
import type { Journey } from '../../types/Journey';
import Modal from '../../components/Modal/Modal';
import JourneyCard from '../../components/JourneyCard/JourneyCard';
import './JourneyDashboard.css';

const JourneyDashboard = () => {
  const [journeys, setJourneys] = useState<(Journey & { id: number })[]>([
    { 
      id: 1, 
      title: 'Started Learning React', 
      description: 'Began my journey with React.js', 
      date: '2025-01-15'
    },
    { 
      id: 2, 
      title: 'First Project Launch', 
      description: 'Launched my first full-stack application', 
      date: '2025-03-20'
    },
  ]);

  const [formData, setFormData] = useState<Journey>({
    title: '',
    description: '',
    date: '',
    markdown: '',
    image: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    if (formData.id !== undefined) {
      setJourneys(journeys.map((j) => (j.id === formData.id ? { ...formData, id: j.id } : j)));
    } else {
      setJourneys([...journeys, { ...formData, id: Date.now() }]);
    }
    setFormData({ title: '', description: '', date: '', markdown: '', image: '' });
    setIsModalOpen(false);
  };

  const handleEdit = (journey: Journey & { id: number }) => {
    setFormData(journey);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const journey = journeys.find(j => j.id === id);
    if (!journey) return;

    if (window.confirm(`Are you sure you want to delete "${journey.title}"?`)) {
      setJourneys(journeys.filter((j) => j.id !== id));
    }
  };

  const handleAddNew = () => {
    setFormData({ title: '', description: '', date: '', markdown: '', image: '' });
    setIsModalOpen(true);
  };

  // Group journeys by year and month
  const groupedJourneys = journeys.reduce((groups, journey) => {
    const date = new Date(journey.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const key = `${year}-${month}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(journey);
    return groups;
  }, {} as Record<string, typeof journeys>);

  // Sort groups by date (newest first)
  const sortedGroups = Object.entries(groupedJourneys).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="journey-dashboard">
      <div className="dashboard-header">
        <h1>Journey Dashboard</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add Journey Entry
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id !== undefined ? 'Edit Journey Entry' : 'Add Journey Entry'}
      >
        <form onSubmit={handleSubmit} className="journey-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Enter journey title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              required
            />
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              required
            />
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter journey description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              required
            />
            <div className='upload-section'>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload('image')}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload" className="btn btn-secondary">
                {formData.image ? 'Change Image' : 'Upload Image'}
              </label>
              {formData.image && <span className="file-name">✓ Image uploaded</span>}
            </div>
          </div>
          <div className="journey-actions">
            <button type="submit" className="btn btn-primary">
              {formData.id !== undefined ? 'Update' : 'Add'} Entry
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="journey-timeline">
        {journeys.length === 0 ? (
          <div className="empty-state">
            <h2>No Journey Entries Yet</h2>
            <p>Start documenting your journey by adding your first entry!</p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              Add Your First Entry
            </button>
          </div>
        ) : (
          sortedGroups.map(([dateKey, groupJourneys]) => {
            const [year, month] = dateKey.split('-');
            const date = new Date(Number(year), Number(month));
            return (
              <div key={dateKey} className="timeline-group">
                <h2 className="timeline-header">
                  {date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="journey-group">
                  {groupJourneys.map((journey) => (
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
